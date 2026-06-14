/**
 * Metronic button mapping (billing/basic and global patterns):
 * - default (primary)  → Upgrade Plan, Save, Done, main CTAs
 * - light              → Cancel Plan, Add New, Export, table actions, pagination
 * - outline            → neutral bordered actions (rare secondary)
 * - outline-primary    → bordered primary emphasis
 * - link               → Edit Billing, Download All, Learn more
 * - link-muted         → Order History, secondary nav text actions
 * - clear              → icon-only / minimal toolbar controls
 * - destructive        → soft danger (cancel destructive flows)
 * - destructive-solid  → Delete, Remove, Report
 * - success            → confirm / approve actions
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active",
        primary:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active",
        light:
          "border-transparent bg-btn-light text-btn-light-foreground hover:bg-btn-light-hover",
        outline:
          "border-border bg-card text-foreground hover:bg-muted",
        "outline-primary":
          "border-primary/30 bg-card text-primary hover:border-primary/50 hover:bg-primary/5",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-muted",
        clear:
          "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        link:
          "h-auto border-transparent bg-transparent px-0 text-primary shadow-none hover:text-primary-hover hover:underline hover:underline-offset-4",
        "link-muted":
          "h-auto border-transparent bg-transparent px-0 text-muted-foreground shadow-none hover:text-primary hover:underline hover:underline-offset-4",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:ring-destructive/20",
        "destructive-solid":
          "border-transparent bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/30",
        success:
          "border-transparent bg-success text-success-foreground shadow-sm hover:bg-success/90",
      },
      size: {
        default: "h-10 px-4 text-sm",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 rounded-md px-5 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
        link: "h-auto px-0 text-sm",
      },
    },
    compoundVariants: [
      {
        variant: ["link", "link-muted"],
        size: "default",
        className: "h-auto px-0",
      },
      {
        variant: ["link", "link-muted"],
        size: "sm",
        className: "h-auto px-0 text-xs",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
