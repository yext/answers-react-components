import { Filter } from '@yext/answers-headless-react';

/**
 * Represents a filter which may be displayed by the UI.
 */
export interface DisplayableFilter {
  /** The type of filter. */
  filterType: 'NLP_FILTER' | 'STATIC_FILTER' | 'FACET',
  /** The Filter associated with the DisplayableFilter. */
  filter: Filter,
  /** The label which designates which group this filter belongs to. */
  groupLabel: string,
  /** The label of the filter which is displayed by the UI. */
  label: string
}
