import { useAnswersActions } from '@yext/search-headless-react';
import {
  AppliedFilters,
  ResultsCount,
  SearchBar,
  StandardCard,
  VerticalResults,
  LocationBias,
  Mapbox,
  Pagination,
  MapboxCustomOptions
} from '@yext/search-ui-react';
import { useLayoutEffect } from 'react';

export function LocationsPage() {
  const answersActions = useAnswersActions();
  useLayoutEffect(() => {
    answersActions.setVertical('KM');
  });

  const mapboxOptions: MapboxCustomOptions = {
    center: [-70.9, 42.35],
    zoom: 10,
    style: 'mapbox://styles/mapbox/streets-v11',
  }

  return (
      <div>
        <SearchBar />
        <div className='flex'>
          <div className='min-w-fit pr-4'>
          </div>
          <div className='flex-grow'>
            <div className='flex items-baseline'>
              <ResultsCount />
              <AppliedFilters />
            </div>
            <Mapbox 
              mapboxApiKey='pk.eyJ1IjoieWV4dCIsImEiOiJqNzVybUhnIn0.hTOO5A1yqfpN42-_z_GuLw'
              mapboxOptions={mapboxOptions}
              />
            <VerticalResults
              CardComponent={StandardCard}
            />
            <Pagination />
            <LocationBias />
          </div>
        </div>
      </div>
  );
}