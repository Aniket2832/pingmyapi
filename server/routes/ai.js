const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeEndpoint } = require('../controllers/aiController');

router.use(auth);
router.get('/analyze/:id', analyzeEndpoint);

module.exports = router;