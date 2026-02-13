import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, XCircle, Grid } from 'lucide-react';
import { dashboardAPI, transactionsAPI } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats().then((res) => res.data.data),
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => transactionsAPI.getRecent(5).then((res) => res.data.data),
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: () => dashboardAPI.getLowStock().then((res) => res.data.data),
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" className="text-primary-600" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: stats?.summary?.totalItems || 0,
      subtitle: 'Different items',
      icon: Package,
      color: 'primary',
    },
    {
      title: 'Total Stock',
      value: stats?.summary?.totalQuantity || 0,
      subtitle: 'Units in inventory',
      icon: Grid,
      color: 'secondary',
    },
    {
      title: 'Low Stock',
      value: stats?.summary?.lowStockCount || 0,
      subtitle: 'Need reordering',
      icon: AlertTriangle,
      color: 'yellow',
    },
    {
      title: 'Out of Stock',
      value: stats?.summary?.outOfStockCount || 0,
      subtitle: 'Urgent restock needed',
      icon: XCircle,
      color: 'red',
    },
  ];

  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    secondary: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400',
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {statsCards.map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 card-hover"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stat.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button
              onClick={() => window.location.href = '/transactions'}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'add'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <span className="text-lg font-bold">
                        {transaction.type === 'add' ? '+' : '-'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.type === 'add' ? 'Stock Added' : 'Stock Deducted'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.product?.name} •{' '}
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        transaction.type === 'add'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {transaction.type === 'add' ? '+' : '-'}
                      {transaction.quantity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Low Stock Alerts
            </h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
              {(lowStockData?.lowStock?.length || 0) + (lowStockData?.outOfStock?.length || 0)} Items
            </span>
          </div>
          <div className="p-6">
            {lowStockData && (lowStockData.lowStock?.length > 0 || lowStockData.outOfStock?.length > 0) ? (
              <div className="space-y-4">
                {[...lowStockData.outOfStock, ...lowStockData.lowStock].slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category} • Min: {item.minStockLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          item.quantity === 0 ? 'text-red-600' : 'text-yellow-600'
                        }`}
                      >
                        {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">left</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                All stock levels healthy!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;