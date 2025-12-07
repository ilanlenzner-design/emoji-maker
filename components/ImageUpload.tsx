"use client";

import { UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { clsx } from "clsx";

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
    disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                if (!disabled) {
                    onImageSelect(e.dataTransfer.files[0]);
                }
            }
        },
        [onImageSelect, disabled]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            if (!disabled) {
                onImageSelect(e.target.files[0]);
            }
        }
    };

    return (
        <div
            className={clsx(
                "relative w-full aspect-square rounded-xl border transition-all duration-200 flex flex-col items-center justify-center p-2 text-center cursor-pointer overflow-hidden group bg-black",
                dragActive
                    ? "border-white scale-[1.01]"
                    : "border-white/20 hover:border-white",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById("file-upload")?.click()}
        >
            <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
                disabled={disabled}
            />

            <div className="z-10 flex flex-col items-center space-y-1">
                <div className={clsx(
                    "p-1.5 rounded-full transition-all duration-200",
                    dragActive
                        ? "bg-white text-black scale-110"
                        : "bg-white/10 text-white/40 group-hover:bg-white group-hover:text-black"
                )}>
                    <UploadCloud className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-medium text-white group-hover:text-white transition-colors">
                        {dragActive ? "Drop" : "Upload"}
                    </p>
                </div>
            </div>
        </div>
    );
}
