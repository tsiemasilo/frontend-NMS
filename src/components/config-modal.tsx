import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Configuration {
  checkInterval: number;
  timeout: number;
  maxRetries: number;
  enableNotifications: boolean;
  notificationEmail: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  enableHealthChecks: boolean;
  retainLogs: number;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const [config, setConfig] = useState<Configuration>({
    checkInterval: 300000,
    timeout: 5000,
    maxRetries: 3,
    enableNotifications: true,
    notificationEmail: 'admin@company.com',
    workingHoursStart: '07:00',
    workingHoursEnd: '17:00',
    enableHealthChecks: true,
    retainLogs: 30
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load config on mount (using mock data)
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        setConfig({
          checkInterval: 300000,
          timeout: 5000,
          maxRetries: 3,
          enableNotifications: true,
          notificationEmail: 'admin@company.com',
          workingHoursStart: '07:00',
          workingHoursEnd: '17:00',
          enableHealthChecks: true,
          retainLogs: 30
        });
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        onClose();
      }, 1500);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      checkInterval: 300000,
      timeout: 5000,
      maxRetries: 3,
      enableNotifications: true,
      notificationEmail: 'admin@company.com',
      workingHoursStart: '07:00',
      workingHoursEnd: '17:00',
      enableHealthChecks: true,
      retainLogs: 30
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Configuration...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>System Configuration</span>
          </DialogTitle>
          <DialogDescription>
            Configure network monitoring settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Settings</CardTitle>
                <CardDescription>Configure how network monitoring behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInterval">Check Interval (ms)</Label>
                    <Input
                      id="checkInterval"
                      type="number"
                      value={config.checkInterval}
                      onChange={(e) => setConfig({...config, checkInterval: parseInt(e.target.value) || 300000})}
                    />
                    <p className="text-sm text-gray-500">How often to check connectivity</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={config.timeout}
                      onChange={(e) => setConfig({...config, timeout: parseInt(e.target.value) || 5000})}
                    />
                    <p className="text-sm text-gray-500">Connection timeout duration</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={config.maxRetries}
                    onChange={(e) => setConfig({...config, maxRetries: parseInt(e.target.value) || 3})}
                  />
                  <p className="text-sm text-gray-500">Number of retry attempts before marking as failed</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableHealthChecks"
                    checked={config.enableHealthChecks}
                    onCheckedChange={(checked) => setConfig({...config, enableHealthChecks: checked})}
                  />
                  <Label htmlFor="enableHealthChecks">Enable Health Checks</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableNotifications"
                    checked={config.enableNotifications}
                    onCheckedChange={(checked) => setConfig({...config, enableNotifications: checked})}
                  />
                  <Label htmlFor="enableNotifications">Enable Notifications</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={config.notificationEmail}
                    onChange={(e) => setConfig({...config, notificationEmail: e.target.value})}
                    disabled={!config.enableNotifications}
                  />
                  <p className="text-sm text-gray-500">Email address for receiving alerts</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workingHoursStart">Working Hours Start</Label>
                    <Input
                      id="workingHoursStart"
                      type="time"
                      value={config.workingHoursStart}
                      onChange={(e) => setConfig({...config, workingHoursStart: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingHoursEnd">Working Hours End</Label>
                    <Input
                      id="workingHoursEnd"
                      type="time"
                      value={config.workingHoursEnd}
                      onChange={(e) => setConfig({...config, workingHoursEnd: e.target.value})}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">Define working hours for priority alerts</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Advanced configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="retainLogs">Log Retention (days)</Label>
                  <Input
                    id="retainLogs"
                    type="number"
                    value={config.retainLogs}
                    onChange={(e) => setConfig({...config, retainLogs: parseInt(e.target.value) || 30})}
                  />
                  <p className="text-sm text-gray-500">How long to keep historical logs</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Current Configuration Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>Check Interval: {(config.checkInterval / 1000).toFixed(0)}s</p>
                    <p>Timeout: {config.timeout}ms</p>
                    <p>Max Retries: {config.maxRetries}</p>
                    <p>Working Hours: {config.workingHoursStart} - {config.workingHoursEnd}</p>
                    <p>Log Retention: {config.retainLogs} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {saveStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Configuration saved successfully!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to save configuration</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
