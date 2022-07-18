import { useCallback, useEffect, useRef, useState } from 'react';
import RecentSearches, { ISearch } from 'recent-searches';

export function useRecentSearches(
  recentSearchesLimit: number,
  verticalKey: string | null
): [ISearch[] | undefined, (input: string) => void, () => void] {
  const recentSearchesLimitRef = useRef(recentSearchesLimit);
  const [recentSearchesKey, setRecentSearchesKey] = useState(getRecentSearchesKey(verticalKey));
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
    if (recentSearchesLimit !== recentSearchesLimitRef.current) {
      setRecentSeaches(new RecentSearches({
        limit: recentSearchesLimit,
        namespace: recentSearchesKey
      }));
      recentSearchesLimitRef.current = recentSearchesLimit;
    }
    const newRecentSearchesKey = getRecentSearchesKey(verticalKey);
    if (recentSearchesKey !== newRecentSearchesKey) {
      setRecentSearchesKey(newRecentSearchesKey);
      setRecentSeaches(new RecentSearches({
        limit: recentSearchesLimit,
        namespace: newRecentSearchesKey
      }));
    }
  }, [recentSearchesKey, recentSearchesLimit, verticalKey]);

  return [recentSearches?.getRecentSearches(), setRecentSearch, clearRecentSearches];
}

function getRecentSearchesKey(verticalKey: string | null): string {
  if (verticalKey) {
    return `__yxt_recent_searches_${verticalKey}__`;
  } else {
    return '__yxt_recent_searches_universal__';
  }
}