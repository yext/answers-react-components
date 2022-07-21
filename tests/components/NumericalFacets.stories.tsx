import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext, State } from '@yext/search-headless-react';

import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { RecursivePartial } from '../__utils__/mocks';
import { DisplayableFacets } from '../__fixtures__/data/filters';
import { NumericalFacets, NumericalFacetsProps } from '../../src';

const meta: ComponentMeta<typeof NumericalFacets> = {
  title: 'NumericalFacets',
  component: NumericalFacets
};
export default meta;

const mockedHeadlessState: RecursivePartial<State> = {
  filters: {
    facets: DisplayableFacets
  }
};

export const Primary = (args: NumericalFacetsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <NumericalFacets {...args} />
    </SearchHeadlessContext.Provider>
  );
};
