import { useAnswersActions } from '@yext/answers-headless-react';
import {
  AppliedFilters,
  ResultsCount,
  SearchBar,
  StandardCard,
  VerticalResults,
  LocationBias,
  Mapbox,
  Pagination,
} from '@yext/answers-react-components';
import { useLayoutEffect } from 'react';

export function LocationsPage() {
  const answersActions = useAnswersActions();
  useLayoutEffect(() => {
    answersActions.setVertical('KM');
  });

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
              apiKey='pk.eyJ1IjoieWV4dCIsImEiOiJqNzVybUhnIn0.hTOO5A1yqfpN42-_z_GuLw'
              centerLatitude={37.540778} 
              centerLongitude={-77.433928} 
              defaultZoom={10} 
              showEmptyMap={false}
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

// export function LocationsPage() {
//   const answersActions = useAnswersActions();
//   useLayoutEffect(() => {
//     answersActions.setVertical('KM');
//   });

//   const customCssClasses: GoogleMapsCssClasses = {
//     googleMapsContainer: 'h-screen'
//   }

//   return (
//       <div>
//         <SearchBar />
//         <div className='flex'>
//           <div className='min-w-fit pr-4'>
//           </div>
//           <div className='flex-grow'>
//             <div className='flex items-baseline'>
//               <ResultsCount />
//               <AppliedFilters />
//             </div>
//             <div className='grid grid-cols-2 gap-4'>
//               <div>
//               <VerticalResults
//                 CardComponent={StandardCard}
//               />
//               </div>
//               <div>
//                 <GoogleMaps 
//                   apiKey='AIzaSyB5D45ghF1YMfqTLSzWubmlCN1euBVPhFw'
//                   centerLatitude={37.540778} 
//                   centerLongitude={-77.433928} 
//                   defaultZoom={10} 
//                   showEmptyMap={true}
//                   providerOptions={providerOptions}
//                   customCssClasses={customCssClasses}
//                 />
//               </div>
//             </div>
//             <Pagination />
//             <LocationBias />
//           </div>
//         </div>
//       </div>
//   );
// }

