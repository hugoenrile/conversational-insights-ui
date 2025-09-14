import * as React from "react";

export const Card = ({ 
  children, 
  className = "", 
  onClick,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={`bg-card text-card-foreground rounded-xl shadow-sm border ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={`p-4 border-b border-border ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <h3 className={`text-lg font-semibold text-card-foreground ${className}`}>{children}</h3>;
};

export const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
