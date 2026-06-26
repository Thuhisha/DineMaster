import React from 'react';
import './Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Always render to show pagination exists
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div className="pagination">
      <button 
        className="btn btn-outline btn-sm" 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span className="page-info">
        Page {currentPage} of {safeTotalPages}
      </span>
      <button 
        className="btn btn-outline btn-sm" 
        disabled={currentPage === safeTotalPages} 
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
