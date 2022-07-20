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

// function UnwrappedGoogleMaps({
//   centerLatitude,
//   centerLongitude,
//   defaultZoom: zoom,
//   showEmptyMap,
//   providerOptions,
//   customCssClasses
// }: UnwrappedGoogleMapsProps) {
//   const ref = useRef<HTMLDivElement>(null);
//   const [map, setMap] = useState<google.maps.Map>();
//   const [center] = useState<google.maps.LatLngLiteral>({
//     lat: centerLatitude,
//     lng: centerLongitude
//   });

//   const locationResults = useAnswersState(state => state.vertical.results) || [];
//   const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);
//   const noResults = !locationResults.length;
//   let containerCssClass = cssClasses.googleMapsContainer;
//   if (noResults && !showEmptyMap) {
//     containerCssClass = twMerge(cssClasses.googleMapsContainer, 'hidden');
//   }

//   const bounds = new google.maps.LatLngBounds();
//   const markers = useRef<google.maps.Marker[]>([]);
//   deleteMarkers();

//   for (const result of locationResults) {
//     const position = getPosition(result);
//     const marker = new google.maps.Marker({
//       position,
//       map
//     });
//     const location = new google.maps.LatLng(position.lat, position.lng);
//     bounds.extend(location);
//     markers.current.push(marker);
//   }

//   useEffect(() => {
//     if (ref.current && !map) {
//       setMap(new window.google.maps.Map(ref.current, {
//         center,
//         zoom,
//         ...providerOptions
//       }));
//     }
//   }, [center, map, providerOptions, zoom]);

//   useEffect(() => {
//     if (markers.current.length > 0 && map){
//       map.fitBounds(bounds);
//       map.panToBounds(bounds);
//       const zoom = map.getZoom() ?? 0;
//       if (zoom > 15) {
//         map.setZoom(15);
//       }
//     }
//   });

//   function deleteMarkers(): void {
//     for (let i = 0; i < markers.current.length; i++) {
//       markers.current[i].setMap(null);
//     }
//     markers.current = [];
//   }

//   return (
//     <div className={containerCssClass} ref={ref} />
//   );
// }

// // TEMPORARY FIX
// /* eslint-disable @typescript-eslint/no-explicit-any */
// function getPosition(result: Result){
//   const lat = (result.rawData as any).yextDisplayCoordinate.latitude;
//   const lng = (result.rawData as any).yextDisplayCoordinate.longitude;
//   return { lat, lng };
// }
