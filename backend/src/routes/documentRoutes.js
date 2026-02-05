const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

// Routes
router.get('/', auth, documentController.getAllDocuments);
router.get('/:id', auth, documentController.getDocumentById);
router.get('/product/:productId', auth, documentController.getDocumentsByProduct);
router.delete('/:id', auth, documentController.deleteDocument);

module.exports = router;