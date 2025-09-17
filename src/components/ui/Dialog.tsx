// components/ui/Dialog.tsx
import React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogCloseProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-w-md w-full mx-4">{children}</div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className = "",
}) => {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className = "",
}) => {
  return (
    <p className={`text-gray-600 text-sm mb-4 ${className}`}>{children}</p>
  );
};

export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex justify-end space-x-3 mt-6 ${className}`}>
      {children}
    </div>
  );
};

export const DialogClose: React.FC<DialogCloseProps> = ({
  children,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded-full hover:bg-gray-100 ${className}`}
    >
      {children || <X className="w-5 h-5" />}
    </button>
  );
};
