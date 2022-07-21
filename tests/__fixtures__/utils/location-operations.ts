import {
  SearchActions,
  LatLong,
  SearchIntent,
} from '@yext/search-headless-react';

let isFetching = false;
let userLocation: LatLong = {
  latitude: 38.9072,
  longitude: -77.0369
};

export async function updateLocationIfNeeded(
  searchActions: SearchActions,
  intents: SearchIntent[],
  _geolocationOptions?: PositionOptions
): Promise<void> {
  if (intents.includes(SearchIntent.NearMe) && !searchActions.state.location.userLocation && !isFetching) {
    searchActions.setUserLocation(userLocation);
  }
}

export async function getUserLocation(_geolocationOptions?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, _) => {
    if (!isFetching) {
      resolve({
        coords: userLocation,
        timestamp: new Date().getTime()
      } as GeolocationPosition);
    }
  });
}

export function decorator(story, { parameters }) {
  if (parameters?.geoLocation) {
    const geoLocation = parameters.geoLocation;
    if (geoLocation.isFetching) {
      isFetching = geoLocation.isFetching;
    }
    if (geoLocation.userLocation) {
      userLocation = geoLocation.userLocation;
    }
  }
  return story();
}
