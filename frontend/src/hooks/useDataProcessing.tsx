import { useState, useEffect, useMemo } from 'react';

interface UseDebounceProps {
  value: string;
  delay: number;
}

export const useDebounce = ({ value, delay }: UseDebounceProps): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface UseSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  searchTerm: string;
  searchDelay?: number;
}

export const useSearch = <T extends Record<string, any>>({
  data,
  searchFields,
  searchTerm,
  searchDelay = 300
}: UseSearchProps<T>) => {
  const debouncedSearchTerm = useDebounce({ value: searchTerm, delay: searchDelay });

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return data;
    }

    const lowercaseSearchTerm = debouncedSearchTerm.toLowerCase();

    return data.filter(item => {
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (fieldValue == null) return false;
        
        return String(fieldValue).toLowerCase().includes(lowercaseSearchTerm);
      });
    });
  }, [data, debouncedSearchTerm, searchFields]);

  return {
    filteredData,
    isSearching: searchTerm !== debouncedSearchTerm,
    searchTerm: debouncedSearchTerm
  };
};

interface UseFilterProps<T> {
  data: T[];
  filters: Record<string, any>;
  filterFunctions: Record<string, (item: T, filterValue: any) => boolean>;
}

export const useFilter = <T,>({
  data,
  filters,
  filterFunctions
}: UseFilterProps<T>) => {
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        // Skip if filter value is "all" or empty
        if (filterValue === 'all' || filterValue === '' || filterValue == null) {
          return true;
        }

        const filterFunction = filterFunctions[filterKey];
        if (!filterFunction) {
          console.warn(`No filter function found for key: ${filterKey}`);
          return true;
        }

        return filterFunction(item, filterValue);
      });
    });
  }, [data, filters, filterFunctions]);

  return filteredData;
};

interface UseSortProps<T> {
  data: T[];
  sortField: keyof T;
  sortOrder: 'asc' | 'desc';
}

export const useSort = <T,>({
  data,
  sortField,
  sortOrder
}: UseSortProps<T>) => {
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [data, sortField, sortOrder]);

  return sortedData;
};

// Combined hook for search, filter, and sort
interface UseDataProcessingProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  searchTerm: string;
  filters: Record<string, any>;
  filterFunctions: Record<string, (item: T, filterValue: any) => boolean>;
  sortField: keyof T;
  sortOrder: 'asc' | 'desc';
  searchDelay?: number;
}

export const useDataProcessing = <T extends Record<string, any>>({
  data,
  searchFields,
  searchTerm,
  filters,
  filterFunctions,
  sortField,
  sortOrder,
  searchDelay = 300
}: UseDataProcessingProps<T>) => {
  // Step 1: Search
  const { filteredData: searchedData, isSearching } = useSearch({
    data,
    searchFields,
    searchTerm,
    searchDelay
  });

  // Step 2: Filter
  const filteredData = useFilter({
    data: searchedData,
    filters,
    filterFunctions
  });

  // Step 3: Sort
  const processedData = useSort({
    data: filteredData,
    sortField,
    sortOrder
  });

  return {
    processedData,
    isSearching,
    searchedCount: searchedData.length,
    filteredCount: filteredData.length,
    totalCount: data.length
  };
};
