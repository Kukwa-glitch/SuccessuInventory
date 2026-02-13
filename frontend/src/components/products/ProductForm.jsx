import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { productsAPI } from '../../api/services';
import { useToast } from '../ToastContainer';
import LoadingSpinner from '../LoadingSpinner';
import { Upload, X } from 'lucide-react';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [imagePreview, setImagePreview] = useState(product?.image?.url || null);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: product || {
      name: '',
      sku: '',
      category: '',
      description: '',
      quantity: 0,
      minStockLevel: 10,
      unit: 'pcs',
      productType: '',
      size: '',
      supplier: { name: '', contact: '' },
      location: 'Main Warehouse',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      
      // Append all fields
      Object.keys(data).forEach((key) => {
        if (key === 'supplier') {
          formData.append('supplier[name]', data.supplier.name || '');
          formData.append('supplier[contact]', data.supplier.contact || '');
        } else {
          formData.append(key, data[key]);
        }
      });

      // Append image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      return product
        ? productsAPI.update(product._id, formData)
        : productsAPI.create(formData);
    },
    onSuccess: () => {
      showToast(
        product ? 'Product updated successfully' : 'Product created successfully',
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
    mutation.mutate(data);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product Image
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Product name is required' })}
            className="form-input"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            SKU *
          </label>
          <input
            type="text"
            {...register('sku', { required: 'SKU is required' })}
            className="form-input"
            disabled={!!product}
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <input
            type="text"
            {...register('category', { required: 'Category is required' })}
            className="form-input"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Product Type
          </label>
          <input
            type="text"
            {...register('productType')}
            className="form-input"
            placeholder="e.g., Raw Material, Finished Goods"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Size
        </label>
        <input
          type="text"
          {...register('size')}
          className="form-input"
          placeholder="e.g., Small, Medium, Large, XL, 100ml"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows="3"
          className="form-input"
        />
      </div>

      {/* Stock Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {product ? 'Current Quantity' : 'Initial Quantity'} *
          </label>
          <input
            type="number"
            {...register('quantity', {
              required: 'Quantity is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
            className="form-input"
            disabled={!!product}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Stock Level *
          </label>
          <input
            type="number"
            {...register('minStockLevel', {
              required: 'Min stock level is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
            className="form-input"
          />
          {errors.minStockLevel && (
            <p className="mt-1 text-sm text-red-600">
              {errors.minStockLevel.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Unit *
        </label>
        <select {...register('unit', { required: true })} className="form-input">
          <option value="pcs">Pieces</option>
          <option value="kg">Kilograms</option>
          <option value="g">Grams</option>
          <option value="l">Liters</option>
          <option value="ml">Milliliters</option>
          <option value="box">Box</option>
          <option value="pack">Pack</option>
          <option value="dozen">Dozen</option>
          <option value="pair">Pair</option>
        </select>
      </div>

      {/* Supplier & Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Supplier Name
        </label>
        <input
          type="text"
          {...register('supplier.name')}
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Supplier Contact
        </label>
        <input
          type="text"
          {...register('supplier.contact')}
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location
        </label>
        <input
          type="text"
          {...register('location')}
          className="form-input"
        />
      </div>

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
          className="flex-1 btn-primary flex items-center justify-center gap-2"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>{product ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <span>{product ? 'Update' : 'Create'} Product</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;