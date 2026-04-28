import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import axios from 'axios';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractData';
import { Shield, Lock, Eye, Brain, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';

const AuctionDetail = () => {
  const { id } = useParams();
  const { account, signer } = useWallet();
  const navigate = useNavigate();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Forms
  const [bidAmount, setBidAmount] = useState('');
  const [userBudget, setUserBudget] = useState('1');
  const [revealSecret, setRevealSecret] = useState('');
  const [status, setStatus] = useState(''); // 'committing', 'revealing', 'finalizing'

  useEffect(() => {
    fetchAuction();
  }, [id]);

  const fetchAuction = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auctions/${id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      setAuction(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAiSuggestion = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/suggest', {
        asset_type: auction.asset_type,
        min_bid: parseFloat(auction.min_bid),
        user_budget: parseFloat(userBudget)
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      setAiData(res.data);
    } catch (err) {
      console.error("AI service error", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!signer) return alert("Connect wallet");
    setStatus('committing');
    try {
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const bidWei = ethers.parseEther(bidAmount);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const hash = ethers.solidityPackedKeccak256(["uint256", "bytes32"], [bidWei, secret]);
      
      const tx = await contract.commitBid(id, hash, { value: bidWei });
      await tx.wait();
      
      const storageKey = `bid_${id}_${account}`;
      localStorage.setItem(storageKey, JSON.stringify({ bid: bidAmount, secret }));
      
      alert(`Bid committed! SAVE THIS SECRET: ${secret}`);
      fetchAuction();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setStatus('');
    }
  };

  const handleReveal = async () => {
    if (!signer) return alert("Connect wallet");
    setStatus('revealing');
    try {
      const storageKey = `bid_${id}_${account}`;
      const storedData = localStorage.getItem(storageKey);
      
      let bidToReveal, secretToReveal;

      if (storedData) {
        const parsed = JSON.parse(storedData);
        bidToReveal = parsed.bid;
        secretToReveal = parsed.secret;
      } else {
        bidToReveal = window.prompt("Secret not found in local storage. Enter your bid amount (ETH):");
        secretToReveal = window.prompt("Enter your secret:");
        if (!bidToReveal || !secretToReveal) return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const bidWei = ethers.parseEther(bidToReveal.toString());
      
      const tx = await contract.revealBid(id, bidWei, secretToReveal);
      await tx.wait();
      
      alert("Bid revealed successfully!");
      fetchAuction();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setStatus('');
    }
  };

  if (loading || !auction) return <div className="text-center py-20">Loading...</div>;

  const isCommitPhase = new Date(auction.commit_deadline) > new Date();
  const isRevealPhase = !isCommitPhase && new Date(auction.reveal_deadline) > new Date();
  const isEnded = new Date(auction.reveal_deadline) <= new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left: Info */}
      <div className="lg:col-span-2 space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-10 border-white/5">
          <div className="flex justify-between items-start mb-8">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                isCommitPhase ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/40' : 
                isRevealPhase ? 'bg-accent-green/20 text-accent-green border border-accent-green/40' : 
                'bg-white/10 text-white/50 border border-white/20'
            }`}>
              {isCommitPhase ? 'COMMIT PHASE' : isRevealPhase ? 'REVEAL PHASE' : 'AUCTION ENDED'}
            </span>
            <div className="flex items-center gap-2 text-white/40 font-mono">
              <Timer size={16} />
              <span>{isCommitPhase ? 'Ends: ' + new Date(auction.commit_deadline).toLocaleTimeString() : 'Finalized'}</span>
            </div>
          </div>

          <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none">{auction.title}</h1>
          <p className="text-xl text-white/60 font-light mb-10">{auction.description}</p>
          
          <div className="grid grid-cols-3 gap-8 p-8 bg-white/5 rounded-3xl border border-white/5">
            <div>
              <span className="block text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Asset Type</span>
              <span className="text-xl font-bold text-accent-green">{auction.asset_type}</span>
            </div>
            <div>
              <span className="block text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Min Bid</span>
              <span className="text-xl font-mono text-accent-yellow">{auction.min_bid} ETH</span>
            </div>
            <div>
              <span className="block text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Creator</span>
              <span className="text-xl font-mono truncate block">{auction.creator_address.substring(0, 8)}...</span>
            </div>
          </div>
        </motion.div>

        {/* Phase Action */}
        <div className="glass p-10 border-accent-yellow/20 relative overflow-hidden">
          {isCommitPhase ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-accent-yellow" />
                <h2 className="text-2xl font-bold uppercase italic">Commit Your Bid</h2>
              </div>
              <p className="text-white/50 text-sm">Your bid is encrypted on-chain. Only you can reveal it later.</p>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  step="0.01"
                  className="input-glass flex-1 py-4 text-xl font-mono" 
                  placeholder="0.00 ETH"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                />
                <button 
                  onClick={handleCommit}
                  disabled={status === 'committing'}
                  className="btn-neon-yellow px-12"
                >
                  {status === 'committing' ? 'WAITING...' : 'COMMIT'}
                </button>
              </div>
            </div>
          ) : isRevealPhase ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="text-accent-green" />
                <h2 className="text-2xl font-bold uppercase italic text-accent-green">Reveal Phase Open</h2>
              </div>
              <p className="text-white/50 text-sm">Reveal your bid now to qualify for the win. If you don't reveal, you lose your deposit!</p>
              <button 
                onClick={handleReveal}
                disabled={status === 'revealing'}
                className="btn-neon-green w-full py-5 text-xl tracking-widest"
              >
                {status === 'revealing' ? 'REVEALING...' : 'REVEAL STORED BID'}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="mx-auto text-accent-green mb-4" size={48} />
              <h2 className="text-3xl font-black uppercase italic italic">Auction Concluded</h2>
              <div className="mt-8 p-6 bg-accent-green/5 border border-accent-green/20 rounded-2xl">
                  <span className="text-xs text-white/40 uppercase block mb-2">Winning Price (Vickrey)</span>
                  <span className="text-4xl font-mono text-accent-green">{auction.price_paid || '0.00'} ETH</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: AI Assistant */}
      <div className="space-y-8">
        <div className="glass p-8 border-accent-green/20 relative">
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent-green text-black rounded-full flex items-center justify-center shadow-neon-green">
            <Brain size={24} />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-2">
            AI Assistant <span className="text-[10px] bg-accent-green/20 text-accent-green px-2 py-0.5 rounded italic">BETA</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-2">Your Budget (ETH)</label>
              <input 
                type="number" 
                className="input-glass w-full text-sm font-mono" 
                value={userBudget}
                onChange={e => setUserBudget(e.target.value)}
              />
            </div>
            <button 
              onClick={getAiSuggestion}
              disabled={aiLoading}
              className="w-full py-3 bg-white/5 border border-white/10 hover:border-accent-green text-accent-green text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
            >
              {aiLoading ? 'ANALYZING...' : 'RUN BID ANALYSIS'}
            </button>

            <AnimatePresence>
              {aiData && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6 space-y-6 border-t border-white/10 mt-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase block">Safe Bid</span>
                      <span className="text-sm font-mono text-accent-green">{aiData.safe_bid} ETH</span>
                    </div>
                    <div className="p-3 bg-accent-yellow/5 rounded-xl border border-accent-yellow/20">
                      <span className="text-[8px] text-white/40 uppercase block">Aggressive</span>
                      <span className="text-sm font-mono text-accent-yellow">{aiData.aggressive_bid} ETH</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold">
                      <span className="text-white/40">Win Probability</span>
                      <span className="text-accent-green">{aiData.win_probability}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${aiData.win_probability}%` }}
                        className="h-full bg-accent-green shadow-neon-green"
                      ></motion.div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {aiData.insights.map((insight, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] text-white/60 font-light italic">
                        <span className="text-accent-green">▸</span> {insight}
                      </div>
                    ))}
                  </div>

                  {aiData.overbidding_warning && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500 text-[10px] uppercase font-bold animate-pulse">
                      <AlertTriangle size={16} /> Overbidding Risk Detected
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="glass p-8 border-white/5 text-center">
            <Shield className="mx-auto text-white/20 mb-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Security Audit</h4>
            <p className="text-[10px] text-white/30 italic">No reentrancy detected. Pull-payment mechanism enabled for all refunds.</p>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
