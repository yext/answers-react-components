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
export interface VerticalResultsProps<T> {
  /** {@inheritDoc CardComponent} */
  CardComponent: CardComponent<T>,
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
export function VerticalResults<T>(props: VerticalResultsProps<T>): JSX.Element | null {
  const { displayAllOnNoResults = true, ...otherProps } = props;
  const verticalResults = useSearchState(state => state.vertical.results) || [];
  const allResultsForVertical =
    useSearchState(state => state.vertical?.noResults?.allResultsForVertical.results) || [];
  const isLoading = useSearchState(state => state.searchStatus.isLoading);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results = verticalResults as any;
  if (verticalResults.length === 0 && displayAllOnNoResults) {
    results = allResultsForVertical;
  }

  return (
    <VerticalResultsDisplay results={results} isLoading={isLoading} {...otherProps} />
  );
}
