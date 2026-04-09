const pool = require('../db/index');
const axios = require('axios');

// Helper to extract value from object using dot path e.g. "data.token"
function extractByPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

// Run a single chain
async function executeChain(chain, steps) {
  const variables = {};
  const stepResults = [];
  const startTime = Date.now();

  for (const step of steps) {
    const stepStart = Date.now();

    // Replace {{variables}} in URL and body
    let url = step.url;
    let body = step.body || {};

    Object.keys(variables).forEach(key => {
      url = url.replace(`{{${key}}}`, variables[key]);
      const bodyStr = JSON.stringify(body).replace(`{{${key}}}`, variables[key]);
      body = JSON.parse(bodyStr);
    });

    // Replace variables in headers too
    let headers = step.headers || {};
    Object.keys(variables).forEach(key => {
      const headerStr = JSON.stringify(headers).replace(`{{${key}}}`, variables[key]);
      headers = JSON.parse(headerStr);
    });

    try {
      const response = await axios({
        method: step.method,
        url,
        headers,
        data: ['POST', 'PUT', 'PATCH'].includes(step.method) ? body : undefined,
        timeout: 10000,
      });

      const responseTime = Date.now() - stepStart;
      const success = response.status === step.expected_status;

      // Extract variable if configured
      if (step.extract_variable && step.extract_path) {
        const extracted = extractByPath(response.data, step.extract_path);
        if (extracted !== undefined) {
          variables[step.extract_variable] = extracted;
        }
      }

      stepResults.push({
        step_order: step.step_order,
        name: step.name,
        url,
        status_code: response.status,
        response_time_ms: responseTime,
        success,
        extracted: step.extract_variable ? { [step.extract_variable]: variables[step.extract_variable] } : null,
      });

      if (!success) {
        return {
          success: false,
          failed_step: step.step_order,
          error_message: `Step "${step.name}" returned ${response.status}, expected ${step.expected_status}`,
          total_time_ms: Date.now() - startTime,
          step_results: stepResults,
        };
      }

    } catch (err) {
      const responseTime = Date.now() - stepStart;
      stepResults.push({
        step_order: step.step_order,
        name: step.name,
        url,
        status_code: err.response?.status || null,
        response_time_ms: responseTime,
        success: false,
        error: err.message,
      });

      return {
        success: false,
        failed_step: step.step_order,
        error_message: `Step "${step.name}" failed: ${err.message}`,
        total_time_ms: Date.now() - startTime,
        step_results: stepResults,
      };
    }
  }

  return {
    success: true,
    failed_step: null,
    error_message: null,
    total_time_ms: Date.now() - startTime,
    step_results: stepResults,
  };
}

exports.createChain = async (req, res) => {
  const { name, steps } = req.body;
  const user_id = req.user.id;
  try {
    const chainResult = await pool.query(
      `INSERT INTO chains (user_id, name) VALUES ($1, $2) RETURNING *`,
      [user_id, name]
    );
    const chain = chainResult.rows[0];

    for (const step of steps) {
      await pool.query(
        `INSERT INTO chain_steps (chain_id, step_order, name, url, method, headers, body, extract_variable, extract_path, expected_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [chain.id, step.step_order, step.name, step.url, step.method || 'GET',
         JSON.stringify(step.headers || {}), JSON.stringify(step.body || {}),
         step.extract_variable || null, step.extract_path || null, step.expected_status || 200]
      );
    }

    res.status(201).json(chain);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getChains = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT c.*, 
       (SELECT success FROM chain_logs WHERE chain_id = c.id ORDER BY ran_at DESC LIMIT 1) as last_status,
       (SELECT ran_at FROM chain_logs WHERE chain_id = c.id ORDER BY ran_at DESC LIMIT 1) as last_ran
       FROM chains c WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getChainSteps = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM chain_steps WHERE chain_id = $1 ORDER BY step_order`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.runChain = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const chainResult = await pool.query(
      `SELECT * FROM chains WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (chainResult.rows.length === 0)
      return res.status(404).json({ message: 'Chain not found' });

    const chain = chainResult.rows[0];
    const stepsResult = await pool.query(
      `SELECT * FROM chain_steps WHERE chain_id = $1 ORDER BY step_order`,
      [id]
    );
    const steps = stepsResult.rows;

    const result = await executeChain(chain, steps);

    await pool.query(
      `INSERT INTO chain_logs (chain_id, success, failed_step, error_message, total_time_ms, step_results)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, result.success, result.failed_step, result.error_message,
       result.total_time_ms, JSON.stringify(result.step_results)]
    );

    await pool.query(`UPDATE chains SET last_run = NOW() WHERE id = $1`, [id]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getChainLogs = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM chain_logs WHERE chain_id = $1 ORDER BY ran_at DESC LIMIT 20`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteChain = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    await pool.query(
      `DELETE FROM chains WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    res.json({ message: 'Chain deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};