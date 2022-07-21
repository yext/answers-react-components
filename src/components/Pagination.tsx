import { useSearchState, useSearchActions } from '@yext/search-headless-react';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import { ChevronIcon as PageNavigationIcon } from '../icons/ChevronIcon';
import { usePaginationAnalytics } from '../hooks/usePaginationAnalytics';
import { executeSearch } from '../utils';
import { PropsWithChildren, useCallback } from 'react';
import classNames from 'classnames';

/**
 * Props for {@link Pagination} component
 *
 * @public
 */
export interface PaginationProps {
  /**
   * Whether or not to paginate based on the total results count of
   * the vertical when there are none returned from the search.
   * Defaults to false.
   */
  paginateAllOnNoResults?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: PaginationCssClasses
}

/**
 * The CSS classes used for pagination.
 *
 * @public
 */
export interface PaginationCssClasses {
  paginationContainer?: string,
  paginationLoading?: string,
  label?: string,
  selectedLabel?: string,
  leftIconContainer?: string,
  rightIconContainer?: string,
  icon?: string
}

const builtInPaginationCssClasses: Readonly<PaginationCssClasses> = {
  paginationContainer: 'flex justify-center mb-4',
  paginationLoading: 'opacity-50',
  label: 'z-0 inline-flex items-center px-4 py-2 text-sm font-semibold border border-gray-300 text-neutral',
  selectedLabel: 'z-10 inline-flex items-center px-4 py-2 text-sm font-semibold border border-primary text-primary bg-primary-light',
  leftIconContainer: 'inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-l-md',
  rightIconContainer: 'inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-r-md',
  icon: 'w-3 text-gray-600'
};

/**
 * Renders a component that divide a series of vertical results into chunks
 * across multiple pages and enable user to navigate between those pages.
 *
 * @public
 */
export function Pagination(props: PaginationProps): JSX.Element | null {
  const { customCssClasses = {}, paginateAllOnNoResults = false } = props;
  const cssClasses = useComposedCssClasses(builtInPaginationCssClasses, customCssClasses);
  const searchActions = useSearchActions();
  const verticalResultsCount = useSearchState(state => state.vertical.resultsCount) || 0;
  const allResultsCountForVertical =
    useSearchState(state => state.vertical?.noResults?.allResultsForVertical.resultsCount) || 0;
  const isLoading = useSearchState(state => state.searchStatus.isLoading);

  let resultsCount = verticalResultsCount;
  if (verticalResultsCount === 0 && paginateAllOnNoResults) {
    resultsCount = allResultsCountForVertical;
  }

  const offset = useSearchState(state => state.vertical.offset) || 0;
  const limit = useSearchState(state => state.vertical.limit) || 20;
  const currentPageNumber = (offset / limit) + 1;
  const maxPageCount = Math.ceil(resultsCount / limit);

  const reportAnalyticsEvent = usePaginationAnalytics();
  const navigateToPage = useCallback((newPageNumber: number) => {
    const newOffset = limit * (newPageNumber - 1);
    searchActions.setOffset(newOffset);
    executeSearch(searchActions);
    reportAnalyticsEvent(newPageNumber, currentPageNumber, maxPageCount);
  }, [searchActions, limit, maxPageCount, currentPageNumber, reportAnalyticsEvent]);

  if (maxPageCount <= 1) {
    return null;
  }

  const paginationLabels: string[] = generatePaginationLabels(currentPageNumber, maxPageCount);
  const paginationContainerClassNames = classNames(cssClasses.paginationContainer, {
    [cssClasses.paginationLoading ?? '']: isLoading
  });

  return (
    <div className={paginationContainerClassNames}>
      <nav className='inline-flex shadow-sm -space-x-px' aria-label="Pagination">
        <PaginationButton
          ariaLabel='Navigate to the previous results page'
          className={cssClasses.leftIconContainer}
          navigateToPage={navigateToPage}
          newPageNumber={currentPageNumber - 1}
          disabled={currentPageNumber === 1}
        >
          <PageNavigationIcon className={cssClasses.icon + ' transform -rotate-90'} />
        </PaginationButton>
        {paginationLabels.map((label, index) => {
          switch (label) {
            case '...':
              return (
                <div
                  key={index}
                  className={cssClasses.label}
                >
                  {label}
                </div>
              );
            case `${currentPageNumber}`:
              return (
                <PaginationButton
                  key={index}
                  className={cssClasses.selectedLabel}
                  navigateToPage={navigateToPage}
                  newPageNumber={currentPageNumber}
                >
                  {label}
                </PaginationButton>
              );
            default:
              return (
                <PaginationButton
                  key={index}
                  className={cssClasses.label}
                  navigateToPage={navigateToPage}
                  newPageNumber={Number(label)}
                >
                  {label}
                </PaginationButton>
              );
          }
        })}
        <PaginationButton
          ariaLabel='Navigate to the next results page'
          className={cssClasses.rightIconContainer}
          navigateToPage={navigateToPage}
          newPageNumber={currentPageNumber + 1}
          disabled={currentPageNumber === maxPageCount}
        >
          <PageNavigationIcon className={cssClasses.icon + ' transform rotate-90'} />
        </PaginationButton>
      </nav>
    </div>
  );
}

interface PaginationButtonProps {
  className?: string,
  navigateToPage: (newPageNumber: number) => void,
  newPageNumber: number,
  ariaLabel?: string,
  disabled?: boolean
}

function PaginationButton(props: PropsWithChildren<PaginationButtonProps>): JSX.Element | null {
  const { navigateToPage, newPageNumber } = props;
  const handleClick = useCallback(() => {
    navigateToPage(newPageNumber);
  }, [navigateToPage, newPageNumber]);

  return (
    <button
      aria-label={props.ariaLabel}
      className={props.className}
      onClick={handleClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

function generatePaginationLabels(currentPageNumber: number, maxPageCount: number): string[] {
  const paginationLabels: string[] = [];
  const previousPageNumber = currentPageNumber - 1;
  const nextPageNumber = currentPageNumber + 1;

  if (previousPageNumber > 3) {
    paginationLabels.push('1', '...', `${previousPageNumber}`);
  } else if (previousPageNumber !== 0) {
    [...Array(previousPageNumber)].forEach((_, index) => paginationLabels.push(`${index + 1}`));
  }
  paginationLabels.push(`${currentPageNumber}`);
  if (maxPageCount - nextPageNumber > 2) {
    paginationLabels.push(`${nextPageNumber}`, '...', `${maxPageCount}`);
  } else if (nextPageNumber <= maxPageCount) {
    [...Array(maxPageCount - nextPageNumber + 1)]
      .forEach((_, index) => paginationLabels.push(`${nextPageNumber + index}`));
  }
  return paginationLabels;
}
