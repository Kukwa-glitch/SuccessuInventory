const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Routes
router.get('/inventory', auth, reportController.exportInventory);
router.get('/documents', auth, reportController.exportDocuments);
router.get('/analytics', auth, reportController.getAnalytics);

module.exports = router;