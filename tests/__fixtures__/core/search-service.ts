/* eslint-disable @typescript-eslint/no-unused-vars */
import { SearchService, UniversalSearchRequest, UniversalSearchResponse, VerticalSearchRequest, VerticalSearchResponse } from '@yext/search-core';

/* A sample Universal Search response. */
const mockedUniversalResponse: UniversalSearchResponse = {
  uuid: '123',
  verticalResults: []
};

/* A sample Vertical Search response. */
const mockedVerticalResponse: VerticalSearchResponse = {
  uuid: '123',
  queryId: 'query-id',
  verticalResults: null
};

/**
 * Generates a mocked SearchService using the provided responses.
 *
 * @param universalResponse - The response to supply for all Universal Searches. If one is
 * not provided, a default will be used.
 * @param verticalResponse - The response to supply for all Vertical Searches. If one is
 * not provided, a default will be used.
 */
export function generateMockedSearchService(
  universalResponse?: UniversalSearchResponse,
  verticalResponse?: VerticalSearchResponse ): SearchService
{
  return {
    universalSearch: (request: UniversalSearchRequest) => {
      const response = universalResponse ? universalResponse : mockedUniversalResponse;
      return Promise.resolve(response);
    },
    verticalSearch: (request: VerticalSearchRequest) => {
      const response = verticalResponse ? verticalResponse : mockedVerticalResponse;
      return Promise.resolve(response);
    }
  };
}

export const MockedSearchService: SearchService = generateMockedSearchService();