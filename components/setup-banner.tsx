"use client"

import { useState } from "react"
import { X, AlertTriangle, Info } from "lucide-react"

interface SetupBannerProps {
  authConfigured: boolean
  aiConfigured: boolean
}

export function SetupBanner({ authConfigured, aiConfigured }: SetupBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!aiConfigured) {
    return (
      <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-md mb-3 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm">
          <code className="bg-red-500/20 px-1 rounded">AI_GATEWAY_API_KEY</code> is required.
          Add it to your environment variables to enable image generation.
        </p>
      </div>
    )
  }

  if (!authConfigured && !dismissed) {
    return (
      <div className="bg-blue-500/20 border border-blue-500/40 text-blue-200 px-4 py-3 rounded-md mb-3 flex items-center gap-3">
        <Info className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm flex-1">
          Sign in with Vercel is not configured.{" "}
          <a
            href="https://vercel.com/docs/workflow-collaboration/vercel-authentication/sign-in-with-vercel"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-100"
          >
            Learn how &rarr;
          </a>
        </p>
        <button onClick={() => setDismissed(true)} className="hover:text-blue-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return null
}
