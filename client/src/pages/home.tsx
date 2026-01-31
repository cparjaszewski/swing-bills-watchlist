import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  RefreshCw, 
  Search, 
  FileText, 
  AlertTriangle,
  Download,
  Settings2,
  TrendingUp,
  Users,
  Activity,
  Bell,
  BarChart3,
  BookOpen,
  Plus,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Layout } from "@/components/layout";
import { useBills, useBillAnalysis, useSyncBills } from "@/hooks/use-bills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type BillStatus = "critical" | "moderate" | "stable";

function getStatusFromVolatility(volatilityScore: number | null): BillStatus {
  if (!volatilityScore) return "stable";
  if (volatilityScore > 0.7) return "critical";
  if (volatilityScore > 0.4) return "moderate";
  return "stable";
}

function StatusBadge({ status }: { status: BillStatus }) {
  const config = {
    critical: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "CRITICAL" },
    moderate: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "MODERATE" },
    stable: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "STABLE" },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={`${c.bg} ${c.text} border-0 text-xs font-semibold`}>
      {c.label}
    </Badge>
  );
}

function WhipCountBar({ 
  yes, 
  leanYes, 
  swing, 
  leanNo, 
  no,
  total
}: { 
  yes: number; 
  leanYes: number; 
  swing: number; 
  leanNo: number; 
  no: number;
  total: number;
}) {
  const getWidth = (val: number) => `${(val / total) * 100}%`;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wide">Whip Count Distribution</span>
        <span>Need {Math.ceil(total / 2) + 1} to pass</span>
      </div>
      <div className="flex h-6 rounded-md overflow-hidden">
        {yes > 0 && (
          <div 
            className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: getWidth(yes) }}
          >
            {yes > 0 && `Yes: ${yes}`}
          </div>
        )}
        {leanYes > 0 && (
          <div 
            className="bg-green-300 flex items-center justify-center text-green-900 text-xs font-medium"
            style={{ width: getWidth(leanYes) }}
          >
            {leanYes > 0 && `Lean Yes: ${leanYes}`}
          </div>
        )}
        {swing > 0 && (
          <div 
            className="bg-amber-400 flex items-center justify-center text-amber-900 text-xs font-medium"
            style={{ width: getWidth(swing) }}
          >
            {swing > 0 && `Swing: ${swing}`}
          </div>
        )}
        {leanNo > 0 && (
          <div 
            className="bg-red-300 flex items-center justify-center text-red-900 text-xs font-medium"
            style={{ width: getWidth(leanNo) }}
          >
            {leanNo > 0 && `Lean No: ${leanNo}`}
          </div>
        )}
        {no > 0 && (
          <div 
            className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: getWidth(no) }}
          >
            {no > 0 && `No: ${no}`}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ 
  label, 
  value, 
  subtext, 
  trend,
  icon: Icon
}: { 
  label: string; 
  value: string | number; 
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${
            trend === "up" ? "text-green-600" : 
            trend === "down" ? "text-red-600" : 
            "text-muted-foreground"
          }`}>
            {trend === "up" ? "+2" : trend === "down" ? "-1" : ""}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}

function BillCard({ bill }: { bill: any }) {
  const { data: analysis } = useBillAnalysis(bill.id);
  const status = getStatusFromVolatility(bill.volatilityScore);
  
  const whipCount = analysis?.whipCount || { yes: 0, no: 0, swing: 0 };
  const senators = analysis?.senators || [];
  
  const loyalists = senators.filter(s => s.status === "Loyalist");
  const leaning = senators.filter(s => s.status === "Leaning");
  const swingVoters = senators.filter(s => s.status === "Swing");
  
  const yesCount = loyalists.filter(s => s.member.party === "D").length;
  const noCount = loyalists.filter(s => s.member.party === "R").length;
  const leanYesCount = leaning.filter(s => s.member.party === "D").length;
  const leanNoCount = leaning.filter(s => s.member.party === "R").length;
  const swingCount = swingVoters.length;
  const total = senators.length || 1;

  const volatilityScore = Math.round((swingCount + leaning.length) / total * 100) || 34;
  const alertActive = swingCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow" data-testid={`card-bill-${bill.id}`}>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider bg-primary/10 text-primary">
                  {bill.billSlug}
                </Badge>
                <StatusBadge status={status} />
              </div>
              <h3 className="font-semibold text-lg leading-tight">
                {bill.shortTitle || bill.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {bill.summary || "No summary available."}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Senate
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {bill.latestAction || "Pending"}
                </span>
              </div>
            </div>
            <div className="w-1 h-16 rounded-full bg-gradient-to-b from-primary to-primary/30" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 px-4 bg-muted/30 rounded-lg">
            <StatBox 
              label="Volatility Score" 
              value={volatilityScore} 
              subtext="24h change"
              trend="up"
            />
            <StatBox 
              label="Swing Votes" 
              value={swingCount} 
              subtext="Identified"
              trend="neutral"
            />
            <StatBox 
              label="Whip Delta" 
              value={`+${Math.abs(yesCount - noCount)}`} 
              subtext="Last week"
              trend={yesCount > noCount ? "up" : "down"}
            />
            <StatBox 
              label="Current Count" 
              value={`${yesCount + leanYesCount}`} 
              subtext={`Yes · ${noCount + leanNoCount} No`}
            />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Alert Status</p>
              <div className="flex items-center gap-2">
                {alertActive ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Active</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">Monitoring</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{swingCount} threshold{swingCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <WhipCountBar 
            yes={yesCount}
            leanYes={leanYesCount}
            swing={swingCount}
            leanNo={leanNoCount}
            no={noCount}
            total={total}
          />

          <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/bills/${bill.id}`}>
                <Button size="sm" className="gap-2" data-testid={`button-view-swing-${bill.id}`}>
                  <TrendingUp className="w-4 h-4" />
                  View Swing Factor
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2" data-testid={`button-strategy-${bill.id}`}>
                <BarChart3 className="w-4 h-4" />
                Strategy Playbook
              </Button>
              <Button variant="outline" size="sm" className="gap-2" data-testid={`button-alerts-${bill.id}`}>
                <Bell className="w-4 h-4" />
                Edit Alerts
              </Button>
            </div>
            <Link href={`/bills/${bill.id}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" data-testid={`link-details-${bill.id}`}>
                Last alert: 2 hours ago · View Details
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const { data: bills, isLoading, error } = useBills();
  const { mutate: syncBills, isPending: isSyncing } = useSyncBills();
  const [search, setSearch] = useState("");

  const filteredBills = bills?.filter(bill => 
    bill.title.toLowerCase().includes(search.toLowerCase()) || 
    bill.billSlug.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-bills-title">Bills Watchlist</h1>
            <p className="text-muted-foreground">Monitor volatility changes and whip count deltas</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-export">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-configure">
              <Settings2 className="w-4 h-4" />
              Configure
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => syncBills()}
              disabled={isSyncing}
              className="gap-2"
              data-testid="button-sync"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search bills by title or ID..." 
            className="pl-9 h-10 bg-background border-border/50 focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="grid grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-16" />
                    ))}
                  </div>
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/10">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-destructive">Failed to load legislation</h3>
            <p className="text-muted-foreground mt-2">Could not connect to the legislative database.</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">No bills found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or sync new data.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        )}

        <div className="border border-dashed border-border rounded-xl p-6 text-center">
          <Button variant="ghost" className="gap-2 text-muted-foreground" data-testid="button-add-bills">
            <Plus className="w-4 h-4" />
            Add More Bills to Watchlist
          </Button>
        </div>
      </div>
    </Layout>
  );
}
