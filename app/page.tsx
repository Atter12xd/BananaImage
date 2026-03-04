import { ImageCombiner } from "@/components/image-combiner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Generador de imágenes con IA | Google Gemini",
  description:
    "Genera imágenes desde texto o edita imágenes con IA. Usa modelos Google Gemini, varias proporciones y modos Pro y Clásico. Gratis, sin marcas de agua.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ImageCombiner />
      <article className="sr-only" aria-hidden="true">
        <h1>Generador de imágenes con IA</h1>
        <section>
          <h2>¿Qué es?</h2>
          <p>
            Generador de imágenes con IA que crea imágenes desde texto y edita imágenes existentes. Usa modelos Google Gemini en Vercel.
          </p>
        </section>
        <section>
          <h2>Características</h2>
          <ul>
            <li>Texto a imagen: describe lo que quieres y obtén una imagen generada por IA</li>
            <li>Edición: sube una imagen y describe los cambios</li>
            <li>Varias proporciones: 1:1, 16:9, 9:16, 4:3, 3:4, etc.</li>
            <li>Modos Pro (más calidad) y Clásico (más rápido)</li>
            <li>Sin marcas de agua, gratis para probar</li>
          </ul>
        </section>
        <section>
          <h2>Cómo funciona</h2>
          <p>
            Escribe un texto describiendo la imagen. Opcionalmente sube imágenes de referencia. Elige proporción y modo. Pulsa Generar. Descarga o copia el resultado.
          </p>
        </section>
      </article>
    </main>
  )
}
