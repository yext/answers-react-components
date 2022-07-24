import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Matcher, Source, State, FiltersState } from '@yext/search-headless-react';
import { AppliedFilters } from '../../src/components/AppliedFilters';
import { createHierarchicalFacet } from '../__utils__/hierarchicalfacets';
import { spyOnActions, mockAnswersState, mockAnswersHooks } from '../__utils__/mocks';

const mockedStaticFilters = [{
  selected: true,
  fieldId: 'name',
  matcher: Matcher.Equals,
  value: 'Yext Answers',
  displayName: 'Yext Answers'
}, {
  selected: true,
  fieldId: 'name',
  matcher: Matcher.Equals,
  value: 'Yext Sites',
  displayName: 'Yext Sites'
}, {
  selected: true,
  fieldId: 'builtin.entityType',
  matcher: Matcher.Equals,
  value: 'Yext Pagebuilder',
  displayName: 'Yext Pagebuilder'
}];

const mockedFacets = [{
  fieldId: 'test',
  options: [{
    value: 'val',
    matcher: Matcher.Equals,
    count: 1,
    displayName: 'Yext Reviews',
    selected: true
  }, {
    value: 'val',
    matcher: Matcher.Equals,
    count: 1,
    displayName: 'Yext Sites',
    selected: true
  }],
  displayName: 'Product'
}];

const mockedState: Partial<State> = {
  filters: {
    static: mockedStaticFilters,
    facets: mockedFacets
  },
  vertical: {
    verticalKey: 'vertical',
    results: [{
      source: Source.KnowledgeManager,
      rawData: {}
    }],
    appliedQueryFilters: [{
      displayKey: 'Product Type',
      displayValue: 'Yext Listings',
      filter: {
        fieldId: 'produt',
        matcher: Matcher.Equals,
        value: 'Yext Listings'
      }
    }]
  },
  searchStatus: {
    isLoading: false
  },
  meta: {
    searchType: 'vertical'
  }
};

const mockedActions = {
  state: mockedState,
  executeVerticalQuery: jest.fn(),
  setOffset: jest.fn(),
  setFilterOption: jest.fn(),
  setFacetOption: jest.fn(),
  resetFacets: jest.fn(),
  setStaticFilters: jest.fn()
};
jest.mock('@yext/search-headless-react');

describe('AppliedFilters', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions });
  });

  it('Static filters are rendered', () => {
    render(<AppliedFilters />);
    const staticFilterDisplayName = mockedState.filters.static[0].value as string;
    expect(screen.getByText(staticFilterDisplayName)).toBeDefined();
  });

  it('Facets are rendered', () => {
    render(<AppliedFilters />);
    const facetOptionDisplayName = mockedState.filters.facets[0].options[0].displayName;
    expect(screen.getByText(facetOptionDisplayName)).toBeDefined();
  });

  it('Applied query filters are rendered', () => {
    render(<AppliedFilters />);
    const appliedFilterDisplayName = mockedState.vertical.appliedQueryFilters[0].displayValue;
    expect(screen.getByText(appliedFilterDisplayName)).toBeDefined();
  });

  it('Filters with the fieldId of "builtin.entityType" are hidden by default', () => {
    render(<AppliedFilters />);
    const staticFilterDisplayName = mockedState.filters.static[2].value as string;
    expect(screen.queryByText(staticFilterDisplayName)).toBeFalsy();
  });

  it('The hiddenFields prop prevents filters with a corresponding fieldId from rendering', () => {
    render(<AppliedFilters hiddenFields={['name']} />);
    const staticFilterDisplayName = mockedState.filters.static[0].value as string;
    expect(screen.queryByText(staticFilterDisplayName)).toBeFalsy();
  });

  it('The "X" button for an applied static filter deselects the filter option and duplicate facet if exists', () => {
    const actions = spyOnActions();

    render(<AppliedFilters />);
    const removeFilterButton = screen.getAllByRole('button', { name: 'Remove "Yext Sites" filter' })[0];
    userEvent.click(removeFilterButton);

    const isSelected = actions.setFacetOption.mock.calls[0][2];
    expect(isSelected).toBe(false);
  });

  it('The "X" button for an applied facet deselects the facet option', () => {
    const actions = spyOnActions();

    render(<AppliedFilters />);
    const removeFilterButton = screen.getByRole('button', { name: 'Remove "Yext Reviews" filter' });
    userEvent.click(removeFilterButton);

    const isSelected = actions.setFacetOption.mock.calls[0][2];
    expect(isSelected).toBe(false);
  });

  it('The clear all button unselects all filters', () => {
    const actions = spyOnActions();

    render(<AppliedFilters />);
    const clearAllButton = screen.getByRole('button', { name: 'Clear All' });
    userEvent.click(clearAllButton);

    expect(actions.resetFacets).toHaveBeenCalled();
    expect(actions.setStaticFilters).toHaveBeenCalledWith(expect.not.objectContaining({ selected: true }));
  });
});

describe('AppliedFilters with hierarchical facets', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions });
  });
  it('renders hierarchical facets in the correct order, with same fieldId facets adjacent to each other', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food > fruit > banana',
          { value: 'food > fruit', selected: true },
          'food > fruit > apple',
          'food'
        ]),
        createHierarchicalFacet([
          'fool > bb',
          { value: 'fool > verylonglongman', selected: true },
          'fool',
          'fool > a',
          'fool > longlong',
        ]),
      ]
    });

    render(<AppliedFilters hierarchicalFacetsFieldIds={['hier']} />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(5);
    expect(buttons[0]).toHaveAttribute('aria-label', 'Remove "food" filter');
    expect(buttons[1]).toHaveAttribute('aria-label', 'Remove "fruit" filter');

    expect(buttons[2]).toHaveAttribute('aria-label', 'Remove "fool" filter');
    expect(buttons[3]).toHaveAttribute('aria-label', 'Remove "verylonglongman" filter');

    expect(buttons[4]).toHaveTextContent('Clear All');
  });

  it('renders only selected or parents of selected filters', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          { value: 'food > fruit', selected: true },
          'games',
          { value: 'games > steinsgate', selected: true },
          'games > nier',
        ])
      ]
    });

    render(<AppliedFilters hierarchicalFacetsFieldIds={['hier']} />);
    expect(screen.queryAllByLabelText(/Remove "[a-zA_Z]+" filter/)).toHaveLength(4);
    const nierButton = screen.queryByLabelText('Remove "nier" filter');
    expect(nierButton).toBeNull();
  });

  it('can use a custom delimiter', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          { value: 'games', selected: false },
          { value: 'games ! steinsgate', selected: true }
        ])
      ]
    });

    render(<AppliedFilters
      hierarchicalFacetsFieldIds={['hier']}
      hierarchicalFacetsDelimiter='!'
    />);
    const filterPills = screen.queryAllByLabelText(/Remove "[a-zA_Z]+" filter/);
    expect(filterPills).toHaveLength(2);
    expect(filterPills[0]).toHaveAttribute('aria-label', 'Remove "games" filter');
    expect(filterPills[1]).toHaveAttribute('aria-label', 'Remove "steinsgate" filter');
  });

  it('removing a hierarchical applied filter removes the facet and all descendants in the hierarchy', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          'food > fruit',
          { value: 'food > fruit > banana', selected: true },
          'food > fruit > apple',
          'food > meat',
          'food > meat > cow',
          'food > meat > pig',
          'food > cookies'
        ]),
        createHierarchicalFacet([
          'fool',
          'fool > a',
        ]),
      ]
    });
    const actions = spyOnActions();

    render(<AppliedFilters hierarchicalFacetsFieldIds={['hier']} />);
    const filterPills = screen.queryAllByLabelText(/Remove "[a-zA_Z]+" filter/);
    expect(filterPills).toHaveLength(3);

    const fruitButton = screen.queryByLabelText('Remove "food" filter');
    userEvent.click(fruitButton);

    expect(actions.setFacetOption).toHaveBeenCalledTimes(3);
    expect(actions.setFacetOption).toHaveBeenCalledWith(
      'hier',
      { matcher: Matcher.Equals, value: 'food' },
      false
    );
    expect(actions.setFacetOption).toHaveBeenCalledWith(
      'hier',
      { matcher: Matcher.Equals, value: 'food > fruit' },
      false
    );
    expect(actions.setFacetOption).toHaveBeenCalledWith(
      'hier',
      { matcher: Matcher.Equals, value: 'food > fruit > banana' },
      false
    );
  });

  it('removing a hierarchical applied filter selects its parent', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          'food > fruit',
          { value: 'food > fruit > banana', selected: true },
        ]),
      ]
    });

    const actions = spyOnActions();

    render(<AppliedFilters hierarchicalFacetsFieldIds={['hier']} />);
    const filterPills = screen.queryAllByLabelText(/Remove "[a-zA_Z]+" filter/);
    expect(filterPills).toHaveLength(3);

    const fruitButton = screen.queryByLabelText('Remove "banana" filter');
    userEvent.click(fruitButton);

    expect(actions.setFacetOption).toHaveBeenCalledWith(
      'hier',
      { matcher: Matcher.Equals, value: 'food > fruit > banana' },
      false
    );
    expect(actions.setFacetOption).toHaveBeenCalledWith(
      'hier',
      { matcher: Matcher.Equals, value: 'food > fruit' },
      true
    );
  });
});

function mockFiltersState(filters: FiltersState) {
  return mockAnswersState({
    ...mockedState,
    filters
  });
}
