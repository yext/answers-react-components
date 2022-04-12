import { render, screen } from '@testing-library/react';
import { FiltersState, Matcher, Source, State } from '@yext/answers-headless-react';
import { Filters } from '../../../src/components';
import { createHierarchicalFacet } from '../../__utils__/hierarchicalfacets';
import { spyOnActions, mockAnswersState, mockAnswersHooks } from '../../__utils__/mocks';
import { Fragment } from 'react';
import userEvent from '@testing-library/user-event';

const mockedState: Partial<State> = {
  filters: {
    static: [],
    facets: []
  },
  vertical: {
    verticalKey: 'vertical',
    results: [{
      source: Source.KnowledgeManager,
      rawData: {}
    }],
    appliedQueryFilters: []
  },
  searchStatus: {
    isLoading: false
  },
  meta: {
    searchType: 'vertical'
  }
};

function HierarchicalFacets(): JSX.Element {
  const hierarchicalFacetFieldIds = ['hier'];
  return (
    <Filters.Facets searchOnChange={true}>
      {facets => {
        const filteredFacets = facets.filter(f => f.options.length > 0);
        return (
          <>
            {
              filteredFacets.map(f => {
                if (hierarchicalFacetFieldIds.includes(f.fieldId)) {
                  return <Fragment key={f.fieldId}>
                    <Filters.HierarchicalFacet facet={f} />
                  </Fragment>;
                }
                return null;
              })
            }
            {filteredFacets.length > 0 && <Filters.ApplyFiltersButton />}
          </>
        );
      }}
    </Filters.Facets>
  );
}

const mockedActions = {
  state: mockedState,
  executeVerticalQuery: jest.fn(),
  setOffset: jest.fn(),
  setFilterOption: jest.fn(),
  setFacetOption: jest.fn(),
  resetFacets: jest.fn(),
  setStaticFilters: jest.fn()
};

jest.mock('@yext/answers-headless-react');

describe('Hierarchical facets', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions });
  });

  it('Properly renders hierarchical facets', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          'food > fruit',
          { value: 'food > fruit > banana', selected: true },
          'food > fruit > apple',
        ])
      ]
    });
    render(<HierarchicalFacets/>);

    expect(screen.getByRole('button', { name: /food/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /fruit/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /banana/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /apple/i })).toBeTruthy();
  });

  it('Clicking the currently selected option deselects it and selects its parent', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          'food > fruit',
          { value: 'food > fruit > banana', selected: true },
          'food > fruit > apple',
        ])
      ]
    });
    const actions = spyOnActions();

    render(<HierarchicalFacets/>);

    const bananaButton = screen.getByRole('button', { name: /banana/i });
    userEvent.click(bananaButton);

    expectFacetOptionSet(actions, { value: 'food > fruit > banana', selected: false });
    expectFacetOptionSet(actions, { value: 'food > fruit', selected: true });
  });
  it('Clicking a non-selected option selects it and deselects its siblings', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          'food > fruit',
          { value: 'food > fruit > banana', selected: true },
          'food > fruit > apple',
        ])
      ]
    });
    const actions = spyOnActions();

    render(<HierarchicalFacets/>);

    const appleButton = screen.getByRole('button', { name: /apple/i });
    userEvent.click(appleButton);

    expectFacetOptionSet(actions, { value: 'food > fruit > apple', selected: true });
    expectFacetOptionSet(actions, { value: 'food > fruit > banana', selected: false });
  });
  it('Clicking the current category with a selected child selects the category and deselects the child', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          'food > fruit',
          { value: 'food > fruit > banana', selected: true },
          'food > fruit > apple',
        ])
      ]
    });
    const actions = spyOnActions();

    render(<HierarchicalFacets/>);

    const currentCategoryButton = screen.getByRole('button', { name: /fruit/i });
    userEvent.click(currentCategoryButton);

    expectFacetOptionSet(actions, { value: 'food > fruit', selected: true });
    expectFacetOptionSet(actions, { value: 'food > fruit > banana', selected: false });
  });

  it('Clicking a selected current category deselects it and selects its parent', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          { value: 'food > fruit', selected: true },
          'food > fruit > banana',
          'food > fruit > apple',
        ])
      ]
    });
    const actions = spyOnActions();

    render(<HierarchicalFacets/>);

    const currentCategoryButton = screen.getByRole('button', { name: /fruit/i });
    userEvent.click(currentCategoryButton);

    expectFacetOptionSet(actions, { value: 'food > fruit', selected: false });
    expectFacetOptionSet(actions, { value: 'food', selected: true });
  });
  it('Clicking a parent category selects it and deselects its children', () => {
    mockFiltersState({
      facets: [
        createHierarchicalFacet([
          'food',
          'food > fruit',
          { value: 'food > fruit > banana', selected: true },
          'food > fruit > apple',
        ])
      ]
    });
    const actions = spyOnActions();

    render(<HierarchicalFacets/>);

    const parentCategoryButton = screen.getByRole('button', { name: /food/i });
    userEvent.click(parentCategoryButton);

    expectFacetOptionSet(actions, { value: 'food', selected: true });
    expectFacetOptionSet(actions, { value: 'food > fruit', selected: false });
    expectFacetOptionSet(actions, { value: 'food > fruit > banana', selected: false });
  });
});

function expectFacetOptionSet(actions, facet: { value: string, selected: boolean }) {
  expect(actions.setFacetOption).toHaveBeenCalledWith(
    'hier',
    { matcher: Matcher.Equals, value: facet.value },
    facet.selected
  );
}

function mockFiltersState(filters: FiltersState) {
  return mockAnswersState({
    ...mockedState,
    filters
  });
}