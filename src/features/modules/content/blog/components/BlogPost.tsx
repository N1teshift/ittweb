import { ReactNode } from 'react';

type BlogPostProps = {
  title: string;
  date?: string;
  author?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function BlogPost({ title, date, author, children, footer }: BlogPostProps) {
  return (
    <article className="max-w-4xl w-full mx-auto">
      {/* Header Section */}
      <header className="mb-6 space-y-4">
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-400 font-medieval leading-tight tracking-tight">
            {title}
          </h1>
          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full opacity-80"></div>
        </div>
        
        {/* Metadata */}
        {(date || author) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 pt-2">
            {date && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{date}</span>
              </div>
            )}
            {author && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-300">
                  <span className="text-gray-400">By</span> <span className="font-medium text-amber-400/90">{author}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Content Section */}
      <div className="relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 rounded-xl -z-10"></div>
        
        {/* Main content box - removed border, using subtle top border only */}
        <div className="bg-black/40 backdrop-blur-md border-t border-amber-500/30 rounded-xl p-8 md:p-10 shadow-xl shadow-black/20 pt-8 transition-all duration-300">
          <div className="prose prose-invert prose-lg max-w-none 
            prose-headings:text-amber-300 prose-headings:font-bold
            prose-p:text-gray-200 prose-p:leading-relaxed
            prose-a:text-amber-400 prose-a:no-underline hover:prose-a:text-amber-300 hover:prose-a:underline
            prose-strong:text-gray-100 prose-strong:font-semibold
            prose-code:text-amber-300 prose-code:bg-black/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-l-amber-500/50 prose-blockquote:text-gray-300
            prose-ul:text-gray-200 prose-ol:text-gray-200
            prose-li:marker:text-amber-500/70">
            {children}
          </div>
          
          {footer && (
            <div className="mt-12 pt-8 border-t border-amber-500/20">
              {footer}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

