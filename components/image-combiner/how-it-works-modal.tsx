"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HowItWorksModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-black/95 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How it works</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-sm text-gray-300 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <p className="leading-relaxed mb-3">
              This playground was built with{" "}
              <a
                href="https://v0.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                v0
              </a>{" "}
              and demonstrates Google's image generation models. All API calls run through{" "}
              <a
                href="https://vercel.com/ai-gateway"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Vercel AI Gateway
              </a>{" "}
              for enterprise-grade routing and caching.
            </p>
            <p className="leading-relaxed text-white/90">
              You can clone this playground from v0 and build your own app with your Vercel AI Gateway credentials.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Models</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold text-white">NB2 (Nano Banana 2):</span> Gemini 3.1 Flash Image — Pro-level quality at Flash speed. Supports configurable thinking levels, resolution up to 4K, and Google Search grounding.
              </li>
              <li>
                <span className="font-semibold text-white">Pro:</span> Gemini 3 Pro Image — Best quality, slower generation.
              </li>
              <li>
                <span className="font-semibold text-white">Classic:</span> Gemini 2.5 Flash Image — Fastest generation, lower cost.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">NB2 Features</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold text-white">Thinking level:</span> Minimal (fast) or High (more reasoning for complex prompts)
              </li>
              <li>
                <span className="font-semibold text-white">Resolution:</span> 0.5K, 1K (default), 2K, or 4K output
              </li>
              <li>
                <span className="font-semibold text-white">Google Search grounding:</span> Grounds generation with real-time web results for better accuracy
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Technical Overview</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold text-white">Anonymous users:</span> Get 1 free generation stored in
                localStorage
              </li>
              <li>
                <span className="font-semibold text-white">Authenticated users:</span> Vercel OAuth enables unlimited
                generations with history synced to Supabase
              </li>
              <li>
                <span className="font-semibold text-white">Image processing:</span> Client-side base64 conversion with
                format/size validation
              </li>
              <li>
                <span className="font-semibold text-white">Aspect ratios:</span> 14 ratios including 1:1, 9:16, 16:9, 21:9, 4:3, 3:4, 3:2, 2:3, 5:4, 4:5, 1:4, 4:1, 1:8, 8:1. Auto-detects from uploaded images.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Image Editing</h3>
            <p className="leading-relaxed mb-2">
              Upload one or two source images along with an edit instruction:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Drag and drop images or use the file picker</li>
              <li>Paste image URLs directly</li>
              <li>Supports PNG, JPG, WebP, GIF (max 10MB)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Keyboard Shortcuts</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + Enter</kbd> - Generate image
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + C</kbd> - Copy image to clipboard
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + D</kbd> - Download image
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + U</kbd> - Load generated image as
                input
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Esc</kbd> - Close fullscreen viewer
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
