// "use client";

// export default function Home() {
//     return (
//         <div className="min-h-screen bg-white">
//             {/* Hero Section */}
//             <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
//                 <nav className="container mx-auto flex items-center justify-between px-6 py-4">
//                     <h1 className="text-2xl font-bold text-primary">Cryptea 🌱</h1>
//                     <div className="flex items-center gap-8">
//                         <button className="text-primary hover:text-primary-dark">Learn💡</button>
//                         <button className="text-primary hover:text-primary-dark">Go to app →</button>
//                         <button
//                             className="rounded-full bg-white px-6 py-2 text-primary shadow-md transition-all hover:shadow-lg"
//                             onClick={() => alert("Connecting Wallet...")}
//                         >
//                             Connect Wallet
//                         </button>
//                     </div>
//                 </nav>
//             </header>

//             {/* Main Content */}
//             <main className="container mx-auto">
//                 {/* Hero Content */}
//                 <section className="relative mb-32 mt-20 text-center">
//                     <div className="relative mx-auto mb-16 h-48 w-48">
//                         <img
//                             src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/U20HcxoreG/vfq1faut_expires_30_days.png"
//                             className="h-full w-full animate-float object-contain"
//                         />
//                     </div>

//                     <h1 className="mb-8 text-5xl font-bold leading-tight text-primary md:text-6xl">
//                         While you grinding
//                         <br />
//                         don’t forget to have a tea.
//                     </h1>

//                     <a
//                         href="https://en.wikipedia.org/wiki/Tea"
//                         target="_blank"
//                         className="inline-block text-lg text-primary underline hover:text-primary-dark"
//                     >
//                         Read the benefits of tea on Wikipedia
//                     </a>
//                 </section>

//                 {/* Featured Collection */}
//                 <section className="mb-32 rounded-3xl bg-white/20 px-8 py-12 backdrop-blur-sm">
//                     <h2 className="mb-12 text-center text-3xl font-bold text-primary">
//                         Featured Collection
//                     </h2>

//                     <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//                         {[1, 2, 3].map((item) => (
//                             <div key={item} className="overflow-hidden rounded-2xl transition-transform hover:scale-105">
//                                 <img
//                                     src={`https://picsum.photos/375/385?random=${item}`}
//                                     className="h-96 w-full object-cover"
//                                     alt="NFT Collection"
//                                 />

//                                 <div className="bg-white/20 p-6 backdrop-blur-sm">
//                                     <div className="mb-4 flex items-center justify-between">
//                                         <div>
//                                             <h3 className="text-xl font-semibold text-primary">Collection {item}</h3>
//                                             <p className="text-sm text-primary/80">Unique description for collection...</p>
//                                         </div>
//                                         <button className="rounded-full bg-white px-6 py-2 text-primary hover:bg-primary hover:text-white">
//                                             Mint
//                                         </button>
//                                     </div>
//                                     <div className="flex items-center gap-4">
//                                         <div className="h-2 w-full rounded-full bg-white/30">
//                                             <div className="h-full w-3/4 rounded-full bg-primary"></div>
//                                         </div>
//                                         <span className="text-sm text-primary">75% minted</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Top Collectors */}
//                 <section className="mb-32 rounded-3xl bg-white/20 px-8 py-12 backdrop-blur-sm">
//                     <h2 className="mb-12 text-center text-3xl font-bold text-primary">
//                         Top Collectors
//                     </h2>

//                     <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//                         {[1, 2, 3, 4, 5, 6].map((item) => (
//                             <div key={item} className="flex items-center rounded-xl bg-white/20 p-4 backdrop-blur-sm">
//                                 <img
//                                     src={`https://i.pravatar.cc/50?img=${item}`}
//                                     className="mr-4 h-12 w-12 rounded-full"
//                                     alt="Collector"
//                                 />
//                                 <div>
//                                     <h4 className="font-semibold text-primary">0xEe95...7160</h4>
//                                     <p className="text-sm text-primary/80">1,234.56 $TEA</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>
//             </main>

//             {/* Footer */}
//             <footer className="bg-white/50 backdrop-blur-sm">
//                 <div className="container mx-auto flex flex-col items-center justify-between px-6 py-8 md:flex-row">
//                     <span className="mb-4 md:mb-0">@CRIPTEA 2025</span>
//                     <div className="flex gap-6">
//                         <a href="#" className="text-primary hover:text-primary-dark">Github</a>
//                         <a href="#" className="text-primary hover:text-primary-dark">Whitepaper</a>
//                         <a href="#" className="text-primary hover:text-primary-dark">Support</a>
//                         <a href="#" className="text-primary hover:text-primary-dark">Twitter</a>
//                     </div>
//                 </div>
//             </footer>
//         </div>
//     );
// }