const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Document = require('../models/Document');
const { deleteFromCloudinary } = require('../middleware/upload');

/**
 * @desc Get all products with filtering and search
 * @route GET /api/products
 * @access Private
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      stockStatus,
      sort = '-createdAt',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    // Search in name, SKU, or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Get products
    const products = await Product.find(query)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Filter by stock status (virtual field)
    let filteredProducts = products;
    if (stockStatus) {
      filteredProducts = products.filter(product => {
        const status = product.quantity === 0 ? 'out-of-stock' :
                      product.quantity <= product.minStockLevel ? 'low-stock' : 'in-stock';
        return status === stockStatus;
      });
    }

    // Get total count
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: filteredProducts,
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
 * @desc Get single product by ID
 * @route GET /api/products/:id
 * @access Private
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new product
 * @route POST /api/products
 * @access Private (Staff/Admin)
 */
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      description,
      quantity,
      minStockLevel,
      unit,
      productType,
      size,
      supplier,
      location
    } = req.body;

    // SKU uniqueness check removed - duplicate SKUs are now allowed

    // Create product data
    const productData = {
      name,
      sku: sku.toUpperCase(),
      category,
      description,
      quantity: parseInt(quantity) || 0,
      minStockLevel: parseInt(minStockLevel) || 10,
      unit,
      productType: productType || '',
      size: size || '',
      supplier,
      location,
      createdBy: req.userId,
      updatedBy: req.userId
    };

    // Add image if uploaded
    if (req.uploadedFile) {
      productData.image = {
        url: req.uploadedFile.url,
        publicId: req.uploadedFile.publicId
      };
    }

    // Create product
    const product = await Product.create(productData);

    // Create initial transaction
    if (parseInt(quantity) > 0) {
      await Transaction.create({
        product: product._id,
        type: 'add',
        quantity: parseInt(quantity),
        previousQuantity: 0,
        newQuantity: parseInt(quantity),
        reason: 'Initial stock',
        performedBy: req.userId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    // Delete uploaded image if product creation fails
    if (req.uploadedFile?.publicId) {
      await deleteFromCloudinary(req.uploadedFile.publicId);
    }
    next(error);
  }
};

/**
 * @desc Update product
 * @route PUT /api/products/:id
 * @access Private (Staff/Admin)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      category,
      description,
      minStockLevel,
      unit,
      productType,
      size,
      supplier,
      location,
      status
    } = req.body;

    // Update fields
    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (minStockLevel) product.minStockLevel = parseInt(minStockLevel);
    if (unit) product.unit = unit;
    if (productType !== undefined) product.productType = productType;
    if (size !== undefined) product.size = size;
    if (supplier !== undefined) product.supplier = supplier;
    if (location !== undefined) product.location = location;
    if (status) product.status = status;
    product.updatedBy = req.userId;

    // Update image if new one uploaded
    if (req.uploadedFile) {
      // Delete old image
      if (product.image?.publicId) {
        await deleteFromCloudinary(product.image.publicId);
      }

      product.image = {
        url: req.uploadedFile.url,
        publicId: req.uploadedFile.publicId
      };
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete product
 * @route DELETE /api/products/:id
 * @access Private (Admin only)
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product image
    if (product.image?.publicId) {
      await deleteFromCloudinary(product.image.publicId);
    }

    // Delete related transactions and their documents
    const transactions = await Transaction.find({ product: product._id });
    for (const transaction of transactions) {
      if (transaction.document?.publicId) {
        await deleteFromCloudinary(transaction.document.publicId);
      }
    }
    await Transaction.deleteMany({ product: product._id });

    // Delete related documents
    const documents = await Document.find({ product: product._id });
    for (const doc of documents) {
      if (doc.file?.publicId) {
        await deleteFromCloudinary(doc.file.publicId);
      }
    }
    await Document.deleteMany({ product: product._id });

    // Delete product
    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product and all related data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add stock to product
 * @route POST /api/products/:id/add-stock
 * @access Private (Staff/Admin)
 */
exports.addStock = async (req, res, next) => {
  try {
    const { quantity, reason, notes } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const quantityToAdd = parseInt(quantity);
    if (quantityToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const previousQuantity = product.quantity;
    product.quantity += quantityToAdd;
    product.updatedBy = req.userId;
    await product.save();

    // Create transaction
    const transaction = await Transaction.create({
      product: product._id,
      type: 'add',
      quantity: quantityToAdd,
      previousQuantity,
      newQuantity: product.quantity,
      reason,
      notes,
      performedBy: req.userId
    });

    await transaction.populate('performedBy', 'username');

    res.json({
      success: true,
      message: 'Stock added successfully',
      data: {
        product,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Deduct stock from product (with document upload)
 * @route POST /api/products/:id/deduct-stock
 * @access Private (Staff/Admin)
 */
exports.deductStock = async (req, res, next) => {
  try {
    const { quantity, reason, notes, documentTitle, documentDescription } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const quantityToDeduct = parseInt(quantity);
    if (quantityToDeduct <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    if (product.quantity < quantityToDeduct) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantityToDeduct}`
      });
    }

    const previousQuantity = product.quantity;
    product.quantity -= quantityToDeduct;
    product.updatedBy = req.userId;
    await product.save();

    // Create transaction
    const transactionData = {
      product: product._id,
      type: 'deduct',
      quantity: quantityToDeduct,
      previousQuantity,
      newQuantity: product.quantity,
      reason,
      notes,
      performedBy: req.userId
    };

    // Add document if uploaded
    if (req.uploadedFile) {
      transactionData.document = {
        url: req.uploadedFile.url,
        publicId: req.uploadedFile.publicId,
        type: req.uploadedFile.type
      };
    }

    const transaction = await Transaction.create(transactionData);
    await transaction.populate('performedBy', 'username');

    // Create document record if file was uploaded
    let document = null;
    if (req.uploadedFile) {
      document = await Document.create({
        transaction: transaction._id,
        product: product._id,
        title: documentTitle || `Deduction - ${product.name}`,
        description: documentDescription || reason,
        file: {
          url: req.uploadedFile.url,
          publicId: req.uploadedFile.publicId,
          type: req.uploadedFile.type,
          size: req.uploadedFile.size,
          format: req.uploadedFile.format
        },
        uploadedBy: req.userId
      });
      await document.populate('uploadedBy', 'username');
    }

    res.json({
      success: true,
      message: 'Stock deducted successfully',
      data: {
        product,
        transaction,
        document
      }
    });
  } catch (error) {
    // Delete uploaded file if transaction fails
    if (req.uploadedFile?.publicId) {
      await deleteFromCloudinary(req.uploadedFile.publicId);
    }
    next(error);
  }
};

/**
 * @desc Get all product categories
 * @route GET /api/products/categories
 * @access Private
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');

    res.json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    next(error);
  }
};