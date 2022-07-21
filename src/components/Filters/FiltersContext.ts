import { SelectableFilter as DisplayableFilter } from '@yext/search-headless-react';
import { createContext, useContext } from 'react';

/**
 * FiltersContext is responsible for handling filter selection.
 *
 * @public
 */
export interface FiltersContextType {
  /** A function called when a filter is selected. */
  selectFilter: (filter: DisplayableFilter) => void,
  /** A function called when filters should be applied. */
  applyFilters: () => void,
  /** The list of DisplayableFilter provided by the context. */
  filters: DisplayableFilter[]
}

/**
 * Filters context which provides the filters to render and a handler for selecting a filter.
 *
 * @public
 */
export const FiltersContext = createContext<FiltersContextType | null>(null);

/**
 * A hook used to access the {@link Filters.FiltersContextType}.
 *
 * @public
 */
export function useFiltersContext(): FiltersContextType {
  const filtersContextInstance = useContext(FiltersContext);
  if (filtersContextInstance === null) {
    throw new Error('Tried to use FiltersContext when none exists.');
  }
  return filtersContextInstance;
}
