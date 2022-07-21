import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext, State } from '@yext/search-headless-react';

import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { UniversalResults, UniversalResultsProps } from '../../src/components/UniversalResults';
import { RecursivePartial } from '../__utils__/mocks';
import { verticalResults } from '../__fixtures__/data/universalresults';

const meta: ComponentMeta<typeof UniversalResults> = {
  title: 'UniversalResults',
  component: UniversalResults,
};
export default meta;

const mockedHeadlessState: RecursivePartial<State> = {
  universal: {
    verticals: verticalResults
  }
};

const verticalConfigMap = {
  vertical1: {
    label: 'Vertical 1',
    viewAllButton: true
  }
};

export const Primary = (args: UniversalResultsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <UniversalResults verticalConfigMap={verticalConfigMap} showAppliedFilters={true} {...args} />
    </SearchHeadlessContext.Provider>
  );
};

export const Loading = (args: UniversalResultsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless({
      ...mockedHeadlessState,
      searchStatus: { isLoading: true }
    })}>
      <UniversalResults verticalConfigMap={verticalConfigMap} showAppliedFilters={true} {...args} />
    </SearchHeadlessContext.Provider>
  );
};
