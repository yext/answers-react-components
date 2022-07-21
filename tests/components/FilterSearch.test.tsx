import { FilterSearch } from '../../src/components/FilterSearch';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as searchOperations from '../../src/utils/search-operations';
import { mockSearchActions, spyOnActions } from '../__utils__/mocks';
import { labeledFilterSearchResponse, unlabeledFilterSearchResponse, noResultsFilterSearchResponse } from '../../tests/__fixtures__/data/filtersearch';
import { Matcher } from '@yext/search-headless-react';

jest.mock('@yext/search-headless-react');
const actions = spyOnActions();

const setFilterOption = jest.fn();
const setOffset = jest.fn();
const resetFacets = jest.fn();
const searchFieldsProp = [{
  fieldApiName: 'name',
  entityType: 'ce_person'
}];

describe('search with section labels', () => {
  beforeEach(() => {
    mockSearchActions({
      setFilterOption,
      setOffset,
      resetFacets,
      executeFilterSearch: jest.fn().mockResolvedValue(labeledFilterSearchResponse)
    });
  });

  it('renders the filter search bar, "Filter" label, and default placeholder text', () => {
    render(<FilterSearch searchFields={searchFieldsProp} label='Filter' />);
    const label = 'Filter';
    const labelElement = screen.getByText(label);
    const searchBarElement = screen.getAllByRole<HTMLInputElement>('textbox');

    expect(labelElement).toBeDefined();
    expect(searchBarElement.length).toBe(1);
    expect(searchBarElement[0].placeholder).toBe('Search here...');
  });

  it('sets the placeholder text to the specified value', () => {
    render(<FilterSearch searchFields={searchFieldsProp} placeholder='Search...' />);
    const searchBarElement = screen.getByRole<HTMLInputElement>('textbox');
    expect(searchBarElement.placeholder).toBe('Search...');
  });

  it('displays characters typed in search bar correctly', async () => {
    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'na');
    await waitFor(() => {
      expect(searchBarElement).toHaveValue('na');
    });

    userEvent.type(searchBarElement, '{backspace}');
    await waitFor(() => {
      expect(searchBarElement).toHaveValue('n');
    });
  });

  it('triggers a filter search every time a character is typed or backspaced', async () => {
    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');
    const expectedFilterSearchFields = [{
      entityType: 'ce_person',
      fetchEntities: false,
      fieldApiName: 'name'
    }];

    userEvent.type(searchBarElement, 'na');
    await waitFor(() => {
      expect(actions.executeFilterSearch).toHaveBeenLastCalledWith('na', false, expectedFilterSearchFields);
    });

    userEvent.type(searchBarElement, '{backspace}');
    await waitFor(() => {
      expect(actions.executeFilterSearch).toHaveBeenLastCalledWith('n', false, expectedFilterSearchFields);
    });
    expect(actions.executeFilterSearch).toHaveBeenCalledTimes(3);
  });

  it('does not trigger a filter search when backspacing in an empty text box', async () => {
    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, '{backspace}');
    await waitFor(() => {
      expect(searchBarElement).toHaveValue('');
    });
    expect(actions.executeFilterSearch).toHaveBeenCalledTimes(0);
  });

  it('shows autocomplete results, if they exist, when a character is typed', async () => {
    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'n');
    await waitFor(() => {
      const autocompleteSection = screen.getByText('First name');
      expect(autocompleteSection).toBeDefined();
    });
  });

  it('fills the search bar with an autocomplete result when a user selects it', async () => {
    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'n');
    await waitFor(() => screen.findByText('first name 1'));

    userEvent.type(searchBarElement, '{arrowdown}');
    expect(searchBarElement).toHaveValue('first name 1');
    userEvent.type(searchBarElement, '{arrowdown}');
    expect(searchBarElement).toHaveValue('first name 2');
  });

  it('remove old filter value when a new one is entered', async () => {
    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'n');
    await waitFor(() => screen.findByText('first name 1'));
    userEvent.type(searchBarElement, '{arrowdown}{enter}');
    await waitFor(() => {
      expect(setFilterOption).toBeCalledWith({
        fieldId: 'name',
        matcher: Matcher.Equals,
        value: 'first name 1',
        displayName: 'first name 1',
        selected: true
      });
    });

    userEvent.clear(searchBarElement);
    userEvent.type(searchBarElement, 'n');
    await waitFor(() => screen.findByText('first name 2'));
    userEvent.type(searchBarElement, '{arrowdown}{arrowdown}{enter}');
    await waitFor(() => {
      expect(setFilterOption).toBeCalledWith({
        fieldId: 'name',
        matcher: Matcher.Equals,
        value: 'first name 1',
        selected: false
      });
    });
    expect(setFilterOption).toBeCalledWith({
      fieldId: 'name',
      matcher: Matcher.Equals,
      value: 'first name 2',
      displayName: 'first name 2',
      selected: true
    });
  });

  describe('searchOnSelect = true', () => {
    it('triggers a search on pressing "enter" when an autocomplete result is selected', async () => {
      const mockExecuteSearch = jest.spyOn(searchOperations, 'executeSearch').mockImplementation();
      render(<FilterSearch searchFields={searchFieldsProp} searchOnSelect={true} />);
      const searchBarElement = screen.getByRole('textbox');

      userEvent.type(searchBarElement, 'n');
      await waitFor(() => screen.findByText('first name 1'));

      const expectedSetFilterOptionParam = {
        fieldId: 'name',
        matcher: Matcher.Equals,
        value: 'first name 1',
        displayName: 'first name 1',
        selected: true
      };
      const expectedSetOffsetParam = 0;

      userEvent.type(searchBarElement, '{arrowdown}{enter}');
      await waitFor(() => {
        expect(setFilterOption).toBeCalledWith(expectedSetFilterOptionParam);
      });
      expect(setOffset).toBeCalledWith(expectedSetOffsetParam);
      expect(resetFacets).toBeCalled();

      const setFilterOptionCallOrder = setFilterOption.mock.invocationCallOrder[0];
      const setOffsetCallOrder = setOffset.mock.invocationCallOrder[0];
      const resetFacetsCallOrder = resetFacets.mock.invocationCallOrder[0];
      const mockExecuteSearchCallOrder = mockExecuteSearch.mock.invocationCallOrder[0];
      expect(setFilterOptionCallOrder).toBeLessThan(mockExecuteSearchCallOrder);
      expect(setOffsetCallOrder).toBeLessThan(mockExecuteSearchCallOrder);
      expect(resetFacetsCallOrder).toBeLessThan(mockExecuteSearchCallOrder);
    });

    it('does not trigger a search on pressing "enter" if no autocomplete result is selected', async () => {
      const mockExecuteSearch = jest.spyOn(searchOperations, 'executeSearch').mockImplementation();
      render(<FilterSearch searchFields={searchFieldsProp} searchOnSelect={true} />);
      const searchBarElement = screen.getByRole('textbox');

      userEvent.type(searchBarElement, 'n{enter}');

      await waitFor(() => {
        expect(setFilterOption).not.toBeCalled();
      });
      expect(setOffset).not.toBeCalled();
      expect(resetFacets).not.toBeCalled();
      expect(mockExecuteSearch).not.toBeCalled();
    });

    it('triggers a search when an autocomplete result is clicked', async () => {
      const mockExecuteSearch = jest.spyOn(searchOperations, 'executeSearch').mockImplementation();
      render(<FilterSearch searchFields={searchFieldsProp} searchOnSelect={true} />);
      const searchBarElement = screen.getByRole('textbox');

      userEvent.type(searchBarElement, 'n');
      const autocompleteSuggestion = await waitFor(() => screen.findByText('first name 1'));

      const expectedSetFilterOptionParam = {
        fieldId: 'name',
        matcher: Matcher.Equals,
        value: 'first name 1',
        displayName: 'first name 1',
        selected: true
      };
      const expectedSetOffsetParam = 0;

      userEvent.click(autocompleteSuggestion);
      expect(setFilterOption).toBeCalledWith(expectedSetFilterOptionParam);
      expect(setOffset).toBeCalledWith(expectedSetOffsetParam);
      expect(resetFacets).toBeCalled();

      const setFilterOptionCallOrder = setFilterOption.mock.invocationCallOrder[0];
      const setOffsetCallOrder = setOffset.mock.invocationCallOrder[0];
      const resetFacetsCallOrder = setOffset.mock.invocationCallOrder[0];
      const mockExecuteSearchCallOrder = mockExecuteSearch.mock.invocationCallOrder[0];
      expect(setFilterOptionCallOrder).toBeLessThan(mockExecuteSearchCallOrder);
      expect(setOffsetCallOrder).toBeLessThan(mockExecuteSearchCallOrder);
      expect(resetFacetsCallOrder).toBeLessThan(mockExecuteSearchCallOrder);
    });
  });

  describe('searchOnSelect = false', () => {
    it('does not trigger a search when an autocomplete result is selected', async () => {
      const mockExecuteSearch = jest.spyOn(searchOperations, 'executeSearch').mockImplementation();
      render(<FilterSearch searchFields={searchFieldsProp} searchOnSelect={false} />);
      const searchBarElement = screen.getByRole('textbox');

      userEvent.type(searchBarElement, 'n');
      await waitFor(() => screen.findByText('first name 1'));

      userEvent.type(searchBarElement, '{arrowdown}{enter}');
      await waitFor(() => {
        expect(setFilterOption).toBeCalledWith({
          fieldId: 'name',
          matcher: Matcher.Equals,
          value: 'first name 1',
          displayName: 'first name 1',
          selected: true
        });
      });
      expect(setOffset).not.toHaveBeenCalled();
      expect(resetFacets).not.toHaveBeenCalled();
      expect(mockExecuteSearch).not.toHaveBeenCalled();
    });
  });
});

describe('search without section labels', () => {
  it('shows autocomplete results, if they exist, when a character is typed', async () => {
    mockSearchActions({
      executeFilterSearch: jest.fn().mockResolvedValue(unlabeledFilterSearchResponse)
    });
    jest.spyOn(searchOperations, 'executeSearch').mockImplementation();

    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'n');
    await waitFor(() => {
      const autocompleteSuggestion = screen.getByText('first name 1');
      expect(autocompleteSuggestion).toBeDefined();
    });
  });
});

describe('screen reader', () => {
  it('renders ScreenReader messages with section labels', async () => {
    mockSearchActions({
      executeFilterSearch: jest.fn().mockResolvedValue(labeledFilterSearchResponse)
    });

    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'n');
    const expectedScreenReaderMessage = '2 First name autocomplete options found. 1 Last name autocomplete option found.';
    await waitFor(() => {
      const screenReaderMessage = screen.getByText(expectedScreenReaderMessage);
      expect(screenReaderMessage).toBeDefined();
    });
  });

  it('renders ScreenReader messages without section labels', async () => {
    mockSearchActions({
      executeFilterSearch: jest.fn().mockResolvedValue(unlabeledFilterSearchResponse)
    });

    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'n');
    const expectedScreenReaderMessage = '3 autocomplete options found.';
    await waitFor(() => {
      const screenReaderMessage = screen.getByText(expectedScreenReaderMessage);
      expect(screenReaderMessage).toBeDefined();
    });
  });

  it('renders 0 results ScreenReader message when there are no results', async () => {
    mockSearchActions({
      executeFilterSearch: jest.fn().mockResolvedValue(noResultsFilterSearchResponse)
    });

    render(<FilterSearch searchFields={searchFieldsProp} />);
    const searchBarElement = screen.getByRole('textbox');

    userEvent.type(searchBarElement, 'n');
    const expectedScreenReaderMessage = '0 autocomplete options found.';
    await waitFor(() => {
      const screenReaderMessage = screen.getByText(expectedScreenReaderMessage);
      expect(screenReaderMessage).toBeDefined();
    });
  });
});
