import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext, SearchTypeEnum } from '@yext/search-headless-react';

import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { AppliedFiltersDisplay } from '../../src/components/AppliedFiltersDisplay';
import { DisplayableFilters, DisplayableHierarchicalFacets } from '../__fixtures__/data/filters';
import { AppliedFiltersProps, builtInCssClasses } from '../../src/components/AppliedFilters';

const meta: ComponentMeta<typeof AppliedFiltersDisplay> = {
  title: 'AppliedFilters',
  component: AppliedFiltersDisplay,
  argTypes: {
    hierarchicalFacetsDelimiter: {
      control: false
    }
  }
};
export default meta;

export const Primary = (args: AppliedFiltersProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless({
      meta: { searchType: SearchTypeEnum.Vertical }
    })}>
      <AppliedFiltersDisplay
        cssClasses={builtInCssClasses}
        staticFilters={DisplayableFilters.slice(0, 2)}
        nlpFilters={[DisplayableFilters[2]]}
        facets={[DisplayableFilters[3]]}
        hierarchicalFacets={DisplayableHierarchicalFacets}
        hierarchicalFacetsDelimiter='>'
        {...args}
      />
    </SearchHeadlessContext.Provider>
  );
};

