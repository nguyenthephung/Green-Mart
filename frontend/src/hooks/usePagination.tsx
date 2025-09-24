import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsePaginationReturn<T> extends PaginationState {
  currentData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  setItemsPerPage: (count: number) => void;
  itemsPerPage: number;
}

export const usePagination = <T,>({
  data,
  itemsPerPage: initialItemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);

  const currentData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);

  const setItemsPerPage = (count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentData,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    setItemsPerPage,
    itemsPerPage,
  };
};
