import React from 'react';

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
  apiKey: string,
  centerLatitude: number,
  centerLongitude: number,
  defaultZoom: number,
  showEmptyMap: boolean,
  customCssClasses?: MapboxCssClasses
}

const builtInCssClasses: Readonly<MapboxCssClasses> = {
  mapboxContainer: 'h-96 mb-6'
};

/**
 * A component that renders a map with markers to show result locations.
 *
 * @param props - {@link MapboxProps}
 * @returns A React element conatining a Google Map
 *
 * @public
 */
export function Mapbox({
  apiKey,
  centerLatitude,
  centerLongitude,
  defaultZoom: zoom,
  showEmptyMap,
  customCssClasses
}: MapboxProps) {

  return (
    <div>
    </div>

  );
}

