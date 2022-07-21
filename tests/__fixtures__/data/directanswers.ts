import { DirectAnswerState, DirectAnswerType } from '@yext/search-headless-react';
import { RecursivePartial } from '../../__utils__/mocks';

export const featuredSnippetDAState: RecursivePartial<DirectAnswerState> = {
  result: {
    type: DirectAnswerType.FeaturedSnippet,
    snippet: {
      value: '[snippet.value]',
      matchedSubstrings: [{ length: 4, offset: 1 }]
    },
    value: '[value]',
    relatedResult: {
      link: '[relatedResult.link]',
      name: '[relatedResult.name]',
      id: '[relatedResult.id]'
    }
  }
};

export const fieldValueDAState: RecursivePartial<DirectAnswerState> = {
  result: {
    type: DirectAnswerType.FieldValue,
    entityName: '[entityName]',
    fieldName: '[fieldName]',
    value: '[value]',
    relatedResult: {
      link: '[relatedResult.link]',
      id: '[relatedResult.id]'
    }
  }
};