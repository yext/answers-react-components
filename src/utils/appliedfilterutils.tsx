import {
  AppliedQueryFilter,
  FiltersState,
  SelectableFilter as DisplayableFilter
} from '@yext/search-headless-react';
import { DisplayableHierarchicalFacet, GroupedFilters } from '../models/groupedFilters';
import { getDisplayableFacets, getDisplayableHierarchicalFacets, getDisplayableNlpFilters } from './displayablefilterutils';
import { isDuplicateFilter } from './filterutils';

/**
 * Returns a new list of nlp filters with duplicates of other filters and
 * filter listed in hiddenFields removed from the given nlp filter list.
 */
function pruneNlpFilters(
  nlpFilters: DisplayableFilter[],
  appliedFilters: DisplayableFilter[],
  hiddenFields: string[]
): DisplayableFilter[] {
  const duplicatesRemoved = nlpFilters.filter(nlpFilter => {
    const isDuplicate = appliedFilters.find(appliedFilter => {
      return isDuplicateFilter(nlpFilter, appliedFilter);
    });
    return !isDuplicate;
  });
  return filterHiddenFields(duplicatesRemoved, hiddenFields);
}

export function getDuplicateFacets(
  appliedFiltersState: FiltersState,
  hiddenFields: string[],
  hierarchicalFieldIds: string[],
): DisplayableFilter[] {
  const appliedStaticFilters = filterHiddenFields(
    appliedFiltersState?.static?.filter(filter => filter.selected) ?? [], hiddenFields);
  const appliedFacets =
  filterHiddenFields(getDisplayableFacets(appliedFiltersState.facets ?? [], hierarchicalFieldIds)
    .filter(facet => facet.selected), hiddenFields);
  const duplicatesFacets = appliedFacets.filter(appliedFacet => {
    const isDuplicate = appliedStaticFilters.find(appliedStaticFilter => {
      return isDuplicateFilter(appliedFacet, appliedStaticFilter);
    });
    return isDuplicate;
  });
  return duplicatesFacets;
}

function removeDuplicateFacets(
  appliedStaticFilters: DisplayableFilter[],
  appliedFacets: DisplayableFilter[]
): DisplayableFilter[] {
  const duplicatesRemoved = appliedFacets.filter(appliedFacet => {
    const isDuplicate = appliedStaticFilters.find(appliedStaticFilter => {
      return isDuplicateFilter(appliedFacet, appliedStaticFilter);
    });
    return !isDuplicate;
  });
  return duplicatesRemoved;
}

/**
 * Returns a new list of applied filters with filter on hiddenFields removed
 * from the given applied filter list.
 */
function filterHiddenFields<F extends DisplayableFilter>(
  appliedFilters: F[], hiddenFields: string[]): F[] {
  return appliedFilters.filter(appliedFilter => {
    return !hiddenFields.includes(appliedFilter.fieldId);
  });
}

/**
 * Process all applied filter types (facets, static filters, and nlp filters) by removing
 * duplicates and specified hidden fields.
 */
export function pruneAppliedFilters(
  appliedFiltersState: FiltersState,
  nlpFilters: AppliedQueryFilter[],
  hiddenFields: string[],
  hierarchicalFieldIds: string[],
  hierarchicalDelimiter: string
): GroupedFilters {
  const displayableStaticFilters = appliedFiltersState?.static?.filter(filter => filter.selected) ?? [];
  const displayableFacets =
    getDisplayableFacets(appliedFiltersState.facets ?? [], hierarchicalFieldIds)
      .filter(facet => facet.selected);
  const hierarchicalFacets =
    getDisplayableHierarchicalFacets(
      appliedFiltersState.facets ?? [], hierarchicalFieldIds, hierarchicalDelimiter);
  const selectedHierarchicalFacets = hierarchicalFacets.filter(facet => facet.selected) ?? [];
  const activeHierarchicalFacets = hierarchicalFacets.filter(facet => {
    const isDescendentOfSelectedFacet = selectedHierarchicalFacets.find(selectedFacet =>
      isDescendantHierarchicalFacet(facet, selectedFacet, hierarchicalDelimiter ));
    return isDescendentOfSelectedFacet || selectedHierarchicalFacets.includes(facet);
  });
  const displayableNlpFilters = getDisplayableNlpFilters(nlpFilters);

  const prunedStaticFilters = filterHiddenFields(displayableStaticFilters, hiddenFields);
  const prunedFacets = filterHiddenFields(displayableFacets, hiddenFields);
  const deDupedFacets = removeDuplicateFacets(prunedStaticFilters, prunedFacets);
  const prunedHierarchicalFacets = filterHiddenFields(activeHierarchicalFacets, hiddenFields);
  const prunedNlpFilters = pruneNlpFilters(
    displayableNlpFilters,
    [...prunedStaticFilters, ...prunedFacets],
    hiddenFields
  );

  return {
    staticFilters: prunedStaticFilters,
    facets: deDupedFacets,
    hierarchicalFacets: prunedHierarchicalFacets,
    nlpFilters: prunedNlpFilters
  };
}

export function isDescendantHierarchicalFacet(
  parentFacet: DisplayableHierarchicalFacet,
  potentialChildFacet: Pick<DisplayableHierarchicalFacet, 'displayName'>,
  delimiter: string
): boolean {
  const {
    displayNameTokens: parentTokens,
    lastDisplayNameToken: parentLastDisplayNameToken
  } = parentFacet;
  const parentDisplayName = parentFacet.displayName.trim();

  const { displayName: childDisplayName } = potentialChildFacet;

  if (!childDisplayName.startsWith(parentDisplayName)) {
    return false;
  }

  const otherTokens = childDisplayName.split(delimiter).map(t => t.trim());
  if (otherTokens.length <= parentTokens.length) {
    return false;
  }

  // Ensure that we don't return true for parent = `a > b > c` and child = `a > book > c`
  // by checking that the second element of the child is exactly "b"
  const tokenAtIndexOfLastParentToken = otherTokens[parentTokens.length - 1];
  if (parentLastDisplayNameToken !== tokenAtIndexOfLastParentToken) {
    return false;
  }

  return true;
}
