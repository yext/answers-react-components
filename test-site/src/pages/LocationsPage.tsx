import { useSearchActions } from '@yext/search-headless-react';
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
  const answersActions = useSearchActions();
  useLayoutEffect(() => {
    answersActions.setVertical('KM');
  });

  const mapboxOptions: MapboxCustomOptions = {
    center: [-70.9, 42.35],
    zoom: 10,
    trackResize: true
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
            <div className='h-96 w-80'>
              <Mapbox
                mapSize = 'h-full w-full' 
                mapboxApiKey='pk.eyJ1IjoieWV4dCIsImEiOiJqNzVybUhnIn0.hTOO5A1yqfpN42-_z_GuLw'
                mapboxOptions={mapboxOptions}
                />
            </div>
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