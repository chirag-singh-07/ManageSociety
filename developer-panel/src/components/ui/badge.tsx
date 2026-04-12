import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-secondary text-secondary-foreground',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      warning: 'border-amber-200 bg-amber-50 text-amber-800',
      danger: 'border-red-200 bg-red-50 text-red-800',
      outline: 'bg-background text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

