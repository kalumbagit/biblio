// ui/Table.tsx
import React from "react";
import { cn } from "../../utils/cn";  // Utilitaire pour gérer les classes conditionnelles

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className="overflow-x-auto shadow-md rounded-lg">
    <table className={cn("min-w-full divide-y divide-gray-200", className)}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50 hidden md:table-header-group">{children}</thead>
);

export const TableHead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={cn("px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", className)}>
    {children}
  </th>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={cn("block md:table-row border-b md:border-none mb-4 md:mb-0 last:mb-0", className)}>
    {children}
  </tr>
);

export const TableCell = ({ 
  children, 
  className, 
  "data-label": dataLabel,
  "data-header": dataHeader 
}: { 
  children: React.ReactNode; 
  className?: string;
  "data-label"?: string;
  "data-header"?: string;
}) => (
  <td 
    className={cn(
      "px-3 md:px-6 py-4 block md:table-cell whitespace-nowrap text-sm text-gray-900", 
      "before:content-[attr(data-header)] before:block before:text-xs before:font-medium before:text-gray-500 before:uppercase md:before:hidden",
      className
    )}
    data-header={dataHeader || dataLabel}
  >
    {children}
  </td>
);

// Version alternative avec card layout sur mobile
export const ResponsiveTable = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-4 md:space-y-0 md:block", className)}>
    {children}
  </div>
);

export const ResponsiveTableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("block md:hidden bg-white p-4 rounded-lg shadow-sm border", className)}>
    {children}
  </div>
);