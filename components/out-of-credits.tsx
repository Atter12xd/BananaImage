"use client"

import { useCredits } from "@/hooks/use-credits"
import { Coins, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const formatBalance = (balance: string) => {
  return Number.parseFloat(balance).toFixed(2)
}

interface OutOfCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OutOfCreditsDialog({ open, onOpenChange }: OutOfCreditsDialogProps) {
  const { balance, buyCreditsUrl } = useCredits()
  const balanceNum = Number.parseFloat(balance)
  const isLowCredits = balanceNum > 0 && balanceNum < 0.1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Get AI Credits
          </DialogTitle>
          <DialogDescription>
            {isLowCredits
              ? "Get some AI Gateway credits to keep creating."
              : "Get some AI Gateway credits to start generating."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-6">
          <div className="text-center space-y-3">
            <div className="relative">
              <Coins className="h-16 w-16 text-primary mx-auto opacity-20" />
            </div>
            <div className="text-3xl font-bold tabular-nums text-muted-foreground">${formatBalance(balance)}</div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            type="button"
            className="w-full font-semibold"
            disabled={!buyCreditsUrl}
            onClick={() => buyCreditsUrl && window.open(buyCreditsUrl, "_blank")}
          >
            Get credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
