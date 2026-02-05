const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Routes
router.get('/', auth, transactionController.getAllTransactions);
router.get('/recent', auth, transactionController.getRecentActivity);
router.get('/:id', auth, transactionController.getTransactionById);
router.get('/product/:productId', auth, transactionController.getTransactionsByProduct);

module.exports = router;