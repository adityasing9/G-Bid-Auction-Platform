import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Users, ArrowUpRight, Search, Filter } from 'lucide-react';

const Dashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auctions');
        setAuctions(res.data);
      } catch (err) {
        console.error("Failed to fetch auctions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Live Auctions</h1>
          <p className="text-white/50 font-light mt-2 uppercase tracking-widest text-sm">Real-time decentralized markets</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="input-glass pl-12 pr-4 py-3 w-64 focus:w-80 transition-all"
            />
          </div>
          <button className="glass p-3 border-white/10 hover:border-accent-yellow transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="glass h-80 animate-pulse"></div>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="glass p-20 text-center">
          <p className="text-white/40 mb-6 uppercase tracking-widest">No active auctions found</p>
          <Link to="/create" className="btn-neon-yellow">Launch the first one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction, idx) => (
            <AuctionCard key={auction.id} auction={auction} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};

const AuctionCard = ({ auction, index }) => {
  const isCommitPhase = new Date(auction.commit_deadline) > new Date();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card group overflow-hidden"
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isCommitPhase ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30' : 'bg-accent-green/20 text-accent-green border border-accent-green/30'
          }`}>
            {isCommitPhase ? 'Commit Phase' : 'Reveal Phase'}
          </span>
          <span className="text-white/30 font-mono text-sm">#{auction.id}</span>
        </div>

        <h3 className="text-2xl font-bold mb-2 group-hover:text-accent-yellow transition-colors uppercase leading-none">
          {auction.title}
        </h3>
        <p className="text-white/50 text-sm mb-6 line-clamp-2 font-light">
          {auction.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-1">
            <span className="block text-[10px] text-white/30 uppercase font-bold tracking-tighter">Min Bid</span>
            <span className="text-lg font-mono">{auction.min_bid} ETH</span>
          </div>
          <div className="space-y-1 text-right">
            <span className="block text-[10px] text-white/30 uppercase font-bold tracking-tighter">Asset Type</span>
            <span className="text-lg font-bold text-accent-green italic">{auction.asset_type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{isCommitPhase ? 'Ends soon' : 'Reveal now'}</span>
            </div>
          </div>
          <Link 
            to={`/auction/${auction.id}`} 
            className="flex items-center gap-2 text-accent-yellow font-bold text-sm hover:gap-4 transition-all"
          >
            VIEW DETAILS <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
