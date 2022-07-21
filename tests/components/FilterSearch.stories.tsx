import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext, SearchTypeEnum } from '@yext/search-headless-react';

import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { FilterSearch, FilterSearchProps } from '../../src/components';
import { userEvent, within } from '@storybook/testing-library';
import { generateMockedAutocompleteService } from '../__fixtures__/core/autocomplete-service';
import { labeledFilterSearchResponse, unlabeledFilterSearchResponse } from '../__fixtures__/data/filtersearch';

const mockedHeadlessState = {
  vertical: {
    verticalKey: 'people'
  },
  meta: {
    searchType: SearchTypeEnum.Vertical
  }
};

const searchFields = [
  {
    fieldApiName: 'first_name',
    entityType: 'ce_person'
  },
  {
    fieldApiName: 'last_name',
    entityType: 'ce_person'
  }
];

const meta: ComponentMeta<typeof FilterSearch> = {
  title: 'FilterSearch',
  component: FilterSearch,
  argTypes: {
    sectioned: {
      control: false
    },
    searchFields: {
      control: false
    }
  }
};
export default meta;

export const Primary = (args: FilterSearchProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <FilterSearch label='Filter' {...args} searchFields={searchFields} />
    </SearchHeadlessContext.Provider>
  );
};

export const DropdownUnsectioned = Primary.bind({});
DropdownUnsectioned.parameters = {
  searchCoreServices: {
    autoCompleteService: generateMockedAutocompleteService(undefined, unlabeledFilterSearchResponse)
  }
};
DropdownUnsectioned.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  userEvent.type(canvas.getByRole('textbox'), 'name');
};

export const DropdownSectioned = (args: FilterSearchProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <FilterSearch label='Filter' sectioned={true} {...args} searchFields={searchFields} />
    </SearchHeadlessContext.Provider>
  );
};
DropdownSectioned.parameters = {
  searchCoreServices: {
    autoCompleteService: generateMockedAutocompleteService(undefined, labeledFilterSearchResponse)
  }
};
DropdownSectioned.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  userEvent.type(canvas.getByRole('textbox'), 'name');
};

export const DropdownHighlight = (args: FilterSearchProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <FilterSearch label='Filter' sectioned={true} {...args} searchFields={searchFields} />
    </SearchHeadlessContext.Provider>
  );
};
DropdownHighlight.parameters = {
  searchCoreServices: {
    autoCompleteService: generateMockedAutocompleteService(undefined, labeledFilterSearchResponse)
  }
};
DropdownHighlight.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  userEvent.click(canvas.getByRole('textbox'));
  userEvent.keyboard('name');
  userEvent.keyboard('{Tab}{Tab}', { delay: 1 });
};

export const NoLabel = (args: FilterSearchProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <FilterSearch {...args} searchFields={searchFields} />
    </SearchHeadlessContext.Provider>
  );
};