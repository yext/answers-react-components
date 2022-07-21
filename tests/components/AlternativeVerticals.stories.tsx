import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext } from '@yext/search-headless-react';

import { AlternativeVerticals, AlternativeVerticalsProps } from '../../src/components/AlternativeVerticals';

import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { VerticalSearcherState } from '../__fixtures__/headless-state';
import { verticalNoResults } from '../__fixtures__/data/vertical/noresults';

const meta: ComponentMeta<typeof AlternativeVerticals> = {
  title: 'AlternativeVerticals',
  component: AlternativeVerticals,
};
export default meta;

const mockedHeadlessState = {
  ...VerticalSearcherState,
  vertical: verticalNoResults
};

const verticalConfigMap = {
  faqs: { label: 'FAQs' },
  events: { label: 'Events' },
  locations: { label: 'Locations' }
};

export const Primary = (args: AlternativeVerticalsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <AlternativeVerticals
        currentVerticalLabel='Jobs'
        verticalConfigMap={verticalConfigMap}
        displayAllOnNoResults={false}
        {...args}
      />
    </SearchHeadlessContext.Provider>
  );
};

export const DisplayAllOnNoResults = (args: AlternativeVerticalsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(mockedHeadlessState)}>
      <AlternativeVerticals
        currentVerticalLabel='Jobs'
        verticalConfigMap={verticalConfigMap}
        displayAllOnNoResults={true}
        {...args}
      />
    </SearchHeadlessContext.Provider>
  );
};

export const Loading = (args: AlternativeVerticalsProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless({
      ...mockedHeadlessState,
      searchStatus: {
        isLoading: true
      }
    })}>
      <AlternativeVerticals
        currentVerticalLabel='Jobs'
        verticalConfigMap={verticalConfigMap}
        displayAllOnNoResults={true}
        {...args}
      />
    </SearchHeadlessContext.Provider>
  );
};
