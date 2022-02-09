import { useAnswersState, VerticalResults } from '@yext/answers-headless-react';
import StandardSection from '../sections/StandardSection';
import SectionHeader from '../sections/SectionHeader';
import { SectionComponent } from '../models/sectionComponent';
import { CardConfig } from '../models/cardComponent';
import { useComposedCssClasses, CompositionMethod } from '../hooks/useComposedCssClasses';
import classNames from 'classnames';

/**
 * The CSS class interface used for {@link UniversalResults}.
 */
export interface UniversalResultsCssClasses {
  /** Applies to the outermost container of the results. */
  container?: string,
  /** Applies when the results are loading. */
  results___loading?: string
}

const builtInCssClasses: UniversalResultsCssClasses = {
  container: 'space-y-8 mt-6',
  results___loading: 'opacity-50'
};

/**
 * The configuration for a vertical.
 */
export interface VerticalConfig {
  /** {@inheritDoc SectionComponent} */
  SectionComponent?: SectionComponent,
  /** The configuration for cards in this vertical. */
  cardConfig?: CardConfig,
  /** The label for the vertical. */
  label?: string,
  /** Whether or not this vertical should show a button to view all results on the vertical page. */
  viewAllButton?: boolean
}

/**
 * Properties for {@link UniversalResults}.
 */
export interface UniversalResultsProps {
  /** Whether or not to show the applied filters. */
  showAppliedFilters?: boolean,
  /** A mapping of verticalKey to the configuration for each vertical. */
  verticalConfigs: Record<string, VerticalConfig>,
  /** The CSS class interface used for {@link UniversalResults}. */
  customCssClasses?: UniversalResultsCssClasses,
  /** {@inheritDoc CompositionMethod} */
  cssCompositionMethod?: CompositionMethod
}

/**
 * Displays the results of a universal search with the results for each vertical separated
 * into sections.
 *
 * @param props - {@inheritDoc UniversalResultsProps}
 * @returns A React element for the universal results, or null if there are none
 */
export default function UniversalResults({
  verticalConfigs,
  showAppliedFilters,
  customCssClasses,
  cssCompositionMethod
}: UniversalResultsProps): JSX.Element | null {
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses, cssCompositionMethod);
  const resultsFromAllVerticals = useAnswersState(state => state?.universal?.verticals) || [];
  const isLoading = useAnswersState(state => state.searchStatus.isLoading);

  if (resultsFromAllVerticals.length === 0) {
    return null;
  }

  const resultsClassNames = classNames(cssClasses.container, {
    [cssClasses.results___loading ?? '']: isLoading
  });

  return (
    <div className={resultsClassNames}>
      {renderVerticalSections({ resultsFromAllVerticals, showAppliedFilters, verticalConfigs })}
    </div>
  );
}

interface VerticalSectionsProps extends UniversalResultsProps {
  resultsFromAllVerticals: VerticalResults[]
}

/**
 * Renders a list of {@link SectionComponent}s based on the given list of vertical results and
 * corresponding configs, including specifying which section template to use.
 */
function renderVerticalSections(props: VerticalSectionsProps): JSX.Element {
  const { resultsFromAllVerticals, verticalConfigs } = props;
  return <>
    {resultsFromAllVerticals
      .filter(verticalResults => verticalResults.results)
      .map(verticalResults => {
        const verticalKey = verticalResults.verticalKey;
        const verticalConfig = verticalConfigs[verticalKey] || {};

        const label = verticalConfig.label ?? verticalKey;
        const results = verticalResults.results;

        const SectionComponent = verticalConfig.SectionComponent || StandardSection;

        const appliedQueryFilters = props.showAppliedFilters
          ? verticalResults.appliedQueryFilters
          : undefined;

        /* const resultsCountConfig = {
          resultsCount: verticalResults.resultsCount,
          resultsLength: results.length
        }; */

        return (
          <SectionComponent
            results={results}
            verticalKey={verticalKey}
            header={<SectionHeader {...{
              label,
              // resultsCountConfig,
              appliedQueryFilters,
              verticalKey,
              viewAllButton: verticalConfig.viewAllButton
            }}/>}
            cardConfig={verticalConfig.cardConfig}
            key={verticalKey}
          />
        );
      })
    }
  </>;
}
