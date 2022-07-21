import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Map, MapboxOptions, MarkerOptions } from 'mapbox-gl';
import { Result } from '@yext/answers-headless-react';
/**
 * Interface for customizing the {@link Mapbox} map derived from Mapbox API's Map options.
 * The "container" field is set internally.
 *
 * @public
 */
export interface MapboxCustomOptions extends Omit<MapboxOptions, 'container'> {
  style: mapboxgl.Style | string
};

/**
 * Props for the {@link Mapbox} component
 *
 * @public
 */
export interface MapboxProps {
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
  mapboxApiKey,
  mapboxOptions,
  generateMarkerOptions = defaultGenerateMarkerOptions,
}: MapboxProps) {
  mapboxgl.accessToken = mapboxApiKey;
  const mapContainer = useRef(null);
  const map = useRef<Map|null>(null);
  const mapboxOptionsWithRef = useRef<MapboxOptions>();

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const options: MapboxOptions = {
        container: mapContainer.current,
        ...mapboxOptions
      };
      map.current = new Map(options);
      mapboxOptionsWithRef.current = options;
    }
  });

  useEffect(() => {
    if (map.current) {
      map.current.resize();
    }
  });

  return (
    <div className='h-10'>
      <div ref={mapContainer} />
    </div>
  );
}

function defaultGenerateMarkerOptions(): MarkerOptions {
  return {};
}

