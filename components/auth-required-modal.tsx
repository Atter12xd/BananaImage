"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { LogIn, Loader2 } from "lucide-react"

interface AuthRequiredModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthRequiredModal({ open, onOpenChange }: AuthRequiredModalProps) {
  const { signIn } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    signIn()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white text-center">Continue generating</DialogTitle>
          <DialogDescription className="text-gray-400 text-center pt-2">
            Sign in with Vercel to keep generating
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign in with Vercel
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
