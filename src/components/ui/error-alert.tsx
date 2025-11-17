import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: "destructive" | "warning";
  showIcon?: boolean;
  dismissible?: boolean;
}

const variantStyles = {
  destructive: "bg-destructive/10 border-destructive/20 text-destructive",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
};

export function ErrorAlert({
  message,
  onDismiss,
  className,
  variant = "destructive",
  showIcon = true,
  dismissible = false
}: ErrorAlertProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "p-3 rounded-lg border flex items-start gap-2",
            variantStyles[variant],
            className
          )}
          role="alert"
        >
          {showIcon && (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm flex-1">{message}</p>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-current hover:opacity-70 transition-opacity"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ErrorContainerProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorContainer({
  title = "Something went wrong",
  message,
  retry,
  className
}: ErrorContainerProps) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
