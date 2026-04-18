import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, CreditCard, RefreshCw, Trash2, Search } from 'lucide-react';

interface Tier {
  name: string;
  price: number;
  perks: string[];
  auto_renew?: boolean;
}

interface EscrowCreator {
  id: string;
  name: string;
  wallet_address: string;
  tiers: Tier[];
}

interface EscrowViewProps {
  adminAddress: string;
}

const EscrowView: React.FC<EscrowViewProps> = ({ adminAddress }) => {
  const [escrowList, setEscrowList] = useState<EscrowCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEscrow();
  }, [adminAddress]);

  const fetchEscrow = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/escrow?address=${adminAddress}`);
      const data = await res.json();
      if (data.escrow) {
        setEscrowList(data.escrow);
      } else {
        setError(data.error || "Failed to load escrow data");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = escrowList.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center text-gray-500">Loading escrow data...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <ShieldCheck className="text-[#FF424D]" size={32} />
            Escrow System (Admin Only)
          </h2>
          <p className="text-gray-500">Monitoring all registered sellers and their plans.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF424D]/20 focus:border-[#FF424D] outline-none w-full md:w-80 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-bottom border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Seller / Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">BSC Address</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Plans & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(creator => (
                <tr key={creator.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{creator.name}</div>
                        <div className="text-xs text-gray-400">ID: {creator.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="font-mono text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 break-all max-w-[200px]">
                      {creator.wallet_address || 'Not Linked'}
                    </div>
                  </td>
                  <td className="px-6 py-6 font-sans">
                    <div className="flex flex-wrap gap-2">
                        {creator.tiers?.map((tier, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm min-w-[140px]">
                            <div className="font-bold text-sm mb-1">{tier.name}</div>
                            <div className="text-xs text-[#FF424D] font-black">{tier.price} WYDA</div>
                            <div className="mt-2 flex items-center justify-between">
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${tier.auto_renew ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <RefreshCw size={8} className={tier.auto_renew ? 'animate-spin-slow' : ''} />
                                    {tier.auto_renew ? 'Auto' : 'Manual'}
                                </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-20 text-center text-gray-400">
            No sellers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowView;
