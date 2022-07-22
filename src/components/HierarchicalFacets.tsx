import {
  CollapsibleLabel,
  CollapsibleSection,
  FacetsProvider,
  FilterGroupProvider,
  HierarchicalFacetDisplay,
  HierarchicalFacetDisplayCssClasses
} from './Filters';
import { StandardFacetsProps } from './StandardFacets';
import { Fragment } from 'react';

/**
 * The CSS class interface for {@link HierarchicalFacets}.
 *
 * @public
 */
export interface HierarchicalFacetsCssClasses extends HierarchicalFacetDisplayCssClasses {
  hierarchicalFacetsContainer?: string,
  divider?: string
}

/**
 * Props for the {@link HierarchicalFacets} component.
 *
 * @public
 */
export interface HierarchicalFacetsProps extends Omit<StandardFacetsProps, 'excludedFieldIds'> {
  /** List of filter ids to render as hierarchical facets. */
  includedFieldIds: string[],
  /** The delimiter for determining facet hierarchies, defaults to "\>". */
  delimiter?: string,
  /** The maximum number of options to render before displaying the "Show more/less" button. Defaults to 4. */
  showMoreLimit?: number,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: HierarchicalFacetsCssClasses
}

/**
 * A component that displays hierarchical facets, in a tree level structure,
 * applicable to the current vertical search.
 *
 * @param props - {@link HierarchicalFacetsProps}
 * @returns A React component for facets
 *
 * @public
 */
export function HierarchicalFacets({
  searchOnChange,
  collapsible,
  defaultExpanded,
  includedFieldIds,
  customCssClasses = {},
  delimiter,
  showMoreLimit
}: HierarchicalFacetsProps) {
  return (
    <FacetsProvider searchOnChange={searchOnChange} className={customCssClasses.hierarchicalFacetsContainer}>
      {facets => facets
        .filter(f => f.options.length > 0 && includedFieldIds.includes(f.fieldId))
        .map((f, i) => {
          return (
            <Fragment key={f.fieldId}>
              <FilterGroupProvider
                fieldId={f.fieldId}
                defaultExpanded={!collapsible || defaultExpanded}
              >
                {collapsible
                  ? <CollapsibleLabel label={f.displayName} />
                  : (f.displayName && <div className='text-neutral-dark text-sm font-medium text-left mb-4'>{f.displayName}</div>)}
                <CollapsibleSection >
                  <HierarchicalFacetDisplay
                    facet={f}
                    delimiter={delimiter}
                    showMoreLimit={showMoreLimit}
                    customCssClasses={customCssClasses}
                  />
                </CollapsibleSection>
              </FilterGroupProvider>
              {(i < facets.length - 1) && <Divider className={customCssClasses.divider}/>}
            </Fragment>
          );
        })
      }
    </FacetsProvider>
  );
}

function Divider({ className = 'w-full h-px bg-gray-200 my-4' }: { className?: string }) {
  return <div className={className} />;
}