import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-block px-4 py-1.5 mb-6 glass border-accent-green/30 text-accent-green text-xs font-bold tracking-[0.2em] uppercase rounded-full">
            Next-Gen Sealed-Bid Protocol
          </div>
          <h1 className="text-7xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic">
            Bid in <span className="text-accent-yellow">Shadows</span><br />
            Win in <span className="text-accent-green">Light</span>
          </h1>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            The world's most secure decentralized Vickrey auction platform. 
            No front-running. No manipulation. Just pure game theory on-chain.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/dashboard" className="btn-neon-yellow px-10 py-5 text-lg group flex items-center gap-3">
              Explore Auctions <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/create" className="glass px-10 py-5 text-lg border-white/20 hover:border-white/40 transition-all">
              Create Auction
            </Link>
          </div>
        </motion.div>

        {/* Floating Elements (Visual Polish) */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 border border-accent-yellow/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 w-96 h-96 border border-accent-green/10 rounded-full rotate-45"></div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <ShieldCheck className="text-accent-yellow" size={32} />,
            title: "Sealed-Bid Logic",
            desc: "All bids are hashed (keccak256). No one, not even the creator, knows your bid until the reveal phase."
          },
          {
            icon: <Zap className="text-accent-green" size={32} />,
            title: "Anti-Frontrunning",
            desc: "The commit-reveal mechanism makes front-running mathematically impossible. Your strategy stays private."
          },
          {
            icon: <BarChart3 className="text-accent-yellow" size={32} />,
            title: "AI Optimized",
            desc: "Real-time AI bidding assistant calculates the perfect bid range based on market dynamics and budget."
          }
        ].map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="glass-card p-8 group"
          >
            <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              {f.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{f.title}</h3>
            <p className="text-white/50 leading-relaxed font-light">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Vickrey Explanation */}
      <section className="glass p-12 rounded-[3rem] border-accent-green/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy size={200} className="text-accent-green" />
        </div>
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black mb-6 uppercase italic italic">The Vickrey Edge</h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            In our Second-Price auctions, the winner pays the <span className="text-accent-green font-bold text-2xl tracking-tight">2nd highest bid</span>. 
            This encourages truthful bidding—it's mathematically optimal to bid exactly what you think it's worth.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-xl border border-white/10">
              <span className="block text-xs text-white/40 uppercase mb-1">Standard</span>
              <span className="text-lg font-bold">Highest Price</span>
            </div>
            <div className="p-4 bg-accent-green/10 rounded-xl border border-accent-green/30">
              <span className="block text-xs text-accent-green uppercase mb-1">Our System</span>
              <span className="text-lg font-bold text-accent-green">Second-Price</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
