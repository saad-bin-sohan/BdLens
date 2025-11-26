import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "neu-pressable text-white shadow-none",
        destructive:
          "bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-[10px_10px_20px_rgba(163,177,198,0.4),-10px_-10px_20px_rgba(255,255,255,0.9)] hover:translate-y-[-1px] active:translate-y-[1px]",
        outline:
          "border border-white/70 bg-white/70 text-foreground shadow-[10px_10px_20px_rgba(163,177,198,0.35),-10px_-10px_20px_rgba(255,255,255,0.95)] backdrop-blur hover:-translate-y-[1px]",
        secondary:
          "bg-gradient-to-br from-slate-100/80 to-white text-foreground shadow-[10px_10px_20px_rgba(163,177,198,0.35),-10px_-10px_20px_rgba(255,255,255,0.95)] hover:-translate-y-[1px]",
        ghost: "hover:bg-white/60 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.9)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-10 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
