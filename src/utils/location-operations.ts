import {
  SearchActions,
  SearchIntent,
} from '@yext/search-headless-react';

const defaultGeolocationOptions: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 6000,
  maximumAge: 300000,
};

/**
 * If the provided search intents include a 'NEAR_ME' intent and there's no existing
 * user's location in state, retrieve and store user's location in headless state.
 *
 * @public
 */
export async function updateLocationIfNeeded(
  searchActions: SearchActions,
  intents: SearchIntent[],
  geolocationOptions?: PositionOptions
): Promise<void> {
  if (intents.includes(SearchIntent.NearMe) && !searchActions.state.location.userLocation) {
    try {
      const position = await getUserLocation(geolocationOptions);
      searchActions.setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Retrieves user's location using nagivator.geolocation API.
 *
 * @public
 */
export async function getUserLocation(geolocationOptions?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        err => {
          console.error('Error occured using geolocation API. Unable to determine user\'s location.');
          reject(err);
        },
        { ...defaultGeolocationOptions, ...geolocationOptions }
      );
    } else {
      reject('No access to geolocation API. Unable to determine user\'s location.');
    }
  });
}
