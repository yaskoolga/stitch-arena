"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "./button";

interface ImageDialogProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailClassName?: string;
}

export function ImageDialog({ src, alt, className, thumbnailClassName }: ImageDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={`relative cursor-pointer group ${thumbnailClassName}`}>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain transition-opacity group-hover:opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
            <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
              Click to enlarge
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="relative w-full" style={{ maxHeight: '90vh' }}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setOpen(false)}
            aria-label="Close image"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Image
              src={src}
              alt={alt}
              width={1920}
              height={1440}
              className="object-contain max-h-[90vh] w-auto h-auto"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
