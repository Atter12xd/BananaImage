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
          <DialogTitle className="text-2xl font-bold">Cómo funciona</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-sm text-gray-300 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <p className="leading-relaxed mb-3">
              Plantilla de código abierto para generar imágenes con IA. Añade tu clave de{" "}
              <a
                href="https://vercel.com/ai-gateway"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Vercel AI Gateway
              </a>{" "}
              y despliega.
            </p>
            <p className="leading-relaxed text-white/90">
              Sin inicio de sesión la app funciona en modo anónimo con límite de uso.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Modelos</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold text-white">NB2:</span> Gemini 3.1 Flash — Buena calidad y rápido. Razonamiento configurable, resolución hasta 4K y búsqueda Google.
              </li>
              <li>
                <span className="font-semibold text-white">Pro:</span> Gemini 3 Pro — Máxima calidad, más lento.
              </li>
              <li>
                <span className="font-semibold text-white">Clásico:</span> Gemini 2.5 Flash — Más rápido y económico.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Opciones NB2</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold text-white">Razonamiento:</span> Mínimo (rápido) o Alto (para prompts complejos)
              </li>
              <li>
                <span className="font-semibold text-white">Resolución:</span> 1K (por defecto), 2K o 4K
              </li>
              <li>
                <span className="font-semibold text-white">Búsqueda Google:</span> Usa resultados web en tiempo real para más precisión
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Uso</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold text-white">Anónimos:</span> 1 generación al día por IP
              </li>
              <li>
                <span className="font-semibold text-white">Con cuenta:</span> Generaciones ilimitadas (requiere OAuth de Vercel)
              </li>
              <li>
                <span className="font-semibold text-white">Proporciones:</span> 1:1, 9:16, 16:9, 4:3 y más. Se detectan al subir imágenes.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Edición de imágenes</h3>
            <p className="leading-relaxed mb-2">
              Sube una o dos imágenes y escribe qué quieres cambiar:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Arrastra y suelta o elige archivos</li>
              <li>Pega URLs de imágenes</li>
              <li>PNG, JPG, WebP, GIF (máx. 10 MB)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Atajos de teclado</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + Enter</kbd> — Generar imagen
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + C</kbd> — Copiar imagen
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + D</kbd> — Descargar imagen
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">⌘/Ctrl + U</kbd> — Usar imagen como entrada
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Esc</kbd> — Cerrar vista pantalla completa
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
