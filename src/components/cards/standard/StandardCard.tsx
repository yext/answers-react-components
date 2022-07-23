import { useCardAnalyticsCallback } from '../../../hooks/useCardAnalyticsCallback';
import { CardProps } from '../../../models/cardComponent';
import { useCardFeedbackCallback } from '../../../hooks/useCardFeedbackCallback';
import { StandardCardDisplay, StandardCardCssClasses } from './StandardCardDisplay';

/**
 * Props for a StandardCard.
 *
 * @public
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StandardCardProps extends CardProps<any> {
  /** Whether or not to show thumbs up/down buttons to provide feedback on the result card */
  showFeedbackButtons?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: StandardCardCssClasses
}

/**
 * This Component renders the base result card.
 *
 * @public
 *
 * @param props - An object containing the result itself and any additional information needed
 *                to render the card
 * @returns A React element for the result card
 */
export function StandardCard(props: StandardCardProps): JSX.Element {
  const {
    result,
    customCssClasses,
    showFeedbackButtons
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    title: result.highlightedFields?.name ?? result.name ?? result.rawData.name,
    description: result.highlightedFields?.description ?? result.rawData.description,
    cta1: result.rawData.c_primaryCTA,
    cta2: result.rawData.c_secondaryCTA,
  };

  // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
  const clickHandlers = {
    handleCtaClick: useCardAnalyticsCallback(result, 'CTA_CLICK'),
    handleTitleClick: useCardAnalyticsCallback(result, 'TITLE_CLICK'),
    handleFeedbackClick: useCardFeedbackCallback(result)
  };

  /*
    Note the title, link, description, and CTA props are sourced from LiveAPI data. This data
    must be type-checked at run-time. This is accomplished by using the StandardCardDisplay's PropTypes.
  */
  return (
    <StandardCardDisplay
      customCssClasses={customCssClasses}
      showFeedbackButtons={showFeedbackButtons}
      clickHandlers={clickHandlers}
      title={data.title}
      link={result.link}
      description={data.description}
      cta1={data.cta1}
      cta2={data.cta2}
    />
  );
}

export { StandardCardCssClasses };