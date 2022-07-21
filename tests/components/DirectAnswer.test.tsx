import { render, screen } from '@testing-library/react';
import { DirectAnswerState } from '@yext/search-headless-react';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { DirectAnswer } from '../../src/components/DirectAnswer';
import { RecursivePartial, mockAnswersState } from '../__utils__/mocks';
import { fieldValueDAState, featuredSnippetDAState } from '../__fixtures__/data/directanswers';
import userEvent from '@testing-library/user-event';

jest.mock('@yext/search-headless-react');

jest.mock('../../src/hooks/useAnalytics', () => {
  const report = jest.fn();
  return {
    useAnalytics: () => ({ report })
  };
});

it('renders null when there is no direct answer in state', () => {
  mockState({ result: undefined });
  const { container } = render(<DirectAnswer />);
  expect(container).toBeEmptyDOMElement();
});

describe('FieldValue direct answer', () => {
  beforeEach(() => mockState(fieldValueDAState));

  it('title text', () => {
    render(<DirectAnswer />);
    const expectedTitle = '[entityName] / [fieldName]';
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it('description text', () => {
    render(<DirectAnswer />);
    const expectedDescription = '[value]';
    expect(screen.getByText(expectedDescription)).toBeInTheDocument();
  });

  it('link', () => {
    render(<DirectAnswer />);
    const directAnswerLink = screen.getByRole('link');
    expect(directAnswerLink).toHaveTextContent('View Details');
    expect(directAnswerLink).toHaveAttribute('href', '[relatedResult.link]');
  });

  runAnalyticsTestSuite();
});

describe('FeaturedSnippet direct answer', () => {
  beforeEach(() => mockState(featuredSnippetDAState));

  it('title text', () => {
    render(<DirectAnswer />);
    const expectedTitle = '[value]';
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it('description text is highlighted', () => {
    render(<DirectAnswer />);

    const unhighlightedAtStart = screen.getByText('[');
    expect(unhighlightedAtStart).toBeDefined();

    const highlighted = screen.getByText('snip');
    expect(highlighted).toBeDefined();

    const unhighlightedAtEnd = screen.getByText('pet.value]');
    expect(unhighlightedAtEnd).toBeDefined();
  });

  it('link', () => {
    render(<DirectAnswer />);
    const directAnswerLink = screen.getByRole('link');
    expect(directAnswerLink).toHaveTextContent('[relatedResult.name]');
    expect(directAnswerLink).toHaveAttribute('href', '[relatedResult.link]');
  });

  runAnalyticsTestSuite();
});

function runAnalyticsTestSuite() {
  it('reports link click analytics', () => {
    render(<DirectAnswer />);
    const link = screen.getByRole('link');
    userEvent.click(link);
    expect(useAnalytics().report).toHaveBeenCalledTimes(1);
    expect(useAnalytics().report).toHaveBeenCalledWith(expect.objectContaining({
      type: 'CTA_CLICK',
      queryId: '[queryId]',
      searcher: 'UNIVERSAL',
      directAnswer: true
    }));
  });

  it('reports THUMBS_UP feedback', () => {
    render(<DirectAnswer />);
    const thumbsUp = screen.queryAllByRole('button')[0];
    userEvent.click(thumbsUp);
    expect(useAnalytics().report).toHaveBeenCalledTimes(1);
    expect(useAnalytics().report).toHaveBeenCalledWith(expect.objectContaining({
      type: 'THUMBS_UP',
      queryId: '[queryId]',
      searcher: 'UNIVERSAL',
      directAnswer: true
    }));
  });

  it('reports THUMBS_DOWN feedback', () => {
    render(<DirectAnswer />);
    const thumbsDown = screen.queryAllByRole('button')[1];
    userEvent.click(thumbsDown);
    expect(useAnalytics().report).toHaveBeenCalledTimes(1);
    expect(useAnalytics().report).toHaveBeenCalledWith(expect.objectContaining({
      type: 'THUMBS_DOWN',
      queryId: '[queryId]',
      searcher: 'UNIVERSAL',
      directAnswer: true
    }));
  });
}

function mockState(
  directAnswer: RecursivePartial<DirectAnswerState>,
  isLoading?: boolean
) {
  return mockAnswersState({
    directAnswer,
    searchStatus: { isLoading },
    vertical: {},
    query: {
      queryId: '[queryId]'
    }
  });
}
