import { StateSelector, useSearchState } from '@yext/search-headless-react';
import { useRef } from 'react';

/**
 * Selects a portion Answers State, snapshotted to the last time a search was completed.
 */
export function useStateUpdatedOnSearch<T>(
  stateSelector: StateSelector<T>
): T | undefined {
  const isLoading = useSearchState(state => state.searchStatus.isLoading);
  const wasLoading = useRef<boolean | undefined>(isLoading);
  const currentState = useSearchState(stateSelector);
  const snapshottedState = useRef<T>(currentState);
  if (!isLoading && wasLoading.current) {
    snapshottedState.current = currentState;
  }
  wasLoading.current = isLoading;

  return snapshottedState.current;
}