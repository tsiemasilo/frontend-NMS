import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CalendarIcon, Download, RefreshCw, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { mockAgents, mockAdvancedReports } from "@/lib/mockData";

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

interface DisconnectionReport {
  date: string;
  totalDisconnects: number;
  perAgent: Record<string, number>;
  peakHour: string;
  peakCount: number;
  hourlyData: Array<{
    hour: string;
    disconnections: number;
    formattedHour: string;
  }>;
  agentData: Array<{
    agent: string;
    disconnections: number;
    percentage: number;
  }>;
}

interface PeakTimeData {
  hour: string;
  formattedHour: string;
  disconnections: number;
  agents: string[];
}

export function AdvancedReports() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<string>('daily');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use mock data instead of API calls
  useEffect(() => {
    setAgents(mockAgents);
  }, []);

  const refreshReport = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setReportData(mockAdvancedReports);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshReport();
  }, [selectedDate, reportType]);

  const report: DisconnectionReport = {
    date: format(selectedDate, 'yyyy-MM-dd'),
    totalDisconnects: 15,
    perAgent: {
      'DESKTOP-ABC123': 8,
      'LAPTOP-XYZ789': 4,
      'WORKSTATION-DEF456': 3
    },
    peakHour: '14:00',
    peakCount: 5,
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: i.toString().padStart(2, '0'),
      formattedHour: `${i.toString().padStart(2, '0')}:00`,
      disconnections: Math.floor(Math.random() * 6)
    })),
    agentData: [
      { agent: 'DESKTOP-ABC123', disconnections: 8, percentage: 53.3 },
      { agent: 'LAPTOP-XYZ789', disconnections: 4, percentage: 26.7 },
      { agent: 'WORKSTATION-DEF456', disconnections: 3, percentage: 20.0 }
    ]
  };

  const isWithinWorkingHours = (date: Date): boolean => {
    const hour = date.getHours();
    return hour >= 7 && hour <= 17;
  };

  const pieChartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const peakTimeData: PeakTimeData[] = [
    { hour: '09:00', formattedHour: '9:00 AM', disconnections: 5, agents: ['DESKTOP-ABC123', 'LAPTOP-XYZ789'] },
    { hour: '14:00', formattedHour: '2:00 PM', disconnections: 8, agents: ['DESKTOP-ABC123', 'WORKSTATION-DEF456'] },
    { hour: '16:00', formattedHour: '4:00 PM', disconnections: 3, agents: ['LAPTOP-XYZ789'] }
  ];

  const handleExport = () => {
    const exportData = {
      date: report.date,
      reportType,
      summary: {
        totalDisconnections: report.totalDisconnects,
        peakHour: report.peakHour,
        peakCount: report.peakCount
      },
      hourlyData: report.hourlyData,
      agentData: report.agentData,
      peakTimeData: peakTimeData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-report-${report.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Reports</h2>
          <p className="text-gray-600">Detailed network connectivity analytics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refreshReport} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
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
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hourly">Hourly Analysis</TabsTrigger>
            <TabsTrigger value="agents">Agent Breakdown</TabsTrigger>
            <TabsTrigger value="peaks">Peak Times</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Disconnections</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalDisconnects}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.totalDisconnects > 10 ? (
                      <span className="text-red-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        High activity
                      </span>
                    ) : (
                      <span className="text-green-600 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Normal activity
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.peakHour}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.peakCount} disconnections
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Affected Agent</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.agentData[0]?.agent}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.agentData[0]?.disconnections} disconnections
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Disconnection Pattern</CardTitle>
                <CardDescription>
                  Disconnections throughout the day for {format(selectedDate, 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={report.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedHour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="disconnections" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Breakdown</CardTitle>
                  <CardDescription>Disconnections by agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={report.agentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="disconnections"
                        nameKey="agent"
                      >
                        {report.agentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Details</CardTitle>
                  <CardDescription>Detailed breakdown by agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.agentData.map((agent, index) => (
                      <div key={agent.agent} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: pieChartColors[index % pieChartColors.length] }}
                          />
                          <span className="text-sm font-medium">{agent.agent}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{agent.disconnections}</div>
                          <div className="text-xs text-gray-500">{agent.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="peaks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Peak Disconnection Times</CardTitle>
                <CardDescription>Times with highest disconnection activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {peakTimeData.map((peak, index) => (
                    <div key={peak.hour} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                      <div>
                        <div className="font-medium">{peak.formattedHour}</div>
                        <div className="text-sm text-gray-600">
                          Affected agents: {peak.agents.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{peak.disconnections}</div>
                        <div className="text-sm text-gray-600">disconnections</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
