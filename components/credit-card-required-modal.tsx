"use client"

import { CreditCard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCredits } from "@/hooks/use-credits"

interface CreditCardRequiredModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreditCardRequiredModal({ open, onOpenChange }: CreditCardRequiredModalProps) {
  const { buyCreditsUrl } = useCredits()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Credit Card Required
          </DialogTitle>
          <DialogDescription>
            You need to add credits to your account to generate images.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-6">
          <div className="text-center space-y-3">
            <div className="relative">
              <CreditCard className="h-16 w-16 text-primary mx-auto opacity-20" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Verify your identity by adding a credit card and unlock $5 in free credits.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            type="button"
            className="w-full font-semibold"
            disabled={!buyCreditsUrl}
            onClick={() => buyCreditsUrl && window.open(buyCreditsUrl, "_blank")}
          >
            Add credit card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
