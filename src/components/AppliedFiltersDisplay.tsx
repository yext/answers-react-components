import { CloseIcon } from '../icons/CloseIcon';
import {
  useSearchActions,
  SelectableFilter as DisplayableFilter,
  useSearchState,
  SearchTypeEnum,
} from '@yext/search-headless-react';
import { isNearFilterValue } from '../utils/filterutils';
import { AppliedFiltersCssClasses } from './AppliedFilters';
import { DisplayableHierarchicalFacet } from '../models/groupedFilters';
import { DEFAULT_HIERARCHICAL_DELIMITER } from './Filters/HierarchicalFacetDisplay';
import { executeSearch } from '../utils/search-operations';
import { useCallback } from 'react';
import { isDescendantHierarchicalFacet } from '../utils/appliedfilterutils';
import { isDuplicateFilter } from '../utils/filterutils';

/**
 * Properties for {@link AppliedFilters}.
 */
export interface AppliedFiltersDisplayProps {
  /** Filters that are applied to the search results from static filters and filter search. */
  staticFilters?: DisplayableFilter[],
  /** Filters that are applied to the search results from facets. */
  facets?: DisplayableFilter[],
  /** Filters that are applied to the search results from hierarchical facets. */
  hierarchicalFacets?: DisplayableHierarchicalFacet[],
  /** Filters that are applied to the search results from the backend's natural language processing. */
  nlpFilters?: DisplayableFilter[],
  duplicateFacets?: DisplayableFilter[],
  /** {@inheritDoc HierarchicalFacetsProps.delimiter} */
  hierarchicalFacetsDelimiter?: string,
  /** CSS classes for customizing the component styling. */
  cssClasses?: AppliedFiltersCssClasses
}

/**
 * A component that renders applied filters based on the provided GroupedFilters.
 *
 * @param props - {@link AppliedFiltersDisplayProps}
 * @returns A React element for the applied filters
 */
export function AppliedFiltersDisplay(props: AppliedFiltersDisplayProps): JSX.Element | null {
  const {
    nlpFilters = [],
    staticFilters = [],
    facets = [],
    duplicateFacets,
    hierarchicalFacets = [],
    hierarchicalFacetsDelimiter = DEFAULT_HIERARCHICAL_DELIMITER,
    cssClasses = {}
  } = props;
  const searchActions = useSearchActions();
  const isVertical = useSearchState(state => state.meta.searchType) === SearchTypeEnum.Vertical;

  const handleClickClearAllButton = useCallback(() => {
    searchActions.setOffset(0);
    searchActions.resetFacets();
    searchActions.setStaticFilters(staticFilters.map(f => {
      return {
        ...f,
        selected: false
      };
    }));
    executeSearch(searchActions);
  }, [searchActions, staticFilters]);

  const hasAppliedFilters = (
    nlpFilters.length + staticFilters.length + facets.length + hierarchicalFacets.length) > 0;
  if (!hasAppliedFilters) {
    return null;
  }

  const handleRemoveFacetOption = (filter: DisplayableFilter) => {
    const { fieldId, matcher, value } = filter;
    if (isNearFilterValue(value)) {
      console.error('A Filter with a NearFilterValue is not a supported RemovableFilter.');
      return;
    }
    searchActions.setOffset(0);
    searchActions.setFacetOption(fieldId, { matcher, value }, false);
    executeSearch(searchActions);
  };

  const handleRemoveHierarchicalFacetOption = (facet: DisplayableHierarchicalFacet) => {
    const { fieldId } = facet;

    // Uncheck all descendant options in the hierarchy
    hierarchicalFacets
      .filter(hierarchicalFacet => hierarchicalFacet.fieldId === fieldId)
      .forEach(hierarchicalFacet => {
        if (isDescendantHierarchicalFacet(facet, hierarchicalFacet, hierarchicalFacetsDelimiter)) {
          searchActions.setFacetOption(fieldId, {
            matcher: hierarchicalFacet.matcher,
            value: hierarchicalFacet.value
          }, false);
        }
      });

    const parentDisplayName = facet.displayNameTokens.slice(0, -1).join(` ${hierarchicalFacetsDelimiter} `);
    const parentFacet = hierarchicalFacets
      .find(hierarchicalFacet => hierarchicalFacet.displayName === parentDisplayName);

    parentFacet && searchActions.setFacetOption(fieldId, {
      matcher: parentFacet?.matcher,
      value: parentFacet?.value
    }, true);

    searchActions.setOffset(0);
    searchActions.setFacetOption(fieldId, { matcher: facet.matcher, value: facet.value }, false);
    executeSearch(searchActions);
  };

  const handleRemoveStaticFilterOption = (filter: DisplayableFilter) => {
    searchActions.setOffset(0);
    const { fieldId, matcher, value } = filter;
    if (duplicateFacets) {
      duplicateFacets.forEach(facet => {
        if (isDuplicateFilter(filter, facet)){
          if (isNearFilterValue(value)) {
            console.error('A Filter with a NearFilterValue is not a supported RemovableFilter.');
            return;
          }
          searchActions.setFacetOption(fieldId, { matcher, value }, false);
        }
      });
    }
    searchActions.setFilterOption({ ...filter, selected: false });
    executeSearch(searchActions);
  };

  const renderRemovableFilter =
    (handleRemoveFilter: (filter: DisplayableFilter) => void) =>
      (filter: DisplayableFilter) =>
        <RemovableFilter
          displayName={filter.displayName ?? ''}
          handleRemoveFilter={handleRemoveFilter}
          filter={filter}
          key={filter.displayName}
          cssClasses={cssClasses}
        />;

  const hasRemovableFilters = (staticFilters.length + facets.length + hierarchicalFacets.length) > 0;
  return (
    <div className={cssClasses.appliedFiltersContainer} aria-label='Applied filters to current search'>
      {nlpFilters.map(filter =>
        <NlpFilter filter={filter} key={filter.displayName} cssClasses={cssClasses} />
      )}
      {hierarchicalFacets.map(filter =>
        <RemovableFilter
          key={filter.displayName}
          handleRemoveFilter={handleRemoveHierarchicalFacetOption}
          filter={filter}
          displayName={filter.lastDisplayNameToken}
          cssClasses={cssClasses}
        />
      )}
      {facets.map(renderRemovableFilter(handleRemoveFacetOption))}
      {staticFilters.map(renderRemovableFilter(handleRemoveStaticFilterOption))}
      {isVertical && hasRemovableFilters &&
        <button onClick={handleClickClearAllButton} className={cssClasses.clearAllButton}>
          Clear All
        </button>
      }
    </div>
  );
}

function RemovableFilter<FilterType>({ handleRemoveFilter, filter, displayName, cssClasses }: {
  handleRemoveFilter: (filter: FilterType) => void,
  filter: FilterType,
  displayName: string,
  cssClasses: AppliedFiltersCssClasses
}): JSX.Element {
  const handleClick = useCallback(() => handleRemoveFilter(filter), [filter, handleRemoveFilter]);
  return (
    <div className={cssClasses.removableFilter}>
      <div className={cssClasses.filterLabel}>{displayName}</div>
      <button
        className='w-2 h-2 text-neutral m-1.5'
        onClick={handleClick}
        aria-label={`Remove "${displayName}" filter`}>
        <CloseIcon />
      </button>
    </div>
  );
}

function NlpFilter({ filter, cssClasses }: {
  filter: DisplayableFilter,
  cssClasses: AppliedFiltersCssClasses
}): JSX.Element {
  return (
    <div className={cssClasses.nlpFilter}>
      <span className={cssClasses.filterLabel}>{filter.displayName}</span>
    </div>
  );
}