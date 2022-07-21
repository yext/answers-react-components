import { DisplayableFacet, FacetOption } from '@yext/search-headless-react';
import { useMemo } from 'react';

/**
 * A tree of `HierarchicalFacetNode`s
 */
export type HierarchicalFacetTree = {
  [key: string]: HierarchicalFacetNode
};

/**
 * A single node of a `HierarchicalFacetTree`
 */
export type HierarchicalFacetNode = {
  selected: boolean,
  hasSelectedChild: boolean,
  facetOption: FacetOption,
  childTree: HierarchicalFacetTree,
  parentNode?: HierarchicalFacetNode,
  displayNameTokens: string[],
  lastDisplayNameToken: string
};

/**
 * Parses a `DisplayableFacet` into a `HierarchicalFacetTree`, then memoizes it.
 */
export function useHierarchicalFacetTree(
  hierarchicalFacet: DisplayableFacet,
  delimiter: string
): HierarchicalFacetTree {
  return useMemo(() => {
    return parseHierarchicalFacetTree(hierarchicalFacet, delimiter);
  }, [delimiter, hierarchicalFacet]);
}

/**
 * Parses a `DisplayableFacet` into a `HierarchicalFacetTree`.
 */
export function parseHierarchicalFacetTree(
  hierarchicalFacet: DisplayableFacet,
  delimiter: string
): HierarchicalFacetTree {
  const optionsInAscendingLength = hierarchicalFacet?.options.map(o => {
    const displayNameTokens = o.displayName.split(delimiter).map(s => s.trim());
    return {
      ...o,
      displayNameTokens
    };
  }).sort((a, b) => a.displayNameTokens.length - b.displayNameTokens.length) || [];

  const tree: HierarchicalFacetTree = {};

  optionsInAscendingLength.forEach(o => {
    const {
      displayNameTokens,
      displayName
    } = o;

    let currentTree: HierarchicalFacetTree = tree;
    let parentNode: HierarchicalFacetNode | undefined = undefined;

    for (const token of displayNameTokens.slice(0, -1)) {
      if (!(token in currentTree)) {
        console.error(
          `Error parsing hierarchical facet option "${displayName}" at token "${token}". Current tree:`,
          JSON.stringify(tree));
        return;
      }
      if (o.selected) {
        currentTree[token].hasSelectedChild = true;
      }
      parentNode = currentTree[token];
      currentTree = currentTree[token].childTree;
    }

    const lastDisplayNameToken = displayNameTokens[displayNameTokens.length - 1];
    currentTree[lastDisplayNameToken] = {
      selected: o.selected,
      displayNameTokens,
      lastDisplayNameToken,
      facetOption: {
        value: o.value,
        matcher: o.matcher
      },
      hasSelectedChild: false,
      childTree: {},
      parentNode: parentNode
    };
  });

  return tree;
}