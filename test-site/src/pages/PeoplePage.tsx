import { useLayoutEffect } from 'react';
import { useSearchActions } from '@yext/search-headless-react';
import {
  AppliedFilters,
  FilterSearch,
  ResultsCount,
  SearchBar,
  StandardCard,
  VerticalResults,
  LocationBias,
  StaticFilters,
  StandardFacets,
  HierarchicalFacets,
  ApplyFiltersButton,
  Pagination,
  NumericalFacets,
  AlternativeVerticals
} from '@yext/search-ui-react';

const hierarchicalFacetFieldIds = ['c_hierarchicalFacet'];

export function PeoplePage() {
  const searchActions = useSearchActions();
  useLayoutEffect(() => {
    searchActions.setVertical('people');
    searchActions.executeVerticalQuery();
  });

  return (
    <div>
      <SearchBar />
      <div className='flex'>
        <div className='w-56 shrink-0 mr-5'>
          <FilterSearch
            searchFields={[{ fieldApiName: 'name', entityType: 'ce_person' }]}
            searchOnSelect={true}
            label='Filters'
          />
          <div className='w-full h-px bg-gray-200 my-4' />
          <NumericalFacets searchOnChange={false} />
          <StandardFacets
            searchOnChange={false}
            excludedFieldIds={hierarchicalFacetFieldIds}
          />
          <HierarchicalFacets
            collapsible={true}
            searchOnChange={false}
            includedFieldIds={hierarchicalFacetFieldIds}
          />
          <StaticFilters
            fieldId='c_employeeCountry'
            title='Employee Country'
            filterOptions={[
              { value: 'United States' },
              { value: 'UK' }
            ]}
            searchOnChange={false}
          />
          <br />
          <ApplyFiltersButton />
        </div>
        <div className='flex-grow'>
          <AlternativeVerticals
            currentVerticalLabel='People'
            verticalConfigMap={{
              products: { label: 'Products' }
            }}
          />
          <div className='flex items-baseline'>
            <ResultsCount />
            <AppliedFilters hierarchicalFacetsFieldIds={hierarchicalFacetFieldIds} />
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
