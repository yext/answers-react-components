import { AutocompleteResult } from '@yext/search-headless-react';
import { renderHighlightedValue } from '../utils/renderHighlightedValue';

/**
 * The CSS class interface for the Autocomplete Result.
 *
 * @public
 */
export interface AutocompleteResultCssClasses {
  option?: string,
  icon?: string,
  highlighted?: string,
  nonHighlighted?: string
}

export const builtInCssClasses: Readonly<AutocompleteResultCssClasses> = {
  option: 'flex whitespace-pre-wrap h-6.5 pl-3 text-neutral-dark',
  icon: 'w-6 text-gray-400'
};

/**
 * Renders an autocomplete result, including an icon to the left if provided.
 * @param result - The result to render
 * @returns JSX.Element
 */
export function renderAutocompleteResult(
  result: AutocompleteResult,
  cssClasses: AutocompleteResultCssClasses = {},
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>,
  ariaLabel?: string
): JSX.Element {
  return (<>
    {Icon && <div className={cssClasses.icon}>
      <Icon />
    </div>}
    <div aria-label={ariaLabel || ''} className={cssClasses.option}>
      {renderHighlightedValue(result, cssClasses)}
    </div>
  </>);
}
