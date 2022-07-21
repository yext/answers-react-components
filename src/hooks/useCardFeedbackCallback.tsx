import { Result, DirectAnswer as DirectAnswerData } from '@yext/search-headless-react';
import { useCallback } from 'react';
import { FeedbackType } from '../components/ThumbsFeedback';
import { useCardAnalytics } from './useCardAnalytics';

/**
 * Creates a memoized function for reporting card feedback analytics.
 *
 * @public
 *
 * @param result - card result that contains data use in the feedback analytics event.
 */
export function useCardFeedbackCallback(
  result: Result | DirectAnswerData,
): (analyticsType: FeedbackType) => void {
  const reportAnalyticsEvent = useCardAnalytics();
  return useCallback((analyticsType: FeedbackType) => {
    reportAnalyticsEvent(result, analyticsType);
  }, [reportAnalyticsEvent, result]);
}

