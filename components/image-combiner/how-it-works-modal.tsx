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
            <p className="leading-relaxed mb-2 text-white/90">
              Escribe lo que quieres ver y la IA crea la imagen. También puedes subir una foto y pedir cambios. Es gratis y no necesitas crear cuenta.
            </p>
            <p className="leading-relaxed text-gray-400 text-xs">
              Tienes 1 generación gratis al día. Mañana se renueva.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">¿Qué modelo elijo?</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold text-white">NB2 (recomendado):</span> Buen resultado y rápido. Ideal para probar.
              </li>
              <li>
                <span className="font-semibold text-white">Pro:</span> La mejor calidad. Tarda un poco más.
              </li>
              <li>
                <span className="font-semibold text-white">Clásico:</span> Muy rápido. Para cuando tengas prisa.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Opciones avanzadas (NB2)</h3>
            <p className="text-gray-400 text-xs mb-2">Si quieres afinar el resultado:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-white">Razonamiento:</span> Mínimo = más rápido. Alto = mejor para descripciones complicadas.</li>
              <li><span className="text-white">Resolución:</span> 1K está bien; 2K o 4K si necesitas la imagen más grande.</li>
              <li><span className="text-white">Búsqueda Google:</span> Actívalo si quieres que la IA use información actual de internet.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Formato de la imagen</h3>
            <p className="leading-relaxed text-gray-400">
              Puedes elegir proporción: cuadrado (1:1), vertical (9:16), horizontal (16:9), etc. Si subes una imagen, se sugiere sola.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Editar una foto</h3>
            <p className="leading-relaxed mb-2">
              Sube una o dos imágenes abajo y en el texto di qué quieres cambiar (por ejemplo: “ponle un cielo de atardecer” o “cámbialo a estilo dibujo”).
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
              <li>Arrastra las fotos o haz clic para elegirlas</li>
              <li>También puedes pegar un enlace de una imagen</li>
              <li>Formatos: PNG, JPG, WebP, GIF (máximo 10 MB)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Atajos de teclado</h3>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
              <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Ctrl + Enter</kbd> — Generar</li>
              <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Ctrl + C</kbd> — Copiar imagen</li>
              <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Ctrl + D</kbd> — Descargar</li>
              <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Ctrl + U</kbd> — Usar la imagen generada para editar otra vez</li>
              <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Esc</kbd> — Cerrar pantalla completa</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
