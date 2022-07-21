import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext } from '@yext/search-headless-react';

import { DirectAnswer, DirectAnswerProps } from '../../src/components/DirectAnswer';

import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { featuredSnippetDAState, fieldValueDAState } from '../__fixtures__/data/directanswers';

const meta: ComponentMeta<typeof DirectAnswer> = {
  title: 'DirectAnswer',
  component: DirectAnswer,
};
export default meta;

export const FieldValue = (args: DirectAnswerProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless({
      directAnswer: fieldValueDAState
    })}>
      <DirectAnswer {...args} />
    </SearchHeadlessContext.Provider>
  );
};

export const FeaturedSnippet = (args: DirectAnswerProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless({
      directAnswer: featuredSnippetDAState
    })}>
      <DirectAnswer {...args} />
    </SearchHeadlessContext.Provider>
  );
};

export const Loading = (args: DirectAnswerProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless({
      directAnswer: featuredSnippetDAState,
      searchStatus: { isLoading: true }
    })}>
      <DirectAnswer {...args} />
    </SearchHeadlessContext.Provider>
  );
};

