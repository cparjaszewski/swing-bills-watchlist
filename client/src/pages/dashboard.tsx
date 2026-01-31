import { motion } from "framer-motion";
import { FileText, Users, TrendingUp, AlertCircle, RefreshCw, Sparkles, ArrowRight, Settings2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { useBills, useBillAnalysis, useSyncBills } from "@/hooks/use-bills";
import { usePreferences } from "@/hooks/use-preferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  description?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {trend === "up" && <span className="text-green-600">+</span>}
              {trend === "down" && <span className="text-red-600">-</span>}
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
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
  const totalSenators = firstAnalysis?.senators?.length || 0;
  const swingSenators = firstAnalysis?.senators?.filter(s => s.status === "Swing").length || 0;
  const leaningSenators = firstAnalysis?.senators?.filter(s => s.status === "Leaning").length || 0;

  return (
    <Layout>
      <div className="space-y-8">
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

        {hasOnboarded && selectedTopics.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtering by:</span>
            {selectedTopics.map(topic => (
              <Badge key={topic} variant="secondary" className="bg-primary/10 text-primary">
                {topic}
              </Badge>
            ))}
            <Link href="/onboarding">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" data-testid="button-edit-topics">
                <Settings2 className="w-3 h-3" />
                Edit
              </Button>
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl text-primary" data-testid="text-dashboard-title">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Overview of legislative analysis and swing vote opportunities.</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => syncBills()}
            disabled={isSyncing}
            className="gap-2 border-primary/20 hover:border-primary/50 text-primary"
            data-testid="button-sync-data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Syncing..." : "Sync Data"}
          </Button>
        </div>

        {billsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Bills"
              value={totalBills}
              icon={FileText}
              description="Bills being tracked"
            />
            <StatCard
              title="Total Senators"
              value={totalSenators}
              icon={Users}
              description="In current analysis"
            />
            <StatCard
              title="Swing Votes"
              value={swingSenators}
              icon={TrendingUp}
              description="High priority targets"
              trend="up"
            />
            <StatCard
              title="Leaning Votes"
              value={leaningSenators}
              icon={AlertCircle}
              description="Potential persuasion opportunities"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Legislation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {billsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredBills.slice(0, 5).map((bill) => (
                  <Link href={`/bills/${bill.id}`} key={bill.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" data-testid={`card-bill-${bill.id}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{bill.shortTitle || bill.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{bill.latestAction}</p>
                      </div>
                      <Badge variant="secondary" className="ml-4 shrink-0">{bill.billSlug}</Badge>
                    </div>
                  </Link>
                ))}
                {filteredBills.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    {selectedTopics.length > 0 
                      ? "No bills match your selected topics." 
                      : "No bills available. Click sync to fetch data."}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Swing Senators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!firstAnalysis ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : firstAnalysis.senators
                    ?.filter(s => s.status === "Swing" || s.status === "Leaning")
                    .slice(0, 5)
                    .map((senator, index) => (
                  <div 
                    key={senator.member.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`card-senator-${senator.member.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        Sen. {senator.member.firstName} {senator.member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {senator.member.party === "D" ? "Democrat" : senator.member.party === "R" ? "Republican" : "Independent"} - {senator.member.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Badge 
                        variant={senator.status === "Swing" ? "destructive" : "secondary"}
                        className={senator.status === "Swing" ? "bg-red-100 text-red-700 border-red-200" : ""}
                      >
                        {senator.status}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">
                        {senator.member.votesWithPartyPct}%
                      </span>
                    </div>
                  </div>
                ))}
                {firstAnalysis?.senators?.filter(s => s.status === "Swing" || s.status === "Leaning").length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No swing or leaning senators found.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
