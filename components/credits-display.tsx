"use client"

import { useMemo, useState } from "react"
import { useCredits } from "@/hooks/use-credits"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

const INITIAL_VISIBLE = 5

const formatBalance = (balance: string) => {
  return Number.parseFloat(balance).toFixed(2)
}

const CREDIT_OPTIONS = [
  { amount: 5, label: "$5" },
  { amount: 10, label: "$10" },
  { amount: 25, label: "$25" },
]

export function CreditsDisplay() {
  const { credits, balance, creditsLoading, historyLoading, history, error, buyCreditsUrl, refresh } = useCredits()
  const [isOpen, setIsOpen] = useState(false)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [showAll, setShowAll] = useState(false)

  if (error) {
    return null
  }

  const handleBuy = async (amount: number) => {
    setBuying(true)
    setBuyError(null)

    try {
      const res = await fetch("/api/credits/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      const data = await res.json()

      if (!res.ok) {
        setBuyError(data.error || "Purchase failed")
        return
      }

      if (data.checkoutSessionUrl) {
        // Open Stripe checkout in same tab — returnUrl brings them back
        window.location.href = data.checkoutSessionUrl
      } else {
        // Direct purchase (no checkout needed)
        refresh()
        setIsOpen(false)
      }
    } catch {
      setBuyError("Something went wrong. Please try again.")
    } finally {
      setBuying(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center bg-black/50 border border-gray-600 px-2 md:px-3 gap-2 h-7 md:h-8 min-w-[56px] hover:border-gray-500 transition-colors cursor-pointer text-white text-xs"
      >
        {creditsLoading || !credits ? (
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        ) : (
          <span className="font-semibold tabular-nums">${formatBalance(balance)}</span>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setShowAll(false) }}>
        <DialogContent className="sm:max-w-sm max-h-[70vh] flex flex-col p-0 gap-0 bg-black/95 border-gray-600 text-white font-[family-name:var(--font-geist-pixel)]">
          {/* Header */}
          <div className="border-b border-white/10 px-4 py-3">
            <DialogTitle className="text-xs text-gray-400 uppercase tracking-wider">Balance</DialogTitle>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-bold tabular-nums text-white">${formatBalance(balance)}</span>
              <span className="text-xs text-gray-500">USD</span>
            </div>
          </div>

          {/* Buy Credits */}
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Add Credits</h3>
            <div className="flex gap-2">
              {CREDIT_OPTIONS.map((opt) => (
                <button
                  key={opt.amount}
                  onClick={() => handleBuy(opt.amount)}
                  disabled={buying}
                  className={cn(
                    "flex-1 h-9 text-sm font-medium border transition-colors cursor-pointer",
                    "bg-black/50 border-gray-600 text-white hover:bg-white hover:text-black",
                    buying && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {buying ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Custom"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full h-9 pl-5 pr-2 text-sm bg-black/50 border border-gray-600 text-white placeholder:text-gray-600 focus:outline-none focus:border-white"
                />
              </div>
              <button
                onClick={() => {
                  const amt = Number(customAmount)
                  if (amt > 0) handleBuy(amt)
                }}
                disabled={buying || !customAmount || Number(customAmount) <= 0}
                className={cn(
                  "h-9 px-3 text-sm font-medium border transition-colors cursor-pointer",
                  "bg-white text-black border-white hover:bg-gray-200",
                  (buying || !customAmount || Number(customAmount) <= 0) && "opacity-50 cursor-not-allowed",
                )}
              >
                {buying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy"}
              </button>
            </div>
            {buyError && (
              <p className="text-[10px] text-red-400 mt-1.5">{buyError}</p>
            )}
          </div>

          {/* Activity */}
          <div className="flex flex-col px-4 py-3 flex-1 min-h-0">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Recent Activity</h3>

            <div className="overflow-y-auto flex-1 pr-1 -mr-1">
              {historyLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No activity yet</p>
              ) : (
                <div className="space-y-0.5">
                  {(showAll ? history : history.slice(0, INITIAL_VISIBLE)).map((item) => {
                    let metadata: any = null
                    try {
                      metadata = item.metadata ? JSON.parse(item.metadata) : null
                    } catch {}

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 px-2 py-2 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {metadata?.model && (
                              <span
                                className={cn(
                                  "text-[10px] leading-none px-1.5 py-0.5 font-medium uppercase tracking-wider flex-shrink-0",
                                  metadata.model === "Pro"
                                    ? "bg-white text-black"
                                    : metadata.model === "NB2"
                                      ? "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                                      : "bg-gray-800 text-gray-400",
                                )}
                              >
                                {metadata.model}
                              </span>
                            )}
                            {metadata?.prompt && (
                              <p className="text-xs text-gray-300 truncate">{metadata.prompt}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs tabular-nums text-gray-500 flex-shrink-0">
                          ${Number.parseFloat(item.cost).toFixed(3)}
                        </span>
                      </div>
                    )
                  })}
                  {!showAll && history.length > INITIAL_VISIBLE && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      See more
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
