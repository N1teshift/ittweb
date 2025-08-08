import ClassIcon from '@/features/guides/components/ClassIcon';

type Props = {
  slug: string;
  name: string;
  summary?: string;
};

export default function ClassHeader({ slug, name, summary }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <ClassIcon slug={slug} name={name} />
        <h1 className="font-medieval-brand text-4xl md:text-5xl">{name}</h1>
      </div>
      {summary && <p className="text-gray-300">{summary}</p>}
    </div>
  );
}


