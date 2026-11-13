"use client";

import React, { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Image from "next/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageLightbox({ src, alt, className }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#EDF2F7] bg-[#F1F4F6] transition-all hover:opacity-95"
      >
        <img
          src={src}
          alt={alt}
          className={className || "w-full max-h-96 object-cover"}
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#181C1E] shadow-sm backdrop-blur-xs">
            <ZoomIn className="w-3.5 h-3.5" /> Ampliar foto
          </span>
        </div>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] w-auto max-w-full object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}

