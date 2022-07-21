import { render, screen } from '@testing-library/react';
import { State } from '@yext/search-headless-react';

import { AlternativeVerticals } from '../../src/components/AlternativeVerticals';
import { mockAnswersHooks } from '../__utils__/mocks';
import { verticalNoResults } from '../__fixtures__/data/vertical/noresults';

const mockedState: Partial<State> = {
  query: {
    mostRecentSearch: 'sometext'
  },
  vertical: {
    ...verticalNoResults,
    verticalKey: 'jobs',
  },
  searchStatus: {
    isLoading: false
  },
  meta: {
    searchType: 'vertical'
  }
};

jest.mock('@yext/search-headless-react');

describe('AlternativeVerticals', () => {
  const verticalConfigMap = {
    faqs: { label: 'FAQs' },
    events: { label: 'Events' },
    locations: { label: 'Locations' }
  };

  const alternativeVerticalsProps = {
    currentVerticalLabel: 'Jobs',
    verticalConfigMap
  };

  beforeEach(() => {
    mockAnswersHooks({ mockedState });
  });

  it('displays vertical suggestions corresponding to what is specified in verticalConfigMap', () => {
    render(<AlternativeVerticals {...alternativeVerticalsProps}/>);
    expect(screen.getByText('FAQs - 1 result')).toBeDefined();
    expect(screen.getByText('Events - 2 results')).toBeDefined();
  });

  it('renders an empty dom when there are no vertical suggestions', () => {
    mockAnswersHooks({
      mockedState: {
        ...mockedState,
        vertical: { verticalKey: 'jobs' }
      }
    });
    const { container } = render(<AlternativeVerticals {...alternativeVerticalsProps} />);
    expect(container).toBeEmptyDOMElement();
  });
});