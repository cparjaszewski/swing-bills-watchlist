import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  Settings2, 
  ExternalLink,
  Target,
  BookOpen,
  Clock,
  TrendingDown,
  AlertTriangle,
  Info,
  ChevronRight
} from "lucide-react";
import { Layout } from "@/components/layout";
import { useBills, useBillAnalysis, useSyncBills } from "@/hooks/use-bills";
import { usePreferences } from "@/hooks/use-preferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Bill, SenatorAnalysis } from "@shared/schema";

type AlertSeverity = "critical" | "moderate" | "info";
type AlertType = "volatility_spike" | "whip_count_shift" | "swing_probability" | "committee_movement" | "schedule_change";

interface BillAlert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  bill: Bill;
  metrics: { label: string; value: string | number; subtext?: string }[];
  triggerDetails?: { label: string; value: string }[];
  keyFactors?: { text: string; impact: "high" | "medium" | "low" }[];
  affectedLegislators?: SenatorAnalysis[];
  timestamp: string;
}

const severityConfig: Record<AlertSeverity, { bg: string; text: string; border: string; badge: string }> = {
  critical: { 
    bg: "bg-red-50 dark:bg-red-950/30", 
    text: "text-red-700 dark:text-red-400", 
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
  },
  moderate: { 
    bg: "bg-orange-50 dark:bg-orange-950/30", 
    text: "text-orange-700 dark:text-orange-400", 
    border: "border-l-orange-500",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
  },
  info: { 
    bg: "bg-blue-50 dark:bg-blue-950/30", 
    text: "text-blue-700 dark:text-blue-400", 
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
  },
};

const typeLabels: Record<AlertType, string> = {
  volatility_spike: "Volatility Spike",
  whip_count_shift: "Whip Count Shift",
  swing_probability: "Swing Probability",
  committee_movement: "Committee Movement",
  schedule_change: "Schedule Change",
};

function AlertCard({ alert }: { alert: BillAlert }) {
  const config = severityConfig[alert.severity];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-l-4 ${config.border} overflow-hidden`}>
        <CardContent className="p-0">
          <div className={`p-4 ${config.bg}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={config.badge}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  {typeLabels[alert.type]}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.timestamp}
                </span>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-2" data-testid={`alert-title-${alert.id}`}>
              {alert.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {alert.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {alert.metrics.map((metric, idx) => (
                <div key={idx} className="bg-background rounded-lg p-3 border">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {metric.label}
                  </div>
                  <div className="text-2xl font-bold">
                    {metric.value}
                  </div>
                  {metric.subtext && (
                    <div className="text-xs text-muted-foreground">
                      {metric.subtext}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {alert.triggerDetails && alert.triggerDetails.length > 0 && (
            <div className="px-4 py-3 bg-muted/30 border-t">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Trigger Details
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                {alert.triggerDetails.map((detail, idx) => (
                  <div key={idx}>
                    <span className="text-muted-foreground">{detail.label}:</span>{" "}
                    <span className="font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alert.affectedLegislators && alert.affectedLegislators.length > 0 && (
            <div className="px-4 py-3 border-t">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Affected Legislators
              </div>
              <div className="flex flex-wrap gap-2">
                {alert.affectedLegislators.slice(0, 5).map((senator) => (
                  <Badge 
                    key={senator.member.id} 
                    variant="secondary"
                    className="font-normal"
                  >
                    {senator.member.party === "R" ? "Rep." : "Sen."} {senator.member.lastName} ({senator.member.state})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {alert.keyFactors && alert.keyFactors.length > 0 && (
            <div className="px-4 py-3 border-t">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Key Factors
              </div>
              <div className="space-y-1">
                {alert.keyFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      {factor.text}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={
                        factor.impact === "high" ? "text-red-600 border-red-200" :
                        factor.impact === "medium" ? "text-orange-600 border-orange-200" :
                        "text-blue-600 border-blue-200"
                      }
                    >
                      {factor.impact === "high" ? "High Impact" : 
                       factor.impact === "medium" ? "Medium Impact" : "Low Impact"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-3 border-t flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Link href={`/bills/${alert.bill.id}`}>
                <Button size="sm" className="gap-1" data-testid={`button-open-bill-${alert.id}`}>
                  <ExternalLink className="w-3 h-3" />
                  Open Bill
                </Button>
              </Link>
              <Link href={`/bills/${alert.bill.id}`}>
                <Button size="sm" variant="outline" className="gap-1">
                  <Target className="w-3 h-3" />
                  View Swing Targets
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="gap-1">
                <BookOpen className="w-3 h-3" />
                Generate Playbook
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="text-muted-foreground">
              Mark as Read
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickStats({ 
  activeBills, 
  highVolatility, 
  swingTargets, 
  matchedItems 
}: { 
  activeBills: number;
  highVolatility: number;
  swingTargets: number;
  matchedItems: number;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Quick Stats
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Active Bills</span>
          <span className="font-bold text-lg">{activeBills}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">High Volatility</span>
          <span className="font-bold text-lg text-red-600">{highVolatility}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Swing Targets</span>
          <span className="font-bold text-lg text-orange-600">{swingTargets}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Matched Items</span>
          <span className="font-bold text-lg">{matchedItems}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: preferences, isLoading: prefsLoading } = usePreferences();
  const { mutate: syncBills, isPending: isSyncing } = useSyncBills();
  
  const firstBillId = bills?.[0]?.id;
  const { data: firstAnalysis } = useBillAnalysis(firstBillId || "");

  const selectedTopics = preferences?.selectedTopics || [];
  const hasOnboarded = preferences?.onboardingComplete === true;

  const filteredBills = bills?.filter(bill => {
    if (selectedTopics.length === 0) return true;
    const billTopics = bill.topics || [];
    return billTopics.some(t => selectedTopics.includes(t));
  }) || [];

  const totalBills = filteredBills.length;
  const swingSenators = firstAnalysis?.senators?.filter(s => s.status === "Swing") || [];
  const leaningSenators = firstAnalysis?.senators?.filter(s => s.status === "Leaning") || [];

  const generateAlerts = (): BillAlert[] => {
    if (!filteredBills.length) return [];

    const alerts: BillAlert[] = [];
    
    filteredBills.forEach((bill, idx) => {
      const volatility = bill.volatilityScore || 0;
      const billSenators = firstAnalysis?.senators || [];
      const billSwing = billSenators.filter(s => s.status === "Swing");
      const billLeaning = billSenators.filter(s => s.status === "Leaning");

      if (volatility >= 0.6) {
        alerts.push({
          id: `${bill.id}-volatility`,
          severity: volatility >= 0.8 ? "critical" : "moderate",
          type: "volatility_spike",
          title: `${bill.billSlug.toUpperCase()} Volatility ${volatility >= 0.8 ? "Exceeds Critical Threshold" : "Rising"}`,
          description: bill.summary || `The ${bill.shortTitle || bill.title} is showing increased volatility in vote projections.`,
          bill,
          metrics: [
            { label: "Volatility", value: Math.round(volatility * 100), subtext: `+${Math.round(volatility * 15)}%` },
            { label: "Threshold", value: "80", subtext: "Caution" },
            { label: "Swing Votes", value: billSwing.length, subtext: `+${Math.floor(Math.random() * 3)}` },
            { label: "Vote Date", value: "TBD", subtext: "Pending" }
          ],
          triggerDetails: [
            { label: "Alert Type", value: "Volatility Spike" },
            { label: "Bill", value: bill.billSlug.toUpperCase() },
            { label: "Topics", value: (bill.topics || []).join(", ") || "General" },
            { label: "Committee", value: "Ways & Means" }
          ],
          keyFactors: [
            { text: "Campaign pressure increased 20%", impact: "high" },
            { text: "New climate data heavily released", impact: "high" },
            { text: "Top donor flipped donor stance", impact: "medium" }
          ],
          affectedLegislators: billSwing.concat(billLeaning).slice(0, 4),
          timestamp: `${Math.floor(Math.random() * 59) + 1} minutes ago`
        });
      }

      if (billSwing.length > 0 && idx === 0) {
        alerts.push({
          id: `${bill.id}-swing`,
          severity: "critical",
          type: "swing_probability",
          title: `Sen. ${billSwing[0]?.member.lastName || "Unknown"} Swing Probability Crosses 70% Threshold`,
          description: `Swing probability on ${bill.billSlug.toUpperCase()} increased following constituent pressure campaign and new policy analysis.`,
          bill,
          metrics: [
            { label: "Probability", value: "73%", subtext: "+9%" },
            { label: "Threshold", value: "70%", subtext: "Undecided" },
            { label: "Current Stance", value: "Undecided", subtext: "Very Likely Swing" },
            { label: "Bill", value: bill.billSlug.toUpperCase(), subtext: "Critical" }
          ],
          keyFactors: [
            { text: "Constituent pressure campaign increased 30%", impact: "high" },
            { text: "New climate data heavily released", impact: "high" },
            { text: "Top donor shifted stance", impact: "medium" }
          ],
          timestamp: "1 hour ago"
        });
      }

      if (billLeaning.length >= 2 && idx === 0) {
        alerts.push({
          id: `${bill.id}-whip`,
          severity: "moderate",
          type: "whip_count_shift",
          title: `${bill.billSlug.toUpperCase()} Gains ${billLeaning.length} New Swing Legislators`,
          description: `${billLeaning.length} senators moved into swing territory on the bill, now showing high flip probability.`,
          bill,
          metrics: [
            { label: "New Swings", value: `+${billLeaning.length}`, subtext: "Legislators" },
            { label: "Total Swings", value: billSwing.length + billLeaning.length, subtext: "On this Bill" },
            { label: "Threshold", value: "2", subtext: "Exceeded" },
            { label: "Vote Date", value: "TBD", subtext: "Pending" }
          ],
          affectedLegislators: billLeaning,
          timestamp: "2 hours ago"
        });
      }
    });

    if (filteredBills.length > 0) {
      const infoBill = filteredBills[Math.min(1, filteredBills.length - 1)];
      alerts.push({
        id: `${infoBill.id}-committee`,
        severity: "info",
        type: "committee_movement",
        title: `${infoBill.billSlug.toUpperCase()} Advances Out of Committee`,
        description: infoBill.latestAction || "Bill passed committee vote. Now moves to floor with amendments.",
        bill: infoBill,
        metrics: [
          { label: "Status", value: "Advanced", subtext: "Committee" },
          { label: "Next Step", value: "Floor Vote", subtext: "Pending" }
        ],
        timestamp: "3 hours ago"
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();
  const highVolatilityCount = filteredBills.filter(b => (b.volatilityScore || 0) >= 0.6).length;

  return (
    <Layout>
      <div className="flex gap-6">
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-4 space-y-6">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="gap-2 w-full justify-start">
                <Settings2 className="w-4 h-4" />
                Settings
              </Button>
            </Link>
            
            <QuickStats
              activeBills={totalBills}
              highVolatility={highVolatilityCount}
              swingTargets={swingSenators.length + leaningSenators.length}
              matchedItems={alerts.length}
            />
          </div>
        </aside>

        <div className="flex-1 space-y-6 min-w-0">
          {!prefsLoading && !hasOnboarded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Personalize Your Experience</h3>
                      <p className="text-muted-foreground">Select topics you care about to filter relevant legislation.</p>
                    </div>
                  </div>
                  <Link href="/onboarding">
                    <Button className="gap-2" data-testid="button-start-onboarding">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Legislative Feed</h1>
              {hasOnboarded && selectedTopics.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Filtering:</span>
                  {selectedTopics.map(topic => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  <Link href="/onboarding">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" data-testid="button-edit-topics">
                      Edit
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => syncBills()}
              disabled={isSyncing}
              className="gap-2"
              data-testid="button-sync-data"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Syncing..." : "Refresh"}
            </Button>
          </div>

          <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto">
            <Button variant="default" size="sm" className="text-xs shrink-0">
              All Feed
            </Button>
            <Button variant="ghost" size="sm" className="text-xs shrink-0">
              Critical ({alerts.filter(a => a.severity === "critical").length})
            </Button>
            <Button variant="ghost" size="sm" className="text-xs shrink-0">
              Moderate ({alerts.filter(a => a.severity === "moderate").length})
            </Button>
            <Button variant="ghost" size="sm" className="text-xs shrink-0">
              Info ({alerts.filter(a => a.severity === "info").length})
            </Button>
            <Button variant="ghost" size="sm" className="text-xs shrink-0">
              Vote Prep
            </Button>
          </div>

          {billsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-l-4">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(j => (
                        <Skeleton key={j} className="h-20" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Active Alerts</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedTopics.length > 0 
                    ? "No bills match your selected topics." 
                    : "No legislative activity detected. Click refresh to sync data."}
                </p>
                <Button onClick={() => syncBills()} disabled={isSyncing} className="gap-2">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Data
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
