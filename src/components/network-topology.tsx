import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, Router, Globe, Monitor } from "lucide-react";
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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [animationId, setAnimationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use mock data instead of API calls
  useEffect(() => {
    setAgents(mockAgents);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAgents(mockAgents);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Create network nodes
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;

    const nodes: NetworkNode[] = [
      {
        id: 'internet',
        label: 'Internet',
        type: 'internet',
        status: 'connected',
        x: centerX,
        y: centerY - radius,
      },
      {
        id: 'router',
        label: 'Router',
        type: 'router',
        status: 'connected',
        x: centerX,
        y: centerY,
        ip: '192.168.1.1'
      },
      {
        id: 'target',
        label: 'Target Server',
        type: 'target',
        status: 'connected',
        x: centerX,
        y: centerY + radius,
        ip: '192.168.1.100'
      }
    ];

    // Add agent nodes in a circle around the router
    agents.forEach((agent: Agent, index: number) => {
      const angle = (index * 2 * Math.PI) / agents.length;
      const agentRadius = radius * 0.6;
      nodes.push({
        id: agent.hostname,
        label: agent.hostname,
        type: 'agent',
        status: agent.status === 'connected' ? 'connected' : 'disconnected',
        x: centerX + Math.cos(angle) * agentRadius,
        y: centerY + Math.sin(angle) * agentRadius,
        ip: agent.ip,
        hostname: agent.hostname,
        connectionType: agent.connectionType,
        adapterName: agent.adapterName
      });
    });

    // Create links
    const links: NetworkLink[] = [
      {
        source: 'internet',
        target: 'router',
        status: 'connected',
        type: 'internet'
      },
      {
        source: 'router',
        target: 'target',
        status: 'connected',
        type: 'lan'
      }
    ];

    // Add links from router to agents
    agents.forEach((agent: Agent) => {
      links.push({
        source: 'router',
        target: agent.hostname,
        status: agent.status === 'connected' ? 'connected' : 'disconnected',
        type: 'lan'
      });
    });

    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Draw grid
      drawGrid(ctx);
      
      // Draw links
      links.forEach(link => {
        drawLink(ctx, link, elapsed);
      });
      
      // Draw nodes
      nodes.forEach(node => {
        drawNode(ctx, node, elapsed);
      });
      
      // Draw network health indicator
      drawNetworkHealth(ctx, elapsed);
      
      setAnimationId(requestAnimationFrame(animate));
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [agents]);

  const drawNode = (ctx: CanvasRenderingContext2D, node: NetworkNode, time: number = 0) => {
    const { x, y } = node;
    const size = 20;
    const pulseSize = size + Math.sin(time * 0.003) * 3;
    
    // Draw node background
    ctx.fillStyle = getNodeColor(node);
    ctx.beginPath();
    ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw node border
    ctx.strokeStyle = getNodeBorderColor(node);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw node icon
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let icon = '';
    switch (node.type) {
      case 'internet':
        icon = '🌐';
        break;
      case 'router':
        icon = '📶';
        break;
      case 'target':
        icon = '🖥️';
        break;
      case 'agent':
        icon = '💻';
        break;
    }
    
    ctx.fillText(icon, x, y);
    
    // Draw label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(node.label, x, y + size + 15);
    
    // Draw additional info for agents
    if (node.type === 'agent' && node.ip) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText(node.ip, x, y + size + 28);
    }
  };

  const drawLink = (ctx: CanvasRenderingContext2D, link: NetworkLink, time: number = 0) => {
    const sourceNode = getNodeById(link.source);
    const targetNode = getNodeById(link.target);
    
    if (!sourceNode || !targetNode) return;
    
    const { x: x1, y: y1 } = sourceNode;
    const { x: x2, y: y2 } = targetNode;
    
    // Draw link line
    ctx.strokeStyle = getLinkColor(link);
    ctx.lineWidth = getLinkWidth(link);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw data flow animation for connected links
    if (link.status === 'connected') {
      const progress = (time * 0.002) % 1;
      const dataX = x1 + (x2 - x1) * progress;
      const dataY = y1 + (y2 - y1) * progress;
      
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(dataX, dataY, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const getNodeById = (id: string) => {
    // This would typically find the node by ID, but for simplicity in this demo
    // we'll return approximate positions
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    switch (id) {
      case 'internet':
        return { x: centerX, y: centerY - radius };
      case 'router':
        return { x: centerX, y: centerY };
      case 'target':
        return { x: centerX, y: centerY + radius };
      default:
        // For agents, return positions around the router
        const agentIndex = agents.findIndex(a => a.hostname === id);
        if (agentIndex >= 0) {
          const angle = (agentIndex * 2 * Math.PI) / agents.length;
          const agentRadius = radius * 0.6;
          return {
            x: centerX + Math.cos(angle) * agentRadius,
            y: centerY + Math.sin(angle) * agentRadius
          };
        }
        return { x: centerX, y: centerY };
    }
  };

  const getNodeColor = (node: NetworkNode): string => {
    switch (node.status) {
      case 'connected':
        return '#22c55e';
      case 'disconnected':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getNodeBorderColor = (node: NetworkNode): string => {
    switch (node.status) {
      case 'connected':
        return '#16a34a';
      case 'disconnected':
        return '#dc2626';
      case 'warning':
        return '#d97706';
      default:
        return '#4b5563';
    }
  };

  const getLinkColor = (link: NetworkLink): string => {
    switch (link.status) {
      case 'connected':
        return '#22c55e';
      case 'disconnected':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getLinkWidth = (link: NetworkLink): number => {
    switch (link.type) {
      case 'internet':
        return 4;
      case 'lan':
        return 2;
      case 'ethernet':
        return 2;
      default:
        return 1;
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    
    const canvas = ctx.canvas;
    const gridSize = 20;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x / window.devicePixelRatio, 0);
      ctx.lineTo(x / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y / window.devicePixelRatio);
      ctx.lineTo(canvas.width / window.devicePixelRatio, y / window.devicePixelRatio);
      ctx.stroke();
    }
  };

  const drawNetworkHealth = (ctx: CanvasRenderingContext2D, time: number) => {
    const connectedAgents = agents.filter(a => a.status === 'connected').length;
    const healthPercentage = agents.length > 0 ? (connectedAgents / agents.length) * 100 : 0;
    
    // Draw health indicator in top-right corner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(10, 10, 150, 60);
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 150, 60);
    
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Network Health', 20, 30);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = healthPercentage > 75 ? '#22c55e' : healthPercentage > 50 ? '#f59e0b' : '#ef4444';
    ctx.fillText(`${healthPercentage.toFixed(1)}%`, 20, 50);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.fillText(`${connectedAgents}/${agents.length} connected`, 80, 50);
  };

  const networkHealth = agents.length > 0 ? (agents.filter(a => a.status === 'connected').length / agents.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Topology</h2>
          <p className="text-gray-600">Visual representation of your network infrastructure</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={networkHealth > 75 ? 'default' : networkHealth > 50 ? 'secondary' : 'destructive'}>
            {networkHealth.toFixed(1)}% Health
          </Badge>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.status === 'connected').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {agents.filter(a => a.status === 'disconnected').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <Router className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              networkHealth > 75 ? 'text-green-600' : 
              networkHealth > 50 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {networkHealth.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Topology Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-96 border border-gray-200 rounded-lg bg-white"
              style={{ width: '100%', height: '384px' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Disconnected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Warning</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
