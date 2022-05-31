import { CloseIcon } from '../icons/CloseIcon';
import {
  useAnswersActions,
  SelectableFilter as DisplayableFilter,
  useAnswersState,
  SearchTypeEnum,
} from '@yext/answers-headless-react';
import { isNearFilterValue } from '../utils/filterutils';
import { AppliedFiltersCssClasses } from './AppliedFilters';
import { DisplayableHierarchicalFacet } from '../models/groupedFilters';
import { DEFAULT_HIERARCHICAL_DELIMITER } from './Filters/HierarchicalFacetDisplay';
import { executeSearch } from '../utils/search-operations';
import { useCallback } from 'react';
import { isDescendantHierarchicalFacet } from '../utils/appliedfilterutils';

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
  /** {@inheritDoc Filters.HierarchicalFacetDisplayProps.delimiter} */
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
    hierarchicalFacets = [],
    hierarchicalFacetsDelimiter = DEFAULT_HIERARCHICAL_DELIMITER,
    cssClasses = {}
  } = props;
  const answersActions = useAnswersActions();
  const isVertical = useAnswersState(state => state.meta.searchType) === SearchTypeEnum.Vertical;

  const handleClickClearAllButton = useCallback(() => {
    answersActions.setOffset(0);
    answersActions.resetFacets();
    answersActions.setStaticFilters(staticFilters.map(f => {
      return {
        ...f,
        selected: false
      };
    }));
    executeSearch(answersActions);
  }, [answersActions, staticFilters]);

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
    answersActions.setOffset(0);
    answersActions.setFacetOption(fieldId, { matcher, value }, false);
    executeSearch(answersActions);
  };

  const handleRemoveHierarchicalFacetOption = (facet: DisplayableHierarchicalFacet) => {
    const { fieldId } = facet;

    // Uncheck all descendant options in the hierarchy
    hierarchicalFacets
      .filter(hierarchicalFacet => hierarchicalFacet.fieldId === fieldId)
      .forEach(hierarchicalFacet => {
        if (isDescendantHierarchicalFacet(facet, hierarchicalFacet, hierarchicalFacetsDelimiter)) {
          answersActions.setFacetOption(fieldId, {
            matcher: hierarchicalFacet.matcher,
            value: hierarchicalFacet.value
          }, false);
        }
      });

    const parentDisplayName = facet.displayNameTokens.slice(0, -1).join(` ${hierarchicalFacetsDelimiter} `);
    const parentFacet = hierarchicalFacets
      .find(hierarchicalFacet => hierarchicalFacet.displayName === parentDisplayName);

    parentFacet && answersActions.setFacetOption(fieldId, {
      matcher: parentFacet?.matcher,
      value: parentFacet?.value
    }, true);

    answersActions.setOffset(0);
    answersActions.setFacetOption(fieldId, { matcher: facet.matcher, value: facet.value }, false);
    executeSearch(answersActions);
  };

  const handleRemoveStaticFilterOption = (filter: DisplayableFilter) => {
    answersActions.setOffset(0);
    answersActions.setFilterOption({ ...filter, selected: false });
    executeSearch(answersActions);
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
        className={cssClasses.removeFilterButton}
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