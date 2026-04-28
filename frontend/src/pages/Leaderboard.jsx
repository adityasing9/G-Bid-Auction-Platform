import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('https://bidcrypt.onrender.com/api/leaderboard', {
          headers: { 'Content-Type': 'application/json' }
        });
        setLeaders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-20 h-20 bg-accent-yellow/20 text-accent-yellow rounded-full flex items-center justify-center mx-auto mb-6 shadow-neon-yellow"
        >
          <Trophy size={40} />
        </motion.div>
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">Top Bidders</h1>
        <p className="text-white/40 uppercase tracking-[0.3em] text-xs mt-2">The most successful strategists on-chain</p>
      </div>

      <div className="glass border-white/5 overflow-hidden">
        <div className="grid grid-cols-4 p-6 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">
          <div className="col-span-2">Bidder Wallet</div>
          <div className="text-center">Wins</div>
          <div className="text-center">Win Rate</div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-white/20 uppercase tracking-widest italic">Calculating rankings...</div>
        ) : leaders.length === 0 ? (
          <div className="p-20 text-center text-white/20 uppercase tracking-widest italic">No data available yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaders.map((leader, idx) => (
              <motion.div 
                key={leader.wallet_address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="grid grid-cols-4 p-8 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-2 flex items-center gap-6">
                  <div className="w-10 h-10 flex items-center justify-center font-black italic text-xl">
                    {idx === 0 ? <Medal className="text-accent-yellow" size={32} /> : 
                     idx === 1 ? <Medal className="text-accent-green" size={28} /> : 
                     idx === 2 ? <Medal className="text-white/50" size={24} /> : 
                     <span className="text-white/20">#{idx + 1}</span>}
                  </div>
                  <div>
                    <span className="font-mono text-lg block">{leader.wallet_address.substring(0, 10)}...{leader.wallet_address.substring(38)}</span>
                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter flex items-center gap-1">
                        <TrendingUp size={10} /> Active Bidding History
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-accent-green italic tracking-tighter">{leader.wins}</span>
                  <span className="block text-[8px] text-white/30 uppercase font-bold">Victories</span>
                </div>
                <div className="text-center">
                  <div className="relative inline-block">
                    <span className="text-2xl font-black italic tracking-tighter">{Math.round(leader.win_rate)}%</span>
                    <div className="absolute -right-4 -top-2">
                        <Award size={14} className="text-accent-yellow" />
                    </div>
                  </div>
                  <span className="block text-[8px] text-white/30 uppercase font-bold">Efficiency</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-8">
        {[
          { label: "Total Auctions", value: "1,284", icon: <TrendingUp size={16} /> },
          { label: "Total Volume", value: "482.5 ETH", icon: <Award size={16} /> },
          { label: "Active Users", value: "892", icon: <Medal size={16} /> }
        ].map((stat, i) => (
          <div key={i} className="glass p-6 text-center border-white/5">
            <div className="flex items-center justify-center gap-2 text-white/30 mb-2">
                {stat.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-accent-yellow">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
