"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    alt: string;
}

export function ImageLightbox({ isOpen, onClose, src, alt }: ImageLightboxProps) {
    const [scale, setScale] = React.useState(1);
    const [mounted, setMounted] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

    // Ensure component only renders on client
    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset scale and position when opening new image
    React.useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    // Handle escape key and body scroll lock
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        // Lock body scroll when lightbox is open
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale((prev) => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newScale = Math.max(scale - 0.5, 1);
        setScale(newScale);
        // Reset position when zooming out to 1x
        if (newScale === 1) {
            setPosition({ x: 0, y: 0 });
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const link = document.createElement("a");
            link.href = src;
            link.download = `image-${Date.now()}.jpg`;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download image", error);
            window.open(src, "_blank", "noopener,noreferrer");
        }
    };

    // Pan handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (scale > 1 && e.touches.length === 1) {
            const touch = e.touches[0];
            setIsDragging(true);
            setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging && scale > 1 && e.touches.length === 1) {
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y,
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    if (!mounted) return null;

    const lightboxContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    style={{ height: '100vh', width: '100vw' }}
                    onClick={onClose}
                >
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-[10000]">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={handleZoomIn}
                        >
                            <ZoomIn className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={handleZoomOut}
                        >
                            <ZoomOut className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={handleDownload}
                        >
                            <Download className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Image */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full h-full flex items-center justify-center p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="relative flex items-center justify-center"
                            style={{
                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-full object-contain rounded-md shadow-2xl select-none"
                                style={{ maxHeight: '90vh', maxWidth: '90vw', pointerEvents: 'none' }}
                                draggable={false}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(lightboxContent, document.body);
}
