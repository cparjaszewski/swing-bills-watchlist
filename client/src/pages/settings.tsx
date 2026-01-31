import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Database, Bell, Palette, RefreshCw, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout";
import { useSyncBills } from "@/hooks/use-bills";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { mutate: syncBills, isPending: isSyncing, isSuccess: syncSuccess } = useSyncBills();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSync = () => {
    syncBills(undefined, {
      onSuccess: () => {
        toast({
          title: "Data Synced",
          description: "Legislative data has been refreshed from the API.",
        });
      },
      onError: () => {
        toast({
          title: "Sync Failed",
          description: "Could not connect to the data source. Using cached data.",
          variant: "destructive",
        });
      }
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Saved",
      description: "Your settings have been updated.",
    });
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl text-primary" data-testid="text-settings-title">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your application preferences and data sources.</p>
        </div>

        <div className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Data Source</CardTitle>
                    <CardDescription>Configure your legislative data connection.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>ProPublica Congress API</Label>
                    <p className="text-sm text-muted-foreground">
                      Fetches real-time legislative data from ProPublica.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </span>
                  </div>
                </div>
                
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Sync Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically refresh data every 30 minutes.
                    </p>
                  </div>
                  <Switch
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                    data-testid="switch-auto-sync"
                  />
                </div>

                <Button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full gap-2"
                  data-testid="button-manual-sync"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure alert preferences.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Swing Vote Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new swing vote opportunities are detected.
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    data-testid="switch-notifications"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes.
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    data-testid="switch-dark-mode"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>About</CardTitle>
                    <CardDescription>Application information.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data Source</p>
                    <p className="font-medium">ProPublica Congress API</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Congress Session</p>
                    <p className="font-medium">118th Congress</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chamber</p>
                    <p className="font-medium">Senate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} data-testid="button-save-settings">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
