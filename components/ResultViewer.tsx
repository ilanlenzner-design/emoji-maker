"use client";

import { Download, RefreshCw } from "lucide-react";
import Image from "next/image";

interface ResultViewerProps {
    originalImage: string;
    resultImage: string | null;
    onReset: () => void;
}

export default function ResultViewer({ originalImage, resultImage, onReset }: ResultViewerProps) {
    const handleDownload = async () => {
        if (!resultImage) return;

        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `emoji-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error("Download failed", e);
        }
    };

    return (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-[10px] mx-auto">
                {/* Original */}
                <div className="space-y-2 flex flex-col items-center">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden glass-panel border-white/20">
                        <Image
                            src={originalImage}
                            alt="Original"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Result */}
                <div className="space-y-2 flex flex-col items-center">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden glass-panel border-white/20">
                        {resultImage ? (
                            <Image
                                src={resultImage}
                                alt="Result"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <p className="text-[9px] text-white/40 font-medium animate-pulse">Designing...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {resultImage && (
                <div className="flex justify-center gap-12 pt-2">
                    <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onReset}>
                        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center transition-colors group-hover:bg-white group-hover:text-black text-white">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-medium text-white/50 group-hover:text-white transition-colors">reset</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleDownload}>
                        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center transition-colors group-hover:bg-white group-hover:text-black text-white">
                            <Download className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-medium text-white/50 group-hover:text-white transition-colors">download</span>
                    </div>
                </div>
            )}
        </div>
    );
}
