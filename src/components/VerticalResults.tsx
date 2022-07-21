import { CardComponent } from '../models/cardComponent';
import { useSearchState } from '@yext/search-headless-react';
import { VerticalResultsDisplay } from './VerticalResultsDisplay';

/**
 * The CSS class interface used for {@link VerticalResults}.
 *
 * @public
 */
export interface VerticalResultsCssClasses {
  verticalResultsContainer?: string,
  verticalResultsLoading?: string
}

/**
 * Props for the VerticalResults component.
 *
 * @public
 */
export interface VerticalResultsProps {
  /** {@inheritDoc CardComponent} */
  CardComponent: CardComponent,
  /**
   * Whether or not all results should be displayed when there are none returned from the search.
   * Defaults to true.
   */
  displayAllOnNoResults?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: VerticalResultsCssClasses
}

/**
 * A component that renders search results for a vertical page.
 *
 * @public
 *
 * @param props - {@link VerticalResultsProps}
 * @returns A React element for the results, or null if no results should be displayed
 */
export function VerticalResults(props: VerticalResultsProps): JSX.Element | null {
  const { displayAllOnNoResults = true, ...otherProps } = props;
  const verticalResults = useSearchState(state => state.vertical.results) || [];
  const allResultsForVertical =
    useSearchState(state => state.vertical?.noResults?.allResultsForVertical.results) || [];
  const isLoading = useSearchState(state => state.searchStatus.isLoading);

  let results = verticalResults;
  if (verticalResults.length === 0 && displayAllOnNoResults) {
    results = allResultsForVertical;
  }

  return (
    <VerticalResultsDisplay results={results} isLoading={isLoading} {...otherProps} />
  );
}
