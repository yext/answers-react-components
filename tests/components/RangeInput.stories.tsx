import { ComponentMeta } from '@storybook/react';
import { RangeInput, RangeInputProps } from '../../src/components/Filters/RangeInput';
import { SearchHeadlessContext, Matcher, SelectableFilter } from '@yext/search-headless-react';
import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { FiltersContext, FiltersContextType } from '../../src/components/Filters/FiltersContext';
import { FilterGroupContext, FilterGroupContextType } from '../../src/components/Filters/FilterGroupContext';
import { userEvent, within } from '@storybook/testing-library';

const meta: ComponentMeta<typeof RangeInput> = {
  title: 'RangeInput',
  component: RangeInput,
};

export default meta;

const selectableFilter: SelectableFilter = {
  selected: true,
  fieldId: '123',
  matcher: Matcher.Equals,
  value: 'test'
};

const filterContextValue: FiltersContextType = {
  selectFilter: () => null,
  applyFilters: () => null,
  filters: []
};

const filterContextValueDisabled: FiltersContextType = {
  selectFilter: () => null,
  applyFilters: () => null,
  filters: [selectableFilter]
};

const filterGroupContextValue: FilterGroupContextType = {
  searchValue: '',
  fieldId: '123',
  setSearchValue: () => null,
  getCollapseProps: null,
  getToggleProps: null,
  isExpanded: null,
  isOptionsDisabled: null,
  setIsOptionsDisabled: () => null
};

export const Primary = (args: RangeInputProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless()}>
      <FilterGroupContext.Provider value={filterGroupContextValue}>
        <FiltersContext.Provider value={filterContextValue}>
          <RangeInput {...args}/>
        </FiltersContext.Provider>
      </FilterGroupContext.Provider>
    </SearchHeadlessContext.Provider>
  );
};

export const Disabled = (args: RangeInputProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless()}>
      <FilterGroupContext.Provider value={filterGroupContextValue}>
        <FiltersContext.Provider value={filterContextValueDisabled}>
          <RangeInput {...args}/>
        </FiltersContext.Provider>
      </FilterGroupContext.Provider>
    </SearchHeadlessContext.Provider>
  );
};

export const DisabledForceDisplayTooltip = Disabled.bind({});
DisabledForceDisplayTooltip.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tooltip = canvas.getByText('Unselect an option to enter in a range.').parentElement;
  tooltip.style.visibility = 'visible';
};

export const ValidValues = Primary.bind({});
ValidValues.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const [minTextbox, maxTextbox] = canvas.getAllByRole('textbox');
  userEvent.type(minTextbox, '10');
  userEvent.type(maxTextbox, '20');
};

export const InvalidValues = Primary.bind({});
InvalidValues.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const [minTextbox, maxTextbox] = canvas.getAllByRole('textbox');
  userEvent.type(minTextbox, '20');
  userEvent.type(maxTextbox, '10');
};