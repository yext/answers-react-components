import { provideHeadless, useSearchActions } from '@yext/search-headless-react';
import {
  DirectAnswer,
  DropdownItem,
  ResultsCount,
  SearchBar,
  SpellCheck,
  UniversalResults,
  VisualAutocompleteConfig
} from '@yext/search-ui-react';
import classNames from 'classnames';
import { useLayoutEffect } from 'react';
// import { CustomCard } from '../components/CustomCard';
// import { CustomCard2 } from '../components/CustomCard2';
// import { CustomSection } from '../components/CustomSection';
import { config } from '../config';


const visualAutocompleteConfig: VisualAutocompleteConfig = {
  entityPreviewSearcher: provideHeadless({
    ...config,
    headlessId: 'visual-autocomplete'
  }),
  restrictVerticals: ['people'],
  renderEntityPreviews: (isLoading, verticalKeyToResults, dropdownItemProps) => {
    if (!verticalKeyToResults.people) {
      return null;
    }

    const { results } = verticalKeyToResults.people;
    const containerClassName = classNames({
      'opacity-50': isLoading,
      'flex ml-4 mt-1': true
    });

    return (
      <div className={containerClassName}>
        {results.map((r, index) =>
          <DropdownItem
            value={r.name ?? ''}
            key={index + '-' + r.name}
            className='flex flex-col mb-3 mr-4 border rounded-md p-3 text-lg hover:bg-gray-100'
            focusedClassName='flex flex-col mb-3 mr-4 border rounded-md p-3 text-lg bg-gray-100'
            {...dropdownItemProps}
          >
            {r.name}
          </DropdownItem>
        )}
      </div>
    )
  }
}

const customSearchBarCss = {
  searchBarContainer: 'mb-3 text-emerald-800'
};

export default function UniversalPage(): JSX.Element {
  const searchActions = useSearchActions();
  useLayoutEffect(() => {
    searchActions.setUniversal();
    searchActions.executeUniversalQuery();
  });

  return (
    <div>
      <SearchBar
        visualAutocompleteConfig={visualAutocompleteConfig}
        customCssClasses={customSearchBarCss}
      />
      <SpellCheck />
      <DirectAnswer />
      <ResultsCount />
      <UniversalResults
        verticalConfigMap={{
          people: {}
        }}
      />
      {/* Test generic result type  */}
      {/* <UniversalResults
        verticalConfigMap={{
          people: {
            CardComponent: CustomCard,
            SectionComponent: CustomSection
          },
          products: {
            CardComponent: CustomCard2
          },
          links: {
            SectionComponent: CustomSection
          }
        }}
      /> */}
    </div>
  );
}