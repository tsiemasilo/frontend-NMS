import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Clock, Activity, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { format, subDays, isToday, isYesterday, startOfDay, endOfDay } from "date-fns";
import { mockAgents, mockTimelineEvents, mockTrendData, mockUptimeSegments } from "@/lib/mockData";

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

interface TimelineEvent {
  id: number;
  hostname: string;
  status: string;
  timestamp: string;
  duration?: number;
  connectionType?: string;
  adapterName?: string;
  timeAgo: string;
  isStatusChange: boolean;
}

interface TrendData {
  date: string;
  uptime: number;
  disconnects: number;
  avgResponseTime: number;
  stability: number;
}

interface UptimeSegment {
  start: string;
  end: string;
  status: 'connected' | 'disconnected';
  duration: number;
  agent: string;
}

export function HistoryTimeline() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [uptimeSegments, setUptimeSegments] = useState<UptimeSegment[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Use mock data instead of API calls
  useEffect(() => {
    setAgents(mockAgents);
    setTimelineEvents(mockTimelineEvents);
    setTrendData(mockTrendData);
    setUptimeSegments(mockUptimeSegments);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTimelineEvents(mockTimelineEvents);
      setTrendData(mockTrendData);
      setUptimeSegments(mockUptimeSegments);
      setIsLoading(false);
    }, 1000);
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredEvents = selectedAgent === 'all' 
    ? timelineEvents 
    : timelineEvents.filter(event => event.hostname === selectedAgent);

  const filteredTrendData = selectedAgent === 'all' 
    ? trendData 
    : trendData.filter(trend => trend.date.includes(selectedAgent));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network History</h2>
          <p className="text-gray-600">Timeline of network events and connectivity patterns</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Events</span>
              </CardTitle>
              <CardDescription>
                Latest network connectivity events across all agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <select 
                  value={selectedAgent} 
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent.hostname} value={agent.hostname}>
                      {agent.hostname}
                    </option>
                  ))}
                </select>
              </div>

              <ScrollArea className="h-96 w-full">
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0 mt-1">
                        {event.status === 'connected' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={event.status === 'connected' ? 'default' : 'destructive'}>
                            {event.status}
                          </Badge>
                          <span className="text-sm font-medium">{event.hostname}</span>
                          <span className="text-xs text-gray-500">{event.timeAgo}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {event.connectionType && (
                            <span className="mr-4">
                              Connection: {event.connectionType}
                            </span>
                          )}
                          {event.adapterName && (
                            <span>
                              Adapter: {event.adapterName}
                            </span>
                          )}
                        </div>
                        
                        {event.duration && (
                          <div className="text-xs text-gray-500 mt-1">
                            Duration: {Math.round(event.duration / 60)} minutes
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 text-right">
                        {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Uptime Trends</span>
                </CardTitle>
                <CardDescription>7-day uptime percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={filteredTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Uptime']} />
                    <Line 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Daily Disconnections</span>
                </CardTitle>
                <CardDescription>Number of disconnections per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filteredTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="disconnects" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stability Score</CardTitle>
              <CardDescription>Overall network stability over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={filteredTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Stability']} />
                  <Line 
                    type="monotone" 
                    dataKey="stability" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uptime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uptime Visualization</CardTitle>
              <CardDescription>Visual representation of uptime/downtime periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Disconnected</span>
                  </div>
                </div>
                
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-3">
                    {uptimeSegments.map((segment, index) => (
                      <div key={index} className="flex items-center space-x-4 p-2 rounded-md bg-gray-50">
                        <div className="flex-shrink-0 w-20 text-sm font-medium">
                          {segment.agent}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div 
                              className={`w-4 h-4 rounded ${
                                segment.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <span className="text-sm font-medium capitalize">{segment.status}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {format(new Date(segment.start), 'MMM dd, HH:mm')} - {format(new Date(segment.end), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round(segment.duration / 60)} min
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
