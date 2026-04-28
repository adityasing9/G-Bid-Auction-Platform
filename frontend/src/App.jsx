import { Routes, Route, Link } from 'react-router-dom';
import { useWallet } from './hooks/useWallet';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CreateAuction from './pages/CreateAuction';
import AuctionDetail from './pages/AuctionDetail';
import Leaderboard from './pages/Leaderboard';
import Navbar from './components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { account } = useWallet();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent-yellow selection:text-black overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-yellow/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-green/10 blur-[120px] rounded-full"></div>
      </div>

      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateAuction />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-white/50 text-sm">
        <p>© 2026 BIDCRYPT DECENTRALIZED PLATFORM. BUILT FOR THE FUTURE.</p>
      </footer>
    </div>
  );
}

export default App;
