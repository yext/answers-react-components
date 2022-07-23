import { VerticalResultsDisplay } from '../VerticalResultsDisplay';
import { SectionProps } from '../../models/sectionComponent';
import { StandardCard } from '../cards/standard/StandardCard';
import { useComposedCssClasses } from '../../hooks/useComposedCssClasses';
import { VerticalResultsCssClasses } from '../VerticalResults';

/**
 * The CSS class interface used for {@link StandardSection}.
 *
 * @public
 */
export interface StandardSectionCssClasses extends VerticalResultsCssClasses {
  section?: string
}

const builtInCssClasses: Readonly<StandardSectionCssClasses> = {
  section: ''
};

/**
 * The configuration for a StandardSection.
 *
 * @public
 */
export interface StandardSectionProps<T> extends SectionProps<T> {
  /** CSS classes for customizing the component styling. */
  customCssClasses?: StandardSectionCssClasses
}

/**
 * A component that displays all the results for a vertical using a standard section template.
 *
 * @public
 *
 * @param props - {@link StandardSectionProps}
 * @returns A React element for a standard section, or null if there are no results to display
 */
export function StandardSection<T>(props: StandardSectionProps<T>): JSX.Element | null {
  const cssClasses = useComposedCssClasses(builtInCssClasses, props.customCssClasses);
  const { results, CardComponent = StandardCard, header } = props;

  if (results.length === 0) {
    return null;
  }

  return (
    <section className={cssClasses.section}>
      {header}
      <VerticalResultsDisplay
        results={results}
        CardComponent={CardComponent}
        customCssClasses={cssClasses}
      />
    </section>
  );
}