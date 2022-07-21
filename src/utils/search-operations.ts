import {
  SearchActions,
  AutocompleteResponse,
  SearchIntent,
  SearchTypeEnum
} from '@yext/search-headless-react';

/**
 * Executes a universal/vertical search.
 *
 * @public
 */
export async function executeSearch(searchActions: SearchActions): Promise<void> {
  const isVertical = searchActions.state.meta.searchType === SearchTypeEnum.Vertical;
  try {
    isVertical
      ? searchActions.executeVerticalQuery()
      : searchActions.executeUniversalQuery();
  } catch (e) {
    console.error(`Error occured executing a ${isVertical ? 'vertical': 'universal'} search.\n`, e);
  }
}

/**
 * Executes a universal/vertical autocomplete search and return the corresponding response.
 *
 * @public
 */
export async function executeAutocomplete(
  searchActions: SearchActions
): Promise<AutocompleteResponse | undefined> {
  const isVertical = searchActions.state.meta.searchType === SearchTypeEnum.Vertical;
  try {
    return isVertical
      ? searchActions.executeVerticalAutocomplete()
      : searchActions.executeUniversalAutocomplete();
  } catch (e) {
    console.error(`Error occured executing a ${isVertical ? 'vertical': 'universal'} autocomplete search.\n`, e);
  }
}

/**
 * Get search intents of the current query stored in headless using autocomplete request.
 *
 * @public
 */
export async function getSearchIntents(
  searchActions: SearchActions
): Promise<SearchIntent[] | undefined> {
  const results = await executeAutocomplete(searchActions);
  return results?.inputIntents;
}
