import { BarChart3, Computer, FileText, Router, Settings, TrendingUp, Network, Database } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'agents', name: 'Agents', icon: Computer },
    { id: 'topology', name: 'Network Topology', icon: Network },
    { id: 'history', name: 'History', icon: TrendingUp },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-800 text-white flex-shrink-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Router className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">NetMonitor</h1>
        </div>
      </div>
      
      <nav className="mt-8 flex-1">
        <div className="px-6 mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</h3>
        </div>
        
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-6 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Server Online</p>
            <p className="text-xs text-slate-400">172.16.49.185</p>
          </div>
        </div>
      </div>
    </div>
  );
}
