import { AnalyticsService } from '@yext/analytics';
import { createContext, useContext } from 'react';

export const AnalyticsContext = createContext<AnalyticsService | null>(null);

/**
 * Returns a service that can be used to report analytics events.
 */
export function useAnalytics(): AnalyticsService {
  const analyticsReporter = useContext(AnalyticsContext);
  if (!analyticsReporter) {
    throw new Error('Attempted to call useAnalytics() outside of AnalyticsProvider.'
     + ' Please ensure that \'useAnalytics()\' is called within an AnalyticsProvider component.');
  }
  return analyticsReporter;
}
