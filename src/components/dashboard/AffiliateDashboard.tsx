import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Award, CheckCircle2, ChevronRight, Package, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc } from 'firebase/firestore';



const tiers = [
  { name: 'Silver', threshold: 0, discount: '15%', color: '#94a3b8' },
  { name: 'Gold', threshold: 50, discount: '25%', color: '#d4af37' },
  { name: 'Platinum', threshold: 200, discount: '40%', color: '#ffffff' },
];

export default function AffiliateDashboard() {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({
    cumulativeSales: 0,
    totalUnits: 0,
    currentTier: 'Silver',
    discountCode: 'PENDING'
  });

  useEffect(() => {
    if (userProfile?.affiliateCode) {
      setStats(prev => ({ ...prev, discountCode: userProfile.affiliateCode }));
    }
  }, [userProfile]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    // Fetch stats
    const unsubscribeStats = onSnapshot(doc(db, 'affiliates', user.uid), (doc) => {
      if (doc.exists()) {
        setStats(prev => ({ ...prev, ...doc.data() }));
      }
    }, (err) => handleFirestoreError(err, 'get', `affiliates/${user.uid}`));

    // Fetch sales by affiliateId
    const q = query(
      collection(db, 'sales'), 
      where('affiliateId', '==', user.uid)
    );
    
    const unsubscribeSales = onSnapshot(q, (snapshot) => {
      const fetchedSales = snapshot.docs.map(d => {
        const data = d.data();
        let timestamp = data.timestamp;
        // Normalize timestamp to ISO string or Javascript.Date/number so new Date(sale.timestamp) works perfectly
        if (timestamp) {
          if (typeof timestamp.toDate === 'function') {
            timestamp = timestamp.toDate().toISOString();
          } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
            timestamp = new Date(timestamp.seconds * 1000).toISOString();
          }
        }
        return { id: d.id, ...data, timestamp };
      });

      // Sort client-side by timestamp descending
      fetchedSales.sort((a: any, b: any) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });

      setSales(fetchedSales);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, 'list', 'sales');
      setLoading(false);
    });

    return () => {
      unsubscribeStats();
      unsubscribeSales();
    };
  }, [user, userProfile]);

  const nextTier = tiers.find(t => t.threshold > stats.totalUnits) || tiers[tiers.length - 1];
  const progress = Math.min((stats.totalUnits / (nextTier.threshold || 200)) * 100, 100);

  // Prepare chart data from real sales
  const chartData = sales.reduce((acc: any[], sale) => {
    const month = new Date(sale.timestamp).toLocaleString('default', { month: 'short' });
    const existing = acc.find(a => a.name === month);
    if (existing) {
      existing.sales += sale.amount;
      existing.units += sale.units;
    } else {
      acc.push({ name: month, sales: sale.amount, units: sale.units });
    }
    return acc;
  }, []).slice(0, 7).reverse();

  const displayData = chartData.length > 0 ? chartData : [
    { name: 'None', sales: 0, units: 0 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Cumulative Revenue', value: `$${stats.cumulativeSales.toLocaleString()}`, icon: <DollarSign />, trend: '+0%' },
          { label: 'Total Units Sold', value: stats.totalUnits.toString(), icon: <Package />, trend: '+0 Units' },
          { label: 'Current Tier', value: stats.currentTier, icon: <Award />, color: 'text-aura-gold' },
          { label: 'Reseller Discount', value: `${tiers.find(t => t.name === stats.currentTier)?.discount || '15%'} OFF`, icon: <TrendingUp />, color: 'text-emerald-500' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
              )}
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className={`text-2xl font-display font-bold ${stat.color || 'text-white'}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold italic">Revenue <span className="text-aura-gold">Velocity.</span></h3>
              <p className="text-xs text-zinc-500">Trailing 7-month performance overview.</p>
            </div>
            <select className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer">
              <option>Last 7 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#d4af37" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800">
          <h3 className="text-xl font-bold italic mb-8">Tier <span className="text-aura-gold">Progression.</span></h3>
          
          <div className="space-y-8">
            <div className="relative pt-12 text-center">
              <div className="w-32 h-32 rounded-full border-4 border-zinc-900 border-t-aura-gold mx-auto flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-3xl font-display font-bold">{tiers.find(t => t.name === stats.currentTier)?.discount || '15'}<span className="text-xs text-zinc-500 font-sans">%</span></div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Discount</div>
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-aura-gold text-aura-black text-[9px] font-bold uppercase tracking-widest rounded-full">
                  {stats.currentTier} Tier
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="text-zinc-500">Next: {nextTier.name}</span>
                <span className="text-aura-gold">
                  {stats.totalUnits < nextTier.threshold ? `${nextTier.threshold - stats.totalUnits} units to go` : 'Max Tier Reached'}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-aura-gold"
                />
              </div>
              <p className="mt-4 text-[11px] text-zinc-500 italic leading-relaxed text-center"> Reach 200 units to unlock 40% distributor pricing on all hardware.</p>
            </div>

            <div className="pt-6 border-t border-zinc-800">
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Your Exclusive Code</div>
               <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl group cursor-pointer hover:border-aura-gold transition-all">
                  <code className="text-aura-gold font-mono font-bold">{stats.discountCode}</code>
                  <span className="text-[9px] font-bold text-zinc-700 group-hover:text-white uppercase tracking-widest transition-colors">Copy</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-bold italic">Transaction <span className="text-aura-gold">History.</span></h3>
           <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white">Full Export</button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Order ID</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Date</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Units</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Commission</th>
                <th className="pb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-600 italic text-xs">
                    No transactions recorded for this code yet.
                  </td>
                </tr>
              ) : sales.map((sale, i) => (
                <tr key={sale.id} className="group">
                  <td className="py-5 font-mono text-xs text-white group-hover:text-aura-gold transition-colors">#{sale.id.slice(-6).toUpperCase()}</td>
                  <td className="py-5 text-xs text-zinc-500">{new Date(sale.timestamp).toLocaleDateString()}</td>
                  <td className="py-5 text-xs text-zinc-300 font-medium">{sale.units} units</td>
                  <td className="py-5 text-xs text-aura-gold font-bold text-right">${sale.amount.toLocaleString()}</td>
                  <td className="py-5 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded text-emerald-500 bg-emerald-500/5">
                      Cleared
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
