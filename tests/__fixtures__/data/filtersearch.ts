import { FilterSearchResponse, Matcher } from '@yext/search-headless-react';

export const unlabeledFilterSearchResponse: FilterSearchResponse = {
  sections: [
    {
      results: [
        {
          value: 'first name 1',
          filter: { fieldId: 'name', matcher: Matcher.Equals, value: 'first name 1' }
        },
        {
          value: 'first name 2',
          filter: { fieldId: 'name', matcher: Matcher.Equals, value: 'first name 2' }
        },
        {
          value: 'last name 1',
          filter: { fieldId: 'name', matcher: Matcher.Equals, value: 'last name 1' }
        }
      ],
    }
  ],
  uuid: ''
};

export const labeledFilterSearchResponse: FilterSearchResponse = {
  sections: [
    {
      results: [
        {
          value: 'first name 1',
          filter: { fieldId: 'name', matcher: Matcher.Equals, value: 'first name 1' }
        },
        {
          value: 'first name 2',
          filter: { fieldId: 'name', matcher: Matcher.Equals, value: 'first name 2' }
        }
      ],
      label: 'First name'
    },
    {
      results: [
        {
          value: 'last name 1',
          filter: { fieldId: 'name', matcher: Matcher.Equals, value: 'last name 1' }
        }
      ],
      label: 'Last name'
    }
  ],
  uuid: ''
};

export const noResultsFilterSearchResponse: FilterSearchResponse = {
  sections: [{
    results: []
  }],
  uuid: ''
};

