const pool = require('../db/index');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addEndpoint,
  getEndpoints,
  deleteEndpoint,
  toggleEndpoint
} = require('../controllers/endpointController');

router.use(auth);
router.post('/', addEndpoint);
router.get('/', getEndpoints);
router.delete('/:id', deleteEndpoint);
router.patch('/:id/toggle', toggleEndpoint);

router.get('/:id/diff', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT schema, raw_response, captured_at 
       FROM schema_snapshots 
       WHERE endpoint_id = $1 
       ORDER BY captured_at DESC 
       LIMIT 2`,
      [id]
    );

    if (result.rows.length < 2) {
      return res.json({ hasDiff: false, message: 'Not enough snapshots yet' });
    }

    const [current, previous] = result.rows;
    res.json({
      hasDiff: true,
      current: {
        schema: current.schema,
        raw: current.raw_response,
        capturedAt: current.captured_at
      },
      previous: {
        schema: previous.schema,
        raw: previous.raw_response,
        capturedAt: previous.captured_at
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public status page - no auth required
router.get('/public/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const endpoints = await pool.query(
      `SELECT e.id, e.name, e.url, e.method, e.is_active, e.last_checked,
       (SELECT is_up FROM ping_logs WHERE endpoint_id = e.id ORDER BY checked_at DESC LIMIT 1) as last_status,
       (SELECT response_time_ms FROM ping_logs WHERE endpoint_id = e.id ORDER BY checked_at DESC LIMIT 1) as last_response_time,
       (SELECT COUNT(*) FROM ping_logs WHERE endpoint_id = e.id AND is_up = true) as up_count,
       (SELECT COUNT(*) FROM ping_logs WHERE endpoint_id = e.id) as total_count
       FROM endpoints e
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC`,
      [userId]
    );

    const user = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.rows[0],
      endpoints: endpoints.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = router;