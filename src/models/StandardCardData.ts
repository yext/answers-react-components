import { HighlightedValue } from '@yext/search-headless-react';

/**
 * The data used by the {@link StandardCard} and taken from the original Result.
 *
 * @public
 */
export interface StandardCardData {
  /** The text to display in the card's header. */
  title: HighlightedValue | string,
  /** The content to display in the card's body. */
  description: HighlightedValue | string,
  /** CTA data to render. */
  cta1: CtaData,
  /** CTA data to render. */
  cta2: CtaData
}

/**
 * The shape of a StandardCard CTA field's data.
 *
 * @public
 */
export interface CtaData {
  /** The display label for the CTA element. */
  label: string,
  /** The CTA link source. */
  link: string,
  /** The CTA link type (e.g. URL, Phone, Email, Other). */
  linkType: string
}

/**
 * Type guard for CtaData.
 *
 * @public
 *
 * @param data - the data to validate.
 * @returns whether the data is of type CtaData.
 */
export function isCtaData(data: unknown): data is CtaData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const expectedKeys = ['label', 'link', 'linkType'];
  return expectedKeys.every(key => {
    return key in data;
  });
}