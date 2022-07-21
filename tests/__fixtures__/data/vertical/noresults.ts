import { AllResultsForVertical, Source, VerticalResults, VerticalSearchState } from '@yext/search-headless-react';

export const alternativeVerticals: VerticalResults[] = [
  {
    verticalKey: 'events',
    source: Source.KnowledgeManager,
    resultsCount: 2,
    results: [{
      description: 'How to make coffee',
      name: 'Coffee Workshop',
      rawData: {},
      source: Source.KnowledgeManager,
    }, {
      description: 'How to taste coffee like a pro',
      name: 'Coffee Tasting',
      rawData: {},
      source: Source.KnowledgeManager,
    }],
    queryDurationMillis: 30,
    appliedQueryFilters: []
  },
  {
    verticalKey: 'faqs',
    source: Source.KnowledgeManager,
    resultsCount: 1,
    results: [{
      description: 'Lots and lots of cleaning.',
      name: 'What extra precautions are you taking for covid-19?',
      rawData: {},
      source: Source.KnowledgeManager,
    }],
    queryDurationMillis: 30,
    appliedQueryFilters: []
  }
];

export const allResultsForVertical: AllResultsForVertical = {
  facets: [],
  results: [{
    name: 'Software Engineer',
    rawData: {},
    source: Source.KnowledgeManager,
    description: 'Create software for computers and applications'
  },
  {
    name: 'Product Manager',
    rawData: {},
    source: Source.KnowledgeManager,
    description: 'Identifies the customer need and product\'s objectives'
  }],
  resultsCount: 2
};

export const verticalNoResults: VerticalSearchState = {
  noResults: {
    alternativeVerticals,
    allResultsForVertical
  }
};
