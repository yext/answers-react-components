import { AutocompleteResult, Filter, FilterSearchResponse, SearchParameterField, useSearchActions, useSearchState } from '@yext/search-headless-react';
import { useCallback, useMemo, useState } from 'react';
import { useComposedCssClasses } from '../hooks/useComposedCssClasses';
import { useSynchronizedRequest } from '../hooks/useSynchronizedRequest';
import { executeSearch } from '../utils';
import { isDuplicateFilter } from '../utils/filterutils';
import { Dropdown } from './Dropdown/Dropdown';
import { DropdownInput } from './Dropdown/DropdownInput';
import { DropdownItem } from './Dropdown/DropdownItem';
import { DropdownMenu } from './Dropdown/DropdownMenu';
import { processTranslation } from './utils/processTranslation';
import { renderAutocompleteResult, AutocompleteResultCssClasses } from './utils/renderAutocompleteResult';

/**
 * The CSS class interface for {@link FilterSearch}.
 *
 * @public
 */
export interface FilterSearchCssClasses extends AutocompleteResultCssClasses {
  filterSearchContainer?: string,
  label?: string,
  inputElement?: string,
  sectionLabel?: string,
  focusedOption?: string,
  optionsContainer?: string
}

const builtInCssClasses: Readonly<FilterSearchCssClasses> = {
  filterSearchContainer: 'mb-2',
  label: 'mb-4 text-sm font-medium text-neutral-dark',
  inputElement: 'text-sm bg-white outline-none h-9 w-full p-2 rounded-md border border-gray-300 focus:border-primary text-neutral-dark placeholder:text-neutral',
  sectionLabel: 'text-sm text-neutral-dark font-semibold py-2 px-4',
  focusedOption: 'bg-gray-100',
  option: 'text-sm text-neutral-dark py-1 cursor-pointer hover:bg-gray-100 px-4'
};

/**
 * The props for the {@link FilterSearch} component.
 *
 * @public
 */
export interface FilterSearchProps {
  /** An array of fieldApiName and entityType which indicates what to perform the filter search against. */
  searchFields: Omit<SearchParameterField, 'fetchEntities'>[],
  /** The display label for the component. Defaults to "Filter". */
  label?: string,
  /**
   * The search input's placeholder text when no text has been entered by the user.
   * Defaults to "Search here...".
   */
  placeholder?: string,
  /** Whether to trigger a search when an option is selected. Defaults to false. */
  searchOnSelect?: boolean,
  /** Determines whether or not the results of the filter search are separated by field. Defaults to false. */
  sectioned?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: FilterSearchCssClasses
}

/**
 * A component which allows a user to search for filters associated with specific entities and fields.
 *
 * @public
 *
 * @param props - {@link FilterSearchProps}
 * @returns A react component for Filter Search
 */
export function FilterSearch({
  searchFields,
  label,
  placeholder = 'Search here...',
  searchOnSelect = false,
  sectioned = false,
  customCssClasses
}: FilterSearchProps): JSX.Element {
  const searchActions = useSearchActions();
  const searchParamFields = searchFields.map((searchField) => {
    return { ...searchField, fetchEntities: false };
  });
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);
  const [currentFilter, setCurrentFilter] = useState<Filter>();
  const [ query, setQuery ] = useState<string>();
  const filters = useSearchState(state => state.filters.static);
  filters?.forEach(f => {
    if (currentFilter && isDuplicateFilter(f, currentFilter) && !f.selected) {
      setCurrentFilter(undefined);
      setQuery('');
    }
  });

  const [
    filterSearchResponse,
    executeFilterSearch
  ] = useSynchronizedRequest<string, FilterSearchResponse>(
    inputValue => {
      setQuery(inputValue);
      return searchActions.executeFilterSearch(inputValue ?? '', sectioned, searchParamFields);
    },
    (e) => console.error('Error occured executing a filter search request.\n', e)
  );

  const sections = useMemo(() => {
    return filterSearchResponse?.sections.filter(section => section.results.length > 0) ?? [];
  }, [filterSearchResponse?.sections]);

  const hasResults = sections.flatMap(s => s.results).length > 0;

  const handleDropdownEvent = useCallback((itemData, select) => {
    const newFilter = itemData?.filter as Filter;
    const newDisplayName = itemData?.displayName as string;
    if (newFilter && newDisplayName) {
      if (currentFilter) {
        searchActions.setFilterOption({ ...currentFilter, selected: false });
      }
      searchActions.setFilterOption({ ...newFilter, displayName: newDisplayName, selected: true });
      setCurrentFilter(newFilter);
      if (select && searchOnSelect) {
        searchActions.setOffset(0);
        searchActions.resetFacets();
        executeSearch(searchActions);
      }
    }
  }, [searchActions, currentFilter, searchOnSelect]);

  const handleSelectDropdown = useCallback((_value, _index, itemData) => {
    handleDropdownEvent(itemData, true);
  }, [handleDropdownEvent]);

  const handleToggleDropdown = useCallback((isActive, _prevValue, _value, _index, itemData) => {
    if (!isActive) {
      handleDropdownEvent(itemData, false);
    }
  }, [handleDropdownEvent]);

  const meetsSubmitCritera = useCallback(index => index >= 0, []);

  const itemDataMatrix = useMemo(() => {
    return sections.map(section => {
      return section.results.map(result => ({
        filter: result.filter,
        displayName: result.value
      }));
    });
  }, [sections]);

  function renderDropdownItems() {
    return sections.map((section, sectionIndex) => {
      return (
        <div className='pb-2' key={sectionIndex}>
          {section.label &&
            <div className={cssClasses.sectionLabel}>
              {section.label}
            </div>
          }
          <div className={cssClasses.optionsContainer}>
            {section.results.map((result, index) => (
              <DropdownItem
                key={index}
                focusedClassName={cssClasses.focusedOption}
                value={result.value}
                itemData={itemDataMatrix[sectionIndex][index]}
              >
                {renderAutocompleteResult(result, cssClasses)}
              </DropdownItem>
            ))}
          </div>
        </div>
      );
    });
  }

  return (
    <div className={cssClasses.filterSearchContainer}>
      {label && <h1 className={cssClasses.label}>{label}</h1>}
      <Dropdown
        screenReaderText={getScreenReaderText(sections)}
        onSelect={handleSelectDropdown}
        onToggle={handleToggleDropdown}
        parentQuery={query}
      >
        <DropdownInput
          className={cssClasses.inputElement}
          placeholder={placeholder}
          onChange={executeFilterSearch}
          submitCriteria={meetsSubmitCritera}
        />
        <DropdownMenu>
          {hasResults &&
            <div className='relative z-10 shadow-lg rounded-md border border-gray-300 bg-white pt-3 pb-1 mt-1'>
              {renderDropdownItems()}
            </div>
          }
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

function getScreenReaderText(sections: {
  results: AutocompleteResult[],
  label?: string
}[]) {
  let screenReaderText = processTranslation({
    phrase: '0 autocomplete option found.',
    pluralForm: '0 autocomplete options found.',
    count: 0
  });
  if (sections.length === 0) {
    return screenReaderText;
  }
  const screenReaderPhrases = sections.map(section => {
    const optionInfo = section.label
      ? `${section.results.length} ${section.label}`
      : `${section.results.length}`;
    return processTranslation({
      phrase: `${optionInfo} autocomplete option found.`,
      pluralForm: `${optionInfo} autocomplete options found.`,
      count: section.results.length
    });
  });
  screenReaderText = screenReaderPhrases.join(' ');
  return screenReaderText;
}
