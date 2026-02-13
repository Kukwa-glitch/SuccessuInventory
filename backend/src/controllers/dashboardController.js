const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

/**
 * @desc Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get all active products
    const products = await Product.find({ status: 'active' }).lean();

    // Total items count
    const totalItems = products.length;

    // Total quantity
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    // Low stock items
    const lowStockItems = products.filter(
      p => p.quantity > 0 && p.quantity <= p.minStockLevel
    );

    // Out of stock items
    const outOfStockItems = products.filter(p => p.quantity === 0);

    // Recent activity (last 10 transactions)
    const recentActivity = await Transaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalQuantity,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length
        },
        lowStockItems: lowStockItems.slice(0, 5).map(p => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          quantity: p.quantity,
          minStockLevel: p.minStockLevel
        })),
        outOfStockItems: outOfStockItems.slice(0, 5).map(p => ({
          id: p._id,
          name: p.name,
          sku: p.sku
        })),
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get inventory by category
 * @route GET /api/dashboard/by-category
 * @access Private
 */
exports.getInventoryByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' }).lean();

    const categoryData = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';

      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          totalQuantity: 0
        };
      }

      acc[category].count += 1;
      acc[category].totalQuantity += product.quantity;

      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(categoryData)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get low stock alerts
 * @route GET /api/dashboard/low-stock
 * @access Private
 */
exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' }).lean();

    const lowStockProducts = products
      .filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel)
      .map(p => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        quantity: p.quantity,
        minStockLevel: p.minStockLevel,
        difference: p.minStockLevel - p.quantity,
        urgency: p.quantity <= (p.minStockLevel * 0.5) ? 'high' : 'medium'
      }))
      .sort((a, b) => a.quantity - b.quantity);

    const outOfStockProducts = products
      .filter(p => p.quantity === 0)
      .map(p => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        minStockLevel: p.minStockLevel,
        urgency: 'critical'
      }));

    res.json({
      success: true,
      data: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        totalAlerts: lowStockProducts.length + outOfStockProducts.length
      }
    });
  } catch (error) {
    next(error);
  }
};