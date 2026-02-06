const Document = require('../models/Document');
const { deleteFromCloudinary } = require('../middleware/upload');
const https = require('https');
const http = require('http');

/**
 * @desc Get all documents with filtering
 * @route GET /api/documents
 * @access Private
 */
exports.getAllDocuments = async (req, res, next) => {
  try {
    const {
      product,
      transaction,
      startDate,
      endDate,
      sort = '-createdAt',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (product) {
      query.product = product;
    }

    if (transaction) {
      query.transaction = transaction;
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
      .populate('product', 'name sku category')
      .populate('transaction', 'type quantity reason')
      .populate('uploadedBy', 'username email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
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
 * @desc Get single document by ID
 * @route GET /api/documents/:id
 * @access Private
 */
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('product')
      .populate('transaction')
      .populate('uploadedBy', 'username email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Download document file
 * @route GET /api/documents/:id/download
 * @access Private
 */
exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.file?.url) {
      return res.status(404).json({
        success: false,
        message: 'File not found for this document'
      });
    }

    const fileUrl = document.file.url;
    const protocol = fileUrl.startsWith('https') ? https : http;

    // Fetch file from storage
    protocol.get(fileUrl, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
        
        redirectProtocol.get(redirectUrl, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            return res.status(500).json({
              success: false,
              message: 'Failed to fetch file from storage'
            });
          }

          // Set headers for download
          const fileExtension = document.file.type?.split('/')[1] || 
                               fileUrl.split('.').pop()?.split('?')[0] || 'file';
          const filename = document.title 
            ? `${document.title.replace(/[^a-z0-9\s]/gi, '_').trim()}.${fileExtension}`
            : `document-${document._id}.${fileExtension}`;

          res.setHeader('Content-Type', document.file.type || 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          
          // Pipe the file to response
          redirectResponse.pipe(res);
        }).on('error', (error) => {
          console.error('Error fetching redirected file:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to download file'
          });
        });
        return;
      }

      if (response.statusCode !== 200) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch file from storage'
        });
      }

      // Set headers for download
      const fileExtension = document.file.type?.split('/')[1] || 
                           fileUrl.split('.').pop()?.split('?')[0] || 'file';
      const filename = document.title 
        ? `${document.title.replace(/[^a-z0-9\s]/gi, '_').trim()}.${fileExtension}`
        : `document-${document._id}.${fileExtension}`;

      res.setHeader('Content-Type', document.file.type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Pipe the file to response
      response.pipe(res);
    }).on('error', (error) => {
      console.error('Error fetching file:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download file'
      });
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete document
 * @route DELETE /api/documents/:id
 * @access Private
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from Cloudinary
    if (document.file?.publicId) {
      await deleteFromCloudinary(document.file.publicId);
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get documents by product
 * @route GET /api/documents/product/:productId
 * @access Private
 */
exports.getDocumentsByProduct = async (req, res, next) => {
  try {
    const documents = await Document.find({ product: req.params.productId })
      .populate('transaction', 'type quantity reason createdAt')
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};