import { createElement, isValidElement, PropsWithChildren, ReactNode, useMemo, useRef, useState } from 'react';
import { DropdownContext, DropdownContextType } from './DropdownContext';
import { InputContext, InputContextType } from './InputContext';
import useGlobalListener from '@restart/hooks/useGlobalListener';
import useRootClose from '@restart/ui/useRootClose';
import { FocusContext, FocusContextType } from './FocusContext';
import { v4 as uuid } from 'uuid';
import { ScreenReader } from '../ScreenReader';
import { recursivelyMapChildren } from '../utils/recursivelyMapChildren';
import { DropdownItem, DropdownItemProps, DropdownItemWithIndex } from './DropdownItem';
import useLayoutEffect from 'use-isomorphic-layout-effect';

interface DropdownItemData {
  value: string,
  itemData?: Record<string, unknown>
}

export interface DropdownProps {
  screenReaderText: string,
  screenReaderInstructions?: string,
  parentQuery?: string,
  onSelect?: (value: string, index: number, focusedItemData: Record<string, unknown> | undefined) => void,
  onToggle?: (
    isActive: boolean,
    prevValue: string,
    value: string,
    index: number,
    focusedItemData: Record<string, unknown> | undefined
  ) => void,
  className?: string,
  activeClassName?: string
}

/**
 * Dropdown is the parent component for a set of Dropdown-related components.
 *
 * @remarks
 * It provides multiple shared contexts, which are consumed by its child components,
 * and also registers some global event listeners.
 */
export function Dropdown(props: PropsWithChildren<DropdownProps>): JSX.Element {
  const {
    children,
    screenReaderText,
    screenReaderInstructions = 'When autocomplete results are available, use up and down arrows to review and enter to select.',
    onSelect,
    onToggle,
    className,
    activeClassName,
    parentQuery,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const screenReaderUUID: string = useMemo(() => uuid(), []);
  const [screenReaderKey, setScreenReaderKey] = useState<number>(0);
  const [hasTyped, setHasTyped] = useState<boolean>(false);
  const [childrenWithDropdownItemsTransformed, items] = getTransformedChildrenAndItemData(children);

  const inputContext = useInputContextInstance();
  const { value, setValue, lastTypedOrSubmittedValue, setLastTypedOrSubmittedValue } = inputContext;

  const focusContext = useFocusContextInstance(
    items,
    lastTypedOrSubmittedValue,
    setValue,
    screenReaderKey,
    setScreenReaderKey
  );
  const { focusedIndex, focusedItemData, updateFocusedItem } = focusContext;

  const dropdownContext = useDropdownContextInstance(
    lastTypedOrSubmittedValue,
    value,
    focusedIndex,
    focusedItemData,
    screenReaderUUID,
    setHasTyped,
    onToggle,
    onSelect
  );
  const { toggleDropdown, isActive } = dropdownContext;

  useLayoutEffect(() => {
    if (parentQuery !== undefined && parentQuery !== lastTypedOrSubmittedValue) {
      setLastTypedOrSubmittedValue(parentQuery);
      updateFocusedItem(-1, parentQuery);
    }
  }, [parentQuery, lastTypedOrSubmittedValue, updateFocusedItem, setLastTypedOrSubmittedValue]);

  useRootClose(containerRef, () => {
    toggleDropdown(false);
  }, { disabled: !isActive });

  useGlobalListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
    }

    if (!isActive) {
      return;
    }

    if (e.key === 'ArrowDown') {
      updateFocusedItem(focusedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      updateFocusedItem(focusedIndex - 1);
    } else if (e.key === 'Tab' && !e.shiftKey) {
      if (items.length !== 0) {
        if (focusedIndex >= items.length - 1) {
          toggleDropdown(false);
          updateFocusedItem(-1);
        } else {
          updateFocusedItem(focusedIndex + 1);
          e.preventDefault();
        }
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      if (focusedIndex >= 0) {
        updateFocusedItem(focusedIndex - 1);
        e.preventDefault();
      } else {
        toggleDropdown(false);
      }
    } else if (!hasTyped) {
      setHasTyped(true);
    }
  });

  return (
    <div ref={containerRef} className={isActive ? activeClassName : className}>
      <DropdownContext.Provider value={dropdownContext}>
        <InputContext.Provider value={inputContext}>
          <FocusContext.Provider value={focusContext}>
            {childrenWithDropdownItemsTransformed}
          </FocusContext.Provider>
        </InputContext.Provider>
      </DropdownContext.Provider>

      <ScreenReader
        announcementKey={screenReaderKey}
        announcementText={isActive && (hasTyped || items.length || value) ? screenReaderText : ''}
        instructionsId={screenReaderUUID}
        instructions={screenReaderInstructions}
      />
    </div>
  );
}

function useInputContextInstance(): InputContextType {
  const [value, setValue] = useState('');
  const [lastTypedOrSubmittedValue, setLastTypedOrSubmittedValue] = useState('');
  return {
    value,
    setValue,
    lastTypedOrSubmittedValue,
    setLastTypedOrSubmittedValue
  };
}

function useFocusContextInstance(
  items: DropdownItemData[],
  lastTypedOrSubmittedValue: string,
  setValue: (newValue: string) => void,
  screenReaderKey: number,
  setScreenReaderKey: (newKey: number) => void
): FocusContextType {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const [focusedItemData, setFocusedItemData] = useState<Record<string, unknown> | undefined>(undefined);

  function updateFocusedItem(updatedFocusedIndex: number, value?: string) {
    const numItems = items.length;
    let updatedValue;
    if (updatedFocusedIndex === -1 || updatedFocusedIndex >= numItems || numItems === 0) {
      updatedValue = value ?? lastTypedOrSubmittedValue;
      setFocusedIndex(-1);
      setFocusedItemData(undefined);
      setScreenReaderKey(screenReaderKey + 1);
    } else if (updatedFocusedIndex < -1) {
      const loopedAroundIndex = (numItems + updatedFocusedIndex + 1) % numItems;
      updatedValue = value ?? items[loopedAroundIndex].value;
      setFocusedIndex(loopedAroundIndex);
      setFocusedItemData(items[loopedAroundIndex].itemData);
    } else {
      updatedValue = value ?? items[updatedFocusedIndex].value;
      setFocusedIndex(updatedFocusedIndex);
      setFocusedItemData(items[updatedFocusedIndex].itemData);
    }
    setFocusedValue(updatedValue);
    setValue(updatedValue);
  }

  return {
    focusedIndex,
    focusedValue,
    focusedItemData,
    updateFocusedItem
  };
}

function useDropdownContextInstance(
  prevValue: string,
  value: string,
  index: number,
  focusedItemData: Record<string, unknown> | undefined,
  screenReaderUUID: string,
  setHasTyped: (boolean) => void,
  onToggle?: (
    isActive: boolean,
    prevValue: string,
    value: string,
    index: number,
    focusedItemData: Record<string, unknown> | undefined
  ) => void,
  onSelect?: (value: string, index: number, focusedItemData: Record<string, unknown> | undefined) => void,
): DropdownContextType {
  const [isActive, _toggleDropdown] = useState(false);
  const toggleDropdown = (willBeOpen: boolean) => {
    if (!willBeOpen) {
      setHasTyped(false);
    }
    _toggleDropdown(willBeOpen);
    onToggle?.(willBeOpen, prevValue, value, index, focusedItemData);
  };
  return {
    isActive,
    toggleDropdown,
    onSelect,
    screenReaderUUID
  };
}

function getTransformedChildrenAndItemData(children: ReactNode): [ReactNode, DropdownItemData[]] {
  const items: DropdownItemData [] = [];
  const childrenWithDropdownItemsTransformed = recursivelyMapChildren(children, (child => {
    if (!(isValidElement(child) && child.type === DropdownItem)) {
      return child;
    }
    const props: DropdownItemProps = child.props;
    items.push({
      value: props.value,
      itemData: props.itemData
    });
    const transformedItem = createElement(DropdownItemWithIndex, { ...props, index: items.length - 1 });
    return transformedItem;
  }));

  return [childrenWithDropdownItemsTransformed, items];
}