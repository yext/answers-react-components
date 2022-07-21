import { useCallback, useEffect, useState } from 'react';
import RecentSearches, { ISearch } from 'recent-searches';

export function useRecentSearches(
  recentSearchesLimit: number,
  verticalKey: string | undefined
): [ISearch[] | undefined, (input: string) => void, () => void] {
  const recentSearchesKey = getRecentSearchesKey(verticalKey);
  const [recentSearches, setRecentSeaches] = useState<RecentSearches>(
    new RecentSearches({
      limit: recentSearchesLimit,
      namespace: recentSearchesKey
    })
  );

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem(recentSearchesKey);
    setRecentSeaches(new RecentSearches({
      limit: recentSearchesLimit,
      namespace: recentSearchesKey
    }));
    localStorage.removeItem(recentSearchesKey);
  }, [recentSearchesKey, recentSearchesLimit]);

  const setRecentSearch = useCallback((input: string) => {
    recentSearches.setRecentSearch(input);
  }, [recentSearches]);

  useEffect(() => {
    setRecentSeaches(new RecentSearches({
      limit: recentSearchesLimit,
      namespace: recentSearchesKey
    }));
  }, [recentSearchesKey, recentSearchesLimit]);

  return [recentSearches?.getRecentSearches(), setRecentSearch, clearRecentSearches];
}

function getRecentSearchesKey(verticalKey: string | undefined): string {
  if (verticalKey) {
    return `__yxt_recent_searches_${verticalKey}__`;
  } else {
    return '__yxt_recent_searches_universal__';
  }
}