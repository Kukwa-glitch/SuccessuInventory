import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { productsAPI } from '../../api/services';
import { useToast } from '../ToastContainer';
import LoadingSpinner from '../LoadingSpinner';
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';

const StockAdjustmentForm = ({ product, type, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: '',
      reason: '',
      notes: '',
    },
  });

  const quantity = watch('quantity');

  const mutation = useMutation({
    mutationFn: (data) => {
      if (type === 'add') {
        return productsAPI.addStock(product._id, data);
      } else {
        const formData = new FormData();
        formData.append('quantity', data.quantity);
        formData.append('reason', data.reason);
        if (data.notes) formData.append('notes', data.notes);
        if (file) {
          formData.append('document', file);
          formData.append('documentTitle', `Deduction - ${product.name}`);
          formData.append('documentDescription', data.reason);
        }
        return productsAPI.deductStock(product._id, formData);
      }
    },
    onSuccess: () => {
      showToast(
        `Stock ${type === 'add' ? 'added' : 'deducted'} successfully`,
        'success'
      );
      onSuccess();
    },
    onError: (error) => {
      showToast(
        error.response?.data?.message || 'Operation failed',
        'error'
      );
    },
  });

  const onSubmit = (data) => {
    if (type === 'deduct' && !file) {
      showToast('Verification document is required for deductions', 'error');
      return;
    }
    mutation.mutate(data);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        showToast('File too large. Maximum size is 10MB.', 'error');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        showToast('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.', 'error');
        return;
      }

      setFile(selectedFile);
      setFileType(selectedFile.type);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  const newQuantity = type === 'add'
    ? product.quantity + (parseInt(quantity) || 0)
    : product.quantity - (parseInt(quantity) || 0);

  const getFileIcon = () => {
    if (fileType?.startsWith('image/')) {
      return ImageIcon;
    } else if (fileType === 'application/pdf') {
      return FileText;
    }
    return File;
  };

  const FileIconComponent = getFileIcon();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      {/* Product Info */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        {product.image?.url && (
          <img
            src={product.image.url}
            className="w-16 h-16 rounded-lg object-cover"
            alt={product.name}
          />
        )}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">
            {product.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current Stock:{' '}
            <span
              className={`font-bold ${
                product.quantity <= product.minStockLevel
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {product.quantity} {product.unit}
            </span>
          </p>
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Quantity to {type === 'add' ? 'Add' : 'Remove'} *
        </label>
        <input
          type="number"
          {...register('quantity', {
            required: 'Quantity is required',
            min: { value: 1, message: 'Must be at least 1' },
            max: type === 'deduct'
              ? {
                  value: product.quantity,
                  message: `Cannot exceed current stock (${product.quantity})`,
                }
              : undefined,
          })}
          className="form-input"
          placeholder="Enter amount..."
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
        )}
        {quantity && (
          <p className="mt-1 text-sm text-gray-500">
            New stock will be:{' '}
            <span
              className={`font-bold ${
                newQuantity < 0
                  ? 'text-red-600'
                  : newQuantity <= product.minStockLevel
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }`}
            >
              {newQuantity} {product.unit}
            </span>
          </p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reason *
        </label>
        <textarea
          {...register('reason', { required: 'Reason is required' })}
          rows="2"
          className="form-input"
          placeholder={`Why are you ${type === 'add' ? 'adding' : 'removing'} this stock?`}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Additional Notes
        </label>
        <textarea
          {...register('notes')}
          rows="2"
          className="form-input"
          placeholder="Any additional information..."
        />
      </div>

      {/* File Upload for Deductions */}
      {type === 'deduct' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verification Document * <span className="text-red-600">(Required for deductions)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Upload an image or PDF document to verify this deduction
          </p>
          {file ? (
            <div className="relative">
              {filePreview ? (
                // Image preview
                <div className="relative inline-block">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full max-h-48 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // PDF or other file indicator
                <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <FileIconComponent className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Click to upload image or PDF
              </span>
              <span className="text-xs text-gray-400 mt-1">
                JPG, PNG, WEBP, or PDF (Max 10MB)
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
          disabled={mutation.isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`flex-1 flex items-center justify-center gap-2 ${
            type === 'add'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50`}
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>{type === 'add' ? 'Adding...' : 'Deducting...'}</span>
            </>
          ) : (
            <span>{type === 'add' ? 'Add' : 'Deduct'} Stock</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;