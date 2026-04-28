import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { motion } from 'framer-motion';
import { Wallet, PlusCircle, Trophy, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { account, connectWallet } = useWallet();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent-yellow rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xl">G</span>
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic">
            G-Bid<span className="text-accent-yellow">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium uppercase text-sm tracking-widest">
          <Link to="/dashboard" className="hover:text-accent-yellow transition-colors flex items-center gap-2">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/create" className="hover:text-accent-yellow transition-colors flex items-center gap-2">
            <PlusCircle size={18} /> Create
          </Link>
          <Link to="/leaderboard" className="hover:text-accent-yellow transition-colors flex items-center gap-2">
            <Trophy size={18} /> Leaderboard
          </Link>
        </div>

        <div>
          {account ? (
            <div className="px-4 py-2 glass border-accent-green/50 flex items-center gap-2 text-accent-green font-mono text-sm">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="btn-neon-yellow flex items-center gap-2"
            >
              <Wallet size={18} /> Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
