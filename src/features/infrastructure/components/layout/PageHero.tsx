import React from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  description,
  className = '',
  titleClassName = '',
  descriptionClassName = ''
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <h1 className={`font-medieval-brand text-5xl md:text-6xl mb-8 ${titleClassName}`}>
        {title}
      </h1>
      {description && (
        <p className={`text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed ${descriptionClassName}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHero;

