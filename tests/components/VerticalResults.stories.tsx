import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { AnswersHeadlessContext, Source } from '@yext/answers-headless-react';

import { generateMockedHeadless } from '../__fixtures__/answers-headless';
import { VerticalResults, VerticalResultsProps } from '../../src/components/VerticalResults';
import { StandardCard } from '../../src/components/cards/standard/StandardCard';

const meta: ComponentMeta<typeof VerticalResults> = {
  title: 'VerticalResults',
  component: VerticalResults,
  argTypes: {
    CardComponent: {
      control: false
    }
  }
};
export default meta;

const mockedHeadlessState = {
  vertical: {
    results: [
      {
        rawData: {
          name: 'title1',
          description: 'text1',
          c_primaryCTA: {
            link: 'link1',
            label: 'job1',
            linkType: 'link'
          },
          c_secondaryCTA: {
            link: 'link2',
            label: 'job2',
            linkType: 'link'
          }
        },
        source: Source.KnowledgeManager,
        id: 'id1'
      }
    ],
    resultsCount: 5,
    limit: 1
  }
};

export const NoResults = (args: VerticalResultsProps) => {
  const verticalResultsProps: VerticalResultsProps = {
    CardComponent: StandardCard
  };
  return (
    <AnswersHeadlessContext.Provider value={generateMockedHeadless({})}>
      <VerticalResults {...verticalResultsProps} {...args} />
    </AnswersHeadlessContext.Provider>
  );
};

export const HasResults = (args: VerticalResultsProps) => {
  const verticalResultsProps: VerticalResultsProps = {
    CardComponent: StandardCard
  };
  return (
    <AnswersHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <VerticalResults {...verticalResultsProps} {...args} />
    </AnswersHeadlessContext.Provider>
  );
};

export const Loading = (args: VerticalResultsProps) => {
  const verticalResultsProps: VerticalResultsProps = {
    CardComponent: StandardCard
  };
  return (
    <AnswersHeadlessContext.Provider value={generateMockedHeadless({
      ...mockedHeadlessState,
      searchStatus: { isLoading: true }
    })}>
      <VerticalResults {...verticalResultsProps} {...args} />
    </AnswersHeadlessContext.Provider>
  );
};
