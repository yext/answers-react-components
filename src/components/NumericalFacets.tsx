import { FacetsProvider, RangeInput, RangeInputCssClasses } from './Filters';
import { FilterGroup, FilterGroupCssClasses } from './FilterGroup';
import { CompositionMethod } from '../hooks/useComposedCssClasses';
import { Fragment, useMemo } from 'react';
import { DisplayableFacet, NumberRangeValue } from '@yext/answers-headless-react';
import { StandardFacetsProps } from './StandardFacets';
import { isNumberRangeFilter } from '../models/NumberRangeFilter';

/**
 * The CSS class interface for {@link NumericalFacets}.
 *
 * @public
 */
export interface NumericalFacetsCssClasses extends FilterGroupCssClasses, RangeInputCssClasses {
  container?: string,
  divider?: string,
  rangeInputContainer?: string,
  rangeInputDivider?: string
}

/**
 * Props for the {@link NumericalFacets} component.
 *
 * @public
 */
export interface NumericalFacetsProps extends StandardFacetsProps {
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
  customCssClasses?: NumericalFacetsCssClasses,
  /** {@inheritDoc CompositionMethod} */
  cssCompositionMethod?: CompositionMethod
}

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
  excludeFieldIds = [],
  getFilterDisplayName,
  inputPrefix = <>$</>,
  customCssClasses = {},
  ...filterGroupProps
}: NumericalFacetsProps) {
  const rangeInputCssClasses = useMemo(() => {
    return {
      ...customCssClasses,
      container: customCssClasses.rangeInputContainer,
      divider: customCssClasses.rangeInputDivider
    };
  }, [customCssClasses]);

  return (
    <FacetsProvider searchOnChange={searchOnChange} className={customCssClasses.container}>
      {facets => facets
        .filter(f => !excludeFieldIds.includes(f.fieldId) && isNumericalFacet(f))
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
                  customCssClasses={rangeInputCssClasses}
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

function isNumericalFacet(facet: DisplayableFacet): boolean {
  return facet.options.length > 0 && isNumberRangeFilter(facet.options[0]);
}

function Divider({ className ='w-full h-px bg-gray-200 my-4' }: { className?: string }) {
  return <div className={className} />;
}