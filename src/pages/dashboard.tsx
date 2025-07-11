import { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import { StatsOverview } from "@/components/stats-overview";
import { AgentGrid } from "@/components/agent-grid";
import { AgentDetailsModal } from "@/components/agent-details-modal";
import { ConfigModal } from "@/components/config-modal";
import { NetworkTopology } from "@/components/network-topology";
import { AdvancedReports } from "@/components/advanced-reports";
import { HistoryTimeline } from "@/components/history-timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Settings, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockAgents, mockStats, mockDatabaseStats } from "@/lib/mockData";

interface Agent {
  id: number;
  hostname: string;
  status: string;
  lastSeen: Date;
  platform: string;
  ip: string;
  userInfo: string;
  connectionType: string;
  adapterName: string;
  adapterStatus: string;
  allAdapters: Array<{
    name: string;
    connectionId: string;
    type: string;
    status: string;
  }>;
  connectivityDetails: {
    router: boolean;
    target: boolean;
    internet: boolean;
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  
  // Use mock data instead of API calls
  const agents = mockAgents;
  const stats = mockStats;
  const dbStats = mockDatabaseStats;
  const isConnected = true; // Mock connection status

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDetails(true);
  };

  const handleExportData = () => {
    const dataToExport = {
      agents,
      stats,
      dbStats,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-monitoring-demo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    console.log('Demo: Data refreshed');
  };

  const handleTabChange = (tab: string) => {
    setIsTabLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabLoading(false);
    }, 150);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Network Monitoring Dashboard (Demo)</h2>
              <p className="text-slate-600 mt-1">Demo version with sample data - deploy agents to see real connectivity status</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </Badge>
              
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button onClick={() => setShowConfig(true)} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h2>
          </motion.div>

          {isTabLoading && (
            <motion.div 
              className="flex items-center justify-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 border-4 border-blue-200 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <motion.p 
                  className="text-slate-600 font-medium"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading {activeTab}...
                </motion.p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isTabLoading && activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                className="space-y-8"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <motion.div 
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02, duration: 0.15 }}
                >
                  <h3 className="font-semibold text-blue-900">Dashboard View</h3>
                  <p className="text-blue-700 text-sm">Network overview with stats and all agents</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04, duration: 0.15 }}
                >
                  <StatsOverview stats={stats} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.15 }}
                >
                  <AgentGrid 
                    agents={agents}
                    onAgentClick={handleAgentClick}
                    onExport={handleExportData}
                  />
                </motion.div>
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <HistoryTimeline />
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'reports' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <AdvancedReports />
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'topology' && (
              <motion.div 
                key="topology"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <NetworkTopology />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AgentDetailsModal
        agent={selectedAgent}
        isOpen={showAgentDetails}
        onClose={() => setShowAgentDetails(false)}
      />

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </div>
  );
}
