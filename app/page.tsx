import EmojiGenerator from "../components/EmojiGenerator";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-black text-white">
            <div className="z-10 w-full max-w-[400px] font-sans">
                <div className="mb-4 text-center items-center flex flex-col">
                    <h1 className="text-lg font-bold text-white mb-1">
                        Emoji Maker
                    </h1>
                    <p className="text-[10px] text-white/50 max-w-[250px]">
                        AI Custom Emojis.
                    </p>
                </div>

                <EmojiGenerator />
            </div>
        </main>
    );
}
