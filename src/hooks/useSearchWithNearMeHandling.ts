import { useSearchActions, AutocompleteResponse, SearchIntent } from '@yext/search-headless-react';
import { executeSearch, executeAutocomplete } from '../utils/search-operations';
import { updateLocationIfNeeded } from '../utils/location-operations';
import { MutableRefObject, useRef } from 'react';
import { onSearchFunc } from '../components/SearchBar';

/** The type of a function for executing a query and returning a promise. @public */
export type QueryFunc = () => Promise<void>;
/**
 * A ref which contains a promise of the latest autocomplete response in order get the
 * latest search intents.
 */
export type AutocompleteRef = MutableRefObject<Promise<AutocompleteResponse | undefined> | undefined>;

/**
 * Returns a search action that will handle near me searches, by first checking
 * for near me intents using an autocomplete request.
 *
 * @remarks
 * You can optionally use the provided ref to store autocomplete responses, to avoid
 * making unnecessary autocomplete requests.
 */
export function useSearchWithNearMeHandling(
  geolocationOptions?: PositionOptions,
  onSearch?: onSearchFunc
): [QueryFunc, AutocompleteRef] {
  /**
   * Allow a query search to wait on the response to the autocomplete request right
   * before the search execution in order to retrieve the search intents.
   */
  const autocompletePromiseRef = useRef<Promise<AutocompleteResponse | undefined>>();
  const searchActions = useSearchActions();

  async function executeQuery() {
    let intents: SearchIntent[] = [];
    if (!searchActions.state.location.userLocation) {
      if (!autocompletePromiseRef.current) {
        autocompletePromiseRef.current = executeAutocomplete(searchActions);
      }
      const autocompleteResponseBeforeSearch = await autocompletePromiseRef.current;
      intents = autocompleteResponseBeforeSearch?.inputIntents || [];
      await updateLocationIfNeeded(searchActions, intents, geolocationOptions);
    }
    const verticalKey = searchActions.state.vertical.verticalKey ?? '';
    const query = searchActions.state.query.input ?? '';
    onSearch
      ? onSearch({ verticalKey, query })
      : executeSearch(searchActions);
  }
  return [executeQuery, autocompletePromiseRef];
}