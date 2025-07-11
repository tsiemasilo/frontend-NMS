import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, type Agent } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Activity, Wifi, WifiOff, Router, Globe, Target, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkNode {
  id: string;
  label: string;
  type: 'router' | 'internet' | 'target' | 'agent';
  status: 'connected' | 'disconnected' | 'warning';
  x: number;
  y: number;
  ip?: string;
  hostname?: string;
  connectionType?: string;
  adapterName?: string;
}

interface NetworkLink {
  source: string;
  target: string;
  status: 'connected' | 'disconnected' | 'warning';
  type: 'ethernet' | 'internet' | 'lan';
}

export function NetworkTopology() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [networkHealth, setNetworkHealth] = useState('healthy');
  const [connectionPulse, setConnectionPulse] = useState(true);
  const [showMetrics, setShowMetrics] = useState(false);

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    refetchInterval: 2000,
  });

  // Generate network topology data from agents
  const generateTopology = (): { nodes: NetworkNode[]; links: NetworkLink[] } => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // Core infrastructure nodes
    nodes.push({
      id: 'internet',
      label: 'Internet\n8.8.8.8',
      type: 'internet',
      status: 'connected',
      x: 400,
      y: 50,
      ip: '8.8.8.8'
    });

    nodes.push({
      id: 'router',
      label: 'Router\n192.168.8.1',
      type: 'router',
      status: 'connected',
      x: 400,
      y: 200,
      ip: '192.168.8.1'
    });

    nodes.push({
      id: 'target',
      label: 'Target\n192.168.8.45',
      type: 'target',
      status: 'connected',
      x: 600,
      y: 350,
      ip: '192.168.8.45'
    });

    // Core infrastructure links
    links.push({
      source: 'router',
      target: 'internet',
      status: 'connected',
      type: 'internet'
    });

    links.push({
      source: 'router',
      target: 'target',
      status: 'connected',
      type: 'lan'
    });

    // Add agent nodes
    agents.forEach((agent: Agent, index: number) => {
      const angle = (index * (Math.PI * 2)) / Math.max(agents.length, 4);
      const radius = 150;
      const x = 400 + Math.cos(angle) * radius;
      const y = 350 + Math.sin(angle) * radius;

      nodes.push({
        id: `agent-${agent.hostname}`,
        label: `${agent.hostname}\n${agent.ip || 'Unknown IP'}`,
        type: 'agent',
        status: agent.status as 'connected' | 'disconnected',
        x,
        y,
        ip: agent.ip,
        hostname: agent.hostname,
        connectionType: agent.connectionType,
        adapterName: agent.adapterName
      });

      // Link agent to router
      links.push({
        source: 'router',
        target: `agent-${agent.hostname}`,
        status: agent.status as 'connected' | 'disconnected',
        type: 'ethernet'
      });
    });

    return { nodes, links };
  };

  const { nodes, links } = generateTopology();

  // Enhanced drawing functions with animations
  const drawNode = (ctx: CanvasRenderingContext2D, node: NetworkNode, time: number = 0) => {
    const x = (node.x + offset.x) * scale;
    const y = (node.y + offset.y) * scale;
    const baseRadius = 35 * scale;
    
    // Pulse animation for selected/hovered nodes
    const isActive = selectedNode?.id === node.id || hoveredNode?.id === node.id;
    const pulseOffset = isActive ? Math.sin(time * 0.005) * 3 * scale : 0;
    const radius = baseRadius + pulseOffset;

    // Glow effect for active nodes
    if (isActive) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 10 * scale);
      gradient.addColorStop(0, getNodeColor(node) + '40');
      gradient.addColorStop(1, getNodeColor(node) + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius + 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Node background with gradient
    const nodeGradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
    nodeGradient.addColorStop(0, getLighterColor(getNodeColor(node)));
    nodeGradient.addColorStop(1, getNodeColor(node));
    ctx.fillStyle = nodeGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced border with status indication
    ctx.strokeStyle = getNodeBorderColor(node);
    ctx.lineWidth = isActive ? 4 * scale : 3 * scale;
    ctx.setLineDash(node.status === 'disconnected' ? [8 * scale, 4 * scale] : []);
    ctx.stroke();
    ctx.setLineDash([]);

    // Node icon with better styling
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${18 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2 * scale;
    
    const symbol = getNodeSymbol(node.type);
    ctx.fillText(symbol, x, y);
    ctx.shadowBlur = 0;

    // Enhanced node label with background
    const lines = node.label.split('\n');
    const labelY = y + radius + 25 * scale;
    
    // Label background
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const labelHeight = lines.length * 16 * scale;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(x - maxWidth/2 - 8 * scale, labelY - 8 * scale, maxWidth + 16 * scale, labelHeight + 12 * scale);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - maxWidth/2 - 8 * scale, labelY - 8 * scale, maxWidth + 16 * scale, labelHeight + 12 * scale);

    // Label text
    ctx.fillStyle = '#1f2937';
    ctx.font = `${13 * scale}px Arial`;
    lines.forEach((line, index) => {
      const weight = index === 0 ? 'bold' : 'normal';
      ctx.font = `${weight} ${13 * scale}px Arial`;
      ctx.fillText(line, x, labelY + (index * 16 * scale));
    });

    // Enhanced status indicator with animation
    if (node.type === 'agent') {
      const indicatorRadius = 10 * scale;
      const indicatorX = x + radius - indicatorRadius/2;
      const indicatorY = y - radius + indicatorRadius/2;
      
      // Pulsing animation for connected status
      const statusPulse = node.status === 'connected' && connectionPulse ? 
        Math.sin(time * 0.008) * 2 + indicatorRadius : indicatorRadius;
      
      ctx.fillStyle = node.status === 'connected' ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(indicatorX, indicatorY, statusPulse * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(indicatorX - 2 * scale, indicatorY - 2 * scale, (statusPulse * 0.4) * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connection quality indicator
    if (node.type === 'agent' && node.status === 'connected') {
      const bars = 4;
      const barWidth = 2 * scale;
      const barSpacing = 1 * scale;
      const startX = x - (bars * (barWidth + barSpacing)) / 2;
      const startY = y + radius + 5 * scale;
      
      for (let i = 0; i < bars; i++) {
        const barHeight = (i + 1) * 3 * scale;
        const opacity = Math.random() > 0.3 ? 1 : 0.3; // Simulate signal strength
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
        ctx.fillRect(startX + i * (barWidth + barSpacing), startY - barHeight, barWidth, barHeight);
      }
    }
  };

  const drawLink = (ctx: CanvasRenderingContext2D, link: NetworkLink, time: number = 0) => {
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    
    if (!sourceNode || !targetNode) return;

    const x1 = (sourceNode.x + offset.x) * scale;
    const y1 = (sourceNode.y + offset.y) * scale;
    const x2 = (targetNode.x + offset.x) * scale;
    const y2 = (targetNode.y + offset.y) * scale;

    // Enhanced link styling with gradients
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    const linkColor = getLinkColor(link);
    gradient.addColorStop(0, linkColor);
    gradient.addColorStop(0.5, linkColor + 'CC');
    gradient.addColorStop(1, linkColor);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = getLinkWidth(link) * scale;
    
    // Animated dashed lines for disconnected status
    if (link.status === 'disconnected') {
      const dashOffset = (time * 0.1) % 20;
      ctx.setLineDash([10 * scale, 5 * scale]);
      ctx.lineDashOffset = dashOffset * scale;
    } else {
      ctx.setLineDash([]);
    }
    
    // Data flow animation for active connections
    if (link.status === 'connected' && connectionPulse) {
      // Draw main connection
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Animated data packets
      const progress = (time * 0.002) % 1;
      const packetX = x1 + (x2 - x1) * progress;
      const packetY = y1 + (y2 - y1) * progress;
      
      ctx.fillStyle = linkColor;
      ctx.beginPath();
      ctx.arc(packetX, packetY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Connection strength indicator
    if (link.status === 'connected') {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const strengthBars = 3;
      
      for (let i = 0; i < strengthBars; i++) {
        const barOpacity = Math.random() > 0.4 ? 0.8 : 0.3;
        ctx.fillStyle = linkColor + Math.floor(barOpacity * 255).toString(16).padStart(2, '0');
        ctx.fillRect(midX - 6 + i * 4, midY - 2, 2, 4);
      }
    }
  };

  const getLighterColor = (color: string): string => {
    // Convert hex to lighter version for gradients
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const lighter = (c: number) => Math.min(255, Math.floor(c + (255 - c) * 0.3));
    
    return `rgb(${lighter(r)}, ${lighter(g)}, ${lighter(b)})`;
  };

  const getNodeColor = (node: NetworkNode): string => {
    switch (node.type) {
      case 'internet': return '#3b82f6';
      case 'router': return '#8b5cf6';
      case 'target': return '#f59e0b';
      case 'agent': return node.status === 'connected' ? '#10b981' : '#6b7280';
      default: return '#6b7280';
    }
  };

  const getNodeBorderColor = (node: NetworkNode): string => {
    if (selectedNode?.id === node.id) return '#ef4444';
    return node.status === 'disconnected' ? '#ef4444' : '#374151';
  };

  const getNodeSymbol = (type: string): string => {
    switch (type) {
      case 'internet': return '🌐';
      case 'router': return '📡';
      case 'target': return '🎯';
      case 'agent': return '💻';
      default: return '?';
    }
  };

  const getLinkColor = (link: NetworkLink): string => {
    switch (link.status) {
      case 'connected': return '#10b981';
      case 'disconnected': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getLinkWidth = (link: NetworkLink): number => {
    switch (link.type) {
      case 'internet': return 4;
      case 'ethernet': return 3;
      case 'lan': return 2;
      default: return 2;
    }
  };

  // Enhanced event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale - offset.x;
    const y = (e.clientY - rect.top) / scale - offset.y;

    // Check if clicked on a node
    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 35;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      setHoveredNode(null);
    } else {
      setSelectedNode(null);
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      // Check for node hover
      const x = (e.clientX - rect.left) / scale - offset.x;
      const y = (e.clientY - rect.top) / scale - offset.y;

      const hoveredNode = nodes.find(node => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < 35;
      });

      setHoveredNode(hoveredNode || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  // Enhanced render loop with animations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - startTime;

      // Clear canvas with subtle background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw enhanced grid
      drawGrid(ctx);

      // Draw links with animations
      links.forEach(link => drawLink(ctx, link, deltaTime));

      // Draw nodes with animations
      nodes.forEach(node => drawNode(ctx, node, deltaTime));

      // Draw network health indicator
      drawNetworkHealth(ctx, deltaTime);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [nodes, links, scale, offset, selectedNode, hoveredNode, connectionPulse]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 50 * scale;
    const { width, height } = ctx.canvas;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;

    for (let x = (offset.x * scale) % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = (offset.y * scale) % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawNetworkHealth = (ctx: CanvasRenderingContext2D, time: number) => {
    const connectedAgents = agents.filter(agent => agent.status === 'connected').length;
    const totalAgents = agents.length;
    const healthPercentage = totalAgents > 0 ? (connectedAgents / totalAgents) * 100 : 100;
    
    // Health indicator in top-right corner
    const x = ctx.canvas.width - 120;
    const y = 30;
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(x - 10, y - 10, 110, 40);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 10, y - 10, 110, 40);
    
    // Health bar
    const barWidth = 80;
    const barHeight = 8;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(x, y + 10, barWidth, barHeight);
    
    const healthColor = healthPercentage > 80 ? '#10b981' : 
                       healthPercentage > 50 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = healthColor;
    ctx.fillRect(x, y + 10, (barWidth * healthPercentage) / 100, barHeight);
    
    // Text
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Health: ${Math.round(healthPercentage)}%`, x, y + 5);
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Router className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Interactive Network Topology</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Real-time network infrastructure visualization</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={connectionPulse ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConnectionPulse(!connectionPulse)}
                  className="text-xs"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {connectionPulse ? 'Live' : 'Static'}
                </Button>
                <Button
                  variant={showMetrics ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMetrics(!showMetrics)}
                  className="text-xs"
                >
                  <Monitor className="h-3 w-3 mr-1" />
                  Metrics
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(prev => Math.max(0.1, prev * 0.8))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border rounded-lg cursor-move bg-gray-50"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
            
            {/* Enhanced Legend */}
            <motion.div 
              className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Network Legend</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-700">Internet Gateway</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-700">Network Router</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-700">Target Device</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-gray-700">Connected Agent</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-700">Disconnected Agent</span>
                </div>
              </div>
              {connectionPulse && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <Activity className="h-3 w-3" />
                    <span>Live data flow active</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Enhanced Node Details */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div 
                  className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-xl border border-gray-200 min-w-72"
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      {selectedNode.type === 'agent' && <Monitor className="h-4 w-4" />}
                      {selectedNode.type === 'router' && <Router className="h-4 w-4" />}
                      {selectedNode.type === 'internet' && <Globe className="h-4 w-4" />}
                      {selectedNode.type === 'target' && <Target className="h-4 w-4" />}
                      Node Details
                    </h4>
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">Type:</span>
                      <Badge variant="outline" className="capitalize">{selectedNode.type}</Badge>
                    </div>
                    
                    {selectedNode.ip && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">IP Address:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedNode.ip}</code>
                      </div>
                    )}
                    
                    {selectedNode.hostname && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Hostname:</span>
                        <span className="font-mono text-xs">{selectedNode.hostname}</span>
                      </div>
                    )}
                    
                    {selectedNode.connectionType && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Connection:</span>
                        <Badge variant="secondary" className="uppercase text-xs">
                          {selectedNode.connectionType}
                        </Badge>
                      </div>
                    )}
                    
                    {selectedNode.adapterName && (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-600">Network Adapter:</span>
                        <span className="text-xs text-gray-800 bg-gray-50 p-2 rounded">
                          {selectedNode.adapterName}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        {selectedNode.status === 'connected' ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                        <Badge 
                          variant={selectedNode.status === 'connected' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {selectedNode.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedNode.type === 'agent' && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Connection Quality</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`h-3 w-2 rounded-sm ${
                                selectedNode.status === 'connected'
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              }`}
                              style={{ height: `${bar * 3 + 6}px` }}
                            />
                          ))}
                          <span className="ml-2 text-xs text-gray-600">
                            {selectedNode.status === 'connected' ? 'Excellent' : 'No Signal'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Network Metrics Panel */}
            <AnimatePresence>
              {showMetrics && (
                <motion.div 
                  className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-xl border border-gray-200 min-w-80"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Network Metrics
                    </h4>
                    <button 
                      onClick={() => setShowMetrics(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    {/* Overall Network Health */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Network Health</span>
                        <Badge 
                          variant={networkHealth === 'healthy' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {networkHealth}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            networkHealth === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${networkHealth === 'healthy' ? 85 : 25}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Agent Statistics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">
                          {agents.filter(a => a.status === 'connected').length}
                        </div>
                        <div className="text-xs text-green-600">Connected</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-700">
                          {agents.filter(a => a.status === 'disconnected').length}
                        </div>
                        <div className="text-xs text-red-600">Disconnected</div>
                      </div>
                    </div>

                    {/* Connection Types */}
                    <div className="space-y-2">
                      <span className="font-medium text-gray-700">Connection Types</span>
                      <div className="space-y-1">
                        {['lan', 'wifi', 'ethernet'].map(type => {
                          const count = agents.filter(a => a.connectionType === type).length;
                          return count > 0 ? (
                            <div key={type} className="flex items-center justify-between text-xs">
                              <span className="capitalize">{type}</span>
                              <span className="font-medium">{count} agents</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Network Latency Simulation */}
                    <div className="space-y-2">
                      <span className="font-medium text-gray-700">Average Latency</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="h-2 bg-blue-500 rounded-full w-3/4" />
                        </div>
                        <span className="text-xs font-medium">~15ms</span>
                      </div>
                    </div>

                    {/* Data Transfer Rate */}
                    <div className="space-y-2">
                      <span className="font-medium text-gray-700">Data Transfer</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <div className="font-medium text-blue-700">↓ 24.5 MB/s</div>
                          <div className="text-blue-600">Download</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded border border-purple-200">
                          <div className="font-medium text-purple-700">↑ 8.2 MB/s</div>
                          <div className="text-purple-600">Upload</div>
                        </div>
                      </div>
                    </div>

                    {/* Last Update Time */}
                    <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Click and drag to pan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Scroll to zoom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Click nodes for details</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Scale: {Math.round(scale * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}