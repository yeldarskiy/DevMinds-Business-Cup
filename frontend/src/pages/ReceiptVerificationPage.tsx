import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, FileText, FlaskConical, Loader2, RotateCcw, ScanLine, ShoppingBasket, UploadCloud, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { DemoBadge } from '../components/ui/DemoBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { ErrorState, EmptyState } from '../components/ui/StateViews'
import { StoreName } from '../components/ui/StoreBadge'
import { averagePrice, getQuote } from '../data/prices'
import { storeName } from '../data/stores'
import { errorMessage } from '../services/api'
import { receiptService, type ScanResult } from '../services/receiptService'
import { useAppState } from '../state/AppState'
import type { Receipt, ShoppingPlan } from '../types'
import { cn } from '../utils/cn'
import { longDate, money, round2 } from '../utils/format'
import { optimizeBasket } from '../utils/optimizer'

const ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }
const MAX_SIZE = 10 * 1024 * 1024
const STEPS = ['Uploading receipt', 'Analyzing receipt', 'Matching items to your plan']
const STEP_MS = 550

type Phase =
  | { kind: 'idle' }
  | { kind: 'ready'; file: File; preview: string | null }
  | { kind: 'processing'; step: number; fileName: string }
  | { kind: 'error'; message: string; file: File }
  | { kind: 'verified'; receipt: Receipt; processedByOcr: boolean }

/** Compares what the receipt says with the plan and the five-retailer average. */
function verify(scan: ScanResult, plan: ShoppingPlan, fileName: string): Receipt {
  const total = round2(scan.items.reduce((s, i) => s + i.price * i.quantity, 0))
  const predictedTotal = round2(
    scan.items.reduce((s, i) => {
      const planned = plan.items.find((p) => p.productId === i.productId)
      const unit = planned?.unitPrice ?? (i.productId ? getQuote(i.productId, scan.storeId)?.price : undefined) ?? i.price
      return s + unit * i.quantity
    }, 0),
  )
  const baseline = round2(scan.items.reduce((s, i) => s + (i.productId ? averagePrice(i.productId) : i.price) * i.quantity, 0))
  return {
    id: `rcpt-${Date.now().toString(36)}`,
    storeId: scan.storeId,
    purchasedAt: scan.purchasedAt,
    items: scan.items,
    total,
    predictedTotal,
    baseline,
    verifiedSavings: round2(Math.max(0, baseline - total)),
    fileName,
    source: scan.processedByOcr ? 'api' : 'demo',
  }
}

function UploadArea({ onFile }: { onFile: (file: File) => void }) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const code = rejected[0].errors[0]?.code
        toast.error(code === 'file-too-large' ? 'That file is over 10 MB. Try a smaller photo.' : 'Use a JPG, JPEG or PNG receipt.')
        return
      }
      if (accepted[0]) onFile(accepted[0])
    },
    [onFile],
  )
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, accept: ACCEPT, maxSize: MAX_SIZE, multiple: false, noClick: true })

  return (
    <div
      {...getRootProps()}
      className={cn('flex flex-col items-center rounded-[14px] border-2 border-dashed px-6 py-12 text-center transition-colors', isDragActive ? 'border-brand-600 bg-brand-50' : 'border-line-strong bg-canvas/60')}
    >
      <input {...getInputProps()} aria-label="Receipt file" />
      <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-brand-700 shadow-panel">
        <UploadCloud className="size-6" aria-hidden />
      </span>
      <p className="mt-4 font-semibold">{isDragActive ? 'Drop the receipt to upload' : 'Upload Receipt'}</p>
      <p className="mt-1 text-sm text-muted">Drag and drop a photo or scan of your receipt</p>
      <div className="mt-3 flex gap-1.5">
        {['PNG', 'JPG'].map((f) => (
          <Badge key={f}>{f}</Badge>
        ))}
      </div>
      <Button className="mt-5" onClick={open}>
        Choose file
      </Button>
      <p className="mt-3 text-xs text-muted">Up to 10 MB</p>
    </div>
  )
}

function VerificationContent({ plan, derived }: { plan: ShoppingPlan; derived: boolean }) {
  const { saveReceipt } = useAppState()
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const previewRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    [],
  )

  const selectFile = useCallback((file: File) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    previewRef.current = preview
    setPhase({ kind: 'ready', file, preview })
    toast.success('Receipt uploaded', { description: file.name })
  }, [])

  const run = async (file: File) => {
    setPhase({ kind: 'processing', step: 0, fileName: file.name })
    const ticker = window.setInterval(() => setPhase((p) => (p.kind === 'processing' ? { ...p, step: Math.min(STEPS.length - 1, p.step + 1) } : p)), STEP_MS)
    try {
      const scan = receiptService.ocrAvailable ? await receiptService.upload(file, plan) : await receiptService.simulate(plan)
      const receipt = verify(scan, plan, file.name)
      saveReceipt(receipt)
      setPhase({ kind: 'verified', receipt, processedByOcr: scan.processedByOcr })
      toast.success('Receipt verified', { description: `${money(receipt.verifiedSavings)} estimated savings from the receipt and sample comparison prices.` })
    } catch (error) {
      setPhase({ kind: 'error', message: errorMessage(error), file })
    } finally {
      window.clearInterval(ticker)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div className="min-w-0 space-y-6">
        {phase.kind === 'idle' && (
          <Panel title="Upload your receipt" description={`From your ${storeName(plan.storeId)} trip`}>
            <UploadArea onFile={selectFile} />
          </Panel>
        )}

        {phase.kind === 'ready' && (
          <Panel title="Ready to verify">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-56 w-full shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-line bg-canvas sm:w-44">
                {phase.preview ? (
                  <img src={phase.preview} alt={`Preview of ${phase.file.name}`} className="h-full w-full object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-muted">
                    <FileText className="size-10" aria-hidden />
                    <span className="text-xs font-medium">PDF document</span>
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <p className="break-all font-medium">{phase.file.name}</p>
                <p className="text-sm text-muted">{Math.max(1, Math.round(phase.file.size / 1024))} KB</p>
                <p className="mt-3 text-sm text-ink-soft">GIMZUP will scan product lines and prices, then compare them with your saved shopping plan.</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Button onClick={() => run(phase.file)} icon={<ScanLine className="size-4" aria-hidden />}>
                    Verify receipt
                  </Button>
                  <Button variant="ghost" onClick={() => setPhase({ kind: 'idle' })} icon={<X className="size-4" aria-hidden />}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {phase.kind === 'processing' && (
          <Panel title="Analyzing Receipt..." description={phase.fileName}>
            <ol className="space-y-4" aria-live="polite">
              {STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span className={cn('flex size-7 items-center justify-center rounded-full', i < phase.step ? 'bg-brand-600 text-white' : i === phase.step ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-faint')}>
                    {i === phase.step ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <span className="tnum text-xs font-semibold">{i + 1}</span>}
                  </span>
                  <span className={i <= phase.step ? 'text-ink' : 'text-muted'}>{label}</span>
                </li>
              ))}
            </ol>
          </Panel>
        )}

        {phase.kind === 'error' && (
          <div className="space-y-3">
            <ErrorState message={`The receipt couldn’t be read. ${phase.message}`} onRetry={() => run(phase.file)} />
            <Button variant="ghost" onClick={() => setPhase({ kind: 'idle' })}>
              Choose a different file
            </Button>
          </div>
        )}

        {phase.kind === 'verified' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Panel
              title={
                <span className="flex items-center gap-2">
                  <BadgeCheck className="size-5 text-brand-600" aria-hidden /> Receipt Verified
                </span>
              }
              description={phase.receipt.fileName ?? undefined}
              action={phase.processedByOcr ? <Badge tone="brand">Read from your file</Badge> : <DemoBadge label="Demo OCR" />}
            >
              {!phase.processedByOcr && (
                <p className="mb-5 flex items-start gap-2 rounded-[10px] bg-canvas px-3 py-2.5 text-sm text-ink-soft">
                  <FlaskConical className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                  Receipt OCR isn’t connected in this environment. The lines below are what {storeName(phase.receipt.storeId)} would print for your plan, including register price differences.
                </p>
              )}
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-4">
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Store</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    <StoreName id={phase.receipt.storeId} />
                  </dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Date</dt>
                  <dd className="mt-1 text-sm font-semibold">{longDate(phase.receipt.purchasedAt)}</dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Items</dt>
                  <dd className="tnum mt-1 text-sm font-semibold">{phase.receipt.items.reduce((n, i) => n + i.quantity, 0)}</dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Total cost</dt>
                  <dd className="tnum mt-1 text-sm font-semibold">{money(phase.receipt.total)}</dd>
                </div>
              </dl>

              <h3 className="mt-6 text-sm font-semibold">Extracted line items</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <caption className="sr-only">Receipt line items</caption>
                  <thead className="text-left text-xs text-muted">
                    <tr>
                      <th scope="col" className="py-2 font-medium">Item</th>
                      <th scope="col" className="py-2 text-right font-medium">Qty</th>
                      <th scope="col" className="py-2 text-right font-medium">Price</th>
                      <th scope="col" className="py-2 text-right font-medium">Planned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {phase.receipt.items.map((item) => {
                      const planned = plan.items.find((p) => p.productId === item.productId)
                      const changed = planned && Math.abs(planned.unitPrice - item.price) >= 0.01
                      return (
                        <tr key={item.id}>
                          <td className="py-2 font-mono text-xs">{item.name}</td>
                          <td className="tnum py-2 text-right">{item.quantity}</td>
                          <td className={cn('tnum py-2 text-right font-medium', changed && (item.price < (planned?.unitPrice ?? 0) ? 'text-brand-700' : 'text-danger-600'))}>{money(item.price)}</td>
                          <td className="tnum py-2 text-right text-muted">{planned ? money(planned.unitPrice) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <ButtonLink to="/app/dashboard" icon={<ArrowRight className="size-4" aria-hidden />}>
                  View Savings Dashboard
                </ButtonLink>
                <Button variant="secondary" onClick={() => setPhase({ kind: 'idle' })} icon={<RotateCcw className="size-4" aria-hidden />}>
                  Verify another receipt
                </Button>
              </div>
            </Panel>
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <Panel title="Prediction comparison">
          {phase.kind === 'verified' ? (
            <>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted">Predicted</dt>
                  <dd className="tnum mt-1 text-2xl font-semibold tracking-tight">{money(phase.receipt.predictedTotal)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Actual</dt>
                  <dd className="tnum mt-1 text-2xl font-semibold tracking-tight">{money(phase.receipt.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-muted">
                {phase.receipt.total < phase.receipt.predictedTotal
                  ? `You paid ${money(round2(phase.receipt.predictedTotal - phase.receipt.total))} less than predicted thanks to register price drops.`
                  : phase.receipt.total > phase.receipt.predictedTotal
                    ? `You paid ${money(round2(phase.receipt.total - phase.receipt.predictedTotal))} more than predicted. Some prices changed since they were checked.`
                    : 'The receipt matches the prediction exactly.'}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted">Predicted at {storeName(plan.storeId)}</p>
              <p className="tnum mt-1 text-2xl font-semibold tracking-tight">{money(plan.predictedTotal)}</p>
              <p className="mt-2 text-sm text-muted">
                {plan.items.length} {plan.items.length === 1 ? 'product' : 'products'}. Upload the receipt to see the actual cost.
              </p>
              {derived && <p className="mt-3 rounded-[10px] bg-canvas px-3 py-2 text-xs text-ink-soft">Based on the optimizer’s recommendation for your current basket.</p>}
            </>
          )}
        </Panel>

        {phase.kind === 'verified' && (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            aria-labelledby="verified-title"
            className="rounded-panel bg-ink p-6 text-white shadow-lift"
          >
            <p id="verified-title" className="flex items-center gap-2 text-sm font-medium text-brand-400">
              <BadgeCheck className="size-4" aria-hidden /> Estimated Savings
            </p>
            <p className="tnum mt-2 text-4xl font-semibold tracking-tight">{money(phase.receipt.verifiedSavings)}</p>
            <p className="mt-2 text-sm text-white/70">
              Estimated using sample prices from the available retailer catalog ({money(phase.receipt.baseline)}).
            </p>
          </motion.section>
        )}
      </div>
    </div>
  )
}

export default function ReceiptVerificationPage() {
  const { plan, basket } = useAppState()
  const derivedPlan = useMemo<ShoppingPlan | null>(() => {
    if (plan || basket.length === 0) return null
    const best = optimizeBasket(basket).best
    return {
      storeId: best.storeId,
      predictedTotal: best.total,
      baseline: round2(best.lines.reduce((s, l) => s + l.averageUnitPrice * l.quantity, 0)),
      items: best.lines.map((l) => ({ productId: l.productId, name: l.name, quantity: l.quantity, unitPrice: l.unitPrice })),
      createdAt: new Date().toISOString(),
    }
  }, [plan, basket])
  const active = plan ?? derivedPlan

  return (
    <div>
      <PageHeader title="Receipt Verification" description="Upload your receipt to compare what you paid with what GIMZUP predicted, and confirm your real savings." />
      {active ? (
        <VerificationContent key={active.createdAt} plan={active} derived={!plan} />
      ) : (
        <div className="rounded-panel border border-line bg-surface">
          <EmptyState
            icon={<ShoppingBasket className="size-5" aria-hidden />}
            title="No receipt uploaded"
            description="Build a basket and choose a store first. GIMZUP verifies the receipt against that plan."
            action={<ButtonLink to="/app/basket">Build basket</ButtonLink>}
          />
        </div>
      )}
    </div>
  )
}
