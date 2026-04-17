import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, CreditCard, Calendar, ExternalLink, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface CreatorEscrow {
  id: string;
  name: string;
  handle: string;
  wallet_address: string;
  tiers: any[];
  created_at: string;
}

export default function EscrowList({ adminAddress }: { adminAddress: string }) {
  const [creators, setCreators] = useState<CreatorEscrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEscrow();
  }, [adminAddress]);

  const fetchEscrow = async () => {
    try {
      const res = await fetch(`/api/admin/escrow?address=${adminAddress}`);
      const data = await res.json();
      if (data.creators) {
        setCreators(data.creators);
      }
    } catch (e) {
      console.error("Escrow fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center">Loading escrow data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Creator</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">BSC Address</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Plans (Tiers)</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {creators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-500">No sellers registered in escrow yet.</td>
                </tr>
              ) : creators.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-300" />
                      {c.wallet_address || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">
                      {(c.tiers || []).map((t: any, idx: number) => (
                        <div key={idx} className="bg-gray-100 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-200">
                          {t.name} ({t.price} WYDA)
                          {t.auto_renew && <span className="ml-1 text-[#FF424D]">★</span>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100 text-[#FF424D]">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#FF424D]/5 border border-[#FF424D]/10 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FF424D] shadow-sm">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Escrow Security</h4>
          <p className="text-sm text-gray-500">You are viewing verified seller information as an administrator.</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs font-bold text-gray-300">
           <span className="w-2 h-2 rounded-full bg-green-500" />
           LIVE MONITORING
        </div>
      </div>
    </div>
  );
}
