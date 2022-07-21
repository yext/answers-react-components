import { render, screen, act } from '@testing-library/react';
import { SearchHeadlessProvider, useSearchActions } from '@yext/search-headless-react';
import { useStateUpdatedOnSearch } from '../../src/hooks/useStateUpdatedOnSearch';

it('uses the correct initial value', () => {
  function TestComponent() {
    const verticalKey = useStateUpdatedOnSearch(state => state.vertical.verticalKey);
    return <div>{verticalKey}</div>;
  }
  renderWithProvider(<TestComponent/>);
  expect(screen.getByText('initialVerticalKey')).toBeDefined();
});

describe('updates correctly', () => {
  function renderTestComponent() {
    let actions;
    const TestComponent = () => {
      const query = useStateUpdatedOnSearch(state => state.query.input) ?? '__';
      actions = useSearchActions();

      return <div data-testid='query'>{query}</div>;
    };
    renderWithProvider(<TestComponent />);
    return { actions };
  }

  it('does not update state before the next search is run', () => {
    const { actions } = renderTestComponent();
    expect(screen.getByTestId('query')).toHaveTextContent('__');
    act(() => actions.setQuery('ignored query update'));
    expect(screen.getByTestId('query')).toHaveTextContent('__');
  });

  it('updates state only after searchStatus.isLoading changes from true to false', () => {
    const { actions } = renderTestComponent();
    act(() => {
      actions.setState({
        ...actions.state,
        searchStatus: { isLoading: true }
      });
      actions.setQuery('updated query');
    });
    expect(screen.getByTestId('query')).toHaveTextContent('__');
    act(() => {
      actions.setState({
        ...actions.state,
        searchStatus: { isLoading: false }
      });
    });
    expect(screen.getByTestId('query')).toHaveTextContent('updated query');
  });
});

let headlessIdCounter = 0;
function renderWithProvider(testJsx) {
  const config = {
    apiKey: '_unused',
    experienceKey: '_unused',
    locale: '_unused',
    verticalKey: 'initialVerticalKey',
    // A unique headlessId is necessary every time a new test is run
    // Otherwise, the same headless instance will be returned,
    // even with different usages of SearchHeadlessProvider.
    headlessId: headlessIdCounter.toString()
  };
  headlessIdCounter++;

  render(
    <SearchHeadlessProvider {...config}>
      {testJsx}
    </SearchHeadlessProvider>
  );
}