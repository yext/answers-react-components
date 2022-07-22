import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext, State } from '@yext/search-headless-react';
import { userEvent, within } from '@storybook/testing-library';
import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { RecursivePartial } from '../__utils__/mocks';
import { DisplayableFacets } from '../__fixtures__/data/filters';
import { StandardFacets, StandardFacetsProps } from '../../src';

const meta: ComponentMeta<typeof StandardFacets> = {
  title: 'StandardFacets',
  component: StandardFacets
};
export default meta;

const mockedHeadlessState: RecursivePartial<State> = {
  filters: {
    facets: DisplayableFacets
  }
};

export const Primary = (args: StandardFacetsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <StandardFacets {...args} />
    </SearchHeadlessContext.Provider>
  );
};

export const NoOptionCounts = (args: StandardFacetsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <StandardFacets {...args} showOptionCounts={false} />
    </SearchHeadlessContext.Provider>
  );
};

export const ShowMoreLimit = (args: StandardFacetsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <StandardFacets {...args} showMoreLimit={1} />
    </SearchHeadlessContext.Provider>
  );
};

export const ShowMoreLimitClicked = ShowMoreLimit.bind({});
ShowMoreLimitClicked.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  userEvent.click(canvas.getByText('Show More'));
};
