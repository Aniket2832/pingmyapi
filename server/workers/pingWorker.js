const cron = require('node-cron');
const axios = require('axios');
const pool = require('../db/index');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function extractSchema(data) {
  if (Array.isArray(data)) {
    return data.length > 0 ? { type: 'array', items: extractSchema(data[0]) } : { type: 'array' };
  }
  if (typeof data === 'object' && data !== null) {
    const schema = { type: 'object', keys: {} };
    for (const key of Object.keys(data)) {
      schema.keys[key] = typeof data[key];
    }
    return schema;
  }
  return { type: typeof data };
}

function schemasMatch(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function sendAlert(userEmail, userName, endpoint, reason) {
  try {
    await resend.emails.send({
      from: 'PingMyAPI <onboarding@resend.dev>',
      to: userEmail,
      subject: `🚨 Alert: ${endpoint.name} is ${reason}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #fff; padding: 32px; border-radius: 16px;">
          <h1 style="color: #fff; margin-bottom: 4px;">🔔 PingMyAPI Alert</h1>
          <p style="color: #94a3b8; margin-top: 0;">Hi ${userName}, something needs your attention.</p>
          
          <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #ef4444;">
            <h2 style="margin: 0 0 12px 0; color: #ef4444;">⚠️ ${reason}</h2>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Monitor:</strong> ${endpoint.name}</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>URL:</strong> ${endpoint.url}</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Method:</strong> ${endpoint.method}</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
            You're receiving this because you set up this monitor on PingMyAPI.
          </p>
        </div>
      `
    });
    console.log(`📧 Alert email sent to ${userEmail} for: ${endpoint.name}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
}

async function pingEndpoint(endpoint, userEmail, userName) {
  const start = Date.now();
  let status_code = null;
  let is_up = false;
  let schema_changed = false;
  let responseData = null;

  try {
    const response = await axios({
      method: endpoint.method,
      url: endpoint.url,
      timeout: 10000,
    });

    status_code = response.status;
    is_up = status_code === endpoint.expected_status;
    responseData = response.data;

    // Schema drift detection
    if (responseData && typeof responseData === 'object') {
      const currentSchema = extractSchema(responseData);

      const lastSnapshot = await pool.query(
        `SELECT schema FROM schema_snapshots
         WHERE endpoint_id = $1
         ORDER BY captured_at DESC LIMIT 1`,
        [endpoint.id]
      );

      if (lastSnapshot.rows.length === 0) {
        await pool.query(
          `INSERT INTO schema_snapshots (endpoint_id, schema) VALUES ($1, $2)`,
          [endpoint.id, JSON.stringify(currentSchema)]
        );
      } else {
        const prevSchema = lastSnapshot.rows[0].schema;
        if (!schemasMatch(prevSchema, currentSchema)) {
          schema_changed = true;
          await pool.query(
  `INSERT INTO schema_snapshots (endpoint_id, schema, raw_response) VALUES ($1, $2, $3)`,
  [endpoint.id, JSON.stringify(currentSchema), JSON.stringify(responseData)]
);
          console.log(`⚠️  Schema changed for: ${endpoint.name}`);
          // Send schema change alert
          await sendAlert(userEmail, userName, endpoint, 'Schema Changed');
        }
      }
    }

    // Send alert if status code doesn't match expected
    if (!is_up) {
      await sendAlert(userEmail, userName, endpoint, `Unexpected Status Code: ${status_code}`);
    }

  } catch (err) {
    status_code = err.response?.status || null;
    is_up = false;
    console.log(`❌ Failed to ping: ${endpoint.name} — ${err.message}`);
    // Send down alert
    await sendAlert(userEmail, userName, endpoint, 'API is Down');
  }

  const response_time_ms = Date.now() - start;

  await pool.query(
    `INSERT INTO ping_logs (endpoint_id, status_code, response_time_ms, schema_changed, is_up)
     VALUES ($1, $2, $3, $4, $5)`,
    [endpoint.id, status_code, response_time_ms, schema_changed, is_up]
  );

  await pool.query(
    `UPDATE endpoints SET last_checked = NOW() WHERE id = $1`,
    [endpoint.id]
  );

  console.log(`✅ Pinged: ${endpoint.name} | Status: ${status_code} | ${response_time_ms}ms | Up: ${is_up} | Schema changed: ${schema_changed}`);
}

async function runPingCycle() {
  try {
    // Join with users to get email
    const result = await pool.query(`
      SELECT e.*, u.email as user_email, u.name as user_name
      FROM endpoints e
      JOIN users u ON e.user_id = u.id
      WHERE e.is_active = true
    `);

    const endpoints = result.rows;
    if (endpoints.length === 0) return;

    console.log(`🔄 Pinging ${endpoints.length} endpoint(s)...`);
    await Promise.all(endpoints.map(ep => pingEndpoint(ep, ep.user_email, ep.user_name)));
  } catch (err) {
    console.error('Ping cycle error:', err.message);
  }
}

cron.schedule('* * * * *', runPingCycle);
console.log('⏰ Ping worker started — checking every minute');