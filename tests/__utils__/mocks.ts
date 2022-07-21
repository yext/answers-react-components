import {
  State,
  StateSelector,
  useSearchState,
  useSearchActions,
  SearchUtilities,
  useSearchUtilities,
  SearchActions
} from '@yext/search-headless-react';

export function spyOnActions(): jest.Mocked<SearchActions> {
  const spy = jest.spyOn(require('@yext/search-headless-react'), 'useSearchActions');
  const proxyHandler = {
    get: (_, prop) => spy.mock.results[0].value[prop]
  };
  return new Proxy(spy, proxyHandler);
}

export type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    // eslint-disable-next-line @typescript-eslint/ban-types
    T[P] extends object ? RecursivePartial<T[P]> :
      T[P];
};

export function mockAnswersState(
  customState: RecursivePartial<State>
): jest.SpyInstance<typeof useSearchState, unknown[]> {
  function mockImpl<T>(stateAccessor: StateSelector<T>) {
    return stateAccessor({
      ...customState
    } as State);
  }
  return jest
    .spyOn(require('@yext/search-headless-react'), 'useSearchState')
    .mockImplementation(mockImpl as (...args: unknown[]) => unknown);
}

export function mockSearchActions(
  customActions: RecursivePartial<SearchActions>
): jest.SpyInstance<typeof useSearchActions, unknown[]> {
  return jest
    .spyOn(require('@yext/search-headless-react'), 'useSearchActions')
    .mockImplementation(() => customActions as SearchActions);
}

export function mockAnswersUtils(
  customUtils: RecursivePartial<SearchUtilities>
): jest.SpyInstance<typeof useSearchUtilities, unknown[]> {
  return jest
    .spyOn(require('@yext/search-headless-react'), 'useSearchUtilities')
    .mockImplementation(() => customUtils as SearchUtilities);
}

export function mockAnswersHooks({
  mockedState, mockedActions, mockedUtils
}: {
  mockedState?: RecursivePartial<State>,
  mockedActions?: RecursivePartial<SearchActions>,
  mockedUtils?: RecursivePartial<SearchUtilities>
}) {
  mockedUtils && mockAnswersUtils(mockedUtils);
  mockedState && mockAnswersState(mockedState);
  mockedActions && mockSearchActions(mockedActions);
}