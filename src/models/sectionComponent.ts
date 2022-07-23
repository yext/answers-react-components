import { Result } from '@yext/search-headless-react';
import { CardComponent } from './cardComponent';

/**
 * The configuration of a section template for a vertical's results on a universal page.
 *
 * @public
 */
export interface SectionProps<T> {
  /** The results from this vertical. */
  results: Result<T>[],
  /** The key for the vertical. */
  verticalKey: string,
  /** A header to display above the results. */
  header?: JSX.Element,
  /** The card to use for this vertical. */
  CardComponent?: CardComponent<T>,
  /** Whether or not to allow more results to be viewed. */
  viewMore?: boolean
}

/**
 * A component that can be used to render a section template for vertical results.
 *
 * @public
 */
export type SectionComponent<T> = (props: SectionProps<T>) => JSX.Element | null;
