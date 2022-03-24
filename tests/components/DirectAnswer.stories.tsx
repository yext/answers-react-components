import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { AnswersHeadlessContext } from '@yext/answers-headless-react';

import { DirectAnswer } from '../../src/components/DirectAnswer';

import { generateMockedHeadless } from '../__fixtures__/answers-headless';
import { featuredSnippetDAState, fieldValueDAState } from './DirectAnswer.fixtures';

const meta: ComponentMeta<typeof DirectAnswer> = {
  title: 'DirectAnswer',
  component: DirectAnswer,
};
export default meta;

export const FieldValue = () => {
  return (
    <AnswersHeadlessContext.Provider value={generateMockedHeadless({
      directAnswer: fieldValueDAState
    })}>
      <DirectAnswer />
    </AnswersHeadlessContext.Provider>
  );
};

export const FeaturedSnippet = () => {
  return (
    <AnswersHeadlessContext.Provider value={generateMockedHeadless({
      directAnswer: featuredSnippetDAState
    })}>
      <DirectAnswer />
    </AnswersHeadlessContext.Provider>
  );
};

export const Loading = () => {
  return (
    <AnswersHeadlessContext.Provider value={generateMockedHeadless({
      directAnswer: featuredSnippetDAState,
      searchStatus: { isLoading: true }
    })}>
      <DirectAnswer />
    </AnswersHeadlessContext.Provider>
  );
};

