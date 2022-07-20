import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Map, MapboxOptions } from 'mapbox-gl';
/**
 * CSS class interface for the {@link Mapbox} component
 *
 * @public
 */
export interface MapboxCssClasses {
  mapboxContainer?: string
}

/**
 * Props for the {@link Mapbox} component
 *
 * @public
 */
export interface MapboxProps {
  mapboxApiKey: string,
  mapboxOptions: MapboxOptions,
  mapCenter?: {
    lat: number,
    lng: number
  }
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
  mapboxApiKey: apiKey,
}: MapboxProps) {
  mapboxgl.accessToken = apiKey;
  const mapContainer = useRef(null);
  const map = useRef<Map|null>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: zoom
      });
    }
  });

  return (
    <div>
      <div ref={mapContainer} />
    </div>
  );
}

