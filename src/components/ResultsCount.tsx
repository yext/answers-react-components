import {
  SearchTypeEnum,
  useAnswersState,
  VerticalResults,
  VerticalSearchState
} from '@yext/answers-headless-react';
import classNames from 'classnames';
import { CompositionMethod, useComposedCssClasses } from '../hooks/useComposedCssClasses';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

/**
 *  The CSS class interface for {@link ResultsCount}.
 *
 * @public
 */
export interface ResultsCountCssClasses {
  resultCountText?: string,
  resultCountText___loading?: string
}

/**
 * Props for {@link ResultsCount}.
 *
 * @public
 */
export interface ResultsCountProps {
  /** CSS classes for customizing the component styling. */
  customCssClasses?: ResultsCountCssClasses,
  /** {@inheritDoc CompositionMethod} */
  cssCompositionMethod?: CompositionMethod
}

const builtInCssClasses: ResultsCountCssClasses = {
  resultCountText: 'font-semibold text-neutral mb-4 py-2 mr-2.5',
  resultCountText___loading: 'opacity-50'
};

/**
 * Renders results count of a universal/vertical search.
 *
 * @public
 *
 * @param props - {@link ResultsCountProps}
 */
function ResultsCountComponent(props: ResultsCountProps): JSX.Element | null {
  const { customCssClasses, cssCompositionMethod } = props;
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses, cssCompositionMethod);
  const isLoading = useAnswersState(state => state.searchStatus.isLoading);
  const resultsCountText = useResultsCount();

  const resultsCountClassnames = classNames(cssClasses.resultCountText, {
    [cssClasses.resultCountText___loading ?? '']: isLoading
  });
  return <div className={resultsCountClassnames}>{resultsCountText}</div>;
}

export function ResultsCount(props: ResultsCountProps): JSX.Element | null {
  return (
    <I18nextProvider i18n={i18n}>
      <ResultsCountComponent {...props}/>
    </I18nextProvider>
  );
}

/**
 * Generates a string for the results count of the recent universal/vertical search.
 */
function useResultsCount() {
  const isVertical = useAnswersState(state => state.meta.searchType) === SearchTypeEnum.Vertical;
  const results = useAnswersState(state => isVertical ? state.vertical : state.universal.verticals);
  const { t } = useTranslation();

  let resultsCount = 0;
  if (results) {
    if (isUniversalSearchResults(results)) {
      results.forEach(resultsOfAVertical => resultsCount += resultsOfAVertical.resultsCount);
    } else {
      resultsCount = results.resultsCount ?? 0;
    }
  }
  if (resultsCount === 0) {
    return null;
  }
  const resultsCountText = t('{{count}} Results', { count: resultsCount });
  return resultsCountText;
}

function isUniversalSearchResults(data: VerticalResults[] | VerticalSearchState): data is VerticalResults[] {
  return Array.isArray(data);
}
