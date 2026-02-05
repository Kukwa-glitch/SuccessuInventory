const Transaction = require('../models/Transaction');

/**
 * @desc Get all transactions with filtering
 * @route GET /api/transactions
 * @access Private
 */
exports.getAllTransactions = async (req, res, next) => {
  try {
    const {
      product,
      type,
      startDate,
      endDate,
      sort = '-createdAt',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    // Filter by product
    if (product) {
      query.product = product;
    }

    // Filter by transaction type
    if (type) {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.find(query)
      .populate('product', 'name sku category')
      .populate('performedBy', 'username email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single transaction by ID
 * @route GET /api/transactions/:id
 * @access Private
 */
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product')
      .populate('performedBy', 'username email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get transactions by product
 * @route GET /api/transactions/product/:productId
 * @access Private
 */
exports.getTransactionsByProduct = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ product: req.params.productId })
      .populate('performedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get recent activity
 * @route GET /api/transactions/recent
 * @access Private
 */
exports.getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const transactions = await Transaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};