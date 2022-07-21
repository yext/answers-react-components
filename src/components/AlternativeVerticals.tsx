import { processTranslation } from './utils/processTranslation';
import { StarIcon } from '../icons/StarIcon';
import { useSearchState, VerticalResults as VerticalResultsData } from '@yext/search-headless-react';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import classNames from 'classnames';
import { VerticalConfig } from '../models/verticalConfig';

/**
 * The CSS class interface used for {@link AlternativeVerticals}.
 *
 * @public
 */
export interface AlternativeVerticalsCssClasses {
  alternativeVerticalsContainer?: string,
  alternativeVerticalsLoading?: string,
  noResultsText?: string,
  categoriesText?: string,
  suggestion?: string,
  verticalIcon?: string
}

const builtInCssClasses: Readonly<AlternativeVerticalsCssClasses> = {
  alternativeVerticalsContainer: 'flex flex-col justify-between border rounded-lg mb-4 p-4 shadow-sm',
  alternativeVerticalsLoading: 'opacity-50',
  noResultsText: 'text-lg text-neutral-dark pb-2',
  categoriesText: 'text-neutral',
  suggestion: 'pb-4 flex items-center',
  verticalIcon: 'w-4 mr-2'
};

interface VerticalSuggestion {
  resultsCount: number,
  label?: string,
  verticalKey: string
}

function isVerticalSuggestion(suggestion: unknown): suggestion is VerticalSuggestion {
  return (suggestion as VerticalSuggestion)?.resultsCount !== undefined &&
    (suggestion as VerticalSuggestion)?.verticalKey !== undefined;
}

/**
 * A map of vertical keys to labels.
 *
 * @public
 */
export interface VerticalLabelMap {
  /** Config mapped to a vertical. */
  [verticalKey: string]: Pick<VerticalConfig, 'label'>
}

/**
 * Props for {@link AlternativeVerticals}.
 *
 * @public
 */
export interface AlternativeVerticalsProps {
  /** The label for the current vertical. */
  currentVerticalLabel: string,
  /** A map of verticalKeys to the display label for that vertical. */
  verticalConfigMap: VerticalLabelMap,
  /**
   * Whether or not all results should be displayed when there are none returned from the search.
   * Defaults to true.
   */
  displayAllOnNoResults?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: AlternativeVerticalsCssClasses
}

/**
 * A component that displays the alternative verticals that have results if a search returns none
 * on the current vertical.
 *
 * @public
 *
 * @param props - {@link AlternativeVerticalsProps}
 * @returns A React element for the alternative verticals, or null if there are none with results
 */
export function AlternativeVerticals({
  currentVerticalLabel,
  verticalConfigMap,
  displayAllOnNoResults = true,
  customCssClasses
}: AlternativeVerticalsProps): JSX.Element | null {
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);

  const alternativeVerticals = useSearchState(state => state.vertical.noResults?.alternativeVerticals) || [];
  const allResultsForVertical =
    useSearchState(state => state.vertical.noResults?.allResultsForVertical.results) || [];
  const query = useSearchState(state => state.query.mostRecentSearch);

  const verticalSuggestions = buildVerticalSuggestions(verticalConfigMap, alternativeVerticals);
  const isShowingAllResults = displayAllOnNoResults && allResultsForVertical.length > 0;

  const isLoading = useSearchState(state => state.searchStatus.isLoading);
  const containerClassNames = classNames(cssClasses.alternativeVerticalsContainer, {
    [cssClasses.alternativeVerticalsLoading ?? '']: isLoading
  });

  function buildVerticalSuggestions(
    verticalConfigMap: VerticalLabelMap,
    alternativeVerticals: VerticalResultsData[]): VerticalSuggestion[] {

    return alternativeVerticals
      .filter((alternativeResults: VerticalResultsData) => {
        return !!verticalConfigMap[alternativeResults.verticalKey];
      })
      .map((alternativeResults: VerticalResultsData) => {
        return {
          label: verticalConfigMap[alternativeResults.verticalKey].label,
          verticalKey: alternativeResults.verticalKey,
          resultsCount: alternativeResults.resultsCount
        };
      })
      .filter(isVerticalSuggestion)
      .filter(verticalSuggestion => verticalSuggestion.resultsCount > 0);
  }

  if (verticalSuggestions.length <= 0) {
    return null;
  }

  return (
    <div className={containerClassNames}>
      {renderNoResultsInfo()}
      {verticalSuggestions &&
        <div className='pt-4 text-neutral-dark'>
          <div className={cssClasses.categoriesText}>
            <span>
              {processTranslation({
                phrase: 'The following category yielded results for - ',
                pluralForm: 'The following categories yielded results for - ',
                count: verticalSuggestions.length
              })}
            </span>
            <strong>{query}</strong>
          </div>
          <ul className='pt-4'>
            {verticalSuggestions.map(renderSuggestion)}
          </ul>
        </div>
      }
    </div>
  );

  function renderNoResultsInfo() {
    return (
      <div className={cssClasses.noResultsText}>
        <span>No results found in {currentVerticalLabel}.</span>
        {isShowingAllResults &&
          <span> Showing all {currentVerticalLabel} instead.</span>
        }
      </div>
    );
  }

  function renderSuggestion(suggestion: VerticalSuggestion) {
    const resultsCountText = processTranslation({
      phrase: `${suggestion.resultsCount} result`,
      pluralForm: `${suggestion.resultsCount} results`,
      count: suggestion.resultsCount
    });
    return (
      <li key={suggestion.verticalKey} className={cssClasses.suggestion}>
        <div className={cssClasses.verticalIcon}><StarIcon/></div>
        <span className='font-bold'>{suggestion.label} - {resultsCountText}</span>
      </li>
    );
  }
}