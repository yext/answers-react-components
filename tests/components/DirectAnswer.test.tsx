import { render, screen, fireEvent } from '@testing-library/react';
import { DirectAnswerState } from '@yext/answers-headless-react';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { DirectAnswer } from '../../src/components/DirectAnswer';
import { RecursivePartial, mockAnswersState } from '../__utils__/mocks';
import { fieldValueDAState, featuredSnippetDAState } from './DirectAnswer.fixtures';

jest.mock('@yext/answers-headless-react');

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

it('applies the loading state css class', () => {
  mockState(fieldValueDAState, true);
  const { container } = render(<DirectAnswer customCssClasses={{ container___loading: '_loading' }}/>);
  // eslint-disable-next-line testing-library/no-node-access
  expect(container.firstChild).toHaveClass('_loading');
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

  it('description text is highlighted and uses the "highlighted" css class', () => {
    render(<DirectAnswer customCssClasses={{ highlighted: '_highlighted' }}/>);
    // eslint-disable-next-line testing-library/no-node-access
    const highlightedNodes = document.body.querySelectorAll('._highlighted');
    expect(highlightedNodes).toHaveLength(1);
    expect(highlightedNodes[0]).toHaveTextContent('snip');
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
    fireEvent.click(link);
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
    fireEvent.click(thumbsUp);
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
    fireEvent.click(thumbsDown);
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
