import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../ui/Button'
import { Logo } from '../ui/Logo'

const LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#retailers', label: 'Retailers' },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-5 sm:px-8">
        <Link to="/" aria-label="GIMZUP home" className="rounded-lg">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="inline-flex min-h-11 items-center text-sm font-medium text-ink-soft hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden md:block">
          <ButtonLink to="/app/basket" size="sm" className="h-11">
            Build Basket
          </ButtonLink>
        </div>
        <button
          type="button"
          className="ml-auto flex size-11 items-center justify-center rounded-lg text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-surface px-5 pb-5 md:hidden">
          <ul className="py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center text-[15px] font-medium text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink to="/app/basket" className="w-full">
            Build Basket
          </ButtonLink>
        </nav>
      )}
    </header>
  )
}
