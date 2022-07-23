import { useSearchState, VerticalResults as VerticalResultsData } from '@yext/search-headless-react';
import { StandardSection } from './sections/StandardSection';
import {
  SectionHeader,
  SectionHeaderCssClasses,
  builtInCssClasses as sectionHeaderCssClasses
} from './sections/SectionHeader';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import classNames from 'classnames';
import { VerticalConfigMap } from '../models/verticalConfig';

/**
 * The CSS class interface used for {@link UniversalResults}.
 *
 * @public
 */
export interface UniversalResultsCssClasses extends SectionHeaderCssClasses {
  universalResultsContainer?: string,
  universalResultsLoading?: string
}

const builtInCssClasses: Readonly<UniversalResultsCssClasses> = {
  universalResultsContainer: 'space-y-8',
  universalResultsLoading: 'opacity-50',
  ...sectionHeaderCssClasses
};

/**
 * Props for {@link UniversalResults}.
 *
 * @public
 */
export interface UniversalResultsProps<T> {
  /** Whether or not to show the applied filters. */
  showAppliedFilters?: boolean,
  /** A mapping of verticalKey to the configuration for each vertical. */
  verticalConfigMap: VerticalConfigMap<T>,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: UniversalResultsCssClasses
}

/**
 * Displays the results of a universal search with the results for each vertical separated
 * into sections.
 *
 * @public
 *
 * @param props - {@link UniversalResultsProps}
 * @returns A React element for the universal results, or null if there are none
 */
export function UniversalResults<T>({
  verticalConfigMap,
  showAppliedFilters,
  customCssClasses
}: UniversalResultsProps<T>): JSX.Element | null {
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);
  const resultsFromAllVerticals = useSearchState(state => state?.universal?.verticals) || [];
  const isLoading = useSearchState(state => state.searchStatus.isLoading);

  if (resultsFromAllVerticals.length === 0) {
    return null;
  }

  const resultsClassNames = classNames(cssClasses.universalResultsContainer, {
    [cssClasses.universalResultsLoading ?? '']: isLoading
  });

  return (
    <div className={resultsClassNames}>
      {renderVerticalSections({ resultsFromAllVerticals, showAppliedFilters, verticalConfigMap, cssClasses })}
    </div>
  );
}

interface VerticalSectionsProps<T> extends UniversalResultsProps<T> {
  resultsFromAllVerticals: VerticalResultsData[],
  cssClasses: UniversalResultsCssClasses
}

/**
 * Renders a list of {@link SectionComponent}s based on the given list of vertical results and
 * corresponding configs, including specifying which section template to use.
 */
function renderVerticalSections<T>(props: VerticalSectionsProps<T>): JSX.Element {
  const { resultsFromAllVerticals, verticalConfigMap, cssClasses } = props;
  return <>
    {resultsFromAllVerticals
      .filter(verticalResults => verticalResults.results)
      .map(verticalResults => {
        const verticalKey = verticalResults.verticalKey;
        const verticalConfig = verticalConfigMap[verticalKey] || {};

        const label = verticalConfig.label ?? verticalKey;
        const results = verticalResults.results;

        const SectionComponent = verticalConfig.SectionComponent || StandardSection;

        const appliedQueryFilters = props.showAppliedFilters
          ? verticalResults.appliedQueryFilters
          : undefined;

        return (
          <SectionComponent
            results={results}
            verticalKey={verticalKey}
            header={<SectionHeader {...{
              label,
              appliedQueryFilters,
              verticalKey,
              viewAllButton: verticalConfig.viewAllButton,
              getViewAllUrl: verticalConfig.getViewAllUrl,
              cssClasses
            }}/>}
            CardComponent={verticalConfig.CardComponent}
            key={verticalKey}
          />
        );
      })
    }
  </>;
}
