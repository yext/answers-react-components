import { render, screen } from '@testing-library/react';
import { AnswersHeadless, FacetOption, Source, State } from '@yext/answers-headless-react';
import { Filters } from '../../../src/components';
import { mockAnswersHooks, spyOnActions } from '../../__utils__/mocks';
import userEvent from '@testing-library/user-event';
import { DisplayableFacets } from '../../__fixtures__/data/filters';

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

function Facets({ searchOnChange = true }: { searchOnChange?: boolean }): JSX.Element {
  return (
    <Filters.Facets searchOnChange={searchOnChange}>
      {facets => {
        const filteredFacets = facets.filter(f => f.options.length > 0);
        return (
          <>
            {filteredFacets.map(f => {
              return (
                <Filters.FilterGroup key={f.fieldId} fieldId={f.fieldId}>
                  {f.options.map(o =>
                    <Filters.CheckboxOption
                      key={o.displayName}
                      value={o.value}
                      matcher={o.matcher}
                      selectedByDefault={o.selected}
                      label={o.displayName}
                    />
                  )}
                  {filteredFacets.length > 0 && !searchOnChange && <Filters.ApplyFiltersButton />}
                </Filters.FilterGroup>
              );
            })}
          </>
        );
      }}
    </Filters.Facets>
  );
}

const mockedActions = {
  state: mockedState,
  setOffset: jest.fn(),
  setFacetOption: jest.fn(),
  executeVerticalQuery: jest.fn()
};

const mockedUtils = {
  isCloseMatch: () => true
};

jest.mock('@yext/answers-headless-react');

describe('Facets', () => {
  beforeEach(() => {
    mockAnswersHooks({ mockedState, mockedActions, mockedUtils });
  });

  it('Properly renders regular and number range facets', () => {
    render(<Facets />);

    DisplayableFacets.forEach(f => {
      f.options.forEach(o => {
        expect(screen.getByText(o.displayName)).toBeDefined();
      });
    });
  });

  it('Clicking an unselected facet option checkbox selects it', () => {
    const actions = spyOnActions();
    render(<Facets />);

    const productFacet = DisplayableFacets[0];
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(productFacet.options[0].displayName);
    expect(coffeeCheckbox.checked).toBeFalsy();

    userEvent.click(coffeeCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[0], true);
  });

  it('Clicking an unselected facet option label selects it', () => {
    const actions = spyOnActions();
    render(<Facets />);

    const productFacet = DisplayableFacets[0];
    const coffeeFacetOption = productFacet.options[0];
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(coffeeFacetOption.displayName);
    expect(coffeeCheckbox.checked).toBeFalsy();

    const coffeeLabel = screen.getByText(coffeeFacetOption.displayName);
    userEvent.click(coffeeLabel);
    expectFacetOptionSet(actions, productFacet.fieldId, coffeeFacetOption, true);
  });

  it('Clicking an unselected number range facet option checkbox selects it', () => {
    const actions = spyOnActions();
    render(<Facets />);

    const priceFacet = DisplayableFacets[1];
    const cheapCheckbox: HTMLInputElement = screen.getByLabelText(priceFacet.options[1].displayName);
    expect(cheapCheckbox.checked).toBeFalsy();

    userEvent.click(cheapCheckbox);
    expectFacetOptionSet(actions, priceFacet.fieldId, priceFacet.options[1], true);
  });

  it('Clicking a selected facet option checkbox unselects it', () => {
    const actions = spyOnActions();
    render(<Facets />);

    const productFacet = DisplayableFacets[0];
    const teaCheckbox: HTMLInputElement = screen.getByLabelText(productFacet.options[1].displayName);
    expect(teaCheckbox.checked).toBeTruthy();

    userEvent.click(teaCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[1], false);
  });

  it('Clicking a selected number range facet option checkbox unselects it', () => {
    const actions = spyOnActions();
    render(<Facets />);

    const priceFacet = DisplayableFacets[1];
    const expensiveCheckbox: HTMLInputElement = screen.getByLabelText(priceFacet.options[0].displayName);
    expect(expensiveCheckbox.checked).toBeTruthy();

    userEvent.click(expensiveCheckbox);
    expectFacetOptionSet(actions, priceFacet.fieldId, priceFacet.options[0], false);
  });

  it('Clicking a facet option executes a search when searchOnChange is true', () => {
    const actions = spyOnActions();
    render(<Facets />);

    const productFacet = DisplayableFacets[0];
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(productFacet.options[0].displayName);
    expect(coffeeCheckbox.checked).toBeFalsy();

    userEvent.click(coffeeCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[0], true);
    expect(actions.executeVerticalQuery).toBeCalled();
  });

  it('Only clicking the apply button executes a search when searchOnChange is false', () => {
    const actions = spyOnActions();
    render(<Facets searchOnChange={false} />);

    const productFacet = DisplayableFacets[0];
    const coffeeCheckbox: HTMLInputElement = screen.getByLabelText(productFacet.options[0].displayName);
    expect(coffeeCheckbox.checked).toBeFalsy();

    userEvent.click(coffeeCheckbox);
    expectFacetOptionSet(actions, productFacet.fieldId, productFacet.options[0], true);
    expect(actions.executeVerticalQuery).toBeCalledTimes(0);

    const applyButton = screen.getAllByRole('button', { name: 'Apply Filters' })[0];
    userEvent.click(applyButton);
    expect(actions.executeVerticalQuery).toBeCalledTimes(1);
  });
});

function expectFacetOptionSet(
  actions: AnswersHeadless,
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
