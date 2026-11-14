import { MapPinOff } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-muted ring-1 ring-line">
        <MapPinOff className="size-6" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">This page doesn’t exist</h1>
      <p className="mt-2 max-w-sm text-muted">The link may be out of date. Pick up your shopping journey from the basket.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink to="/app/basket">Build basket</ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </div>
  )
}
