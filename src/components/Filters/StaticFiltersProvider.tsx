import { useAnswersActions, useAnswersState, SelectableFilter as DisplayableFilter } from '@yext/answers-headless-react';
import { PropsWithChildren, useMemo } from 'react';
import { executeSearch } from '../../utils/search-operations';
import { FiltersContext, FiltersContextType } from './FiltersContext';

/**
 * Props for the {@link Filters.StaticFiltersProvider}.
 *
 * @public
 */
export type StaticFiltersProviderProps = PropsWithChildren<{
  /** CSS class names applied to the StaticFilter's container div. */
  className?: string,
  /** Whether or not a search is automatically run when a filter is selected. Defaults to true. */
  searchOnChange?: boolean
}>;

/**
 * The StaticFilters component is a wrapper component around {@link Filters} that updates static filter
 * options when a child filter is updated.
 *
 * The representation of the facets is configured using props.children,
 * and is intended for use with components like {@link Filters.CheckboxOption}.
 *
 * @param props - {@link Filters.StaticFiltersProviderProps}
 *
 * @public
 */
export function StaticFiltersProvider({
  children,
  className = 'w-full',
  searchOnChange = true
}: StaticFiltersProviderProps): JSX.Element {
  const answersActions = useAnswersActions();
  const displayableFilters = useAnswersState(state => state.filters.static);

  const filtersContextInstance: FiltersContextType = useMemo(() => {
    return {
      selectFilter(filter: DisplayableFilter) {
        answersActions.setFilterOption({ ...filter });
      },
      applyFilters() {
        if (searchOnChange) {
          answersActions.setOffset(0);
          answersActions.resetFacets();
          executeSearch(answersActions);
        }
      },
      filters: displayableFilters ?? []
    };
  }, [answersActions, displayableFilters, searchOnChange]);

  return (
    <div className={className}>
      <FiltersContext.Provider value={filtersContextInstance}>
        {children}
      </FiltersContext.Provider>
    </div>
  );
}
