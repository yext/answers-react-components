import { Result, DirectAnswer as DirectAnswerData } from '@yext/search-headless-react';
import { useCallback } from 'react';
import { CardAnalyticsType, useCardAnalytics } from './useCardAnalytics';

/**
 * Creates a memoized function for reporting card analytics.
 *
 * @public
 *
 * @param result - result that contains data use in the card analytics event.
 * @param analyticsType - the card analytics event type to report.
 */
export function useCardAnalyticsCallback(
  result: Result | DirectAnswerData,
  analyticsType: CardAnalyticsType
): () => void {
  const reportAnalyticsEvent = useCardAnalytics();
  return useCallback(() => {
    reportAnalyticsEvent(result, analyticsType);
  }, [analyticsType, reportAnalyticsEvent, result]);
}

