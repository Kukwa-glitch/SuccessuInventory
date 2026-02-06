const Product = require('../models/Product');
const Document = require('../models/Document');
const Transaction = require('../models/Transaction');
const { generateInventoryPDF, generateTransactionsPDF, generateDocumentsPDF } = require('../utils/pdfGenerator');

/**
 * @desc Export inventory report as PDF
 * @route GET /api/reports/inventory
 * @access Private
 */
exports.exportInventory = async (req, res, next) => {
  try {
    const { search, category, status, stockStatus } = req.query;
    const query = {};
    const filters = {};

    // Build query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
      filters.search = search;
    }

    if (category) {
      query.category = category;
      filters.category = category;
    }

    if (status) {
      query.status = status;
      filters.status = status;
    }

    // Get products
    const products = await Product.find(query).sort({ name: 1 }).lean();

    // Filter by stock status
    let filteredProducts = products;
    if (stockStatus) {
      filteredProducts = products.filter(p => {
        const status = p.quantity === 0 ? 'out-of-stock' :
                      p.quantity <= p.minStockLevel ? 'low-stock' : 'in-stock';
        return status === stockStatus;
      });
      filters.stockStatus = stockStatus;
    }

    // Generate PDF
    const pdfBuffer = await generateInventoryPDF(filteredProducts, filters);

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-report-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Export transactions report as PDF
 * @route GET /api/reports/transactions
 * @access Private
 */
exports.exportTransactions = async (req, res, next) => {
  try {
    const { type, startDate, endDate, product } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (product) {
      query.product = product;
    }

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
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const pdfBuffer = await generateTransactionsPDF(transactions);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-report-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Export documents report as PDF
 * @route GET /api/reports/documents
 * @access Private
 */
exports.exportDocuments = async (req, res, next) => {
  try {
    const { product, startDate, endDate } = req.query;
    const query = {};

    if (product) {
      query.product = product;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const documents = await Document.find(query)
      .populate('product', 'name sku')
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const pdfBuffer = await generateDocumentsPDF(documents);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="documents-report-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get analytics data
 * @route GET /api/reports/analytics
 * @access Private
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Transaction trends
    const transactions = await Transaction.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const trendData = transactions.reduce((acc, trans) => {
      const date = trans.createdAt.toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          additions: 0,
          deductions: 0,
          total: 0
        };
      }

      if (trans.type === 'add') {
        acc[date].additions += trans.quantity;
        acc[date].total += trans.quantity;
      } else if (trans.type === 'deduct') {
        acc[date].deductions += trans.quantity;
        acc[date].total -= trans.quantity;
      }

      return acc;
    }, {});

    // Top products by movement
    const productMovement = transactions.reduce((acc, trans) => {
      const productId = trans.product.toString();
      
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          totalMovement: 0,
          additions: 0,
          deductions: 0
        };
      }

      acc[productId].totalMovement += trans.quantity;
      if (trans.type === 'add') {
        acc[productId].additions += trans.quantity;
      } else if (trans.type === 'deduct') {
        acc[productId].deductions += trans.quantity;
      }

      return acc;
    }, {});

    const topProducts = Object.values(productMovement)
      .sort((a, b) => b.totalMovement - a.totalMovement)
      .slice(0, 10);

    // Populate product details
    for (let item of topProducts) {
      const product = await Product.findById(item.productId).select('name sku');
      item.product = product;
    }

    res.json({
      success: true,
      data: {
        transactionTrends: Object.values(trendData),
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};