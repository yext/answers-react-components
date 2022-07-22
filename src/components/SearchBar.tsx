import {
  SearchHeadless,
  QuerySource,
  SearchTypeEnum,
  UniversalLimit,
  useSearchActions,
  useSearchState,
  useSearchUtilities,
  VerticalResults as VerticalResultsData
} from '@yext/search-headless-react';
import classNames from 'classnames';
import { Fragment, isValidElement, PropsWithChildren, ReactNode, useCallback, useEffect } from 'react';
import { useEntityPreviews } from '../hooks/useEntityPreviews';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useSearchWithNearMeHandling } from '../hooks/useSearchWithNearMeHandling';
import { useSynchronizedRequest } from '../hooks/useSynchronizedRequest';
import { VerticalDividerIcon } from '../icons/VerticalDividerIcon';
import { HistoryIcon as RecentSearchIcon } from '../icons/HistoryIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { YextIcon } from '../icons/YextIcon';
import { Dropdown } from './Dropdown/Dropdown';
import { useDropdownContext } from './Dropdown/DropdownContext';
import { DropdownInput } from './Dropdown/DropdownInput';
import { DropdownItem } from './Dropdown/DropdownItem';
import { DropdownMenu } from './Dropdown/DropdownMenu';
import { FocusedItemData } from './Dropdown/FocusContext';
import { useComposedCssClasses, twMerge } from '../hooks/useComposedCssClasses';
import { SearchButton } from './SearchButton';
import { processTranslation } from './utils/processTranslation';
import {
  renderAutocompleteResult,
  AutocompleteResultCssClasses,
  builtInCssClasses as AutocompleteResultBuiltInCssClasses
} from './utils/renderAutocompleteResult';
import { useSearchBarAnalytics } from '../hooks/useSearchBarAnalytics';
import { isVerticalLink, VerticalLink } from '../models/verticalLink';
import { executeAutocomplete as executeAutocompleteSearch } from '../utils/search-operations';
import { clearStaticRangeFilters } from '../utils/filterutils';
import { useMemo } from 'react';
import { recursivelyMapChildren } from './utils/recursivelyMapChildren';

const builtInCssClasses: Readonly<SearchBarCssClasses> = {
  searchBarContainer: 'h-12 mb-6',
  inputDivider: 'border-t border-gray-200 mx-2.5',
  inputElement: 'outline-none flex-grow border-none h-full pl-0.5 pr-2 text-neutral-dark text-base placeholder:text-neutral-light',
  searchButtonContainer: ' w-8 h-full mx-2 flex flex-col justify-center items-center',
  searchButton: 'h-7 w-7',
  focusedOption: 'bg-gray-100',
  clearButton: 'h-3 w-3 mr-3.5',
  verticalDivider: 'mr-0.5',
  recentSearchesIcon: 'w-5 mr-1 text-gray-400',
  recentSearchesOption: 'pl-3 text-neutral-dark',
  recentSearchesNonHighlighted: 'font-normal', // Swap this to semibold once we apply highlighting to recent searches
  verticalLink: 'ml-12 pl-1 text-neutral italic',
  entityPreviewsDivider: 'h-px bg-gray-200 mt-1 mb-4 mx-3.5',
  ...AutocompleteResultBuiltInCssClasses
};

/**
 * The CSS class interface for the {@link SearchBar}.
 *
 * @public
 */
export interface SearchBarCssClasses extends AutocompleteResultCssClasses {
  searchBarContainer?: string,
  inputElement?: string,
  inputDivider?: string,
  clearButton?: string,
  searchButton?: string,
  searchButtonContainer?: string,
  focusedOption?: string,
  recentSearchesIcon?: string,
  recentSearchesOption?: string,
  recentSearchesNonHighlighted?: string,
  verticalLink?: string,
  verticalDivider?: string,
  entityPreviewsDivider?: string
}

/**
 * The type of a functional React component which renders entity previews using
 * a map of vertical key to the corresponding VerticalResults data.
 *
 * @remarks
 * The autocomplete loading state is passed in as an optional param.
 *
 * Default props for rendering corresponding DropdownItems are passed in:
 * an onClick function to allow an entity preview to be submitted, and
 * an ariaLabel function that returns text for the screenreader
 *
 * For the entity previews to be navigable in the search bar's dropdown section,
 * wrap each entity preview in a {@link DropdownItem} component.
 *
 * @public
 */
export type RenderEntityPreviews = (
  autocompleteLoading: boolean,
  verticalKeyToResults: Record<string, VerticalResultsData>,
  dropdownItemProps: {
    onClick: (value: string, _index: number, itemData?: FocusedItemData) => void,
    ariaLabel: (value: string) => string
  }
) => JSX.Element | null;

/**
 * The configuration options for Visual Autocomplete.
 *
 * @public
 */
export interface VisualAutocompleteConfig {
  /** The Search Headless instance used to perform visual autocomplete searches. */
  entityPreviewSearcher: SearchHeadless,
  /** Renders entity previews based on the autocomplete loading state and results. */
  renderEntityPreviews: RenderEntityPreviews,
  /** Specify which verticals to include for VisualAutocomplete. */
  includedVerticals: string[],
  /** Specify the number of entities to return per vertical. **/
  universalLimit?: UniversalLimit,
  /** The debouncing time, in milliseconds, for making API requests for entity previews. */
  entityPreviewsDebouncingTime?: number
}

/**
 * The interface of a function which is called on a search.
 *
 * @public
 */
export type onSearchFunc = (searchEventData: { verticalKey?: string, query?: string }) => void;

/**
 * The props for the {@link SearchBar} component.
 *
 * @public
 */
export interface SearchBarProps {
  /** The search bar's placeholder text. */
  placeholder?: string,
  /** {@inheritDoc LocationBiasProps.geolocationOptions} */
  geolocationOptions?: PositionOptions,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: SearchBarCssClasses,
  /** {@inheritDoc VisualAutocompleteConfig} */
  visualAutocompleteConfig?: VisualAutocompleteConfig,
  /** Hides vertical links if true. */
  hideVerticalLinks?: boolean,
  /** A function which is called when a vertical link is selected. */
  onSelectVerticalLink?: (data: { verticalLink: VerticalLink, querySource: QuerySource }) => void,
  /** A function which returns a display label for the given verticalKey. */
  verticalKeyToLabel?: (verticalKey: string) => string,
  /** Hides recent searches if true. */
  hideRecentSearches?: boolean,
  /** Limits the number of recent searches shown. */
  recentSearchesLimit?: number,
  /** A callback which is called when a search is ran. */
  onSearch?: onSearchFunc
}

/**
 * Renders a SearchBar that is hooked up with an InputDropdown component.
 *
 * @public
 */
export function SearchBar({
  placeholder,
  geolocationOptions,
  hideRecentSearches,
  visualAutocompleteConfig,
  hideVerticalLinks,
  onSelectVerticalLink,
  verticalKeyToLabel,
  recentSearchesLimit = 5,
  customCssClasses,
  onSearch
}: SearchBarProps): JSX.Element {
  const {
    entityPreviewSearcher,
    renderEntityPreviews,
    includedVerticals,
    universalLimit,
    entityPreviewsDebouncingTime = 500
  } = visualAutocompleteConfig ?? {};
  const searchActions = useSearchActions();
  const searchUtilities = useSearchUtilities();
  const reportAnalyticsEvent = useSearchBarAnalytics();

  const query = useSearchState(state => state.query.input) ?? '';
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);
  const isVertical = useSearchState(state => state.meta.searchType) === SearchTypeEnum.Vertical;
  const verticalKey = useSearchState(state => state.vertical.verticalKey);
  const [autocompleteResponse, executeAutocomplete, clearAutocompleteData] = useSynchronizedRequest(
    () => executeAutocompleteSearch(searchActions)
  );
  const [
    executeQueryWithNearMeHandling,
    autocompletePromiseRef,
  ] = useSearchWithNearMeHandling(geolocationOptions, onSearch);
  const [
    recentSearches,
    setRecentSearch,
    clearRecentSearches,
  ] = useRecentSearches(recentSearchesLimit, verticalKey);
  const filteredRecentSearches = recentSearches?.filter(search =>
    searchUtilities.isCloseMatch(search.query, query)
  );

  useEffect(() => {
    if (hideRecentSearches) {
      clearRecentSearches();
    }
  }, [clearRecentSearches, hideRecentSearches]);

  const clearAutocomplete = useCallback(() => {
    clearAutocompleteData();
    autocompletePromiseRef.current = undefined;
  }, [autocompletePromiseRef, clearAutocompleteData]);

  const executeQuery = useCallback(() => {
    if (!hideRecentSearches) {
      const input = searchActions.state.query.input;
      input && setRecentSearch(input);
    }
    executeQueryWithNearMeHandling();
  }, [
    searchActions.state.query.input,
    executeQueryWithNearMeHandling,
    hideRecentSearches,
    setRecentSearch
  ]);

  const handleSubmit = useCallback((value?: string, index?: number, itemData?: FocusedItemData) => {
    value !== undefined && searchActions.setQuery(value);
    searchActions.setOffset(0);
    searchActions.resetFacets();
    clearStaticRangeFilters(searchActions);
    if (itemData && isVerticalLink(itemData.verticalLink) && onSelectVerticalLink) {
      onSelectVerticalLink({ verticalLink: itemData.verticalLink, querySource: QuerySource.Autocomplete });
    } else {
      executeQuery();
    }
    if (typeof index === 'number' && index >= 0 && !itemData?.isEntityPreview) {
      reportAnalyticsEvent('AUTO_COMPLETE_SELECTION', value);
    }
  }, [searchActions, executeQuery, onSelectVerticalLink, reportAnalyticsEvent]);

  const [
    entityPreviewsState,
    executeEntityPreviewsQuery
  ] = useEntityPreviews(entityPreviewSearcher, entityPreviewsDebouncingTime);
  const { verticalKeyToResults, isLoading: entityPreviewsLoading } = entityPreviewsState;
  const entityPreviews = renderEntityPreviews?.(
    entityPreviewsLoading,
    verticalKeyToResults,
    { onClick: handleSubmit, ariaLabel: getAriaLabel }
  );
  const updateEntityPreviews = useCallback((query: string) => {
    if (!renderEntityPreviews || !includedVerticals) {
      return;
    }
    executeEntityPreviewsQuery(query, universalLimit ?? {}, includedVerticals);
  }, [executeEntityPreviewsQuery, renderEntityPreviews, includedVerticals, universalLimit]);

  const handleInputFocus = useCallback((value = '') => {
    searchActions.setQuery(value);
    updateEntityPreviews(value);
    autocompletePromiseRef.current = executeAutocomplete();
  }, [searchActions, autocompletePromiseRef, executeAutocomplete, updateEntityPreviews]);

  const handleInputChange = useCallback((value = '') => {
    searchActions.setQuery(value);
    updateEntityPreviews(value);
    autocompletePromiseRef.current = executeAutocomplete();
  }, [searchActions, autocompletePromiseRef, executeAutocomplete, updateEntityPreviews]);

  const handleClickClearButton = useCallback(() => {
    updateEntityPreviews('');
    handleSubmit('');
    reportAnalyticsEvent('SEARCH_CLEAR_BUTTON');
  }, [handleSubmit, reportAnalyticsEvent, updateEntityPreviews]);

  function renderInput() {
    return (
      <DropdownInput
        className={cssClasses.inputElement}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        onFocus={handleInputFocus}
        onChange={handleInputChange}
        ariaLabel='Conduct a search'
      />
    );
  }

  function renderRecentSearches() {
    const recentSearchesCssClasses = {
      icon: cssClasses.recentSearchesIcon,
      option: cssClasses.recentSearchesOption,
      nonHighlighted: cssClasses.recentSearchesNonHighlighted
    };

    return filteredRecentSearches?.map((result, i) => (
      <DropdownItem
        className='flex items-center h-6.5 px-3.5 py-1.5 cursor-pointer hover:bg-gray-100'
        focusedClassName={twMerge('flex items-center h-6.5 px-3.5 py-1.5 cursor-pointer hover:bg-gray-100', cssClasses.focusedOption)}
        key={i}
        value={result.query}
        onClick={handleSubmit}
      >
        {renderAutocompleteResult(
          { value: result.query },
          recentSearchesCssClasses,
          RecentSearchIcon,
          `recent search: ${result.query}`
        )}
      </DropdownItem>
    ));
  }

  const itemDataMatrix = useMemo(() => {
    return autocompleteResponse?.results.map(result => {
      return result.verticalKeys?.map(verticalKey => ({
        verticalLink: { verticalKey, query: result.value }
      })) ?? [];
    }) ?? [];
  }, [autocompleteResponse?.results]);

  function renderQuerySuggestions() {
    return autocompleteResponse?.results.map((result, i) => (
      <Fragment key={i}>
        <DropdownItem
          className='flex items-stretch py-1.5 px-3.5 cursor-pointer hover:bg-gray-100'
          focusedClassName={twMerge('flex items-stretch py-1.5 px-3.5 cursor-pointer hover:bg-gray-100', cssClasses.focusedOption)}
          value={result.value}
          onClick={handleSubmit}
        >
          {renderAutocompleteResult(
            result,
            cssClasses,
            MagnifyingGlassIcon,
            `autocomplete suggestion: ${result.value}`
          )}
        </DropdownItem>
        {!hideVerticalLinks && !isVertical && result.verticalKeys?.map((verticalKey, j) => (
          <DropdownItem
            key={j}
            className='flex items-stretch py-1.5 px-3.5 cursor-pointer hover:bg-gray-100'
            focusedClassName={twMerge('flex items-stretch py-1.5 px-3.5 cursor-pointer hover:bg-gray-100', cssClasses.focusedOption)}
            value={result.value}
            itemData={itemDataMatrix[i][j]}
            onClick={handleSubmit}
          >
            {renderAutocompleteResult(
              { value: `in ${verticalKeyToLabel ? verticalKeyToLabel(verticalKey) : verticalKey}` },
              { ...cssClasses, option: cssClasses.verticalLink }
            )}
          </DropdownItem>
        ))}
      </Fragment>
    ));
  }

  function renderClearButton() {
    return (
      <>
        <button
          aria-label='Clear the search bar'
          className={cssClasses.clearButton}
          onClick={handleClickClearButton}
        >
          <CloseIcon />
        </button>
        <VerticalDividerIcon className={cssClasses.verticalDivider} />
      </>
    );
  }

  const entityPreviewsCount = calculateEntityPreviewsCount(entityPreviews);
  const showEntityPreviewsDivider = entityPreviews
    && !!(autocompleteResponse?.results.length || filteredRecentSearches?.length);
  const hasItems = !!(autocompleteResponse?.results.length
    || filteredRecentSearches?.length || entityPreviews);
  const screenReaderText = getScreenReaderText(
    autocompleteResponse?.results.length,
    filteredRecentSearches?.length,
    entityPreviewsCount
  );
  const activeClassName = classNames('relative z-10 bg-white border rounded-3xl border-gray-200 w-full overflow-hidden', {
    ['shadow-lg' ?? '']: hasItems
  });

  const handleToggleDropdown = useCallback((isActive) => {
    if (!isActive) {
      clearAutocomplete();
    }
  }, [clearAutocomplete]);

  return (
    <div className={cssClasses.searchBarContainer}>
      <Dropdown
        className='relative z-10 bg-white border rounded-3xl border-gray-200 w-full overflow-hidden'
        activeClassName={activeClassName}
        screenReaderText={screenReaderText}
        parentQuery={query}
        onToggle={handleToggleDropdown}
      >
        <div className='inline-flex items-center justify-between w-full'>
          <div className='w-7 mx-2.5 my-2'>
            <YextIcon />
          </div>
          {renderInput()}
          {query && renderClearButton()}
          <DropdownSearchButton
            handleSubmit={handleSubmit}
            cssClasses={cssClasses}
          />
        </div>
        {hasItems &&
          <StyledDropdownMenu cssClasses={cssClasses}>
            {renderRecentSearches()}
            {renderQuerySuggestions()}
            {showEntityPreviewsDivider && <div className={cssClasses.entityPreviewsDivider}></div>}
            {entityPreviews}
          </StyledDropdownMenu>
        }
      </Dropdown>
    </div>
  );
}

function StyledDropdownMenu({ cssClasses, children }: PropsWithChildren<{
  cssClasses: {
    inputDivider?: string
  }
}>) {
  return (
    <DropdownMenu>
      <div className={cssClasses.inputDivider} />
      <div className='bg-white py-4 z-10'>
        {children}
      </div>
    </DropdownMenu>
  );
}

function getScreenReaderText(
  autocompleteOptions = 0,
  recentSearchesOptions = 0,
  entityPreviewsCount = 0
): string {
  const recentSearchesText = recentSearchesOptions > 0
    ? processTranslation({
      phrase: `${recentSearchesOptions} recent search found.`,
      pluralForm: `${recentSearchesOptions} recent searches found.`,
      count: recentSearchesOptions
    })
    : '';
  const entityPreviewsText = entityPreviewsCount > 0
    ? ' ' + processTranslation({
      phrase: `${entityPreviewsCount} result preview found.`,
      pluralForm: `${entityPreviewsCount} result previews found.`,
      count: entityPreviewsCount
    })
    : '';
  const autocompleteText = autocompleteOptions > 0
    ? ' ' + processTranslation({
      phrase: `${autocompleteOptions} autocomplete suggestion found.`,
      pluralForm: `${autocompleteOptions} autocomplete suggestions found.`,
      count: autocompleteOptions
    })
    : '';

  const text = recentSearchesText + autocompleteText + entityPreviewsText;
  if (text === '') {
    return processTranslation({
      phrase: '0 autocomplete suggestion found.',
      pluralForm: '0 autocomplete suggestions found.',
      count: 0
    });
  }
  return text.trim();
}

function DropdownSearchButton({ handleSubmit, cssClasses }: {
  handleSubmit: () => void,
  cssClasses: {
    searchButtonContainer?: string,
    searchButton?: string
  }
}) {
  const { toggleDropdown } = useDropdownContext();
  const handleClick = useCallback(() => {
    handleSubmit();
    toggleDropdown(false);
  }, [handleSubmit, toggleDropdown]);
  return (
    <div className={cssClasses.searchButtonContainer}>
      <SearchButton
        className={cssClasses.searchButton}
        handleClick={handleClick}
      />
    </div>
  );
}

function getAriaLabel(value: string): string {
  return 'result preview: ' + value;
}

/**
 * Calculates the number of navigable entity previews from a ReactNode containing DropdownItems.
 */
export function calculateEntityPreviewsCount(children: ReactNode): number {
  let count = 0;
  recursivelyMapChildren(children, c => {
    if (isValidElement(c) && c.type === DropdownItem) {
      count++;
    }
    return c;
  });
  return count;
}