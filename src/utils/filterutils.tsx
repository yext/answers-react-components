import { NearFilterValue, Filter, SelectableFilter, NumberRangeValue, Matcher, AnswersActions } from '@yext/answers-headless-react';
import isEqual from 'lodash/isEqual';
import { isNumberRangeFilter } from '../models/NumberRangeFilter';

/**
 * Check if the object follows NearFilterValue interface.
 */
export function isNearFilterValue(obj: unknown): obj is NearFilterValue {
  return typeof obj === 'object' && !!obj && 'radius' in obj && 'lat' in obj && 'long' in obj;
}

/**
 * Checks if the object follows the NumberRangeValue interface.
 */
export function isNumberRangeValue(obj: unknown): obj is NumberRangeValue {
  return typeof obj === 'object' && !!obj && ('start' in obj || 'end' in obj);
}

/**
 * Returns true if the two given filters are the same.
 */
export function isDuplicateFilter(thisFilter: Filter, otherFilter: Filter): boolean {
  if (thisFilter.fieldId !== otherFilter.fieldId) {
    return false;
  }
  if (thisFilter.matcher !== otherFilter.matcher) {
    return false;
  }
  if (!isEqual(thisFilter.value, otherFilter.value)) {
    return false;
  }
  return true;
}

/**
 * Finds the {@link SelectableFilter} from the list provided that matches the given {@link Filter}.
 * If no matching {@link SelectableFilter} can be found, undefined is returned.
 *
 * @param filter - The filter to match against.
 * @param selectableFilters - The list of {@link SelectableFilters} to search against.
 */
export function findSelectableFilter(
  filter: Filter,
  selectableFilters: SelectableFilter[]
): SelectableFilter | undefined {
  return selectableFilters.find(selectableFilter => {
    const { displayName: _, ...storedFilter } = selectableFilter;
    return isDuplicateFilter(storedFilter, filter);
  });
}

/**
 * Creates a number range value based on a min and max from user input.
 */
export function parseNumberRangeInput(minRangeInput: string, maxRangeInput: string): NumberRangeValue {
  const minRange = parseNumber(minRangeInput);
  const maxRange = parseNumber(maxRangeInput);

  return {
    ...(minRange !== undefined && {
      start: {
        matcher: Matcher.GreaterThanOrEqualTo,
        value: minRange
      }
    }),
    ...(maxRange !== undefined && {
      end: {
        matcher: Matcher.LessThanOrEqualTo,
        value: maxRange
      }
    })
  };
}

/**
 * Given a string, returns the corresponding number, or undefined if it is NaN.
 */
function parseNumber(num: string) {
  const parsedNum = parseFloat(num);
  if (isNaN(parsedNum)) {
    return undefined;
  }
  return parsedNum;
}

/**
 * Deselects the selected static number range filters in state.
 */
export function clearStaticRangeFilters(answersActions: AnswersActions){
  const selectedStaticRangeFilters = answersActions.state?.filters?.static?.filter(filter =>
    isNumberRangeFilter(filter) && filter.selected === true
  );
  selectedStaticRangeFilters?.forEach(filter => {
    answersActions.setFilterOption({
      ...filter,
      selected: false
    });
  });
}