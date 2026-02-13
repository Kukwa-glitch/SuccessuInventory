const { body, param } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, and hyphens'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive number'),

  body('minStockLevel')
    .notEmpty()
    .withMessage('Minimum stock level is required')
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a positive number'),

  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'dozen', 'pair'])
    .withMessage('Invalid unit of measurement'),

  body('productType')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product type cannot exceed 100 characters'),

  body('size')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Size cannot exceed 100 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
];

const updateProductValidation = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a positive number'),

  body('unit')
    .optional()
    .isIn(['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'dozen', 'pair'])
    .withMessage('Invalid unit of measurement'),

  body('productType')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product type cannot exceed 100 characters'),

  body('size')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Size cannot exceed 100 characters'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Invalid status')
];

const stockValidation = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3 and 500 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const productIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID')
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  stockValidation,
  productIdValidation
};