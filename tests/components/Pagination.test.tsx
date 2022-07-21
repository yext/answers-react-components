import { render, screen, within } from '@testing-library/react';
import { State, VerticalSearchState } from '@yext/search-headless-react';
import { spyOnActions, mockAnswersState, mockAnswersHooks } from '../__utils__/mocks';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../../src/components/Pagination';
import { verticalNoResults } from '../__fixtures__/data/vertical/noresults';

const mockedState: Partial<State> = {
  searchStatus: {
    isLoading: false
  },
  meta: {
    searchType: 'vertical'
  },
  query: {}
};

const mockedActions = {
  state: mockedState,
  setOffset: jest.fn(),
  executeVerticalQuery: jest.fn()
};

jest.mock('@yext/search-headless-react');

beforeEach(() => {
  mockAnswersHooks({ mockedState, mockedActions });
});

describe('no results are returned from search', () => {
  it('doesn\'t display pagination when there are no results to display', () => {
    mockVerticalSearchState({
      resultsCount: 0
    });
    render(<Pagination />);
    const paginationNavEl = screen.queryByRole('navigation', { name: 'Pagination' });
    expect(paginationNavEl).toBeNull();
  });

  it('doesn\'t display pagination if allResults exceeds limit and paginateAllOnNoResults is false', () => {
    mockVerticalSearchState({
      resultsCount: 0,
      noResults: verticalNoResults.noResults,
      limit: 1
    });
    render(<Pagination paginateAllOnNoResults={false} />);
    const paginationNavEl = screen.queryByRole('navigation', { name: 'Pagination' });
    expect(paginationNavEl).toBeNull();
  });

  it('doesn\'t display pagination if allResults is less than limit and paginateAllOnNoResults is true', () => {
    mockVerticalSearchState({
      resultsCount: 0,
      noResults: verticalNoResults.noResults,
      limit: 3
    });
    render(<Pagination paginateAllOnNoResults={true} />);
    const paginationNavEl = screen.queryByRole('navigation', { name: 'Pagination' });
    expect(paginationNavEl).toBeNull();
  });

  it('displays pagination if allResults exceeds limit and paginateAllOnNoResults is true', () => {
    mockVerticalSearchState({
      resultsCount: 0,
      noResults: verticalNoResults.noResults,
      limit: 1
    });
    render(<Pagination paginateAllOnNoResults={true} />);
    const paginationNavEl = screen.queryByRole('navigation', { name: 'Pagination' });
    expect(paginationNavEl).toBeDefined();
  });
});

describe('results are returned from search', () => {
  it('does not display pagination when resultsCount is less than limit', () => {
    const mockedVerticalSearchState: VerticalSearchState = {
      resultsCount: 1,
      verticalKey: 'vertical',
      limit: 3,
      offset: 0
    };
    mockVerticalSearchState(mockedVerticalSearchState);
    render(<Pagination />);
    const pagination = screen.queryByRole('navigation', { name: 'Pagination' });
    expect(pagination).toBeNull();
  });

  it('displays pagination when resultsCount is greater than limit', () => {
    const mockedVerticalSearchState: VerticalSearchState = {
      resultsCount: 3,
      verticalKey: 'vertical',
      limit: 1,
      offset: 0
    };
    mockVerticalSearchState(mockedVerticalSearchState);
    render(<Pagination />);
    const pagination = screen.getByRole('navigation', { name: 'Pagination' });
    expect(pagination).toBeDefined();
  });

  it('is displayed without ellipses label', () => {
    const mockedVerticalSearchState: VerticalSearchState = {
      resultsCount: 3,
      verticalKey: 'vertical',
      limit: 1,
      offset: 0
    };
    mockVerticalSearchState(mockedVerticalSearchState);
    render(<Pagination />);
    const paginationNavEl = screen.getByRole('navigation', { name: 'Pagination' });
    const totalPaginationButtons = within(paginationNavEl).queryAllByRole('button').length;
    const numIconNavButtons = 2;
    const numLabelNavButtons = mockedVerticalSearchState.resultsCount;
    expect(totalPaginationButtons - numIconNavButtons).toEqual(numLabelNavButtons);
  });

  it('is displayed with ellipses label', () => {
    const customCssClasses = {
      leftIconContainer: 'leftNavButton',
      rightIconContainer: 'rightNavButton'
    };
    const mockedVerticalSearchState: VerticalSearchState = {
      resultsCount: 5,
      verticalKey: 'vertical',
      limit: 1,
      offset: 0
    };
    mockVerticalSearchState(mockedVerticalSearchState);
    render(<Pagination customCssClasses={ customCssClasses }/>);
    const paginationNavEl = screen.getByRole('navigation', { name: 'Pagination' });
    const paginationButtons = within(paginationNavEl).queryAllByRole('button');
    const numIconNavButtons = 2;
    const numLabelNavButtons = 3;
    // expected pagination layout with n results: [<] [1] [2] [...] [n] [>]
    expect(paginationButtons.length).toEqual(numIconNavButtons + numLabelNavButtons);
    expect(paginationButtons[0].classList.contains('leftNavButton')).toBeTruthy();
    expect(paginationButtons[1].textContent).toEqual('1');
    expect(paginationButtons[2].textContent).toEqual('2');
    expect(paginationButtons[3].textContent).toEqual(`${mockedVerticalSearchState.resultsCount}`);
    expect(paginationButtons[4].classList.contains('rightNavButton')).toBeTruthy();
    expect(screen.getByText('...')).toBeDefined();
  });

  it('checks that navigation buttons trigger a new search', () => {
    const mockedResultsCount = 5;
    const mockedVerticalSearchState: VerticalSearchState = {
      resultsCount: mockedResultsCount,
      verticalKey: 'vertical',
      limit: 1,
      offset: 0
    };
    mockVerticalSearchState(mockedVerticalSearchState);
    const actions = spyOnActions();
    render(<Pagination />);

    // navigate to the last results page
    userEvent.click(screen.getByText(`${mockedResultsCount}`));
    expect(actions.setOffset).toHaveBeenCalledWith(mockedResultsCount - 1);
    expect(actions.executeVerticalQuery).toHaveBeenCalledTimes(1);
  });
});

function mockVerticalSearchState(vertical: VerticalSearchState) {
  return mockAnswersState({
    ...mockedState,
    vertical
  });
}
