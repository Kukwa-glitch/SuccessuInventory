import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Trash2, ExternalLink } from 'lucide-react';
import { documentsAPI } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';

const DocumentsPage = () => {
  const { isStaff } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsAPI.getAll(filters).then((res) => res.data),
  });

  const documents = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      showToast('Document deleted successfully', 'success');
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to delete document', 'error');
    },
  });

  const handleDelete = (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      deleteMutation.mutate(document._id);
    }
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
        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="form-input"
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {documents.length} documents found
          </div>
        </div>

        {/* Documents Grid */}
        <div className="p-6">
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <div
                  key={document._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {document.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {document.product?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                      {document.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {document.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <a
                          href={document.file?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View File
                        </a>
                        {isStaff && (
                          <button
                            onClick={() => handleDelete(document)}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                            disabled={deleteMutation.isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>By: {document.uploadedBy?.username}</span>
                      <span className="capitalize">{document.file?.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No documents found</p>
              <p className="text-sm mt-2">
                Documents are automatically created when you deduct stock
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;