import { HighlightedValue } from '@yext/search-headless-react';

const defaultCssClasses: HighlightedValueCssClasses = {
  highlighted: 'font-normal',
  nonHighlighted: 'font-semibold'
};

/**
 * The CSS class interface for {@link renderHighlightedValue}.
 *
 * @public
 */
export interface HighlightedValueCssClasses {
  highlighted?: string,
  nonHighlighted?: string
}

/**
 * Renders a HighlightedValue with highlighting based on its matchedSubstrings.
 * @returns JSX.Element
 *
 * @public
 *
 * @param highlightedValueOrString - the text to add highlight to.
 * @param customCssClasses - css classes use for the non-highlighted and highlighted text.
 */
export function renderHighlightedValue(
  highlightedValueOrString: Partial<HighlightedValue> | string,
  customCssClasses?: HighlightedValueCssClasses
): JSX.Element {
  const { value = '', matchedSubstrings } =
    typeof highlightedValueOrString === 'string'
      ? { value: highlightedValueOrString, matchedSubstrings: [] }
      : highlightedValueOrString;

  const cssClasses = { ...defaultCssClasses, ...customCssClasses };
  if (!matchedSubstrings || matchedSubstrings.length === 0) {
    return <span>{value}</span>;
  }
  const substrings = [...matchedSubstrings];
  substrings.sort((a, b) => a.offset - b.offset);
  const highlightedJSX: JSX.Element[] = [];
  let curr = 0;
  for (const { offset, length } of substrings) {
    if (offset > curr) {
      highlightedJSX.push(
        <span key={curr} className={cssClasses.nonHighlighted} >{value.substring(curr, offset)}</span>
      );
    }
    highlightedJSX.push(
      <span key={offset} className={cssClasses.highlighted}>{value.substring(offset, offset + length)}</span>
    );
    curr = offset + length;
  }
  if (curr < value.length) {
    highlightedJSX.push(
      <span key={curr} className={cssClasses.nonHighlighted} >{value.substring(curr)}</span>
    );
  }
  return <>{highlightedJSX}</>;
}