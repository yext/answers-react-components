import { DisplayableFacet } from '@yext/search-headless-react';
import { ReactNode, useCallback, useState } from 'react';
import { useComposedCssClasses } from '../../hooks/useComposedCssClasses';
import { HierarchicalFacetNode, HierarchicalFacetTree, useHierarchicalFacetTree } from '../../hooks/useHierarchicalFacetTree';
import { useFiltersContext } from './FiltersContext';

/**
 * Props for HierarchicalFacetDisplay
 *
 * @public
 */
export interface HierarchicalFacetDisplayProps {
  /** The `DisplayableFacet` to render as a HierarchicalFacetDisplay. */
  facet: DisplayableFacet,
  /** {@inheritDoc HierarchicalFacetsProps.delimiter} */
  delimiter?: string,
  /** {@inheritDoc HierarchicalFacetsProps.showMoreLimit} */
  showMoreLimit?: number,
  /**
   * CSS classes for customizing the component styling
   * of HierarchicalFacetDisplayCssClasses.
   */
  customCssClasses?: HierarchicalFacetDisplayCssClasses
}

/**
 * The CSS class interface for HierarchicalFacetDisplay.
 *
 * @public
 */
export interface HierarchicalFacetDisplayCssClasses {
  treeContainer?: string,
  allCategoriesOption___active?: string,
  allCategoriesOption___inactive?: string,
  availableOption__active?: string,
  availableOption__inactive?: string,
  parentCategory?: string,
  currentCategory?: string,
  showMoreButton?: string
}

const builtInCssClasses: Readonly<HierarchicalFacetDisplayCssClasses> = {
  treeContainer: 'flex flex-col items-start',
  allCategoriesOption___active: 'font-semibold mb-2 text-sm',
  allCategoriesOption___inactive: 'mb-2 text-sm',
  availableOption__active: 'font-semibold ml-4 mb-2 text-sm',
  availableOption__inactive: 'ml-4 mb-2 text-sm',
  parentCategory: 'mb-2 text-sm',
  currentCategory: 'font-semibold mb-2 text-sm',
  showMoreButton: 'ml-4 text-sm font-medium text-primary'
};

export const DEFAULT_HIERARCHICAL_DELIMITER = '>';

/**
 * A HierarchicalFacetDisplay takes a `DisplayableFacet` and renders the facet in a way
 * to represent multiple levels of "hierarchies".
 *
 * The hierarchies are determined by the provided delimiter, which defaults to "\>".
 *
 * @public
 */
export function HierarchicalFacetDisplay({
  facet,
  delimiter = DEFAULT_HIERARCHICAL_DELIMITER,
  showMoreLimit = 4,
  customCssClasses
}: HierarchicalFacetDisplayProps): JSX.Element {
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses);
  const tree = useHierarchicalFacetTree(facet, delimiter);
  const [isShowingMore, setIsShowingMore] = useState(false);
  const resetShowMore = useCallback(() => setIsShowingMore(false), []);
  const toggleShowMore = useCallback(() => {
    setIsShowingMore(!isShowingMore);
  }, [isShowingMore]);

  /** Iteratively parses the `HierarchicalFacetTree` into an array of ReactNodes */
  function renderTree(): ReactNode[] {
    let treePointer: HierarchicalFacetTree = tree;
    const renderedNodesAndShowMoreButton: ReactNode[] = [renderAllCategoriesButton()];

    while (treePointer) {
      const currentNodes = Object.values(treePointer);
      const selectedChildNode = currentNodes.find(n => n.selected);
      const selectedHasNoChildren =
        selectedChildNode && Object.values(selectedChildNode.childTree).length === 0;
      const activeParentNode = currentNodes.find(n => n.hasSelectedChild);

      if ((!selectedChildNode && !activeParentNode) || selectedHasNoChildren) {
        renderedNodesAndShowMoreButton.push(...renderAvailableOptions(currentNodes));
        if (currentNodes.length > showMoreLimit) {
          renderedNodesAndShowMoreButton.push(renderShowMoreButton());
        }
        break;
      }

      const activeNode = selectedChildNode ?? activeParentNode;
      if (!activeNode) {
        break;
      }
      renderedNodesAndShowMoreButton.push(
        renderCategory(activeNode, facet.fieldId));
      treePointer = activeNode.childTree;
    }

    return renderedNodesAndShowMoreButton;
  }

  function renderAllCategoriesButton() {
    return (
      <AllCategories
        key='_AllCategories'
        activeClassName={cssClasses.allCategoriesOption___active}
        inactiveClassName={cssClasses.allCategoriesOption___inactive}
        facet={facet}
        resetShowMore={resetShowMore}
      />
    );
  }

  function renderAvailableOptions(nodes: HierarchicalFacetNode[]) {
    const nodesToRender = isShowingMore ? nodes : nodes.slice(0, showMoreLimit);
    return nodesToRender.map(n =>
      <AvailableOption
        key={n.lastDisplayNameToken}
        activeClassName={cssClasses.availableOption__active}
        inactiveClassName={cssClasses.availableOption__inactive}
        fieldId={facet.fieldId}
        currentNode={n}
        resetShowMore={resetShowMore}
        siblingNodes={nodes.filter(siblingNode => siblingNode !== n)}
      />
    );
  }

  function renderShowMoreButton() {
    return <ShowMoreButton
      key='_ShowMoreButton'
      className={cssClasses.showMoreButton}
      isShowingMore={isShowingMore}
      toggleShowMore={toggleShowMore}
    />;
  }

  function renderCategory(selectedNode: HierarchicalFacetNode, fieldId: string) {
    const sharedProps = {
      key: selectedNode.lastDisplayNameToken,
      resetShowMore,
      selectedNode,
      fieldId
    };

    if (selectedNode.hasSelectedChild) {
      return <ParentCategory className={cssClasses.parentCategory} {...sharedProps}/>;
    } else {
      return <CurrentCategory className={cssClasses.currentCategory} {...sharedProps}/>;
    }
  }

  return (
    <div className={cssClasses.treeContainer}>
      {renderTree()}
    </div>
  );
}

/**
 * A hard-coded "All Categories" button that can be used to reset the HierarchicalFacetDisplay
 * to its initial state, i.e. with no options selected.
 */
function AllCategories({ facet, inactiveClassName, activeClassName, resetShowMore }: {
  facet: DisplayableFacet,
  activeClassName?: string,
  inactiveClassName?: string,
  resetShowMore: () => void
}) {
  const { applyFilters, selectFilter } = useFiltersContext();
  const handleClickAllCategories = useCallback(() => {
    facet.options
      .filter(o => o.selected)
      .forEach(o => selectFilter({ ...o, fieldId: facet.fieldId, selected: false }));
    applyFilters();
    resetShowMore();
  }, [applyFilters, facet.fieldId, facet.options, resetShowMore, selectFilter]);

  if (facet.options.find(o => o.selected)) {
    return (
      <button
        className={inactiveClassName}
        onClick={handleClickAllCategories}
      >
        All Categories /
      </button>
    );
  }

  return (
    <div className={activeClassName}>All Categories</div>
  );
}

/** An option currently available for selection or deselection. */
function AvailableOption(props: {
  fieldId: string,
  activeClassName?: string,
  inactiveClassName?: string,
  resetShowMore: () => void,
  currentNode: HierarchicalFacetNode,
  siblingNodes: HierarchicalFacetNode[]
}) {
  const { fieldId, currentNode, activeClassName, inactiveClassName, resetShowMore, siblingNodes } = props;
  const { applyFilters, selectFilter } = useFiltersContext();
  const { selected, lastDisplayNameToken, facetOption } = currentNode;
  const handleClickAvailableOptions = useCallback(() => {
    siblingNodes.filter(n => n.selected).forEach(n => selectFilter({
      ...n.facetOption,
      selected: false,
      fieldId
    }));
    selectFilter({
      ...facetOption,
      selected: !selected,
      fieldId
    });
    const parentFacetOption = currentNode.parentNode?.facetOption;
    parentFacetOption && selectFilter({
      ...parentFacetOption,
      selected,
      fieldId
    });
    applyFilters();
    resetShowMore();
  }, [
    applyFilters,
    currentNode.parentNode?.facetOption,
    facetOption,
    fieldId,
    resetShowMore,
    selectFilter,
    selected,
    siblingNodes
  ]);

  return (
    <button
      className={selected ? activeClassName : inactiveClassName}
      onClick={handleClickAvailableOptions}
    >
      {lastDisplayNameToken}
    </button>
  );
}

/** A parent category that is not the most immediate one. */
function ParentCategory({ fieldId, selectedNode, className, resetShowMore }: {
  fieldId: string,
  selectedNode: HierarchicalFacetNode,
  className?: string,
  resetShowMore: () => void
}) {
  const { applyFilters, selectFilter } = useFiltersContext();

  const deselectChildOptions = useCallback((node: HierarchicalFacetNode) => {
    const tree = node.childTree;
    Object.values(tree).forEach(n => {
      selectFilter({
        ...n.facetOption,
        selected: false,
        fieldId
      });
      deselectChildOptions(n);
    });
  }, [fieldId, selectFilter]);

  const handleClickParentCategory = useCallback(() => {
    selectFilter({
      ...selectedNode.facetOption,
      selected: true,
      fieldId
    });
    deselectChildOptions(selectedNode);
    applyFilters();
    resetShowMore();
  }, [applyFilters, deselectChildOptions, fieldId, resetShowMore, selectFilter, selectedNode]);

  return (
    <button className={className} onClick={handleClickParentCategory}>
      {selectedNode.lastDisplayNameToken + ' /'}
    </button>
  );
}

/** The currently selected category, i.e. the most immediate category. */
function CurrentCategory({ fieldId, selectedNode, className, resetShowMore }: {
  fieldId: string,
  selectedNode: HierarchicalFacetNode,
  className?: string,
  resetShowMore: () => void
}) {
  const { applyFilters, selectFilter } = useFiltersContext();
  const handleClickCurrentCategory = useCallback(() => {
    selectFilter({
      ...selectedNode.facetOption,
      selected: false,
      fieldId
    });
    const parentFacetOption = selectedNode.parentNode?.facetOption;
    parentFacetOption && selectFilter({
      ...parentFacetOption,
      selected: true,
      fieldId
    });
    applyFilters();
    resetShowMore();
  }, [
    applyFilters,
    fieldId,
    resetShowMore,
    selectFilter,
    selectedNode.facetOption,
    selectedNode.parentNode?.facetOption
  ]);

  return (
    <button
      className={className}
      onClick={handleClickCurrentCategory}
    >
      {selectedNode.lastDisplayNameToken}
    </button>
  );
}

/** The "Show more/less" button for hiding/showing additional `AvailableOption`s */
function ShowMoreButton({ className, isShowingMore, toggleShowMore }: {
  className?: string,
  isShowingMore: boolean,
  toggleShowMore: () => void
}) {
  return (
    <button className={className} onClick={toggleShowMore}>
      {isShowingMore ? 'Show less' : 'Show more'}
    </button>
  );
}