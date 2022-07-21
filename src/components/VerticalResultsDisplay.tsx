import { VerticalResultsCssClasses } from './VerticalResults';
import { CardComponent } from '../models/cardComponent';
import { Result } from '@yext/search-headless-react';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import classNames from 'classnames';

const builtInCssClasses: Readonly<VerticalResultsCssClasses> = {
  verticalResultsLoading: 'opacity-50'
};

interface VerticalResultsDisplayProps {
  CardComponent: CardComponent,
  isLoading?: boolean,
  results: Result[],
  customCssClasses?: VerticalResultsCssClasses
}

/**
 * A Component that displays all the search results for a given vertical.
 *
 * @param props - The props for the Component, including the results and the card type
 *                to be used.
 */
export function VerticalResultsDisplay(props: VerticalResultsDisplayProps): JSX.Element | null {
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
function renderResult(
  CardComponent: CardComponent,
  result: Result
): JSX.Element {
  return <CardComponent result={result} key={result.id || result.index}/>;
}