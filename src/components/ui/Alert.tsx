// components/ui/Alert.tsx
import React from "react";

interface AlertProps {
  variant: "success" | "error" | "warning";
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  children,
  className = "",
}) => {
  return (
    <div
      className={`border rounded-md p-4 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = "",
}) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};
