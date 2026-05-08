export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function InlineSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin ${className}`} />
  );
}
