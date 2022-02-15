import classNames from 'classnames';
import { ReactNode } from 'react';
import ChevronIcon from '../../icons/ChevronIcon';
import CollapseButton from './CollapseButton';
import { useFilterGroupContext } from './FilterGroupContext';
import Label from './Label';

export type CollapsibleLabelProps = {
  children?: ReactNode
};

/**
 * CollapsibleLabel is a convenience wrapper for a {@link CollapseButton}
 * with a simple {@link Label} and rotating icon.
 *
 * For more customization, use the individual subcomponents.
 */
export default function CollapsibleLabel({ children }: CollapsibleLabelProps): JSX.Element {
  const { isExpanded } = useFilterGroupContext();
  const iconClassName = classNames('w-3', {
    'transform rotate-180': !isExpanded
  });

  return (
    <CollapseButton>
      <Label>{children}</Label>
      <ChevronIcon className={iconClassName}/>
    </CollapseButton>
  );
}