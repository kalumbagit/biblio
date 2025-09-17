import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  animation?: "fadeIn" | "slideIn" | "scale" | "none";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  animation = "fadeIn",
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Petit délai pour permettre le rendu avant l'animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Délai correspondant à la durée de l'animation avant de démonter
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const animations = {
    fadeIn: {
      overlay: "opacity-0 transition-opacity duration-300",
      overlayVisible: "opacity-100",
      content: "opacity-0 scale-95 transition-all duration-300",
      contentVisible: "opacity-100 scale-100",
    },
    slideIn: {
      overlay: "opacity-0 transition-opacity duration-300",
      overlayVisible: "opacity-100",
      content: "opacity-0 translate-y-10 transition-all duration-300",
      contentVisible: "opacity-100 translate-y-0",
    },
    scale: {
      overlay: "opacity-0 transition-opacity duration-300",
      overlayVisible: "opacity-100",
      content: "opacity-0 scale-75 transition-all duration-300",
      contentVisible: "opacity-100 scale-100",
    },
    none: {
      overlay: "",
      overlayVisible: "",
      content: "",
      contentVisible: "",
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={cn(
            "fixed inset-0 bg-black bg-opacity-50",
            animations[animation].overlay,
            isVisible && animations[animation].overlayVisible
          )}
          onClick={onClose}
        />
        <div
          className={cn(
            "relative bg-white rounded-lg shadow-xl w-full",
            sizes[size],
            animations[animation].content,
            isVisible && animations[animation].contentVisible
          )}
        >
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
