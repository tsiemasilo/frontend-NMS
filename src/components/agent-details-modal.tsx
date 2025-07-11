import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Activity, Network, Monitor, Wifi, AlertCircle, CheckCircle } from "lucide-react";
import { mockAgentDetails } from "@/lib/mockData";

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

interface AgentDetailsModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AgentEvent {
  id: number;
  hostname: string;
  status: string;
  timestamp: string;
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

export function AgentDetailsModal({ agent, isOpen, onClose }: AgentDetailsModalProps) {
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agent && isOpen) {
      setIsLoading(true);
      setError(null);
      
      // Simulate loading delay and use mock data
      setTimeout(() => {
        setAgentDetails(mockAgentDetails);
        setIsLoading(false);
      }, 500);
    }
  }, [agent, isOpen]);

  if (!agent) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Agent Details...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error Loading Agent Details</DialogTitle>
          </DialogHeader>
          <div className="text-red-600 text-center py-4">
            {error}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>{agent.hostname}</span>
            <Badge variant={agent.status === 'connected' ? 'default' : 'destructive'}>
              {agent.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="adapters">Adapters</TabsTrigger>
            <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>System Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Platform:</span>
                    <span className="text-sm font-medium">{agent.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">IP Address:</span>
                    <span className="text-sm font-medium">{agent.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">User:</span>
                    <span className="text-sm font-medium">{agent.userInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Seen:</span>
                    <span className="text-sm font-medium">
                      {new Date(agent.lastSeen).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Network className="h-4 w-4" />
                    <span>Network Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Connection Type:</span>
                    <span className="text-sm font-medium">{agent.connectionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Adapter:</span>
                    <span className="text-sm font-medium">{agent.adapterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Adapter Status:</span>
                    <Badge variant={agent.adapterStatus === 'connected' ? 'default' : 'destructive'}>
                      {agent.adapterStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest activity from this agent</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-2">
                    {agentDetails?.events?.map((event: AgentEvent) => (
                      <div key={event.id} className="flex items-center space-x-3 p-2 rounded-md bg-gray-50">
                        <div className="flex-shrink-0">
                          {event.status === 'connected' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge variant={event.status === 'connected' ? 'default' : 'destructive'}>
                              {event.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {event.connectionType} - {event.adapterName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adapters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Adapters</CardTitle>
                <CardDescription>All network adapters detected on this agent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agent.allAdapters.map((adapter, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Wifi className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{adapter.name}</p>
                          <p className="text-xs text-gray-500">{adapter.connectionId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{adapter.type}</Badge>
                        <Badge variant={adapter.status === 'connected' ? 'default' : 'destructive'}>
                          {adapter.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connectivity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connectivity Test Results</CardTitle>
                <CardDescription>Latest connectivity test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Network className="h-4 w-4" />
                      <span className="text-sm font-medium">Router Connection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {agent.connectivityDetails.router ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {agent.connectivityDetails.router ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm font-medium">Target Server</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {agent.connectivityDetails.target ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {agent.connectivityDetails.target ? 'Reachable' : 'Unreachable'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Network className="h-4 w-4" />
                      <span className="text-sm font-medium">Internet Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {agent.connectivityDetails.internet ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {agent.connectivityDetails.internet ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
