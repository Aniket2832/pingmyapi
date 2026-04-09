const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createChain, getChains, getChainSteps,
  runChain, getChainLogs, deleteChain
} = require('../controllers/chainController');

router.use(auth);
router.post('/', createChain);
router.get('/', getChains);
router.get('/:id/steps', getChainSteps);
router.post('/:id/run', runChain);
router.get('/:id/logs', getChainLogs);
router.delete('/:id', deleteChain);

module.exports = router;