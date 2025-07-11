import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api, type Agent, type AgentEvent } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { CalendarIcon, Download, FileText, TrendingUp, Clock, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function AdvancedReports() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    refetchInterval: 5000,
  });

  // Generate enhanced disconnection report using new analysis API
  const generateDisconnectionReport = async (): Promise<DisconnectionReport> => {
    const report: DisconnectionReport = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      totalDisconnects: 0,
      perAgent: {},
      peakHour: '00:00',
      peakCount: 0,
      hourlyData: [],
      agentData: []
    };

    // Initialize hourly data for working hours (07:00-17:00)
    const hourlyMap: Record<string, { count: number; agents: Set<string> }> = {};
    for (let hour = 7; hour <= 17; hour++) {
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourlyMap[hourKey] = { count: 0, agents: new Set() };
    }

    // Collect enhanced disconnect analysis for each agent
    for (const agent of agents) {
      try {
        const analysisResponse = await fetch(`/api/agents/${agent.hostname}/disconnect-analysis?date=${format(selectedDate, 'yyyy-MM-dd')}`);
        if (analysisResponse.ok) {
          const analysis = await analysisResponse.json();
          
          // Use meaningful incident count instead of raw event count
          const meaningfulDisconnects = analysis.totalIncidents || 0;
          report.perAgent[agent.hostname] = meaningfulDisconnects;
          report.totalDisconnects += meaningfulDisconnects;

          // Process hourly data from enhanced analysis
          if (analysis.hourlyData) {
            analysis.hourlyData.forEach((hourData: any) => {
              if (hourlyMap[hourData.hour]) {
                hourlyMap[hourData.hour].count += hourData.incidents;
                if (hourData.incidents > 0) {
                  hourlyMap[hourData.hour].agents.add(agent.hostname);
                }
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching disconnect analysis for ${agent.hostname}:`, error);
        // Fallback to working hours disconnections API
        try {
          const fallbackResponse = await fetch(`/api/agents/${agent.hostname}/working-hours-disconnections?date=${format(selectedDate, 'yyyy-MM-dd')}`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            report.perAgent[agent.hostname] = fallbackData.disconnections || 0;
            report.totalDisconnects += fallbackData.disconnections || 0;
          }
        } catch (fallbackError) {
          console.error(`Error fetching fallback data for ${agent.hostname}:`, fallbackError);
        }
      }
    }

    // Convert hourly data to array format
    let maxCount = 0;
    let peakHour = '07:00';
    
    Object.entries(hourlyMap).forEach(([hour, data]) => {
      report.hourlyData.push({
        hour,
        formattedHour: formatHour(hour),
        disconnections: data.count
      });

      if (data.count > maxCount) {
        maxCount = data.count;
        peakHour = hour;
      }
    });

    report.peakHour = peakHour;
    report.peakCount = maxCount;

    // Convert agent data to array format with percentages
    report.agentData = Object.entries(report.perAgent).map(([agent, count]) => ({
      agent,
      disconnections: count,
      percentage: report.totalDisconnects > 0 ? Math.round((count / report.totalDisconnects) * 100) : 0
    })).sort((a, b) => b.disconnections - a.disconnections);

    return report;
  };

  const { data: reportData, refetch: refreshReport, isLoading } = useQuery({
    queryKey: ['disconnection-report', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: generateDisconnectionReport,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const isWithinWorkingHours = (date: Date): boolean => {
    const hour = date.getHours();
    return hour >= 7 && hour <= 17;
  };

  const formatHour = (hour: string): string => {
    const hourNum = parseInt(hour.split(':')[0]);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:00 ${period}`;
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    await refreshReport();
    setIsGenerating(false);
  };

  const handleExportPDF = () => {
    // Implementation for PDF export would go here
    console.log('Exporting PDF report for:', format(selectedDate, 'yyyy-MM-dd'));
    // This would integrate with a PDF generation library like jsPDF
  };

  const handleExportImage = () => {
    // Implementation for image export would go here
    console.log('Exporting image report for:', format(selectedDate, 'yyyy-MM-dd'));
  };

  const renderChart = () => {
    if (!reportData?.hourlyData) return null;

    const commonProps = {
      data: reportData.hourlyData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedHour" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Meaningful Incidents']}
                labelFormatter={(label) => `Time: ${label}`}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{`Time: ${label}`}</p>
                        <p className="text-blue-600">{`Incidents: ${payload[0].value}`}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Only counts disconnects with 2+ min gap
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="disconnections" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedHour" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="disconnections" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedHour" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="disconnections" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        if (!reportData.agentData.length) return <div className="text-center py-12 text-gray-500">No disconnection data available</div>;
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.agentData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="disconnections"
                nameKey="agent"
                label={({ agent, percentage }) => `${agent}: ${percentage}%`}
              >
                {reportData.agentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Disconnections']} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              LAN Disconnection Reports & Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleExportImage} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Image
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48">
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

            {/* Chart Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Period</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
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

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating || isLoading}
              className="ml-auto"
            >
              {isGenerating || isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </div>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary Stats */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Meaningful Incidents</p>
                    <p className="text-2xl font-bold text-red-600">{reportData.totalDisconnects}</p>
                    <p className="text-xs text-gray-500">Filtered by 2-min gap</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Peak Time</p>
                    <p className="text-2xl font-bold text-amber-600">{formatHour(reportData.peakHour)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Peak Count</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.peakCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Agents Monitored</p>
                    <p className="text-2xl font-bold text-green-600">{agents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Chart Visualization */}
      {reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {chartType === 'pie' ? 'Disconnections by Agent' : 'Working Hours Disconnections (07:00 - 17:00)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Agent Breakdown Table */}
      {reportData && reportData.agentData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Disconnections by Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.agentData.map((agentData, index) => (
                  <div key={agentData.agent} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="font-medium">{agentData.agent}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">{agentData.disconnections} disconnections</span>
                      <Badge variant="outline">{agentData.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Report Data JSON (for debugging/export) */}
      {reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Raw Report Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}