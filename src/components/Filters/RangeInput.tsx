import { Matcher, NumberRangeValue, useSearchActions, useSearchState } from '@yext/search-headless-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFilterGroupContext } from './FilterGroupContext';
import { useComposedCssClasses } from '../../hooks/useComposedCssClasses';
import { clearStaticRangeFilters, findSelectableFilter, parseNumberRangeInput } from '../../utils/filterutils';
import { executeSearch } from '../../utils/search-operations';
import classNames from 'classnames';
import { NumberRangeFilter } from '../../models/NumberRangeFilter';
import { useFiltersContext } from './FiltersContext';
import { InvalidIcon } from '../../icons/InvalidIcon';

/**
 * Props for RangeInput
 *
 * @public
 */
export interface RangeInputProps {
  /**
   * Returns the filter's display name based on the range values which is used when the filter
   * is displayed by other components such as AppliedFilters.
   *
   * @remarks
   * By default, the displayName separates the range with a dash such as '10 - 20'.
   * If the range is unbounded, it will display as 'Up to 20' or 'Over 10'.
   */
  getFilterDisplayName?: (value: NumberRangeValue) => string,
  /**
   * An optional element which renders in front of the input text.
   */
  inputPrefix?: JSX.Element,
  /** CSS classes for customizing the component styling defined by RangeInputCssClasses */
  customCssClasses?: RangeInputCssClasses
}

/**
 * The CSS class interface for RangeInput.
 *
 * @public
 */
export interface RangeInputCssClasses {
  rangeInputContainer?: string,
  input?: string,
  input___withPrefix?: string,
  input___withoutPrefix?: string,
  input___disabled?: string,
  input___enabled?: string,
  input___valid?: string,
  input___invalid?: string,
  inputContainer?: string,
  inputRowContainer?: string,
  buttonsContainer?: string,
  inputPrefix?: string,
  inputPrefix___disabled?: string,
  inputPrefix___enabled?: string,
  applyButton?: string,
  clearButton?: string,
  tooltipContainer?: string,
  tooltip?: string,
  invalidMessage?: string,
  invalidRowContainer?: string
}

const builtInCssClasses: Readonly<RangeInputCssClasses> = {
  rangeInputContainer: 'flex flex-col',
  input: 'w-full h-9 form-input cursor-pointer border rounded-md focus:ring-0 text-neutral-dark text-sm text-right appearance-none leading-9',
  input___withPrefix: 'pl-[2.5rem]',
  input___withoutPrefix: 'px-2',
  input___disabled: 'bg-gray-50 placeholder:text-neutral-light cursor-not-allowed',
  input___enabled: 'placeholder:text-neutral',
  input___valid: 'border-gray-300 focus:border-primary',
  input___invalid: 'border-red-700 focus:border-red-700',
  inputContainer: 'relative',
  inputRowContainer: 'flex flex-row items-center space-x-3 group',
  buttonsContainer: 'flex flex-row items-center justify-between pt-2',
  inputPrefix: 'absolute left-2 top-2 text-sm',
  inputPrefix___disabled: 'text-neutral-light cursor-not-allowed',
  inputPrefix___enabled: 'text-neutral',
  applyButton: 'text-sm text-primary font-medium',
  clearButton: 'text-sm text-neutral font-medium',
  tooltipContainer: 'invisible group-hover:visible relative -top-6',
  tooltip: 'absolute z-10 left-0 whitespace-nowrap rounded shadow-lg p-3 text-sm bg-neutral-dark text-white',
  invalidMessage: 'pl-3 text-sm text-red-700',
  invalidRowContainer: 'pt-2 flex flex-row items-center'
};

/**
 * Represents a single number range static filter which accepts user input.
 *
 * @public
 *
 * @param props - RangeInputProps
 */
export function RangeInput(props: RangeInputProps): JSX.Element | null {
  const { filters } = useFiltersContext();
  const { fieldId, setIsOptionsDisabled } = useFilterGroupContext();
  const {
    getFilterDisplayName = getDefaultFilterDisplayName,
    inputPrefix
  } = props;
  const cssClasses = useComposedCssClasses(builtInCssClasses, props.customCssClasses);
  const searchActions = useSearchActions();
  const [minRangeInput, setMinRangeInput] = useState<string>('');
  const [maxRangeInput, setMaxRangeInput] = useState<string>('');
  const staticFilters = useSearchState(state => state.filters.static);
  const isDisabled = filters.some(filter => filter.selected && filter.fieldId === fieldId);

  const rangeFilter: NumberRangeFilter = useMemo(() => {
    return {
      fieldId,
      matcher: Matcher.Between,
      value: parseNumberRangeInput(minRangeInput, maxRangeInput),
    };
  }, [fieldId, maxRangeInput, minRangeInput]);

  const isValid = isValidRange(rangeFilter.value);

   // Find a static filter which matches the current range input
  const matchingFilter = findSelectableFilter(rangeFilter, staticFilters ?? []);
  const isSelectedInAnswersState = matchingFilter?.selected === true;
  const hasUserInput = !!(minRangeInput || maxRangeInput);
  const shouldRenderApplyButton = hasUserInput && !isSelectedInAnswersState;

  useEffect(() => {
    setIsOptionsDisabled(hasUserInput);
  }, [hasUserInput, setIsOptionsDisabled]);

  const handleMinChange = useCallback(event => {
    const input = event?.target?.value;
    validateNumericInput(input) && setMinRangeInput(input);
  }, []);

  const handleMaxChange = useCallback(event => {
    const input = event?.target?.value;
    validateNumericInput(input) && setMaxRangeInput(input);
  }, []);

  const handleClickApply = useCallback(() => {
    if (!rangeFilter.value.start && !rangeFilter.value.end) {
      return;
    }
    if (!isValid) {
      return;
    }
    const displayName = getFilterDisplayName(rangeFilter.value);
    clearStaticRangeFilters(searchActions, new Set([fieldId]));
    searchActions.setFilterOption({
      ...rangeFilter,
      selected: true,
      displayName
    });
    searchActions.setOffset(0);
    executeSearch(searchActions);
  }, [searchActions, fieldId, getFilterDisplayName, isValid, rangeFilter]);

  const handleClickClear = useCallback(() => {
    const displayName = getFilterDisplayName(rangeFilter.value);
    searchActions.setFilterOption({
      ...rangeFilter,
      selected: false,
      displayName
    });
    setMinRangeInput('');
    setMaxRangeInput('');
    searchActions.setOffset(0);
    executeSearch(searchActions);
  }, [searchActions, getFilterDisplayName, rangeFilter]);

  const inputClasses = classNames(cssClasses.input, {
    [cssClasses.input___withPrefix ?? '']: !!inputPrefix,
    [cssClasses.input___withoutPrefix ?? '']: !inputPrefix,
    [cssClasses.input___disabled ?? '']: isDisabled,
    [cssClasses.input___enabled ?? '']: !isDisabled,
    [cssClasses.input___invalid ?? '']: !isValid,
    [cssClasses.input___valid ?? '']: isValid
  });

  const inputPrefixClasses = classNames(cssClasses.inputPrefix, {
    [cssClasses.inputPrefix___disabled ?? '']: isDisabled,
    [cssClasses.inputPrefix___enabled ?? '']: !isDisabled,
  });

  function renderInput(value: string, onChange: (event: unknown) => void, placeholder: string) {
    return (
      <div className={cssClasses.inputContainer}>
        {inputPrefix && <span className={inputPrefixClasses} aria-hidden="true">{inputPrefix}</span>}
        <input
          type='text'
          inputMode='decimal'
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          className={inputClasses}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <div className={cssClasses.rangeInputContainer}>
      <div className={cssClasses.inputRowContainer}>
        {renderInput(minRangeInput, handleMinChange, 'Min')}
        <div className='w-2.5 text-sm text-neutral'>-</div>
        {renderInput(maxRangeInput, handleMaxChange, 'Max')}
        {isDisabled &&
        <div className={cssClasses.tooltipContainer}>
          <div className={cssClasses.tooltip}>
            Unselect an option to enter in a range.
          </div>
        </div>
        }
      </div>
      {!isValid &&
        <div className={cssClasses.invalidRowContainer}>
          <InvalidIcon/>
          <div className={cssClasses.invalidMessage}>Invalid range</div>
        </div>
      }
      {hasUserInput &&
        <div className={cssClasses.buttonsContainer}>
          <button
            className={cssClasses.clearButton}
            onClick={handleClickClear}
          >
            Clear min and max
          </button>
          {shouldRenderApplyButton &&
            <button
              className={cssClasses.applyButton}
              onClick={handleClickApply}
            >
              Apply
            </button>
          }
        </div>
      }
    </div>
  );
}

/**
 * Creates the filter's display name based on the number range.
 */
function getDefaultFilterDisplayName(numberRange: NumberRangeValue) {
  const start = numberRange.start;
  const end = numberRange.end;

  if (start && end) {
    return `${start.value} - ${end.value}`;
  } else if (start && !end) {
    return `Over ${start.value}`;
  } else if (end && !start) {
    return `Up to ${end.value}`;
  }
  return '';
}

/**
 * Returns true only if the provided string passes the numeric validation.
 *
 * @remarks
 * Allows whole numbers and numbers with a single period.
 */
function validateNumericInput(str: string) {
  const numberRegex = new RegExp(/^\d*\.?\d*$/);
  return numberRegex.test(str);
}

/**
 * Determines if the range is valid.
 */
function isValidRange(range: NumberRangeValue): boolean {
  if (range.start && range.end) {
    return range.start.value <= range.end.value;
  }
  return true;
}