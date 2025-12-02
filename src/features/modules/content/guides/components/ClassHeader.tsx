import ClassIcon from './ClassIcon';

/**
 * Props for the ClassHeader component
 */
type Props = {
  /** Unique identifier for the class */
  slug: string;
  /** Display name of the class */
  name: string;
  /** Optional description text for the class */
  summary?: string;
  /** Optional custom icon source path */
  iconSrc?: string;
};

/**
 * Displays a header section for a class/troll class with icon, title, and optional summary.
 * Used on individual class detail pages (/guides/classes/[slug], /guides/subclasses/[slug], etc.)
 */
export default function ClassHeader({ slug, name, summary, iconSrc }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <ClassIcon slug={slug} name={name} iconSrc={iconSrc} />
        <h1 className="font-medieval-brand text-4xl md:text-5xl">{name}</h1>
      </div>
      {summary && <p className="text-gray-300">{summary}</p>}
    </div>
  );
}



