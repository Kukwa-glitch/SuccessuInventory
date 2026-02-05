const { param, query } = require('express-validator');

const transactionIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isMongoId()
    .withMessage('Invalid transaction ID')
];

const productIdValidation = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID')
];

const transactionQueryValidation = [
  query('product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),

  query('type')
    .optional()
    .isIn(['add', 'deduct', 'adjust'])
    .withMessage('Invalid transaction type'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  transactionIdValidation,
  productIdValidation,
  transactionQueryValidation
};