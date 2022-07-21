import { FacetsProvider, RangeInput, RangeInputCssClasses } from './Filters';
import { FilterGroup, FilterGroupCssClasses } from './FilterGroup';
import { Fragment } from 'react';
import { NumberRangeValue } from '@yext/search-headless-react';
import { StandardFacetsProps } from './StandardFacets';
import { isNumericalFacet } from '../utils/filterutils';

/**
 * The CSS class interface for {@link NumericalFacets}.
 *
 * @public
 */
export interface NumericalFacetsCssClasses extends FilterGroupCssClasses, RangeInputCssClasses {
  numericalFacetsContainer?: string,
  divider?: string
}

/**
 * Props for the {@link NumericalFacets} component.
 *
 * @public
 */
export interface NumericalFacetsProps extends Omit<StandardFacetsProps, 'excludedFieldIds'> {
  /** List of filter ids to render as numerical facets. */
  includedFieldIds?: string[],
  /**
   * Returns the filter's display name based on the range values which is used when the filter
   * is displayed by other components such as AppliedFilters.
   *
   * @remarks
   * By default, the displayName separates the range with a dash such as '10 - 20'.
   * If the range is unbounded, it will display as 'Up to 20' or 'Over 10'.
   */
  getFilterDisplayName?: (value: NumberRangeValue) => string,
  /**
   * An optional element which renders in front of the input text.
   */
  inputPrefix?: JSX.Element,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: NumericalFacetsCssClasses
}

const DEFAULT_RANGE_INPUT_PREFIX = <>$</>;

/**
 * A component that displays numerical facets applicable to the current vertical search.
 *
 * @param props - {@link NumericalFacetsProps}
 * @returns A React component for facets
 *
 * @public
 */
export function NumericalFacets({
  searchOnChange,
  includedFieldIds = [],
  getFilterDisplayName,
  inputPrefix = DEFAULT_RANGE_INPUT_PREFIX,
  customCssClasses = {},
  ...filterGroupProps
}: NumericalFacetsProps) {
  return (
    <FacetsProvider searchOnChange={searchOnChange} className={customCssClasses.numericalFacetsContainer}>
      {facets => facets
        .filter(f => isNumericalFacet(f)
          && (includedFieldIds.length === 0 || includedFieldIds.includes(f.fieldId)))
        .map((f, i) => {
          return (
            <Fragment key={f.fieldId}>
              <FilterGroup
                fieldId={f.fieldId}
                filterOptions={f.options}
                title={f.displayName}
                customCssClasses={customCssClasses}
                {...filterGroupProps}
              >
                <RangeInput
                  getFilterDisplayName={getFilterDisplayName}
                  inputPrefix={inputPrefix}
                  customCssClasses={customCssClasses}
                />
              </FilterGroup>
              {(i < facets.length - 1) && <Divider className={customCssClasses.divider}/>}
            </Fragment>
          );
        })
      }
    </FacetsProvider>
  );
}

function Divider({ className ='w-full h-px bg-gray-200 my-4' }: { className?: string }) {
  return <div className={className} />;
}