const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { isStaffOrAdmin, isAdmin } = require('../middleware/roleCheck');
const { uploadSingle } = require('../middleware/upload');
const validate = require('../middleware/validator');

// Validation rules
const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('minStockLevel').isInt({ min: 0 }).withMessage('Minimum stock level must be a positive number'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

const stockValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
];

// Routes
router.get('/', auth, productController.getAllProducts);
router.get('/categories', auth, productController.getCategories);
router.get('/:id', auth, productController.getProductById);

router.post('/',
  auth,
  isStaffOrAdmin,
  uploadSingle('image', 'products'),
  createProductValidation,
  validate,
  productController.createProduct
);

router.put('/:id',
  auth,
  isStaffOrAdmin,
  uploadSingle('image', 'products'),
  productController.updateProduct
);

router.delete('/:id',
  auth,
  isAdmin,
  productController.deleteProduct
);

router.post('/:id/add-stock',
  auth,
  isStaffOrAdmin,
  stockValidation,
  validate,
  productController.addStock
);

router.post('/:id/deduct-stock',
  auth,
  isStaffOrAdmin,
  uploadSingle('document', 'deductions'),
  stockValidation,
  validate,
  productController.deductStock
);

module.exports = router;