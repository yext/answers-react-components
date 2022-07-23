import { VerticalResultsCssClasses } from './VerticalResults';
import { CardComponent } from '../models/cardComponent';
import { Result } from '@yext/search-headless-react';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import classNames from 'classnames';

const builtInCssClasses: Readonly<VerticalResultsCssClasses> = {
  verticalResultsLoading: 'opacity-50'
};

interface VerticalResultsDisplayProps<T> {
  CardComponent: CardComponent<T>,
  isLoading?: boolean,
  results: Result<T>[],
  customCssClasses?: VerticalResultsCssClasses
}

/**
 * A Component that displays all the search results for a given vertical.
 *
 * @param props - The props for the Component, including the results and the card type
 *                to be used.
 */
export function VerticalResultsDisplay<T>(props: VerticalResultsDisplayProps<T>): JSX.Element | null {
  const {
    CardComponent,
    results,
    isLoading = false,
    customCssClasses
  } = props;
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);

  if (results.length === 0) {
    return null;
  }

  const resultsClassNames = classNames(cssClasses.verticalResultsContainer, {
    [cssClasses.verticalResultsLoading ?? '']: isLoading
  });

  return (
    <div className={resultsClassNames}>
      {results?.map(result => renderResult(CardComponent, result))}
    </div>
  );
}

/**
 * Renders a single result using the specified card and configuration.
 *
 * @param CardComponent - The card for the vertical.
 * @param result - The result to render.
 */
function renderResult<T>(
  CardComponent: CardComponent<T>,
  result: Result<T>
): JSX.Element {
  return <CardComponent result={result} key={result.id || result.index}/>;
}