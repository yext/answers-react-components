import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext, State } from '@yext/search-headless-react';
import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { createHierarchicalFacet } from '../__utils__/hierarchicalfacets';
import { RecursivePartial } from '../__utils__/mocks';
import { HierarchicalFacets, HierarchicalFacetsProps } from '../../src';

const meta: ComponentMeta<typeof HierarchicalFacets> = {
  title: 'HierarchicalFacets',
  component: HierarchicalFacets
};
export default meta;

const mockedHeadlessState: RecursivePartial<State> = {
  filters: {
    facets: [
      createHierarchicalFacet([
        'food',
        'food > fruit',
        { value: 'food > fruit > banana', selected: true },
        'food > fruit > apple',
      ])
    ]
  }
};

export function Primary(args: HierarchicalFacetsProps): JSX.Element {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <HierarchicalFacets includedFieldIds={['hier']} {...args} />
    </SearchHeadlessContext.Provider>
  );
}
