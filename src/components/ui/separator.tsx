import * as React from "react"

// Create a simple separator component without using @radix-ui/react-separator
const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
  }
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => {
    const ariaProps = decorative
      ? { "aria-hidden": true }
      : { role: "separator" }

    return (
      <div
        ref={ref}
        className={[
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className,
        ].filter(Boolean).join(" ")}
        {...ariaProps}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }