import { useComposedCssClasses } from '../../../hooks/useComposedCssClasses';
import {
  ThumbsFeedback,
  builtInCssClasses as thumbsFeedbackCssClasses,
  FeedbackType,
  ThumbsFeedbackCssClasses
} from '../../ThumbsFeedback';
import { renderHighlightedValue } from '../../utils/renderHighlightedValue';
import { CtaData } from '../../../models/StandardCardData';

import { HighlightedValue } from '@yext/search-headless-react';
import React, { MouseEventHandler } from 'react';
import PropTypes from 'prop-types';

/**
 * The CSS class interface used for the StandardCardDisplay.
 *
 * @public
 */
interface StandardCardCssClasses extends ThumbsFeedbackCssClasses {
  container?: string,
  header?: string,
  body?: string,
  cta1?: string,
  cta2?: string,
  title?: string
}

/**
 * Default Tailwind styles for the StandardCardDisplay.
 */
const builtInCssClasses: Readonly<StandardCardCssClasses> = {
  container: 'flex flex-col justify-between border rounded-lg mb-4 p-4 shadow-sm',
  header: 'flex text-neutral-dark',
  body: 'flex justify-end pt-2.5 text-base',
  cta1: 'whitespace-nowrap bg-primary text-white font-medium rounded-lg py-2 px-5 shadow',
  cta2: 'whitespace-nowrap bg-white text-primary font-medium rounded-lg py-2 px-5 mt-2 shadow',
  title: 'text-lg font-medium',
  thumbsFeedbackContainer: 'flex justify-end mt-4 text-sm text-gray-500 font-medium',
  thumbsUpIcon: thumbsFeedbackCssClasses.thumbsUpIcon,
  thumbsDownIcon: thumbsFeedbackCssClasses.thumbsDownIcon
};

/**
 * Click handlers for the various buttons and links that can appear in the StandardCardDisplay.
 */
interface ClickHandlers {
  handleTitleClick: MouseEventHandler<HTMLAnchorElement>,
  handleCtaClick: MouseEventHandler<HTMLButtonElement>,
  handleFeedbackClick: (feedback: FeedbackType) => void
}

/**
 * Props for displaying the basic, Standard card.
 */
interface StandardCardDisplayProps {
  title: string | HighlightedValue,
  link?: string,
  description?: string,
  showFeedbackButtons?: boolean,
  cta1?: CtaData,
  cta2?: CtaData,
  clickHandlers: ClickHandlers,
  customCssClasses?: StandardCardCssClasses
}

/**
 * The display portion of the {@link StandardCard}.
 *
 * @param props - Contains a title, an optional description, and up to two CTAs. Click handlers for
 *                the various buttons and links are also supplied. The props can also include custom
 *                styling.
 * @returns - The rendered Result card.
 */
function StandardCardDisplay(props: StandardCardDisplayProps) {
  const {
    title,
    link,
    description,
    customCssClasses,
    clickHandlers,
    showFeedbackButtons,
    cta1,
    cta2
  } = props;
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);

  function renderTitle(title: string | HighlightedValue, link?: string) {
    const titleJsx = renderHighlightedValue(title, { highlighted: 'font-bold', nonHighlighted: 'font-medium' });

    return (
      link
        ? <a href={link} className='text-lg font-medium text-primary hover:underline focus:underline' onClick={clickHandlers.handleTitleClick}>
          {titleJsx}
        </a>
        : <div className={cssClasses.title}>{titleJsx}</div>
    );
  }

  function renderCTAs(cta1?: CtaData | undefined, cta2?: CtaData | undefined) {
    if (cta1 || cta2) {
      return (
        <div className='flex flex-col justify-end ml-4'>
          {cta1 &&
            <button className={cssClasses.cta1} onClick={clickHandlers.handleCtaClick}>{cta1.label}</button>}
          {cta2 &&
            <button className={cssClasses.cta2} onClick={clickHandlers.handleCtaClick}>{cta2.label}</button>}
        </div>
      );
    }

    return null;
  }

  function renderDescription(text: string | undefined) {
    if (text) {
      return (
        <div className='w-full'>
          {renderHighlightedValue(text, { highlighted: 'font-semibold', nonHighlighted: 'font-normal' })}
        </div>
      );
    }

    return null;
  }

  function renderFeedbackIcons() {
    if (showFeedbackButtons) {
      return (
        <ThumbsFeedback
          feedbackText=''
          onClick={clickHandlers.handleFeedbackClick}
          customCssClasses={cssClasses}
        />
      );
    }

    return null;
  }

  return (
    <div className={cssClasses.container}>
      <div className={cssClasses.header}>
        {renderTitle(title, link)}
      </div>
      {(description ?? cta1 ?? cta2) &&
        <div className={cssClasses.body}>
          {renderDescription(description)}
          {renderCTAs(cta1, cta2)}
        </div>
      }
      {renderFeedbackIcons()}
    </div>
  );
}

/**
 * The PropTypes for the StandardCardDisplay component. Note that props known at compile-time
 * are not included here. Type-checking of these props is taken care of by TypeScript.
 */
StandardCardDisplay.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      matchedSubstrings: PropTypes.arrayOf(PropTypes.shape({
        length: PropTypes.number.isRequired,
        offset: PropTypes.number.isRequired
      })).isRequired
    })
  ]).isRequired,
  link: PropTypes.string,
  description: PropTypes.string,
  cta1: PropTypes.shape({
    label: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    linkType: PropTypes.string.isRequired
  }),
  cta2: PropTypes.shape({
    label: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    linkType: PropTypes.string.isRequired
  })
};

export { StandardCardDisplay, StandardCardCssClasses };