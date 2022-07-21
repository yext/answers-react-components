import {
  DirectAnswer as DirectAnswerData,
  DirectAnswerType,
  FieldValueDirectAnswer,
  Result,
  useSearchState
} from '@yext/search-headless-react';
import { useCallback } from 'react';
import { FeedbackType } from '../components/ThumbsFeedback';
import { useAnalytics } from './useAnalytics';

/**
 * Analytics event types for cta click and title click.
 *
 * @public
 */
export type CardCtaEventType = 'CTA_CLICK' | 'TITLE_CLICK';

/**
 * Analytics event types for interactions on a card.
 *
 * @public
 */
export type CardAnalyticsType = CardCtaEventType | FeedbackType;

function isDirectAnswer(data: unknown): data is DirectAnswerData {
  return (data as DirectAnswerData)?.type === DirectAnswerType.FeaturedSnippet ||
    (data as DirectAnswerData)?.type === DirectAnswerType.FieldValue;
}

export function useCardAnalytics(): (
  cardResult: Result | DirectAnswerData, analyticsEventType: CardAnalyticsType
) => void {
  const analytics = useAnalytics();
  const verticalKey = useSearchState(state => state.vertical.verticalKey);
  const queryId = useSearchState(state => state.query.queryId);

  const reportCtaEvent = useCallback((result: DirectAnswerData | Result, eventType: CardCtaEventType) => {
    let url: string | undefined, entityId: string | undefined, fieldName: string | undefined;
    let directAnswer = false;
    if (isDirectAnswer(result)) {
      url = result.relatedResult.link;
      entityId = result.relatedResult.id;
      fieldName = result.type === DirectAnswerType.FeaturedSnippet
        ? undefined
        : (result as FieldValueDirectAnswer).fieldName;
      directAnswer = true;
    } else {
      url = result.link;
      entityId = result.id;
    }

    if (!queryId) {
      console.error('Unable to report a CTA event. Missing field: queryId.');
      return;
    }
    if (!entityId) {
      console.error('Unable to report a CTA event. Missing field: entityId.');
      return;
    }
    analytics?.report({
      type: eventType,
      entityId,
      searcher: verticalKey ? 'VERTICAL' : 'UNIVERSAL',
      queryId,
      verticalKey: verticalKey || '',
      url,
      fieldName,
      directAnswer
    });
  }, [analytics, queryId, verticalKey]);

  const reportFeedbackEvent = useCallback((result: DirectAnswerData | Result, feedbackType: FeedbackType) => {
    if (!queryId) {
      console.error('Unable to report a result feedback event. Missing field: queryId.');
      return;
    }
    let directAnswer = false;
    let entityId: string | undefined;
    if (isDirectAnswer(result)) {
      directAnswer = true;
      entityId = result.relatedResult.id;
    } else {
      entityId = result.id;
    }
    analytics?.report({
      type: feedbackType,
      entityId,
      searcher: verticalKey ? 'VERTICAL' : 'UNIVERSAL',
      queryId,
      verticalKey: verticalKey || '',
      directAnswer
    });
  }, [analytics, queryId, verticalKey]);

  const reportAnalyticsEvent = useCallback((
    cardResult: DirectAnswerData | Result,
    analyticsEventType: CardAnalyticsType
  ) => {
    if (!analytics) {
      return;
    }
    if (analyticsEventType === 'TITLE_CLICK' || analyticsEventType === 'CTA_CLICK') {
      reportCtaEvent(cardResult, analyticsEventType);
    }
    if (analyticsEventType === 'THUMBS_DOWN' || analyticsEventType === 'THUMBS_UP') {
      reportFeedbackEvent(cardResult, analyticsEventType);
    }
  }, [analytics, reportCtaEvent, reportFeedbackEvent]);
  return reportAnalyticsEvent;
}