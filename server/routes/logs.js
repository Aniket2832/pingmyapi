const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db/index');

router.use(auth);

router.get('/:endpointId', async (req, res) => {
  const { endpointId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ping_logs
       WHERE endpoint_id = $1
       ORDER BY checked_at DESC
       LIMIT 50`,
      [endpointId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;