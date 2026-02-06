import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, FileText, FileDown, X } from 'lucide-react';
import { documentsAPI, reportsAPI } from '../api/services';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';

const DocumentsPage = () => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filters, setFilters] = useState({
    product: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsAPI.getAll(filters).then((res) => res.data),
  });

  const documents = data?.data || [];

  // View document details in modal
  const handleViewDetails = (document) => {
    setSelectedDocument(document);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedDocument(null);
  };

  // Download single document file
  const handleDownloadFile = (document) => {
    if (!document.file?.url) {
      showToast('No file available for this document', 'error');
      return;
    }

    try {
      // Open file in new tab for download
      const link = document.createElement('a');
      link.href = document.file.url;
      link.target = '_blank';
      link.download = document.title || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading file...', 'info');
    } catch (error) {
      showToast('Failed to download file', 'error');
    }
  };

  // Export all documents to PDF report
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const response = await reportsAPI.exportDocuments(filters);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Documents report exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export documents report', 'error');
    } finally {
      setIsExporting(false);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Filter
              </label>
              <input
                type="text"
                placeholder="Search by product..."
                value={filters.product}
                onChange={(e) =>
                  setFilters({ ...filters, product: e.target.value })
                }
                className="form-input"
              />
            </div>

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

            <div className="flex items-end">
              <button 
                onClick={handleExportPDF}
                disabled={isExporting || documents.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Download PDF Report'}
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((document) => (
                <tr
                  key={document._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {document.title}
                    </div>
                    {document.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                        {document.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {document.product?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {document.product?.sku || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {document.file?.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {document.uploadedBy?.username || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(document)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {document.file?.url && (
                        <button
                          onClick={() => handleDownloadFile(document)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No documents found</p>
          </div>
        )}
      </div>

      {/* Document Details Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Document Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Title
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedDocument.title}
                </p>
              </div>

              {/* Description */}
              {selectedDocument.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedDocument.description}
                  </p>
                </div>
              )}

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Product
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {selectedDocument.product?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    SKU: {selectedDocument.product?.sku || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    File Type
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {selectedDocument.file?.type || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Upload Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Uploaded By
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {selectedDocument.uploadedBy?.username || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Upload Date
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedDocument.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* File Preview */}
              {selectedDocument.file?.url && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    File Preview
                  </h3>
                  {selectedDocument.file.type?.includes('image') ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={selectedDocument.file.url}
                        alt={selectedDocument.title}
                        className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Preview not available for this file type
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {selectedDocument.file?.url && (
                  <button
                    onClick={() => handleDownloadFile(selectedDocument)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;