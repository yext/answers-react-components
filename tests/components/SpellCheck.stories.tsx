import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SearchHeadlessContext } from '@yext/search-headless-react';

import { SpellCheck, SpellCheckProps } from '../../src/components/SpellCheck';

import { generateMockedHeadless } from '../__fixtures__/search-headless';
import { VerticalSearcherState } from '../__fixtures__/headless-state';

const meta: ComponentMeta<typeof SpellCheck> = {
  title: 'SpellCheck',
  component: SpellCheck,
};
export default meta;

export const Primary = (args: SpellCheckProps) => {
  return (
    <SearchHeadlessContext.Provider value={generateMockedHeadless(VerticalSearcherState)}>
      <SpellCheck {...args} />
    </SearchHeadlessContext.Provider>
  );
};
