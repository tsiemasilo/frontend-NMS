import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Activity, AlertTriangle, Wifi, Zap, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api, type Agent, type AgentEvent } from "@/lib/api";
import { HealthScoreBadge } from "@/components/health-score-badge";

interface AgentDetailsModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentDetailsModal({ agent, isOpen, onClose }: AgentDetailsModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const { data: agentDetails, isLoading, error } = useQuery({
    queryKey: ['/api/agents', agent?.hostname],
    queryFn: () => api.getAgent(agent!.hostname),
    enabled: !!agent?.hostname && isOpen,
  });

  const handleExport = async () => {
    if (!agent) return;
    
    setIsExporting(true);
    try {
      const blob = await api.exportAgentHistory(agent.hostname);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agent.hostname.replace(/[^a-z0-9]/gi, '_')}_history.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'disconnected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Debug information */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">Error loading agent details: {error.message}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hostname</label>
              <p className="text-sm text-slate-900">{agent?.hostname}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <Badge variant="outline" className={getStatusColor(agent?.status || 'unknown')}>
                <div className={`w-2 h-2 rounded-full mr-2 ${getEventIcon(agent?.status || 'unknown')}`}></div>
                {agent?.status}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
              <p className="text-sm text-slate-900">{agent?.platform || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Seen</label>
              <p className="text-sm text-slate-900">
                {agent?.lastSeen ? formatDistanceToNow(new Date(agent.lastSeen), { addSuffix: true }) : 'Unknown'}
              </p>
            </div>
            {agent?.username && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                <p className="text-sm text-slate-900">{agent.username}</p>
              </div>
            )}
            {agent?.ip && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IP Address</label>
                <p className="text-sm text-slate-900 font-mono">{agent.ip}</p>
              </div>
            )}
            {agent?.connectionType && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Connection Type</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.connectionType === 'ethernet' ? 'bg-blue-500' :
                    agent.connectionType === 'lan' ? 'bg-green-500' :
                    agent.connectionType === 'wifi' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}></div>
                  <p className="text-sm text-slate-900 capitalize">{agent.connectionType}</p>
                </div>
              </div>
            )}
            {agent?.adapterName && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Network Adapter</label>
                <p className="text-sm text-slate-900">{agent.adapterName}</p>
              </div>
            )}
          </div>
          
          {/* Network Health Metrics */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Network Health Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="mb-2">
                  <HealthScoreBadge score={agent?.healthScore} size="lg" showLabel={false} />
                </div>
                <p className="text-xs text-slate-600">Overall Health Score</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-lg font-semibold text-blue-600">
                    {agent?.uptimePercentage || 0}%
                  </span>
                </div>
                <p className="text-xs text-slate-600">24h Uptime</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-lg font-semibold text-green-600">
                    {agent?.avgResponseTime || 0}ms
                  </span>
                </div>
                <p className="text-xs text-slate-600">Avg Response Time</p>
              </div>
            </div>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {agentDetails && (
            <div>
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Working Hours Analysis
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-slate-600 mb-1">Today's Disconnections (07:00-17:00)</label>
                    <p className={`text-lg font-semibold ${
                      agentDetails.workingHoursDisconnections > 5 
                        ? 'text-red-600' 
                        : agentDetails.workingHoursDisconnections > 2
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {agentDetails.workingHoursDisconnections} disconnections
                    </p>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Status</label>
                    <Badge variant="outline" className={
                      agentDetails.workingHoursDisconnections > 5 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : agentDetails.workingHoursDisconnections > 2
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }>
                      {agentDetails.workingHoursDisconnections > 5 
                        ? 'Frequent Issues' 
                        : agentDetails.workingHoursDisconnections > 2
                        ? 'Some Issues'
                        : 'Stable'
                      }
                    </Badge>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {agentDetails.events.map((event: AgentEvent) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getEventIcon(event.status)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 capitalize">{event.status}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </p>
                      {event.duration && (
                        <p className="text-xs text-slate-400">
                          Duration: {Math.round(event.duration / 1000)}s
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {agentDetails.events.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export History'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
