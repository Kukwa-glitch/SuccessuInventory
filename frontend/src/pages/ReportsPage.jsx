import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { dashboardAPI, reportsAPI } from '../api/services';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportsPage = () => {
  const { showToast } = useToast();

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['inventory-by-category'],
    queryFn: () => dashboardAPI.getByCategory().then((res) => res.data.data),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 30],
    queryFn: () => reportsAPI.getAnalytics(30).then((res) => res.data.data),
  });

  const handleExportInventory = async () => {
    try {
      const response = await reportsAPI.exportInventory({});
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Inventory report exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export report', 'error');
    }
  };

  if (categoryLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" className="text-primary-600" />
      </div>
    );
  }

  const topProducts = analyticsData?.topProducts || [];
  const totalMovement = topProducts.reduce((sum, p) => sum + p.totalMovement, 0);

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex justify-end gap-2 animate-fade-in">
        <button
          onClick={handleExportInventory}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Inventory PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Category Distribution
          </h3>
          <div className="space-y-4">
            {categoryData?.map((category, index) => {
              const maxQuantity = Math.max(...categoryData.map((c) => c.totalQuantity));
              const percentage = (category.totalQuantity / maxQuantity) * 100;
              
              return (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {category.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {category.totalQuantity} units
                      </span>
                      <span className="text-xs text-gray-500">
                        ${category.totalValue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {category.count} products
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products by Movement */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Top Products by Movement (Last 30 Days)
          </h3>
          <div className="space-y-4">
            {topProducts.slice(0, 10).map((product, index) => {
              const percentage = totalMovement > 0
                ? (product.totalMovement / totalMovement) * 100
                : 0;

              return (
                <div
                  key={product.productId}
                  className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.product?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.product?.sku}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className="text-green-600 dark:text-green-400">
                        +{product.additions} added
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        -{product.deductions} deducted
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {product.totalMovement}
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Summary Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Categories
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {categoryData?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Stock Value
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ${categoryData?.reduce((sum, c) => sum + c.totalValue, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Products
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {categoryData?.reduce((sum, c) => sum + c.count, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;