import type { ComponentPropsWithoutRef } from "react";

type NationsFiWordmarkProps = ComponentPropsWithoutRef<"span"> & {
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "nf-logo-wordmark--sm",
  md: "nf-logo-wordmark--md",
  lg: "nf-logo-wordmark--lg",
} as const;

/** Header wordmark: metallic “Nations” + electric blue “.Fi” (brand lockup). */
export function NationsFiWordmark({
  size = "md",
  className = "",
  ...props
}: NationsFiWordmarkProps) {
  return (
    <span
      className={`nf-logo-wordmark ${SIZE_CLASS[size]} ${className}`.trim()}
      {...props}
    >
      <span className="nf-logo-nations" aria-hidden>
        Nations
      </span>
      <span className="nf-logo-fi" aria-hidden>
        .Fi
      </span>
      <span className="sr-only">Nations.Fi</span>
    </span>
  );
}
