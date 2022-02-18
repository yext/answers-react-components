import { processTranslation } from './utils/processTranslation';
import Star from '../icons/StarIcon';
import { useAnswersState, VerticalResults as VerticalResultsData } from '@yext/answers-headless-react';
import { CompositionMethod, useComposedCssClasses } from '../hooks/useComposedCssClasses';
import classNames from 'classnames';
import { isVerticalLink, VerticalLink } from '../models/verticalLink';
import { UniversalLink } from '../models/universalLink';

/**
 * The CSS class interface used for {@link AlternativeVerticals}.
 *
 * @public
 */
export interface AlternativeVerticalsCssClasses {
  container?: string,
  alternativeVerticals___loading?: string,
  noResultsText?: string,
  categoriesText?: string,
  suggestions?: string,
  suggestionList?: string,
  suggestion?: string,
  suggestionButton?: string,
  verticalIcon?: string,
  verticalLink?: string,
  allCategoriesLink?: string
}

const builtInCssClasses: AlternativeVerticalsCssClasses = {
  container: 'flex flex-col justify-between border rounded-lg mb-4 p-4 shadow-sm',
  alternativeVerticals___loading: 'opacity-50',
  noResultsText: 'text-lg text-gray-900 pb-2',
  categoriesText: 'text-gray-500',
  suggestions: 'pt-4 text-blue-600',
  suggestionList: 'pt-4',
  suggestion: 'pb-4',
  suggestionButton: 'inline-flex items-center cursor-pointer hover:underline focus:underline',
  verticalIcon: 'w-4 mr-2',
  verticalLink: 'font-bold',
  allCategoriesLink: 'text-blue-600 cursor-pointer hover:underline focus:underline'
};

interface VerticalConfig {
  label: string,
  verticalKey: string
}

interface VerticalSuggestion extends VerticalConfig {
  resultsCount: number
}

function isVerticalSuggestion(suggestion: VerticalSuggestion | null): suggestion is VerticalSuggestion {
  return suggestion?.resultsCount !== undefined;
}

/**
 * Props for {@link AlternativeVerticals}.
 *
 * @public
 */
export interface AlternativeVerticalsProps {
  /** The label for the current vertical. */
  currentVerticalLabel: string,
  /** An array containing the label and verticalKey of each vertical. */
  verticalsConfig: VerticalConfig[],
  /**
   * Whether or not all results should be displayed when there are none returned from the search.
   * Defaults to true.
   */
  displayAllOnNoResults?: boolean,
  /**
   * A function to provide user defined url path for vertical and universal sugestion links.
   *
   * Defaults to "/[verticalKey]?query=[query]" for vertical links and "/?query=[query]"
   * for universal links.
   */
  getSuggestionUrl?: (data: VerticalLink | UniversalLink) => string
  /** CSS classes for customizing the component styling. */
  customCssClasses?: AlternativeVerticalsCssClasses,
  /** {@inheritDoc CompositionMethod} */
  cssCompositionMethod?: CompositionMethod
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
export default function AlternativeVerticals({
  currentVerticalLabel,
  verticalsConfig,
  displayAllOnNoResults = true,
  customCssClasses,
  getSuggestionUrl: customGetSuggestionUrl,
  cssCompositionMethod
}: AlternativeVerticalsProps): JSX.Element | null {
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses, cssCompositionMethod);

  const alternativeVerticals = useAnswersState(state => state.vertical.noResults?.alternativeVerticals) || [];
  const allResultsForVertical =
    useAnswersState(state => state.vertical.noResults?.allResultsForVertical.results) || [];
  const query = useAnswersState(state => state.query.mostRecentSearch);

  const verticalSuggestions = buildVerticalSuggestions(verticalsConfig, alternativeVerticals);
  const isShowingAllResults = displayAllOnNoResults && allResultsForVertical.length > 0;

  const isLoading = useAnswersState(state => state.searchStatus.isLoading);
  const containerClassNames = classNames(cssClasses.container, {
    [cssClasses.alternativeVerticals___loading ?? '']: isLoading
  });

  const getSuggestionUrl = customGetSuggestionUrl
    ? customGetSuggestionUrl
    : (data: VerticalLink | UniversalLink) => {
      return isVerticalLink(data)
        ? `/${data.verticalKey}?query=${data.query}`
        :`/?query=${data.query}`;
    };

  function buildVerticalSuggestions(
    verticalsConfig: VerticalConfig[],
    alternativeVerticals: VerticalResultsData[]): VerticalSuggestion[] {

    return alternativeVerticals
      .map((alternativeResults: VerticalResultsData) => {
        const matchingVerticalConfig = verticalsConfig.find(config => {
          return config.verticalKey === alternativeResults.verticalKey;
        });

        return matchingVerticalConfig
          ? {
            ...matchingVerticalConfig,
            resultsCount: alternativeResults.resultsCount
          }
          : null;
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
        <div className={cssClasses.suggestions}>
          <div className={cssClasses.categoriesText}>
            <span>
              {processTranslation({
                phrase: 'This category yielded results for - ',
                pluralForm: 'These categories yielded results for - ',
                count: verticalSuggestions.length
              })}
            </span>
            <strong>{query}</strong>
          </div>
          <ul className={cssClasses.suggestionList}>
            {verticalSuggestions.map(renderSuggestion)}
          </ul>
          {renderUniversalDetails()}
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
    const href = getSuggestionUrl({ verticalKey: suggestion.verticalKey, query });
    return (
      <li key={suggestion.verticalKey} className={cssClasses.suggestion}>
        <a className={cssClasses.suggestionButton} href={href}>
          <div className={cssClasses.verticalIcon}><Star/></div>
          <span className={cssClasses.verticalLink}>{suggestion.label}</span>
        </a>
      </li>
    );
  }

  function renderUniversalDetails() {
    const href = getSuggestionUrl({ query });
    return (
      <div className={cssClasses.categoriesText}>
        <span>View results across </span>
        <a className={cssClasses.allCategoriesLink} href={href}>
          all search categories.
        </a>
      </div>
    );
  }
}