/* eslint-disable @typescript-eslint/no-unused-vars */
import { AutocompleteResponse, AutocompleteService, FilterSearchRequest, FilterSearchResponse, UniversalAutocompleteRequest, VerticalAutocompleteRequest } from '@yext/search-core';

/* A sample Autocomplete response. */
const mockedResponse: AutocompleteResponse = {
  results: [],
  inputIntents: [],
  queryId: 'query-id',
  uuid: '123'
};

/* A sample Filter search response. */
const mockedFilterSearchResponse: FilterSearchResponse = {
  uuid: '123',
  queryId: 'query-id',
  sections: [],
  businessId: '1234'
};

/**
 * Generates a mocked AutocompleteService using the provided responses.
 *
 * @param response - The response to supply for all Query Suggestion requests. If one is
 * not provided, a default will be used.
 * @param filterSearchResponse - The response to supply for all Filter searches. If one is
 * not provided, a default will be used.
 */
export function generateMockedAutocompleteService(
  autocompleteResponse?: AutocompleteResponse,
  filterSearchResponse?: FilterSearchResponse): AutocompleteService
{
  return {
    universalAutocomplete:
      (request: UniversalAutocompleteRequest) => {
        const response = autocompleteResponse ? autocompleteResponse : mockedResponse;
        return Promise.resolve(response);
      },
    verticalAutocomplete:
      (request: VerticalAutocompleteRequest) => {
        const response = autocompleteResponse ? autocompleteResponse : mockedResponse;
        return Promise.resolve(response);
      },
    filterSearch:
      (request: FilterSearchRequest) => {
        const response = filterSearchResponse ? filterSearchResponse : mockedFilterSearchResponse;
        return Promise.resolve(response);
      }
  };
}

export const MockedAutocompleteService: AutocompleteService = generateMockedAutocompleteService();