import { useState, useMemo } from 'react';

/**
 * Hook for managing pagination
 * 
 * @param {Array} data - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} - Pagination state and methods
 * 
 * @example
 * const {
 *   currentPage,
 *   totalPages,
 *   paginatedData,
 *   goToPage,
 *   nextPage,
 *   prevPage
 * } = usePagination(products, 10);
 */
function usePagination(data = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Get current page data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Navigation methods
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  const firstPage = () => {
    goToPage(1);
  };

  const lastPage = () => {
    goToPage(totalPages);
  };

  // Reset to first page when data changes
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Page range for pagination UI
  const getPageRange = (range = 5) => {
    const pages = [];
    const halfRange = Math.floor(range / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    // Adjust if we're near the start or end
    if (currentPage <= halfRange) {
      endPage = Math.min(totalPages, range);
    }
    
    if (currentPage > totalPages - halfRange) {
      startPage = Math.max(1, totalPages - range + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPagination,
    getPageRange,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage, data.length),
    totalItems: data.length,
  };
}

export default usePagination;