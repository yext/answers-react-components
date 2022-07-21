# search-ui-react

<div>
  <a href="https://npmjs.org/package/@yext/search-ui-react">
    <img src="https://img.shields.io/npm/v/@yext/search-ui-react" alt="NPM version"/>
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-BSD%203--Clause-blue.svg" alt="License"/>
  </a>
  <a href='https://coveralls.io/github/yext/search-ui-react?branch=main'>
    <img src='https://coveralls.io/repos/github/yext/search-ui-react/badge.svg?branch=main' alt='Coverage Status' />
  </a>
</div>
<br>

A library of React Components for powering Yext Search integrations.

See the [full documentation](./docs/search-ui-react.md) here.

## Getting Started

If you are using NPM 7+, you can install the components with the following command:

```bash
npm install @yext/search-ui-react
```
The @yext/search-headless-react peer dependency will be automatically installed.

If you are using NPM 6 or Yarn, you can install the library and its peer dependencies with this command:
```bash
npx install-peerdeps @yext/search-ui-react
```
The command will work with Yarn so long as NPM 6+ is installed on the machine.

Once the library and its peer dependencies are installed, the components can be rendered using React by placing them inside the `SearchHeadlessProvider` with the appropriate credentials:

```tsx
import { SearchHeadlessProvider } from '@yext/search-headless-react';
import { SearchBar, UniversalResults } from '@yext/search-ui-react';

const config = {
  apiKey: '<apiKey>',
  experienceKey: '<experienceKey>',
  locale: 'en',
  experienceVersion: 'PRODUCTION',
}

function App() {
  return (
    <SearchHeadlessProvider {...config}>
      <SearchBar />
      <UniversalResults />
    </SearchHeadlessProvider>
  );
}

export default App;
```

To use the Component Library's Styling without adding Tailwind to your project, add the following import: 

```tsx
import '@yext/search-ui-react/bundle.css'
```