import { useRecentSearches } from '../../src/hooks/useRecentSearches';
import { renderHook } from '@testing-library/react-hooks';
import { act } from '@testing-library/react';

beforeEach(() => {
  localStorage.clear();
});

it('returns recent searches', () => {
  const verticalKey = 'people';
  const { result, rerender } = renderHook(() =>
    useRecentSearches(10, verticalKey)
  );
  const setRecentSearch = result.current[1];
  setRecentSearch('bob');
  setRecentSearch('carrie');
  setRecentSearch('williard');

  rerender();
  const [recentSearches] = result.current;
  expect(recentSearches?.[0].query).toBe('williard');
  expect(recentSearches?.[1].query).toBe('carrie');
  expect(recentSearches?.[2].query).toBe('bob');
});

it('preserves recent searches when returning to a vertical', () => {
  let verticalKey = 'people';
  const { result, rerender } = renderHook(() =>
    useRecentSearches(10, verticalKey)
  );
  const setRecentPeopleSearch = result.current[1];
  setRecentPeopleSearch('bob');
  setRecentPeopleSearch('carrie');
  rerender();
  let recentSearches = result.current[0];
  expect(recentSearches?.length).toBe(2);

  verticalKey = 'places';
  rerender();
  recentSearches = result.current[0];
  const setRecentPlacesSearch = result.current[1];
  expect(recentSearches?.length).toBe(0);

  setRecentPlacesSearch('yext');
  rerender();
  recentSearches = result.current[0];
  expect(recentSearches?.length).toBe(1);

  verticalKey = 'people';
  rerender();
  recentSearches = result.current[0];
  expect(recentSearches?.length).toBe(2);
});

it('clears searches properly', () => {
  let verticalKey = 'people';
  const { result, rerender } = renderHook(() =>
    useRecentSearches(10, verticalKey)
  );
  const [, setRecentPeopleSearch, clearPeopleSearches] = result.current;
  setRecentPeopleSearch('bob');
  setRecentPeopleSearch('carrie');

  act(() => clearPeopleSearches());
  verticalKey = 'people';
  rerender();
  const recentSearches = result.current[0];
  expect(recentSearches?.length).toBe(0);
});