const pool = require('../db/index');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.analyzeEndpoint = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Verify endpoint belongs to user
    const endpointResult = await pool.query(
      `SELECT * FROM endpoints WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (endpointResult.rows.length === 0) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    const endpoint = endpointResult.rows[0];

    // Get last 20 ping logs
    const logsResult = await pool.query(
      `SELECT status_code, response_time_ms, schema_changed, is_up, checked_at
       FROM ping_logs
       WHERE endpoint_id = $1
       ORDER BY checked_at DESC
       LIMIT 20`,
      [id]
    );

    const logs = logsResult.rows;

    if (logs.length < 3) {
      return res.json({
        analysis: "Not enough data yet — need at least 3 pings to analyze patterns. Check back soon!",
        status: 'pending'
      });
    }

    // Build stats for AI
    const avgResponse = Math.round(logs.reduce((s, l) => s + l.response_time_ms, 0) / logs.length);
    const uptime = Math.round((logs.filter(l => l.is_up).length / logs.length) * 100);
    const schemaChanges = logs.filter(l => l.schema_changed).length;
    const recentLogs = logs.slice(0, 5);
    const olderLogs = logs.slice(5);
    const recentAvg = recentLogs.length
      ? Math.round(recentLogs.reduce((s, l) => s + l.response_time_ms, 0) / recentLogs.length)
      : 0;
    const olderAvg = olderLogs.length
      ? Math.round(olderLogs.reduce((s, l) => s + l.response_time_ms, 0) / olderLogs.length)
      : 0;
    const trend = recentAvg > olderAvg ? 'degrading' : 'improving';
    const trendPct = olderAvg > 0
      ? Math.round(Math.abs(recentAvg - olderAvg) / olderAvg * 100)
      : 0;

    const prompt = `You are an expert API performance analyst. Analyze this API monitoring data and give a SHORT, DIRECT, ACTIONABLE insight in 3-4 sentences max. Be specific with numbers. Sound like a senior engineer, not a chatbot.

API Details:
- Name: ${endpoint.name}
- URL: ${endpoint.url}
- Method: ${endpoint.method}
- Expected Status: ${endpoint.expected_status}

Performance Data (last ${logs.length} pings):
- Average Response Time: ${avgResponse}ms
- Uptime: ${uptime}%
- Schema Changes Detected: ${schemaChanges}
- Recent avg (last 5): ${recentAvg}ms
- Older avg (prev 5-20): ${olderAvg}ms  
- Trend: Response time is ${trend} by ${trendPct}%
- Recent statuses: ${recentLogs.map(l => `${l.is_up ? 'UP' : 'DOWN'}(${l.response_time_ms}ms)`).join(', ')}

Give your analysis now:`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content || 'Unable to analyze at this time.';

    // Determine severity
    let status = 'healthy';
    if (uptime < 80) status = 'critical';
    else if (uptime < 95 || trendPct > 30) status = 'warning';

    res.json({ analysis, status, stats: { avgResponse, uptime, schemaChanges, trend, trendPct } });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};