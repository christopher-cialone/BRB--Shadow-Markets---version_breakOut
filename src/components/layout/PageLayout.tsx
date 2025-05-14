import React, { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <div className="page-container">
      <header className="page-header mb-6">
        <h1 className="text-neon-pink text-3xl mb-2 font-pixel">{title}</h1>
        {subtitle && (
          <p className="text-cyan-300 mb-4 text-sm md:text-base">
            {subtitle}
          </p>
        )}
        <div className="h-1 w-1/3 bg-neon-purple opacity-70 rounded-full mb-4"></div>
      </header>
      
      <main>
        {children}
      </main>
    </div>
  );
};