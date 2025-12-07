"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import ResultViewer from "./ResultViewer";
import { Prediction } from "../types";

export default function EmojiGenerator() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setFileUrl(url);
        setError(null);
        setPrediction(null);
    };

    const handleStartGeneration = async () => {
        if (!file) return;
        setIsProcessing(true);
        await startPrediction(file);
        setIsProcessing(false);
    };

    const startPrediction = async (imageFile: File) => {
        try {
            // 1. Resize image to max 512x512
            const resizeImage = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        let width = img.width;
                        let height = img.height;
                        const validSize = 512;

                        if (width > height) {
                            if (width > validSize) {
                                height *= validSize / width;
                                width = validSize;
                            }
                        } else {
                            if (height > validSize) {
                                width *= validSize / height;
                                height = validSize;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx?.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL(file.type));
                    };
                    img.onerror = reject;
                });
            };

            const base64Image = await resizeImage(imageFile);

            // 2. Start prediction
            const response = await fetch("/api/predictions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const errorJson = JSON.parse(text);
                    setError(errorJson.detail || errorJson.error || "Failed to start prediction");
                } catch {
                    setError(`Server error: ${response.status} ${response.statusText}`);
                }
                return;
            }

            const predictionData = await response.json();
            setPrediction(predictionData);
        } catch (e) {
            console.error(e);
            setError("Failed to process image");
        }
    };

    const reset = () => {
        setFile(null);
        setFileUrl(null);
        setPrediction(null);
        setError(null);
        setIsProcessing(false);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {!file ? (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-full max-w-[160px]">
                        <ImageUpload onImageSelect={handleFileSelect} />
                    </div>
                    <span className="mt-2 text-[10px] font-medium text-white/40">Select image</span>
                </div>
            ) : !prediction ? (
                <div className="w-full mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-[10px]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden glass-panel group border-white/20">
                                <img
                                    src={fileUrl!}
                                    alt="Preview"
                                />
                                <button
                                    onClick={reset}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-white hover:text-black text-white transition-all backdrop-blur-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                            <span className="text-[10px] font-medium text-white/60">Original</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 justify-start">
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden glass-panel flex items-center justify-center bg-black border-white/20 border">
                                <button
                                    onClick={handleStartGeneration}
                                    disabled={isProcessing}
                                    className="w-10 h-10 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white"
                                >
                                    {isProcessing ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 17v4" /><path d="M3 5h4" /><path d="M17 9h4" /></svg>
                                    )}
                                </button>
                            </div>
                            <span className="text-[10px] font-medium text-white/60">Emoji</span>
                        </div>
                    </div>
                </div>
            ) : (
                <ResultViewer
                    originalImage={fileUrl!}
                    resultImage={prediction.output ? prediction.output[0] : null}
                    onReset={reset}
                />
            )}
        </div>
    );
}
