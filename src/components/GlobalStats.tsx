'use client';

export function GlobalStats() {
  // Mock data - will be fetched from contracts
  const stats = [
    {
      title: "Total Value Locked",
      value: "$2.4M",
      change: "+12.5%",
      changeType: "positive",
      icon: "💰"
    },
    {
      title: "Active Users",
      value: "1,247",
      change: "+8.2%",
      changeType: "positive",
      icon: "👥"
    },
    {
      title: "Active Strategies",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: "⚡"
    },
    {
      title: "Avg APY",
      value: "11.2%",
      change: "+0.8%",
      changeType: "positive",
      icon: "📈"
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ color: '#0f172a' }}>
          Platform Overview
        </h2>
        <p className="text-lg leading-relaxed" style={{ color: '#475569' }}>
          Real-time statistics from our vault and registry contracts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-slate-800/80 rounded-xl p-6 shadow-sm border border-[#f1f5f9] dark:border-slate-700/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                stat.changeType === 'positive' 
                  ? 'bg-[#D1FAE5] dark:bg-green-900/30 text-[#065F46] dark:text-green-300'
                  : 'bg-[#FEE2E2] dark:bg-red-900/30 text-[#991B1B] dark:text-red-300'
              }`}>
                {stat.change}
              </div>
            </div>
            
            <div className="mb-2">
              <h3 className="text-3xl font-bold mb-1 tracking-tight" style={{ color: '#0f172a' }}>
                {stat.value}
              </h3>
              <p className="text-sm font-semibold" style={{ color: '#64748b' }}>
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
