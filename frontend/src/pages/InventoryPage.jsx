import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, PlusCircle, MinusCircle, Trash2, Edit } from 'lucide-react';
import { productsAPI } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ProductForm from '../components/products/ProductForm';
import StockAdjustmentForm from '../components/products/StockAdjustmentForm';

const InventoryPage = () => {
  const { isAdmin, isStaff } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'add-stock', 'deduct-stock'

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsAPI.getAll({ search }).then((res) => res.data),
  });

  const products = productsData?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      showToast('Product deleted successfully', 'success');
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to delete product', 'error');
    },
  });

  const handleDelete = (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(product._id);
    }
  };

  const openModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedProduct(null);
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return {
        label: 'Out of Stock',
        className: 'status-out',
      };
    } else if (product.quantity <= product.minStockLevel) {
      return {
        label: 'Low Stock',
        className: 'status-low',
      };
    }
    return {
      label: 'In Stock',
      className: 'status-in-stock',
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" className="text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input max-w-md"
              />
            </div>
            <div className="flex gap-2">
              {isStaff && (
                <button
                  onClick={() => openModal('create')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              )}
              <button className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {products.length} products found
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => {
                const status = getStockStatus(product);
                return (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image?.url && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            src={product.image.url}
                            alt={product.name}
                          />
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {product.quantity}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        {product.unit}
                      </span>
                      <div className="text-xs text-gray-500">
                        Min: {product.minStockLevel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {isStaff && (
                          <>
                            <button
                              onClick={() => openModal('add-stock', product)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Add Stock"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openModal('deduct-stock', product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Deduct Stock"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openModal('edit', product)}
                              className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                            disabled={deleteMutation.isLoading}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalType === 'create' || modalType === 'edit') && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title={modalType === 'create' ? 'Add New Product' : 'Edit Product'}
        >
          <ProductForm
            product={selectedProduct}
            onSuccess={() => {
              closeModal();
              queryClient.invalidateQueries(['products']);
            }}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {(modalType === 'add-stock' || modalType === 'deduct-stock') && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title={modalType === 'add-stock' ? 'Add Stock' : 'Deduct Stock'}
        >
          <StockAdjustmentForm
            product={selectedProduct}
            type={modalType === 'add-stock' ? 'add' : 'deduct'}
            onSuccess={() => {
              closeModal();
              queryClient.invalidateQueries(['products']);
              queryClient.invalidateQueries(['dashboard-stats']);
            }}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;