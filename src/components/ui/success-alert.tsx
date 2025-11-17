import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDuration?: number;
}

export function SuccessAlert({
  message,
  onDismiss,
  className,
  showIcon = true,
  dismissible = false,
  autoHide = false,
  autoHideDuration = 5000
}: SuccessAlertProps) {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDuration, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "p-3 rounded-lg border bg-green-50 border-green-200 text-green-800 flex items-start gap-2",
            className
          )}
          role="alert"
        >
          {showIcon && (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm flex-1">{message}</p>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-current hover:opacity-70 transition-opacity"
              aria-label="Dismiss success message"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import * as React from "react";

interface SuccessContainerProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SuccessContainer({
  title = "Success!",
  message,
  action,
  className
}: SuccessContainerProps) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center space-y-4 max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"
        >
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
