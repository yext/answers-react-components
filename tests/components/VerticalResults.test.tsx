import { render, screen } from '@testing-library/react';
import { VerticalResults, VerticalResultsProps } from '../../src/components/VerticalResults';
import { State, VerticalSearchState } from '@yext/search-headless-react';
import { StandardCard } from '../../src/components/cards/standard/StandardCard';
import { mockAnswersState, mockAnswersHooks } from '../__utils__/mocks';
import { mockedVerticalResults } from '../__fixtures__/data/vertical/results';

const mockedState: Partial<State> = {
  vertical: {
    verticalKey: 'vertical',
    results: mockedVerticalResults,
    resultsCount: mockedVerticalResults.length,
    offset: 0
  },
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

it('displays results', () => {
  const verticalResultsProps: VerticalResultsProps = {
    CardComponent: StandardCard
  };
  render(<VerticalResults {...verticalResultsProps} />);
  mockedState.vertical?.results?.forEach(result =>
    expect(screen.getByText(result.rawData.name as string)).toBeDefined()
  );
});

it('displays all results when there are no search results', () => {
  const verticalResultsProps: VerticalResultsProps = {
    CardComponent: StandardCard,
    displayAllOnNoResults: true
  };
  const mockedNoResults = {
    allResultsForVertical: {
      facets: [],
      results: mockedVerticalResults,
      resultsCount: mockedVerticalResults.length
    },
    alternativeVerticals: []
  };
  mockVerticalSearchState({
    noResults: mockedNoResults
  });
  render(<VerticalResults {...verticalResultsProps} />);
  mockedNoResults.allResultsForVertical.results.forEach(result =>
    expect(screen.getByText(result.rawData.name as string)).toBeDefined()
  );
});

it('doesn\'t display pagination component when allowPagination is false', () => {
  const verticalResultsProps: VerticalResultsProps = {
    CardComponent: StandardCard
  };
  render(<VerticalResults {...verticalResultsProps} />);
  const paginationNavEl = screen.queryByRole('navigation', { name: 'Pagination' });
  expect(paginationNavEl).toBeNull();
});

function mockVerticalSearchState(vertical: VerticalSearchState) {
  return mockAnswersState({
    ...mockedState,
    vertical
  });
}
