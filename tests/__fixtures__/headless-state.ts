import { State } from '@yext/search-headless-react';

/* A sample State for a Vertical Searcher */
export const VerticalSearcherState: State = {
  query: {},
  universal: {},
  vertical: {
    verticalKey: 'vertical'
  },
  directAnswer: {},
  queryRules: {
    actions: []
  },
  filters: {},
  searchStatus: {},
  spellCheck: {
    enabled: true,
    correctedQuery: 'Correction'
  },
  sessionTracking: {},
  meta: {
    searchType: 'vertical'
  },
  location: {}
};