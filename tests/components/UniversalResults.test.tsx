import { render, screen } from '@testing-library/react';

import { UniversalResults } from '../../src/components/UniversalResults';

import { State } from '@yext/search-headless-react';
import { CtaData } from '../../src/models/StandardCardData';
import { mockAnswersState } from '../__utils__/mocks';
import { verticalResults } from '../__fixtures__/data/universalresults';

const mockedState: Partial<State> = {
  universal: {
    verticals: verticalResults
  },
  query: {
    mostRecentSearch: 'test'
  },
  vertical: {},
  searchStatus: {
    isLoading: false
  },
  meta: {
    searchType: 'universal'
  }
};

jest.mock('@yext/search-headless-react');

describe('UniversalResults', () => {
  beforeEach(() => {
    mockAnswersState(mockedState);
  });

  it('Results are displayed', () => {
    render(<UniversalResults verticalConfigMap={{}} />);
    const verticals = mockedState.universal.verticals;
    expect(screen.getByText(verticals[0].verticalKey)).toBeDefined();
    expect(screen.getByText(verticals[1].verticalKey)).toBeDefined();
    expect(screen.queryByText(verticals[2].verticalKey)).toBeNull();

    expect(screen.queryByText(verticals[0].appliedQueryFilters[0].displayValue)).toBeNull();

    function checkResultData(resultData: Record<string, unknown>) {
      expect(screen.getByText(resultData.name.toString())).toBeDefined();
      expect(screen.getByText(resultData.description.toString())).toBeDefined();
    }

    function checkCTAs(resultData: Record<string, unknown>) {
      const cta1 = resultData.c_primaryCTA as CtaData;
      const cta2 = resultData.c_secondaryCTA as CtaData;
      expect(screen.getByText(cta1.label)).toBeDefined();
      expect(screen.getByText(cta2.label)).toBeDefined();
    }

    checkResultData(verticals[0].results[0].rawData);
    checkCTAs(verticals[0].results[0].rawData);
    checkResultData(verticals[0].results[1].rawData);
    checkResultData(verticals[1].results[0].rawData);
  });

  it('Vertical label is used when specified', () => {
    render(<UniversalResults verticalConfigMap={{ vertical1: { label: 'Jobs' } }} />);
    expect(screen.getByText('Jobs')).toBeDefined();
    expect(screen.queryByText(mockedState.universal.verticals[0].verticalKey)).toBeNull();
  });

  it('View all button is displayed only when specified', () => {
    render(
      <UniversalResults verticalConfigMap={{ vertical1: { viewAllButton: true } }} />);
    expect(screen.getAllByText('View all')).toHaveLength(1);
  });

  it('View all button uses getViewAllUrl when specified to set the link', () => {
    render(<UniversalResults verticalConfigMap={{
      vertical1: { viewAllButton: true },
      vertical2: {
        viewAllButton: true,
        getViewAllUrl: (data) => {
          return `/${data.verticalKey}?input=${data.query}`;
        }
      }
    }} />);
    const links = screen.getAllByRole('link');
    expect(links[0].getAttribute('href')).toBe('/vertical1?query=test');
    expect(links[1].getAttribute('href')).toBe('/vertical2?input=test');
  });

  it('Applied filters are displayed when specified', () => {
    render(<UniversalResults verticalConfigMap={{}} showAppliedFilters={true} />);
    const filters = mockedState.universal.verticals[0].appliedQueryFilters;
    expect(screen.getByText(filters[0].displayValue)).toBeDefined();
  });
});
