import { useSearchActions } from '@yext/search-headless-react';
import { useCallback } from 'react';
import { clearStaticRangeFilters, getSelectedNumericalFacetFields } from '../utils/filterutils';
import { executeSearch } from '../utils/search-operations';

/**
 * Props for {@link ApplyFiltersButton}
 *
 * @public
 */
export interface ApplyFiltersButtonProps {
  /** The label for the button, defaults to 'Apply Filters' */
  label?: string,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: ApplyFiltersButtonCssClasses
}

/**
 * The CSS class interface for {@link ApplyFiltersButtonProps}.
 *
 * @public
 */
export interface ApplyFiltersButtonCssClasses {
  button?: string
}

const builtInCssClasses: Readonly<ApplyFiltersButtonCssClasses> = {
  button: 'border border-gray-300 px-2.5 py-1 rounded-md text-primary bg-white shadow-md sticky bottom-3'
};

/**
 * Runs a vertical search.
 * By default has `position: sticky` styling that anchors it to the bottom of the page.
 *
 * @remarks
 * This is intended to be used when `searchOnChange` field is set to false on all
 * the Facets/StaticFilters components.
 *
 * @public
 */
export function ApplyFiltersButton({
  customCssClasses,
  label = 'Apply Filters'
}: ApplyFiltersButtonProps): JSX.Element {
  const cssClasses = { ...builtInCssClasses, ...customCssClasses };
  const searchActions = useSearchActions();
  const handleClick = useCallback(() => {
    searchActions.setOffset(0);
    clearStaticRangeFilters(searchActions, getSelectedNumericalFacetFields(searchActions));
    executeSearch(searchActions);
  }, [searchActions]);

  return (
    <button
      onClick={handleClick}
      className={cssClasses.button}
    >
      {label}
    </button>
  );
}