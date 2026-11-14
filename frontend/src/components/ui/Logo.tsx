import { cn } from '../../utils/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#0F1E3D" />
      <path d="M8 10h2.4l2.2 9.2a1.6 1.6 0 0 0 1.6 1.2h7.1a1.6 1.6 0 0 0 1.5-1.1L24.5 13H12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 16.2l1.8 1.8 3.4-3.6" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14.5" cy="24" r="1.4" fill="#fff" />
      <circle cx="21" cy="24" r="1.4" fill="#fff" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className={'text-[17px] font-semibold tracking-[0.04em] text-ink'}>GIMZUP</span>
    </span>
  )
}
