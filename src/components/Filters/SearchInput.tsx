import { useFilterGroupContext } from './FilterGroupContext';

export type SearchInputProps = {
  className?: string,
  placeholderText?: string
};

/**
 * SearchInput is a simple input component that updates the
 * active searchValue for a particular {@link FilterGroup}.
 */
export default function SearchInput(props: SearchInputProps): JSX.Element {
  const {
    className = 'text-sm bg-white h-9 w-full outline-none p-2 mb-2 rounded-md border border-gray-300 focus:border-blue-600',
    placeholderText = 'Search here...'
  } = props;
  const { searchValue, setSearchValue } = useFilterGroupContext();

  return (
    <input
      className={className}
      type='text'
      placeholder={placeholderText}
      value={searchValue}
      onChange={e => setSearchValue(e.target.value)}
    />
  );
}