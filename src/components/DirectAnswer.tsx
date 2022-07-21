import { useSearchState, DirectAnswerType, DirectAnswer as DirectAnswerData } from '@yext/search-headless-react';
import { renderHighlightedValue } from './utils/renderHighlightedValue';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import {
  ThumbsFeedbackCssClasses,
  ThumbsFeedback,
  builtInCssClasses as thumbsFeedbackCssClasses
} from './ThumbsFeedback';

import { useCardAnalyticsCallback } from '../hooks/useCardAnalyticsCallback';
import { useCardFeedbackCallback } from '../hooks/useCardFeedbackCallback';

/**
 * Props for {@link DirectAnswer}.
 *
 * @public
 */
export interface DirectAnswerProps {
  /** CSS classes for customizing the component styling. */
  customCssClasses?: DirectAnswerCssClasses
}

/**
 *  The CSS class interface for {@link DirectAnswer}.
 *
 * @public
 */
export interface DirectAnswerCssClasses extends ThumbsFeedbackCssClasses {
  directAnswerContainer?: string,
  directAnswerLoading?: string,
  answer?: string,
  description?: string,
  content?: string,
  highlighted?: string,
  answerContainer?: string
}

const builtInCssClasses: Readonly<DirectAnswerCssClasses> = {
  directAnswerContainer: '',
  directAnswerLoading: 'opacity-50',
  answer: 'font-bold text-xl text-neutral-dark',
  description: 'text-neutral',
  content: 'mt-4',
  highlighted: 'bg-primary-light',
  answerContainer: 'p-4 border rounded-lg shadow-sm',
  thumbsFeedbackContainer: thumbsFeedbackCssClasses.thumbsFeedbackContainer,
  thumbsUpIcon: thumbsFeedbackCssClasses.thumbsUpIcon,
  thumbsDownIcon: thumbsFeedbackCssClasses.thumbsDownIcon
};

/**
 * Renders Direct Answers provided by the Search API.
 *
 * @public
 *
 * @param props - {@link DirectAnswerProps}
 * @returns A react element for DirectAnswer
 */
export function DirectAnswer(props: DirectAnswerProps): JSX.Element | null {
  const directAnswerResult = useSearchState(state => state.directAnswer.result);
  const isLoading = useSearchState(state => state.searchStatus.isLoading || false);
  const composedCssClasses = useComposedCssClasses(builtInCssClasses, props.customCssClasses);

  const handleClickViewDetails = useCardAnalyticsCallback(directAnswerResult as DirectAnswerData, 'CTA_CLICK');
  const handleClickFeedbackButton = useCardFeedbackCallback(directAnswerResult as DirectAnswerData);

  if (!directAnswerResult) {
    return null;
  }

  const cssClasses = getCssClassesForAnswerType(composedCssClasses, directAnswerResult.type);
  const title = directAnswerResult.type === DirectAnswerType.FeaturedSnippet
    ? directAnswerResult.value
    : `${directAnswerResult.entityName} / ${directAnswerResult.fieldName}`;
  const description: ReactNode = directAnswerResult.type === DirectAnswerType.FeaturedSnippet
    ? renderHighlightedValue(directAnswerResult.snippet, { highlighted: cssClasses.highlighted })
    : directAnswerResult.value;
  const link = directAnswerResult.relatedResult.link;

  function getLinkText(directAnswerResult: DirectAnswerData) {
    const isSnippet = directAnswerResult.type === DirectAnswerType.FeaturedSnippet;
    const name = directAnswerResult.relatedResult.name;
    const snippetLinkMessage = 'Read more about ';

    return (<>
      {isSnippet && name && <div className='pt-4 text-neutral'>
        {snippetLinkMessage}
        <a
          className='text-primary'
          href={link}
          onClick={handleClickViewDetails}
        >
          {name}
        </a>
      </div>}
      {!isSnippet && link && <div className='pt-4 text-neutral'>
        <a
          href={link}
          className='text-primary'
          onClick={handleClickViewDetails}
        >
          View Details
        </a>
      </div>}
    </>);
  }

  const containerCssClasses = classNames(cssClasses.directAnswerContainer, {
    [cssClasses.directAnswerLoading ?? '']: isLoading
  });

  return (
    <div className={containerCssClasses}>
      <div className={cssClasses.answerContainer}>
        {title &&
          <div className={cssClasses.header}>{title}</div>}
        <div className={cssClasses.content}>
          <div className={cssClasses.body}>{description}</div>
          {link && getLinkText(directAnswerResult)}
        </div>
      </div>
      <ThumbsFeedback
        onClick={handleClickFeedbackButton}
        customCssClasses={composedCssClasses}
      />
    </div>
  );
}

function getCssClassesForAnswerType(cssClasses: DirectAnswerCssClasses, type: DirectAnswerType) {
  const isSnippet = type === DirectAnswerType.FeaturedSnippet;
  return {
    ...cssClasses,
    header: isSnippet ? cssClasses.answer : cssClasses.description,
    body: isSnippet ? cssClasses.description : cssClasses.answer
  };
}
