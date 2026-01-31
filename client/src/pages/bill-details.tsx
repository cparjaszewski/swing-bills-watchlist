import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, FileText, Share2, Printer } from "lucide-react";
import { Layout } from "@/components/layout";
import { useBillAnalysis } from "@/hooks/use-bills";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WhipCountCard } from "@/components/whip-count-card";
import { SenatorList } from "@/components/senator-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BillDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: analysis, isLoading, error } = useBillAnalysis(id || "");

  if (isLoading) return <BillDetailsSkeleton />;
  if (error || !analysis) return <BillDetailsError />;

  const { bill, whipCount, senators } = analysis;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/bills" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Legislation
          </Link>

          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="space-y-2 max-w-4xl">
              <div className="flex gap-2">
                <Badge className="bg-primary text-primary-foreground font-mono">{bill.billSlug}</Badge>
                <Badge variant="outline" className="text-muted-foreground">{bill.latestAction}</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                {bill.shortTitle || bill.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> 
                  Updated {new Date(bill.lastUpdated || "").toLocaleDateString()}
                </span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" /> 
                  ProPublica ID: {bill.id}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="analysis" className="space-y-8">
          <TabsList className="bg-background/50 border border-border p-1 h-12 rounded-xl">
            <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6">Vote Analysis</TabsTrigger>
            <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6">Bill Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            {/* Top Row: Whip Count & Key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <WhipCountCard counts={whipCount} />
              </div>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="font-serif font-bold text-lg mb-4">Strategic Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Pass Probability</span>
                      <span className="font-mono font-bold text-green-600">68%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Key Swing Votes</span>
                      <span className="font-mono font-bold text-purple-600">{whipCount.swing}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-border/50">
                      <span className="text-muted-foreground text-sm">Party Alignment</span>
                      <span className="font-mono font-bold">High</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20">
                    Export Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Senators Grid */}
            <div className="pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold">Senate Floor Analysis</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Filter by State</Button>
                  <Button variant="ghost" size="sm">Filter by Party</Button>
                </div>
              </div>
              <SenatorList senators={senators} />
            </div>
          </TabsContent>

          <TabsContent value="text" className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm prose prose-slate max-w-none">
              <h3 className="font-serif">Summary</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {bill.summary || "No summary available for this bill."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function BillDetailsSkeleton() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </Layout>
  );
}

function BillDetailsError() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Analysis Unavailable</h2>
        <p className="text-muted-foreground mb-6">We couldn't retrieve the analysis for this bill. Please try again later.</p>
        <Link href="/bills">
          <Button variant="outline">Return to Legislation</Button>
        </Link>
      </div>
    </Layout>
  );
}
