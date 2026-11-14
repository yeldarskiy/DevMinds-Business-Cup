import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55 select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[0_1px_0_rgb(255_255_255/0.15)_inset,0_1px_2px_rgb(4_120_87/0.3)]',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-canvas hover:border-faint',
  ghost: 'text-ink-soft hover:bg-ink/5',
  danger: 'bg-surface text-danger-600 border border-line-strong hover:bg-danger-50 hover:border-danger-600/40',
  dark: 'bg-ink text-white hover:bg-ink-soft',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 min-w-9 px-3 text-sm',
  md: 'h-11 min-w-11 px-4 text-sm',
  lg: 'h-12 min-w-12 px-5 text-[15px]',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string): string {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading = false, icon, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, typeof className === 'string' ? className : undefined)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
