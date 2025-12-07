import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
    if (!process.env.REPLICATE_API_TOKEN) {
        return NextResponse.json(
            { error: "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it." },
            { status: 500 }
        );
    }

    const { image } = await request.json();

    if (!image) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    try {
        // Ensure image is a string URI
        if (typeof image !== 'string' || !image.startsWith('data:')) {
            return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
        }

        const output = await replicate.run(
            "flux-kontext-apps/kontext-emoji-maker",
            {
                input: {
                    input_image: image,
                    prompt: "A TOK emoji",
                    aspect_ratio: "match_input_image",
                    lora_strength: 1,
                    output_format: "png"
                },
            }
        );

        // Convert ReadableStream to Base64
        const chunks = [];
        // @ts-ignore
        for await (const chunk of output) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const base64Image = buffer.toString("base64");
        const dataUri = `data:image/png;base64,${base64Image}`;

        return NextResponse.json({
            status: "succeeded",
            output: [dataUri],
            id: "run-" + Date.now(),
            created_at: new Date().toISOString()
        }, { status: 201 });

    } catch (e) {
        console.error("Prediction Error:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: "Internal Server Error", detail: errorMessage }, { status: 500 });
    }
}
