import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Monitor, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api, type Agent } from "@/lib/api";
import { HealthScoreBadge } from "@/components/health-score-badge";

interface AgentGridProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
  onExport: () => void;
}

export function AgentGrid({ agents, onAgentClick, onExport }: AgentGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentDisconnections, setAgentDisconnections] = useState<Record<string, number>>({});

  // Fetch working hours disconnections for all agents
  useEffect(() => {
    const fetchDisconnections = async () => {
      const disconnectionData: Record<string, number> = {};
      
      for (const agent of agents) {
        try {
          const result = await api.getWorkingHoursDisconnections(agent.hostname);
          disconnectionData[agent.hostname] = result.disconnections;
        } catch (error) {
          console.error(`Failed to fetch disconnections for ${agent.hostname}:`, error);
          disconnectionData[agent.hostname] = 0;
        }
      }
      
      setAgentDisconnections(disconnectionData);
    };

    if (agents.length > 0) {
      fetchDisconnections();
    }
  }, [agents]);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         '';
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform?: string) => {
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Agent Status</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => onAgentClick(agent)}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900 truncate">
                  {agent.hostname}
                  {agent.username && (
                    <span className="text-slate-500 text-sm ml-1">({agent.username})</span>
                  )}
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusIndicator(agent.status)}`}></div>
                    <Badge variant="outline" className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                  {agentDisconnections[agent.hostname] !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={`flex items-center space-x-1 ${
                        agentDisconnections[agent.hostname] > 5 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : agentDisconnections[agent.hostname] > 2
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      <span>{agentDisconnections[agent.hostname]}</span>
                    </Badge>
                  )}
                </div>
              </div>
              
              {agentDisconnections[agent.hostname] !== undefined && (
                <div className="mb-2 text-xs text-slate-500">
                  Working Hours Disconnections Today (07:00-17:00): {agentDisconnections[agent.hostname]}
                </div>
              )}
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Last Seen:</span>
                  <span>{formatDistanceToNow(new Date(agent.lastSeen), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Platform:</span>
                  <div className="flex items-center space-x-1">
                    {getPlatformIcon(agent.platform)}
                    <span>{agent.platform || 'Unknown'}</span>
                  </div>
                </div>
                {agent.ip && (
                  <div className="flex items-center justify-between">
                    <span>IP Address:</span>
                    <span className="font-mono text-xs">{agent.ip}</span>
                  </div>
                )}
                {agent.connectionType && (
                  <div className="flex items-center justify-between">
                    <span>Connection:</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        agent.connectionType === 'ethernet' ? 'bg-blue-500' :
                        agent.connectionType === 'lan' ? 'bg-green-500' :
                        agent.connectionType === 'wifi' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="capitalize">{agent.connectionType}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Network Health Score */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Network Health:</span>
                  <HealthScoreBadge score={agent.healthScore} size="sm" showLabel={false} />
                </div>
                {agent.uptimePercentage !== undefined && (
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>24h Uptime:</span>
                    <span>{agent.uptimePercentage}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredAgents.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No agents found matching your criteria.
          </div>
        )}
        
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <p>Showing {filteredAgents.length} of {agents.length} agents</p>
        </div>
      </CardContent>
    </Card>
  );
}
