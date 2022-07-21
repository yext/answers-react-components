import userEvent from '@testing-library/user-event';
import { State, Matcher, SelectableFilter } from '@yext/search-headless-react';
import { render, screen, waitFor } from '@testing-library/react';
import { RangeInput } from '../../src/components/Filters';
import { mockAnswersHooks, spyOnActions } from '../__utils__/mocks';
import { FiltersContext, FiltersContextType } from '../../src/components/Filters/FiltersContext';
import { FilterGroupContext, FilterGroupContextType } from '../../src/components/Filters/FilterGroupContext';

const mockedState: Partial<State> = {
  filters: {
    static: [],
  },
  meta: {
    searchType: 'vertical'
  }
};

const mockedActions = {
  state: mockedState,
  setOffset: jest.fn(),
  setFilterOption: jest.fn(),
  resetFacets: jest.fn(),
  executeVerticalQuery: jest.fn()
};

jest.mock('@yext/search-headless-react');

it('renders the correct inital state', () => {
  renderRangeInput(filterContextValue);
  const [minTextbox, maxTextbox] = screen.getAllByRole('textbox');
  expect(minTextbox).toBeDefined();
  expect(maxTextbox).toBeDefined();
  expect(screen.queryByText('Clear min and max')).toBeNull();
  expect(screen.queryByText('Apply')).toBeNull();
});

describe('Renders correctly for min input', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions });
  });
  it('renders correctly when inputing min and applies proper values in state', async () => {
    renderRangeInput(filterContextValue);
    const actions = spyOnActions();
    const minTextbox = screen.getAllByRole('textbox')[0];
    userEvent.type(minTextbox, '10');
    await waitFor(() => {
      expect(minTextbox).toHaveValue('10');
    });
    expect(screen.getByText('Clear min and max')).toBeDefined();
    expect(screen.getByText('Apply')).toBeDefined();
    userEvent.click(screen.getByText('Apply'));
    expect(actions.setFilterOption).toHaveBeenCalledWith({
      displayName: 'Over 10',
      fieldId: '123',
      matcher: '$between',
      selected: true,
      value: {
        start: {
          matcher: '$ge',
          value: 10
        },
      }
    });
  });

  it('renders correctly when clearing input and removes range filter set in state', async () => {
    renderRangeInput(filterContextValue);
    const actions = spyOnActions();
    const minTextbox = screen.getAllByRole('textbox')[0];
    userEvent.type(minTextbox, '10');
    await waitFor(() => {
      expect(minTextbox).toHaveValue('10');
    });
    userEvent.click(screen.getByText('Clear min and max'));
    expect(minTextbox).toHaveValue('');
    expect(actions.setFilterOption).toHaveBeenCalledWith({
      displayName: 'Over 10',
      fieldId: '123',
      matcher: '$between',
      selected: false,
      value: {
        start: {
          matcher: '$ge',
          value: 10
        },
      }
    });
  });
});

describe('Renders correctly for max input', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions });
  });

  it('renders correctly when inputing max and applies proper values in state', async () => {
    renderRangeInput(filterContextValue);
    const actions = spyOnActions();
    const maxTextbox = screen.getAllByRole('textbox')[1];
    userEvent.type(maxTextbox, '20');
    await waitFor(() => {
      expect(maxTextbox).toHaveValue('20');
    });
    expect(screen.getByText('Clear min and max')).toBeDefined();
    expect(screen.getByText('Apply')).toBeDefined();
    userEvent.click(screen.getByText('Apply'));
    expect(actions.setFilterOption).toHaveBeenCalledWith({
      displayName: 'Up to 20',
      fieldId: '123',
      matcher: '$between',
      selected: true,
      value: {
        end: {
          matcher: '$le',
          value: 20
        },
      }
    });
  });

  it('renders correctly when clearing input and removes range filter set in state', async () => {
    renderRangeInput(filterContextValue);
    const actions = spyOnActions();
    const maxTextbox = screen.getAllByRole('textbox')[1];
    userEvent.type(maxTextbox, '20');
    await waitFor(() => {
      expect(maxTextbox).toHaveValue('20');
    });
    userEvent.click(screen.getByText('Clear min and max'));
    expect(maxTextbox).toHaveValue('');
    expect(actions.setFilterOption).toHaveBeenCalledWith({
      displayName: 'Up to 20',
      fieldId: '123',
      matcher: '$between',
      selected: false,
      value: {
        end: {
          matcher: '$le',
          value: 20
        },
      }
    });
  });
});

describe('Renders correctly for min and max inputs', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions });
  });

  it('renders correctly when inputing range and applies proper values in state', async () => {
    renderRangeInput(filterContextValue);
    const actions = spyOnActions();
    const [minTextbox, maxTextbox] = screen.getAllByRole('textbox');
    userEvent.type(minTextbox, '10');
    userEvent.type(maxTextbox, '20');
    await waitFor(() => {
      expect(minTextbox).toHaveValue('10');
    });
    expect(maxTextbox).toHaveValue('20');
    expect(screen.getByText('Apply')).toBeDefined();
    expect(screen.getByText('Clear min and max')).toBeDefined();
    userEvent.click(screen.getByText('Apply'));
    expect(actions.setFilterOption).toHaveBeenCalledWith({
      displayName: '10 - 20',
      fieldId: '123',
      matcher: '$between',
      selected: true,
      value: {
        start: {
          matcher: '$ge',
          value: 10
        },
        end: {
          matcher: '$le',
          value: 20
        },
      }
    });
  });

  it('renders correctly when clearing inputs and removes range filter set in state', async () => {
    renderRangeInput(filterContextValue);
    const actions = spyOnActions();
    const [minTextbox, maxTextbox] = screen.getAllByRole('textbox');
    userEvent.type(minTextbox, '10');
    userEvent.type(maxTextbox, '20');
    await waitFor(() => {
      expect(minTextbox).toHaveValue('10');
    });
    expect(maxTextbox).toHaveValue('20');
    userEvent.click(screen.getByText('Clear min and max'));
    expect(minTextbox).toHaveValue('');
    expect(maxTextbox).toHaveValue('');
    expect(actions.setFilterOption).toHaveBeenCalledWith({
      displayName: '10 - 20',
      fieldId: '123',
      matcher: '$between',
      selected: false,
      value: {
        start: {
          matcher: '$ge',
          value: 10
        },
        end: {
          matcher: '$le',
          value: 20
        },
      }
    });
  });

  it('renders correctly when input range is invalid and no filter is set in state', async () => {
    renderRangeInput(filterContextValue);
    const [minTextbox, maxTextbox] = screen.getAllByRole('textbox');
    userEvent.type(minTextbox, '20');
    userEvent.type(maxTextbox, '10');
    const actions = spyOnActions();
    await waitFor(() => {
      expect(minTextbox).toHaveValue('20');
    });
    expect(maxTextbox).toHaveValue('10');
    expect(screen.getByText('Invalid range')).toBeDefined();
    expect(actions.setFilterOption).toHaveBeenCalledTimes(0);
  });
});

it('renders correctly when disabled', () => {
  const selectableFilter: SelectableFilter = {
    selected: true,
    fieldId: '123',
    matcher: Matcher.Between,
    value: 'test'
  };
  const filterContextValueDisabled: FiltersContextType = {
    selectFilter: () => null,
    applyFilters: () => null,
    filters: [selectableFilter]
  };
  renderRangeInput(filterContextValueDisabled);
  const [minTextbox, maxTextbox] = screen.getAllByRole('textbox');
  expect(minTextbox).toHaveAttribute('disabled');
  expect(maxTextbox).toHaveAttribute('disabled');
  expect(screen.getByText('Unselect an option to enter in a range.')).toBeDefined();
});

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

const filterContextValue: FiltersContextType = {
  selectFilter: () => null,
  applyFilters: () => null,
  filters: []
};

function renderRangeInput(filterContextValue) {
  return (
    render(
      <FilterGroupContext.Provider value={filterGroupContextValue}>
        <FiltersContext.Provider value={filterContextValue}>
          <RangeInput />
        </FiltersContext.Provider>
      </FilterGroupContext.Provider>)
  );
}