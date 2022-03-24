/* eslint-disable @typescript-eslint/no-unused-vars */
import { Unsubscribe } from '@reduxjs/toolkit';
import { State, StateListener, StateManager } from '@yext/answers-headless';
import { VerticalSearcherState } from './headless-state';

/**
 * Generates a mocked StateManager implementation.
 *
 * @param state - The initial state to seed the StateManager with. If one is not provided,
 * a default will be used.
 */
export function generateMockedStateManager(state?: State): StateManager {
  return new class implements StateManager {
    getState(): State {
      return state ? state : VerticalSearcherState;
    }

    dispatchEvent(type: string, payload?: unknown): void {
      return null;
    }

    addListener<T>(listener: StateListener<T>): Unsubscribe {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
  }();
}

export const MockedStateManager: StateManager = generateMockedStateManager();