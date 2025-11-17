import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "primary" | "secondary" | "muted";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-2",
  xl: "h-16 w-16 border-[3px]"
};

const variantClasses = {
  primary: "border-primary border-t-transparent",
  secondary: "border-secondary border-t-transparent",
  muted: "border-muted-foreground border-t-transparent"
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  variant = "primary"
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingContainerProps {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function LoadingContainer({ 
  children, 
  size = "lg",
  className,
  text = "Loading..."
}: LoadingContainerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={size} />
        {(text || children) && (
          <p className="text-sm text-muted-foreground">
            {children || text}
          </p>
        )}
      </div>
    </div>
  );
}

export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingContainer size="xl" text={text} />
    </div>
  );
}
