import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#050510] text-white overflow-hidden relative selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]"></div>
                <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20"></div> {/* Optional grid texture */}
            </div>

            {/* Navbar */}
            <nav className="relative z-10 mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image src="/assets/logo.png" alt="Base Standard Logo" width={40} height={40} className="w-10 h-10 object-contain" />
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        The Base Standard
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Leaderboard
                    </Link>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]">
                        Connect Wallet
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 text-center px-4">
                <div className="mb-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <Image
                        src="/assets/logo.png"
                        alt="Hero Logo"
                        width={180}
                        height={180}
                        className="relative w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_0_35px_rgba(59,130,246,0.5)]"
                    />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    Establish Your <br />
                    <span className="text-blue-500">On-Chain Credibility</span>
                </h1>

                <p className="max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed">
                    The Base Standard quantifies your reputation across Base and Zora networks.
                    Earn your tier, mint your achievement card, and prove your commitment to the ecosystem.
                </p>

                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95">
                    Connect Wallet
                </button>
            </section>

            {/* Metrics Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Base Tenure", desc: "Days since your first transaction on Base L2. Every day counts toward your reputation.", icon: "🕒" },
                        { title: "Zora Mints", desc: "NFTs minted on Zora. Early adopters get bonus points for minting within 24 hours.", icon: "🎨" },
                        { title: "Early Adopter Bonus", desc: "Bonus multipliers for being among the first to engage with new collections and protocols.", icon: "⚡" }
                    ].map((item, i) => (
                        <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
                            <div className="text-4xl mb-4 bg-white/10 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">{item.icon}</div>
                            <h3 className="text-xl font-bold text-blue-400 mb-2">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tiers Section */}
            <section className="relative z-10 py-32 text-center">
                <h2 className="text-4xl font-bold mb-4">Reputation Tiers</h2>
                <p className="text-gray-400 mb-16">Earn your status. Mint your achievement. Show your dedication.</p>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { img: "/assets/card-bronze.jpg", name: "Bronze", score: "100-499" },
                        { img: "/assets/card-silver.jpg", name: "Silver", score: "500-849" },
                        { img: "/assets/card-gold.jpg", name: "Gold", score: "850+" },
                        { img: "/assets/card-based.jpg", name: "Based", score: "Elite Status" }
                    ].map((tier, i) => (
                        <div key={i} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4]">
                                <Image
                                    src={tier.img}
                                    alt={`${tier.name} Tier Card`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                    <p className="text-xs font-mono text-blue-300 uppercase tracking-widest mb-1">{tier.name}</p>
                                    <p className="font-bold text-white">{tier.score}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="relative z-10 py-24 bg-gradient-to-b from-transparent to-blue-900/10">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">Project Roadmap</h2>
                    <p className="text-gray-400 mb-12">Building the future of on-chain reputation</p>
                    <div className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image
                            src="/assets/roadmap.png"
                            alt="Project Roadmap"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="relative z-10 py-32 text-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <div className="relative px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Check Your Rank?</h2>
                    <p className="text-gray-400 mb-8">Connect your wallet and discover where you stand in the Base ecosystem.</p>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white text-lg px-10 py-4 rounded-full font-bold transition-all shadow-[0_0_50px_-10px_rgba(37,99,235,0.4)]">
                        Connect Wallet
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-12 text-center text-sm text-gray-500">
                <p>© 2026 The Base Standard. Built on Base.</p>
            </footer>
        </main>
    );
}
