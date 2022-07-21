import { useSearchState } from '@yext/search-headless-react';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import { pruneAppliedFilters } from '../utils/appliedfilterutils';
import { useMemo } from 'react';
import classNames from 'classnames';
import { AppliedFiltersDisplay } from './AppliedFiltersDisplay';
import { GroupedFilters } from '../models/groupedFilters';
import { DEFAULT_HIERARCHICAL_DELIMITER } from './Filters/HierarchicalFacetDisplay';
import { useStateUpdatedOnSearch } from '../hooks/useStateUpdatedOnSearch';

/**
 * The CSS class interface used for {@link AppliedFilters}.
 *
 * @public
 */
export interface AppliedFiltersCssClasses {
  appliedFiltersContainer?: string,
  appliedFiltersLoading?: string,
  nlpFilter?: string,
  removableFilter?: string,
  filterLabel?: string,
  clearAllButton?: string
}

export const builtInCssClasses: Readonly<AppliedFiltersCssClasses> = {
  // Use negative margin to remove space above the filters on mobile
  appliedFiltersContainer: 'flex flex-wrap -mt-3 md:mt-0 mb-2',
  appliedFiltersLoading: 'opacity-50',
  nlpFilter: 'border rounded-3xl px-3 py-1.5 text-sm font-medium text-neutral-dark mr-2 mb-2',
  removableFilter: 'flex items-center border rounded-3xl px-3 py-1.5 text-sm font-medium text-neutral-dark mr-2 mb-2',
  clearAllButton: 'text-sm font-medium text-primary hover:underline focus:underline mb-2'
};

/**
 * Properties for {@link AppliedFilters}.
 *
 * @public
 */
export interface AppliedFiltersProps {
  /** List of filters that should not be displayed. By default, builtin.entityType will be hidden. */
  hiddenFields?: Array<string>,
  /** A set of facet fieldIds that should be interpreted as "hierarchical". */
  hierarchicalFacetsFieldIds?: string[],
  /** {@inheritDoc HierarchicalFacetsProps.delimiter} */
  hierarchicalFacetsDelimiter?: string,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: AppliedFiltersCssClasses
}

/**
 * A component that displays a list of filters applied to the current vertical
 * search, which may include any selected options from static filters, facets, and
 * NLP filters.
 *
 * @public
 *
 * @param props - {@link AppliedFiltersProps}
 * @returns A React element for the applied filters
 */
export function AppliedFilters(props: AppliedFiltersProps): JSX.Element {
  const nlpFilters = useSearchState(state => state.vertical.appliedQueryFilters);
  const isLoading = useSearchState(state => state.searchStatus.isLoading);
  const hasResults = !!useSearchState(state => state.vertical.results);
  const filters = useStateUpdatedOnSearch(state => state.filters);

  const {
    hiddenFields,
    customCssClasses = {},
    hierarchicalFacetsDelimiter = DEFAULT_HIERARCHICAL_DELIMITER,
    hierarchicalFacetsFieldIds
  } = props;

  const appliedFilters: GroupedFilters = useMemo(() => {
    return pruneAppliedFilters(
      hasResults ? (filters ?? {}) : {},
      nlpFilters ?? [],
      hiddenFields ?? ['builtin.entityType'],
      hierarchicalFacetsFieldIds ?? [],
      hierarchicalFacetsDelimiter
    );
  }, [
    hasResults,
    filters,
    hiddenFields,
    hierarchicalFacetsDelimiter,
    hierarchicalFacetsFieldIds,
    nlpFilters
  ]);

  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);
  cssClasses.appliedFiltersContainer = classNames(cssClasses.appliedFiltersContainer, {
    [cssClasses.appliedFiltersLoading ?? '']: isLoading
  });
  return <AppliedFiltersDisplay
    {...appliedFilters}
    cssClasses={cssClasses}
    hierarchicalFacetsDelimiter={hierarchicalFacetsDelimiter}
  />;
}
