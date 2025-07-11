import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Activity, Download, Search, Filter, Clock } from "lucide-react";
import { HealthScoreBadge } from "./health-score-badge";
import { mockAgents } from "@/lib/mockData";

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

interface AgentGridProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
  onExport: () => void;
}

export function AgentGrid({ agents, onAgentClick, onExport }: AgentGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('hostname');
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);

  useEffect(() => {
    let filtered = agents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.ip.includes(searchTerm) ||
        agent.userInfo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'hostname':
          return a.hostname.localeCompare(b.hostname);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'lastSeen':
          return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
        case 'platform':
          return a.platform.localeCompare(b.platform);
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, statusFilter, sortBy]);

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getHealthScore = (agent: Agent) => {
    // Simple health score calculation based on status and connectivity
    let score = 0;
    if (agent.status === 'connected') score += 50;
    if (agent.connectivityDetails?.router) score += 15;
    if (agent.connectivityDetails?.target) score += 20;
    if (agent.connectivityDetails?.internet) score += 15;
    return Math.min(score, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
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
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="disconnected">Disconnected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hostname">Hostname</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="lastSeen">Last Seen</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredAgents.length} of {agents.length} agents
          </Badge>
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <Card 
            key={agent.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onAgentClick(agent)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">{agent.hostname}</CardTitle>
                </div>
                <Badge variant={agent.status === 'connected' ? 'default' : 'destructive'}>
                  {agent.status}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {agent.userInfo} • {agent.ip}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform:</span>
                  <span className="text-sm font-medium">{agent.platform.split(' ')[0]}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection:</span>
                  <span className="text-sm font-medium capitalize">{agent.connectionType}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Adapter:</span>
                  <span className="text-sm font-medium">
                    {agent.adapterName.length > 20 
                      ? `${agent.adapterName.substring(0, 20)}...` 
                      : agent.adapterName}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Health Score:</span>
                  <HealthScoreBadge score={getHealthScore(agent)} size="sm" />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{getTimeSince(agent.lastSeen)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {agent.allAdapters.length} adapter{agent.allAdapters.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-8">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No network agents are currently registered.'}
          </p>
        </div>
      )}
    </div>
  );
}
