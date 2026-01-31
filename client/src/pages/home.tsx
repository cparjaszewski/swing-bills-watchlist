import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Search, FileText, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/layout";
import { useBills, useSyncBills } from "@/hooks/use-bills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl text-primary">Active Legislation</h1>
            <p className="text-muted-foreground text-lg">Track key votes and identify swing opportunities.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => syncBills()}
              disabled={isSyncing}
              className="gap-2 border-primary/20 hover:border-primary/50 text-primary"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Syncing..." : "Sync Data"}
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search bills by title or ID..." 
            className="pl-10 h-12 text-lg bg-white shadow-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 flex flex-col justify-between">
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/10">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-destructive">Failed to load legislation</h3>
            <p className="text-muted-foreground mt-2">Could not connect to the legislative database.</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">No bills found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or sync new data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBills.map((bill) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/60 group">
                  <CardContent className="pt-6 flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider">
                        {bill.billSlug}
                      </Badge>
                      {bill.volatilityScore && (
                        <Badge variant="outline" className={
                          bill.volatilityScore > 0.7 ? "border-red-200 bg-red-50 text-red-700" :
                          bill.volatilityScore > 0.4 ? "border-amber-200 bg-amber-50 text-amber-700" :
                          "border-green-200 bg-green-50 text-green-700"
                        }>
                          {Math.round(bill.volatilityScore * 100)}% Volatility
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {bill.shortTitle || bill.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {bill.summary || "No summary available for this bill."}
                    </p>

                    <div className="pt-2 text-xs text-muted-foreground font-mono">
                      Latest Action: {bill.latestAction || "Pending"}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-4 border-t border-border/30">
                    <Link href={`/bills/${bill.id}`} className="w-full">
                      <Button className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Analyze Vote <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
