import { useCallback } from 'react';
import { useFilterGroupContext } from './FilterGroupContext';

/**
 * Props for the {@link Filters.SearchInput}.
 *
 * @public
 */
export interface SearchInputProps {
  /** CSS class names applied to the input element. */
  className?: string,
  /** The input's placeholder text when no text has been entered by the user. */
  placeholderText?: string
}

/**
 * SearchInput is a simple input component that updates the
 * active searchValue for a particular {@link Filters.FilterGroup}.
 *
 * @param props - {@link Filters.SearchInputProps}
 *
 * @public
 */
export function SearchInput(props: SearchInputProps): JSX.Element {
  const {
    className = 'text-sm bg-white h-9 w-full outline-none p-2 mb-2 rounded-md border border-gray-300 focus:border-primary-600',
    placeholderText = 'Search here...'
  } = props;
  const { searchValue, setSearchValue } = useFilterGroupContext();
  const handleChange = useCallback(e => {
    setSearchValue(e.target.value);
  }, [setSearchValue]);

  return (
    <input
      className={className}
      type='text'
      placeholder={placeholderText}
      value={searchValue}
      onChange={handleChange}
    />
  );
}