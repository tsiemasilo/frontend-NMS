import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api, type Agent, type AgentEvent } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { CalendarIcon, Clock, Activity, Zap, History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, differenceInMinutes, isToday, isYesterday } from 'date-fns';
import { motion } from 'framer-motion';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1d' | '3d' | '7d' | '30d'>('1d');
  const [viewMode, setViewMode] = useState<'timeline' | 'trends' | 'uptime'>('timeline');

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    refetchInterval: 5000,
  });

  // Fetch historical events
  const { data: timelineEvents = [] } = useQuery({
    queryKey: ['timeline-events', selectedDate, selectedAgent, timeRange],
    queryFn: async () => {
      const events: TimelineEvent[] = [];
      const targetAgents = selectedAgent === 'all' ? agents : agents.filter(a => a.hostname === selectedAgent);
      
      for (const agent of targetAgents) {
        try {
          const response = await fetch(`/api/agents/${agent.hostname}/events?date=${format(selectedDate, 'yyyy-MM-dd')}`);
          if (response.ok) {
            const agentEvents: AgentEvent[] = await response.json();
            
            // Process events and add timeline metadata
            let lastStatus = 'connected';
            agentEvents.forEach((event, index) => {
              const eventTime = new Date(event.timestamp);
              const timeAgo = getTimeAgo(eventTime);
              const isStatusChange = event.status !== lastStatus;
              
              events.push({
                ...event,
                timeAgo,
                isStatusChange,
              });
              
              lastStatus = event.status;
            });
          }
        } catch (error) {
          console.error(`Error fetching events for ${agent.hostname}:`, error);
        }
      }
      
      return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    refetchInterval: 10000,
  });

  // Fetch trend data for the selected period
  const { data: trendData = [] } = useQuery({
    queryKey: ['trend-data', timeRange],
    queryFn: async () => {
      const trends: TrendData[] = [];
      const days = timeRange === '1d' ? 1 : timeRange === '3d' ? 3 : timeRange === '7d' ? 7 : 30;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        let totalUptime = 0;
        let totalDisconnects = 0;
        let totalResponseTime = 0;
        let agentCount = 0;
        
        for (const agent of agents) {
          try {
            const [disconnectResponse, agentResponse] = await Promise.all([
              fetch(`/api/agents/${agent.hostname}/working-hours-disconnections?date=${dateStr}`),
              fetch(`/api/agents/${agent.hostname}`)
            ]);
            
            if (disconnectResponse.ok && agentResponse.ok) {
              const disconnectData = await disconnectResponse.json();
              const agentData = await agentResponse.json();
              
              totalDisconnects += disconnectData.disconnections || 0;
              totalUptime += agentData.agent?.uptimePercentage || 0;
              totalResponseTime += agentData.agent?.avgResponseTime || 0;
              agentCount++;
            }
          } catch (error) {
            console.error(`Error fetching trend data for ${agent.hostname}:`, error);
          }
        }
        
        if (agentCount > 0) {
          trends.push({
            date: format(date, 'MMM dd'),
            uptime: Math.round(totalUptime / agentCount),
            disconnects: totalDisconnects,
            avgResponseTime: Math.round(totalResponseTime / agentCount),
            stability: Math.max(0, 100 - (totalDisconnects * 10)) // Simple stability metric
          });
        }
      }
      
      return trends;
    },
    refetchInterval: 30000,
  });

  // Generate uptime segments for visualization
  const { data: uptimeSegments = [] } = useQuery({
    queryKey: ['uptime-segments', selectedDate, selectedAgent],
    queryFn: async () => {
      const segments: UptimeSegment[] = [];
      const targetAgents = selectedAgent === 'all' ? agents : agents.filter(a => a.hostname === selectedAgent);
      
      for (const agent of targetAgents) {
        try {
          const response = await fetch(`/api/agents/${agent.hostname}/events?date=${format(selectedDate, 'yyyy-MM-dd')}`);
          if (response.ok) {
            const events: AgentEvent[] = await response.json();
            const dayStart = startOfDay(selectedDate);
            const dayEnd = endOfDay(selectedDate);
            
            // Create segments based on status changes
            let currentStatus = 'connected';
            let segmentStart = dayStart;
            
            events.forEach(event => {
              const eventTime = new Date(event.timestamp);
              
              if (event.status !== currentStatus) {
                // Close current segment
                segments.push({
                  start: segmentStart.toISOString(),
                  end: eventTime.toISOString(),
                  status: currentStatus as 'connected' | 'disconnected',
                  duration: differenceInMinutes(eventTime, segmentStart),
                  agent: agent.hostname
                });
                
                // Start new segment
                currentStatus = event.status;
                segmentStart = eventTime;
              }
            });
            
            // Close final segment
            segments.push({
              start: segmentStart.toISOString(),
              end: dayEnd.toISOString(),
              status: currentStatus as 'connected' | 'disconnected',
              duration: differenceInMinutes(dayEnd, segmentStart),
              agent: agent.hostname
            });
          }
        } catch (error) {
          console.error(`Error fetching uptime data for ${agent.hostname}:`, error);
        }
      }
      
      return segments;
    },
    refetchInterval: 15000,
  });

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMinutes = differenceInMinutes(now, date);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return format(date, 'MMM dd, HH:mm');
  };

  const getEventIcon = (status: string, isStatusChange: boolean) => {
    if (!isStatusChange) return <Activity className="h-4 w-4 text-gray-400" />;
    
    switch (status) {
      case 'connected':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventColor = (status: string, isStatusChange: boolean) => {
    if (!isStatusChange) return 'border-gray-200 bg-gray-50';
    
    switch (status) {
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'disconnected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderTimelineView = () => (
    <div className="space-y-6">
      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No events found for the selected criteria
                </div>
              ) : (
                timelineEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center p-4 rounded-lg border ${getEventColor(event.status, event.isStatusChange)}`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {getEventIcon(event.status, event.isStatusChange)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {event.hostname}
                            {event.isStatusChange && (
                              <Badge className="ml-2" variant={event.status === 'connected' ? 'default' : 'destructive'}>
                                {event.status}
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-gray-600">
                            {event.adapterName && `${event.adapterName} • `}
                            {event.connectionType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{event.timeAgo}</p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(event.timestamp), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrendsView = () => (
    <div className="space-y-6">
      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Uptime Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Uptime']} />
                <Area type="monotone" dataKey="uptime" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Disconnect Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Incidents']} />
                <Line type="monotone" dataKey="disconnects" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stability Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Network Stability Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'stability' ? `${value}%` : 
                  name === 'avgResponseTime' ? `${value}ms` : value,
                  name === 'stability' ? 'Stability' : 
                  name === 'avgResponseTime' ? 'Response Time' : name
                ]}
              />
              <Area type="monotone" dataKey="stability" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="avgResponseTime" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderUptimeView = () => (
    <div className="space-y-6">
      {/* Uptime Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Uptime Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map(agent => {
              const agentSegments = uptimeSegments.filter(s => s.agent === agent.hostname);
              const totalMinutes = 24 * 60;
              
              return (
                <div key={agent.hostname} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{agent.hostname}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={agent.status === 'connected' ? 'default' : 'destructive'}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                    {agentSegments.map((segment, index) => (
                      <div
                        key={index}
                        className={`h-full ${
                          segment.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(segment.duration / totalMinutes) * 100}%` }}
                        title={`${segment.status} for ${segment.duration} minutes`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Agent Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.hostname} value={agent.hostname}>
                      {agent.hostname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="3d">3 Days</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">View</label>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                  <SelectItem value="uptime">Uptime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render selected view */}
      {viewMode === 'timeline' && renderTimelineView()}
      {viewMode === 'trends' && renderTrendsView()}
      {viewMode === 'uptime' && renderUptimeView()}
    </div>
  );
}