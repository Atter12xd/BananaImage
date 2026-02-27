"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TeamAuthRequiredModalProps {
  open: boolean
}

export function TeamAuthRequiredModal({ open }: TeamAuthRequiredModalProps) {
  const handleReauthorize = () => {
    // Redirect to signin with reauth=true to force consent screen
    window.location.href = "/api/auth/signin?reauth=true"
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Team Access Required</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              To use Nano Banana Pro, you need to grant access to at least one Vercel team. 
              This allows the playground to use your AI Gateway credits.
            </p>
            <p className="text-sm text-muted-foreground">
              Click the button below and select a team on the authorization screen.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={handleReauthorize}>
            Grant Team Access
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
