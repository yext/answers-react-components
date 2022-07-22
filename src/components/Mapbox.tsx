import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Map, Marker, MapboxOptions, MarkerOptions } from 'mapbox-gl';
import { Result, useSearchState } from '@yext/search-headless-react';

/**
 * Interface for customizing the {@link Mapbox} map derived from Mapbox API's Map options.
 * The "container" field is set internally.
 *
 * @public
 */
export type MapboxCustomOptions = Omit<MapboxOptions, 'container'>;

/**
 * Props for the {@link Mapbox} component
 *
 * @public
 */
export interface MapboxProps {
  mapSize: string,
  mapboxApiKey: string,
  mapboxOptions?: MapboxCustomOptions,
  generateMarkerOptions?: (result?: Result, index?: number) => MarkerOptions,
}

/**
 * A component that renders a map with markers to show result locations.
 *
 * @param props - {@link MapboxProps}
 * @returns A React element conatining a Google Map
 *
 * @public
 */
export function Mapbox({
  mapSize,
  mapboxApiKey,
  mapboxOptions,
  generateMarkerOptions = defaultGenerateMarkerOptions
}: MapboxProps) {
  mapboxgl.accessToken = mapboxApiKey;
  const mapContainer = useRef(null);
  const map = useRef<Map|null>(null);
  const mapboxOptionsWithRef = useRef<MapboxOptions>();
  const mapboxStyle = mapboxOptions?.style ?? 'mapbox://styles/mapbox/streets-v11';

  const locationResults = useSearchState(state => state.vertical.results) || [];
  if (map.current) {
    for (const result of locationResults) {
      const markerLocation = getPosition(result);
      const div = document.createElement('div');
      div.className = '';

      new Marker(div).setLngLat(markerLocation).addTo(map.current);
    }
  }

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const options: MapboxOptions = {
        container: mapContainer.current,
        style: mapboxStyle,
        ...mapboxOptions
      };
      map.current = new Map(options);
      mapboxOptionsWithRef.current = options;
    }
  });

  return (
    <div ref={mapContainer} className={mapSize}/>
  );
}

function defaultGenerateMarkerOptions(): MarkerOptions {
  return {};
}

// TEMPORARY FIX
/* eslint-disable @typescript-eslint/no-explicit-any */
function getPosition(result: Result): [number, number]{
  const lat = (result.rawData as any).yextDisplayCoordinate.latitude;
  const lng = (result.rawData as any).yextDisplayCoordinate.longitude;
  return [lng, lat];
}

