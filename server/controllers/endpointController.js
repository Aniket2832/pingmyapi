const pool = require('../db/index');

exports.addEndpoint = async (req, res) => {
  const { name, url, method, expected_status, check_interval } = req.body;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO endpoints (user_id, name, url, method, expected_status, check_interval)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, name, url, method || 'GET', expected_status || 200, check_interval || 5]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getEndpoints = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM endpoints WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteEndpoint = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    await pool.query(
      `DELETE FROM endpoints WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    res.json({ message: 'Endpoint deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.toggleEndpoint = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `UPDATE endpoints SET is_active = NOT is_active
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};