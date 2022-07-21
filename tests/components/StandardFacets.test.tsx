import { render, screen } from '@testing-library/react';
import { DisplayableFacetOption, FacetOption, Source, State, SearchActions } from '@yext/search-headless-react';
import { mockAnswersHooks, spyOnActions } from '../__utils__/mocks';
import userEvent from '@testing-library/user-event';
import { DisplayableFacets } from '../__fixtures__/data/filters';
import { StandardFacets } from '../../src/components';

const mockedState: Partial<State> = {
  filters: {
    static: [],
    facets: DisplayableFacets
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

const mockedActions = {
  state: mockedState,
  setOffset: jest.fn(),
  setFacetOption: jest.fn(),
  executeVerticalQuery: jest.fn()
};

const mockedUtils = {
  isCloseMatch: () => true
};

jest.mock('@yext/search-headless-react');

describe('StandardFacets', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions, mockedUtils });
  });

  it('Properly renders regular range facets only', () => {
    render(<StandardFacets />);

    const regularFilter = DisplayableFacets[0];
    const numericalFilter = DisplayableFacets[1];

    expect(screen.getByText(regularFilter.displayName)).toBeDefined();
    regularFilter.options.forEach(o => {
      expect(screen.getByText(getOptionLabelText(o))).toBeDefined();
    });

    expect(screen.queryByText(numericalFilter.displayName)).toBeNull();
    numericalFilter.options.forEach(o => {
      expect(screen.queryByText(o.displayName)).toBeNull();
    });
  });

  it('Clicking an unselected facet option checkbox selects it', () => {
    const actions = spyOnActions();
    render(<StandardFacets />);

    const productFacet = DisplayableFacets[0];
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(
      getOptionLabelText(productFacet.options[0])
    );
    expect(coffeeCheckbox.checked).toBeFalsy();

    userEvent.click(coffeeCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[0], true);
  });

  it('Does not display option counts if showOptionCounts is set to false', () => {
    render(<StandardFacets showOptionCounts={false}/>);

    const facets = DisplayableFacets[0];
    const coffeeLabel = screen.queryByLabelText(facets.options[0].displayName);
    const coffeeLabelAndCount = screen.queryByLabelText(
      getOptionLabelText(facets.options[0])
    );

    expect(coffeeLabel).toBeDefined();
    expect(coffeeLabelAndCount).toBeNull();
  });

  it('Clicking an unselected facet option label selects it', () => {
    const actions = spyOnActions();
    render(<StandardFacets />);

    const productFacet = DisplayableFacets[0];
    const coffeeFacetOption = productFacet.options[0];
    const labelText = getOptionLabelText(coffeeFacetOption);
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(labelText);
    expect(coffeeCheckbox.checked).toBeFalsy();

    const coffeeLabel = screen.getByText(labelText);
    userEvent.click(coffeeLabel);
    expectFacetOptionSet(actions, productFacet.fieldId, coffeeFacetOption, true);
  });

  it('Clicking a selected facet option checkbox unselects it', () => {
    const actions = spyOnActions();
    render(<StandardFacets />);

    const productFacet = DisplayableFacets[0];
    const teaCheckbox: HTMLInputElement = screen.getByLabelText(getOptionLabelText(productFacet.options[1]));
    expect(teaCheckbox.checked).toBeTruthy();

    userEvent.click(teaCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[1], false);
  });

  it('Clicking a facet option executes a search when searchOnChange is true', () => {
    const actions = spyOnActions();
    render(<StandardFacets />);

    const productFacet = DisplayableFacets[0];
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(
      getOptionLabelText(productFacet.options[0])
    );
    expect(coffeeCheckbox.checked).toBeFalsy();

    userEvent.click(coffeeCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[0], true);
    expect(actions.executeVerticalQuery).toBeCalled();
  });

  it('Clicking a facet option does not execute a search when searchOnChange is false', () => {
    const actions = spyOnActions();
    render(<StandardFacets searchOnChange={false} />);

    const productFacet = DisplayableFacets[0];
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(
      getOptionLabelText(productFacet.options[0])
    );
    expect(coffeeCheckbox.checked).toBeFalsy();

    userEvent.click(coffeeCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[0], true);
    expect(actions.executeVerticalQuery).not.toBeCalled();
  });
});

function expectFacetOptionSet(
  actions: SearchActions,
  fieldId: string,
  option: FacetOption,
  selected: boolean
) {
  expect(actions.setFacetOption).toHaveBeenCalledWith(
    fieldId,
    { matcher: option.matcher, value: option.value },
    selected
  );
}

function getOptionLabelText(option: DisplayableFacetOption) {
  return `${option.displayName} (${option.count})`;
}
