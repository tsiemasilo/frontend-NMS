import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Configuration } from "@/lib/api";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const [formData, setFormData] = useState({
    dashboardIP: '',
    pingIP: '',
    intervalMs: 5000,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery<{
    dashboardIP: string;
    pingIP: string;
    intervalMs: number;
  }>({
    queryKey: ['/api/config'],
    enabled: isOpen,
  });

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: Partial<Configuration>) => api.updateConfiguration(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      toast({
        title: "Configuration Updated",
        description: "Settings saved. Agents will automatically reconnect to the new dashboard IP within 30 seconds.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (config) {
      setFormData({
        dashboardIP: config.dashboardIP || '',
        pingIP: config.pingIP || '',
        intervalMs: config.intervalMs || 5000,
      });
    }
  }, [config]);

  const validateIP = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate IP addresses
    if (!validateIP(formData.dashboardIP)) {
      toast({
        title: "Invalid Dashboard IP",
        description: "Please enter a valid IP address for the dashboard.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateIP(formData.pingIP)) {
      toast({
        title: "Invalid Ping IP",
        description: "Please enter a valid IP address for ping testing.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.intervalMs < 1000) {
      toast({
        title: "Invalid Interval",
        description: "Monitoring interval must be at least 1000ms.",
        variant: "destructive",
      });
      return;
    }
    
    updateConfigMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>System Configuration</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dashboardIP">Dashboard IP</Label>
              <Input
                id="dashboardIP"
                value={formData.dashboardIP}
                onChange={(e) => handleInputChange('dashboardIP', e.target.value)}
                placeholder="172.16.49.185"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pingIP">Ping Target IP</Label>
              <Input
                id="pingIP"
                value={formData.pingIP}
                onChange={(e) => handleInputChange('pingIP', e.target.value)}
                placeholder="172.16.48.254"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intervalMs">Check Interval (ms)</Label>
              <Input
                id="intervalMs"
                type="number"
                value={formData.intervalMs}
                onChange={(e) => handleInputChange('intervalMs', parseInt(e.target.value))}
                min={1000}
                max={60000}
                step={1000}
                required
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
