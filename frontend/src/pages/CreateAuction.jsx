import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contractData';
import { Rocket, Clock, Info } from 'lucide-react';
import axios from 'axios';

const CreateAuction = () => {
  const { signer, account } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetType: 'Art',
    minBid: '',
    commitDuration: '300', // 5 mins
    revealDuration: '300', // 5 mins
    antiSnipe: '60'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) return alert("Please connect wallet");

    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const minBidWei = ethers.parseEther(formData.minBid);
      
      const tx = await contract.createAuction(
        formData.title,
        formData.description,
        formData.assetType,
        minBidWei,
        parseInt(formData.commitDuration),
        parseInt(formData.revealDuration),
        parseInt(formData.antiSnipe)
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      
      // Parse event to get auctionId
      const event = receipt.logs.find(log => {
          try {
              const parsed = contract.interface.parseLog(log);
              return parsed.name === 'AuctionCreated';
          } catch(e) { return false; }
      });
      
      if (event) {
          const parsedLog = contract.interface.parseLog(event);
          const auctionId = parsedLog.args.auctionId.toString();
          
          // Sync with backend
          await axios.post('http://localhost:5000/api/sync/auction', {
              id: auctionId,
              title: formData.title,
              description: formData.description,
              category: formData.assetType,
              minBid: formData.minBid,
              commitDuration: formData.commitDuration,
              revealDuration: formData.revealDuration,
              account: account
          }, {
              headers: { 'Content-Type': 'application/json' }
          });
          
          navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert("Error creating auction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 border-accent-yellow/20"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-accent-yellow/20 rounded-xl flex items-center justify-center text-accent-yellow">
            <Rocket size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Launch Auction</h1>
            <p className="text-white/40 text-xs uppercase tracking-widest">Create a new sealed-bid market</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Asset Title</label>
              <input 
                required
                className="input-glass w-full py-3" 
                placeholder="e.g. Cyberpunk Genesis NFT" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Category</label>
              <select 
                className="input-glass w-full py-3 appearance-none"
                value={formData.assetType}
                onChange={e => setFormData({...formData, assetType: e.target.value})}
              >
                <option value="Art">Art</option>
                <option value="Digital">Digital</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Collectibles">Collectibles</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Min Bid (ETH)</label>
              <input 
                required
                type="number" step="0.001"
                className="input-glass w-full py-3" 
                placeholder="0.1" 
                value={formData.minBid}
                onChange={e => setFormData({...formData, minBid: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Description</label>
            <textarea 
              required
              rows={4}
              className="input-glass w-full py-3 resize-none" 
              placeholder="Tell the bidders what they are fighting for..." 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-white/40 mb-1">
                <Clock size={12} />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Commit</span>
              </div>
              <input 
                type="number" 
                className="bg-transparent text-xl font-mono focus:outline-none w-full" 
                value={formData.commitDuration}
                onChange={e => setFormData({...formData, commitDuration: e.target.value})}
              />
              <span className="text-[8px] text-white/20 uppercase">Seconds</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-white/40 mb-1">
                <Clock size={12} />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Reveal</span>
              </div>
              <input 
                type="number" 
                className="bg-transparent text-xl font-mono focus:outline-none w-full" 
                value={formData.revealDuration}
                onChange={e => setFormData({...formData, revealDuration: e.target.value})}
              />
              <span className="text-[8px] text-white/20 uppercase">Seconds</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-white/40 mb-1">
                <Info size={12} />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Snipe Ext.</span>
              </div>
              <input 
                type="number" 
                className="bg-transparent text-xl font-mono focus:outline-none w-full" 
                value={formData.antiSnipe}
                onChange={e => setFormData({...formData, antiSnipe: e.target.value})}
              />
              <span className="text-[8px] text-white/20 uppercase">Seconds</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-neon-yellow w-full py-4 text-xl flex items-center justify-center gap-3 mt-4"
          >
            {loading ? 'DEPLOYING TO CHAIN...' : 'LAUNCH AUCTION'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAuction;
