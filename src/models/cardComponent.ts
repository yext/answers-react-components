import { Result } from '@yext/search-headless-react';

/**
 * The props provided to every {@link CardComponent}.
 *
 * @public
 */
export interface CardProps<T = Record<string, unknown>> {
  /** The result data provided to the card for rendering. */
  result: Result<T>
}

/**
 * A functional component that can be used to render a result card.
 *
 * @public
 */
export type CardComponent<T = Record<string, unknown>> = (props: CardProps<T>) => JSX.Element;