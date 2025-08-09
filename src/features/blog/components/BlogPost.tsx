import { ReactNode } from 'react';

type BlogPostProps = {
  title: string;
  date?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function BlogPost({ title, date, children, footer }: BlogPostProps) {
  return (
    <article className="prose prose-invert max-w-3xl w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-400 font-medieval">{title}</h1>
        {date ? <p className="text-sm text-gray-400 mt-2">{date}</p> : null}
      </header>
      <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8">
        {children}
        {footer ? <div className="mt-10">{footer}</div> : null}
      </div>
    </article>
  );
}


