const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Middleware to upload single file to Cloudinary
const uploadSingle = (fieldName, folder = 'inventory') => {
  return async (req, res, next) => {
    // First use multer to get the file from request
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.'
            });
          }
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If no file uploaded, continue
      if (!req.file) {
        return next();
      }

      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, folder);

        // Attach file info to request
        req.uploadedFile = {
          url: result.secure_url,
          publicId: result.public_id,
          type: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
          size: result.bytes,
          format: result.format
        };

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading file',
          error: error.message
        });
      }
    });
  };
};


// Middleware to upload multiple files to Cloudinary
const uploadMultiple = (fieldName, maxCount = 5, folder = 'inventory') => {
  return async (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum is ${maxCount}.`
            });
          }
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If no files uploaded, continue
      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        // Upload all files to Cloudinary
        const uploadPromises = req.files.map(file =>
          uploadToCloudinary(file.buffer, folder)
        );

        const results = await Promise.all(uploadPromises);

        // Attach files info to request
        req.uploadedFiles = results.map((result, index) => ({
          url: result.secure_url,
          publicId: result.public_id,
          type: req.files[index].mimetype.startsWith('image/') ? 'image' : 'pdf',
          size: result.bytes,
          format: result.format
        }));

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading files',
          error: error.message
        });
      }
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteFromCloudinary
};