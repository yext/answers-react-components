import { State } from '@yext/search-headless-react';
import { render, screen } from '@testing-library/react';
import { ResultsCount } from '../../src/components/ResultsCount';
import { mockAnswersState } from '../__utils__/mocks';
import { RecursivePartial } from '../__utils__/mocks';

const mockedUniversalState: Partial<State> = {
  searchStatus: {
    isLoading: false
  },
  meta: {
    searchType: 'universal'
  },
  vertical: {}
};

const mockedStateUniversalMultiple: RecursivePartial<State> = {
  ...mockedUniversalState,
  universal: {
    verticals: [{
      resultsCount: 2,
    },
    {
      resultsCount: 3,
    }]
  }
};

const mockedStateUniversalSingle: RecursivePartial<State> = {
  ...mockedUniversalState,
  universal: {
    verticals: [{
      resultsCount: 1,
    }]
  }
};

const mockedStateUniversalNoResult: RecursivePartial<State> = {
  ...mockedUniversalState,
  universal: {
    verticals: [{
      resultsCount: 0,
    }]
  }
};

const mockedVerticalState: Partial<State> = {
  searchStatus: {
    isLoading: false
  },
  meta: {
    searchType: 'vertical'
  }
};

const mockedStateVerticalMultiple: Partial<State> = {
  ...mockedVerticalState,
  vertical: {
    resultsCount: 2
  }
};

const mockedStateVerticalSingle: Partial<State> = {
  ...mockedVerticalState,
  vertical: {
    resultsCount: 1
  }
};

const mockedStateVerticalNoResult: Partial<State> = {
  ...mockedVerticalState,
  vertical: {
    resultsCount: 0
  }
};

const mockedStateVerticalPaginationResult: Partial<State> = {
  ...mockedVerticalState,
  vertical: {
    resultsCount: 30
  }
};

jest.mock('@yext/search-headless-react');

describe('Results count for vertical search', () => {
  it('Displayed correctly for multiple results', () => {
    mockAnswersState(mockedStateVerticalMultiple);
    render(<ResultsCount />);
    const expectedResultsCountNumber = mockedStateVerticalMultiple.vertical.resultsCount;
    expect(screen.getByText(expectedResultsCountNumber + ' Results')).toBeDefined();
  });

  it('Displayed correctly for single result', () => {
    mockAnswersState(mockedStateVerticalSingle);
    render(<ResultsCount />);
    expect(screen.getByText('1 Result')).toBeDefined();
  });

  it('Renders nothing if there is no result', () => {
    mockAnswersState(mockedStateVerticalNoResult);
    const { container } = render(<ResultsCount />);
    expect(container.childNodes[0]).toBeEmptyDOMElement();
  });
});

describe('Results count for universal search', () => {
  it('Displayed correctly for multiple results', () => {
    mockAnswersState(mockedStateUniversalMultiple);
    render(<ResultsCount />);
    let expectedResultsCountNumber = 0;
    const results = mockedStateUniversalMultiple.universal.verticals;
    results.forEach(resultsOfAVertical => expectedResultsCountNumber += resultsOfAVertical.resultsCount);
    expect(screen.getByText(expectedResultsCountNumber + ' Results')).toBeDefined();
  });

  it('Displayed correctly for single result', () => {
    mockAnswersState(mockedStateUniversalSingle);
    render(<ResultsCount />);
    expect(screen.getByText('1 Result')).toBeDefined();
  });

  it('Renders nothing if there is no result', () => {
    mockAnswersState(mockedStateUniversalNoResult);
    const { container } = render(<ResultsCount />);
    expect(container.childNodes[0]).toBeEmptyDOMElement();
  });
});

describe('Results count and pagination range for vertical search', () => {
  it('Renders pagination range if pagination is required', () => {
    mockAnswersState(mockedStateVerticalPaginationResult);
    render(<ResultsCount />);
    expect(screen.getByText('1 - 20 of 30 Results')).toBeDefined();
  });

  it('Does not render pagination range if there is no pagination', () => {
    mockAnswersState(mockedStateVerticalMultiple);
    render(<ResultsCount />);
    expect(screen.getByText('2 Results').textContent).toBe('2 Results');
  });
});
