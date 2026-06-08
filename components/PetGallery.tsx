'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PetGalleryProps {
  photos: string[]
  petName: string
}

const FALLBACK = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'

export default function PetGallery({ photos, petName }: PetGalleryProps) {
  const images = photos?.length ? photos : [FALLBACK]
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 4500, stopOnInteraction: true })]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="relative w-full">
      {/* Main carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="relative flex-none w-full aspect-[4/3] md:aspect-[16/9]">
              <Image
                src={src}
                alt={`${petName} photo ${i + 1}`}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons (desktop) */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass border border-white/30 flex items-center justify-center text-white shadow-warm transition-all hover:scale-105 hidden md:flex"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass border border-white/30 flex items-center justify-center text-white shadow-warm transition-all hover:scale-105 hidden md:flex"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 glass border border-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`rounded-full transition-all ${
                i === selectedIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
