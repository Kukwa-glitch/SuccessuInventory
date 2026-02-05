const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Routes
router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/by-category', auth, dashboardController.getInventoryByCategory);
router.get('/low-stock', auth, dashboardController.getLowStockAlerts);

module.exports = router;