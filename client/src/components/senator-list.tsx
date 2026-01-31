import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Phone, Mail, Award, TrendingUp, AlertCircle, Loader2, Copy, Check,
  BarChart3, PieChart, Target, FileText, Users, MapPin, Building, 
  ThumbsUp, ThumbsDown, Minus, TrendingDown, ChevronRight, ExternalLink,
  Scale, Briefcase, Heart, Leaf, Shield, DollarSign
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SenatorAnalysis, Bill } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useDraftEmail } from "@/hooks/use-email";
import { useToast } from "@/hooks/use-toast";

interface SenatorListProps {
  senators: SenatorAnalysis[];
  billId?: string;
  bill?: Bill;
}

export function SenatorList({ senators, billId, bill }: SenatorListProps) {
  const grouped = {
    Swing: senators.filter(s => s.status === "Swing"),
    Leaning: senators.filter(s => s.status === "Leaning"),
    Loyalist: senators.filter(s => s.status === "Loyalist"),
  };

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([status, items]) => (
        <div key={status} className="space-y-4">
          <h3 className={cn(
            "text-lg font-serif font-semibold flex items-center gap-2",
            status === "Swing" ? "text-purple-600" : 
            status === "Leaning" ? "text-amber-600" : "text-green-600"
          )}>
            {status === "Swing" && <TrendingUp className="w-5 h-5" />}
            {status === "Leaning" && <AlertCircle className="w-5 h-5" />}
            {status === "Loyalist" && <Award className="w-5 h-5" />}
            {status} Votes ({items.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <SenatorCard key={item.member.id} analysis={item} billId={billId} bill={bill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function generateMockAnalytics(member: SenatorAnalysis["member"], status: string) {
  const isSwing = status === "Swing";
  const isLeaning = status === "Leaning";
  
  const flipProbability = isSwing ? Math.floor(Math.random() * 30) + 55 : 
                          isLeaning ? Math.floor(Math.random() * 25) + 30 : 
                          Math.floor(Math.random() * 15) + 5;
  
  const keyIssues = [
    { name: "Economy & Jobs", alignment: Math.floor(Math.random() * 40) + 30, icon: DollarSign },
    { name: "Healthcare", alignment: Math.floor(Math.random() * 50) + 25, icon: Heart },
    { name: "Environment", alignment: Math.floor(Math.random() * 60) + 20, icon: Leaf },
    { name: "Defense", alignment: Math.floor(Math.random() * 45) + 35, icon: Shield },
  ];

  const votingHistory = [
    { bill: "HR-2847", title: "Healthcare Access Act", vote: Math.random() > 0.5 ? "YES" : "NO", date: "Jan 15, 2026" },
    { bill: "SB-1523", title: "Climate Infrastructure Bill", vote: Math.random() > 0.6 ? "YES" : "NO", date: "Dec 8, 2025" },
    { bill: "HR-1104", title: "Tax Reform Act", vote: Math.random() > 0.4 ? "YES" : "NO", date: "Nov 22, 2025" },
    { bill: "SB-892", title: "Education Funding Bill", vote: Math.random() > 0.5 ? "YES" : "NO", date: "Oct 5, 2025" },
  ];

  const influenceFactors = [
    { factor: "Constituent pressure", impact: isSwing ? 85 : 45, trend: "up" as const },
    { factor: "Donor influence", impact: isSwing ? 72 : 60, trend: "stable" as const },
    { factor: "Party leadership", impact: isLeaning ? 68 : 82, trend: "down" as const },
    { factor: "Media coverage", impact: Math.floor(Math.random() * 30) + 40, trend: "up" as const },
  ];

  const demographics = {
    urbanVsRural: { urban: Math.floor(Math.random() * 40) + 30, rural: 0 },
    partyRegistration: { 
      dem: member.party === "D" ? Math.floor(Math.random() * 15) + 40 : Math.floor(Math.random() * 15) + 25,
      rep: member.party === "R" ? Math.floor(Math.random() * 15) + 40 : Math.floor(Math.random() * 15) + 25,
      ind: Math.floor(Math.random() * 10) + 15
    },
    topConcerns: ["Jobs & Economy", "Healthcare Costs", "Education", "Infrastructure"]
  };
  demographics.urbanVsRural.rural = 100 - demographics.urbanVsRural.urban;

  const persuasionApproaches = [
    { approach: "Economic impact framing", effectiveness: isSwing ? 88 : 65, recommended: isSwing },
    { approach: "Constituent testimonials", effectiveness: isSwing ? 82 : 55, recommended: isSwing || isLeaning },
    { approach: "Bipartisan coalition appeal", effectiveness: 75, recommended: true },
    { approach: "Local business endorsements", effectiveness: isLeaning ? 78 : 60, recommended: isLeaning },
  ];

  return {
    flipProbability,
    keyIssues,
    votingHistory,
    influenceFactors,
    demographics,
    persuasionApproaches,
    predictedStance: flipProbability > 50 ? "Undecided" : flipProbability > 30 ? "Leaning Against" : "Likely Against",
    confidenceScore: Math.floor(Math.random() * 20) + 70,
  };
}

function SenatorCard({ analysis, billId, bill }: { analysis: SenatorAnalysis; billId?: string; bill?: Bill }) {
  const { member, status, strategy } = analysis;
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [voteIntention, setVoteIntention] = useState<"YES" | "NO">("YES");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { mutate: draftEmail, isPending } = useDraftEmail();
  const analytics = generateMockAnalytics(member, status);

  const handleDraftEmail = () => {
    if (!billId) {
      toast({
        title: "Bill context required",
        description: "Please open a specific bill to draft an email.",
        variant: "destructive",
      });
      return;
    }
    
    draftEmail(
      { senatorId: member.id, billId, voteIntention },
      {
        onSuccess: (data) => {
          setSubject(data.subject);
          setBody(data.body);
          setEmailDialogOpen(true);
        },
        onError: (error) => {
          toast({
            title: "Failed to generate email",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleCopy = async () => {
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-border">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h4 className="font-bold text-foreground leading-tight">
                  {member.firstName} {member.lastName}
                </h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {member.party} • {member.state}
                </p>
              </div>
            </div>
            <Badge variant={status === "Swing" ? "default" : "secondary"} className={cn(
              status === "Swing" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" :
              status === "Leaning" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
              "bg-green-100 text-green-700 hover:bg-green-200"
            )}>
              {status}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Party Loyalty</span>
              <span className="font-mono font-medium">{member.votesWithPartyPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-400 rounded-full" 
                style={{ width: `${member.votesWithPartyPct}%` }} 
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-border">
            <h5 className="text-xs font-bold text-muted-foreground uppercase mb-2">Persuasion Strategy</h5>
            <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
              {strategy}
            </p>
          </div>
        </div>

        <div className="p-3 bg-secondary/30 border-t border-border flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs font-semibold" 
            onClick={() => setAnalysisDialogOpen(true)}
            data-testid={`button-view-analysis-${member.id}`}
          >
            View Analysis
          </Button>
          
          {billId && (
            <Button 
              size="sm" 
              className="flex-1 text-xs font-semibold gap-1"
              onClick={handleDraftEmail}
              disabled={isPending}
              data-testid={`button-draft-email-${member.id}`}
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
              Draft Email
            </Button>
          )}
        </div>
      </Card>

      {/* Sophisticated Analysis Dialog */}
      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-border">
                  <User className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <DialogTitle className="font-serif text-2xl mb-1">
                    Sen. {member.firstName} {member.lastName}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{member.state}</span>
                    <span>•</span>
                    <Building className="w-4 h-4" />
                    <span>{member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{analytics.flipProbability}%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Flip Probability</div>
              </div>
            </div>
          </DialogHeader>

          {bill && (
            <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Analyzing position on:</span>
                <Badge variant="outline">{bill.billSlug?.toUpperCase()}</Badge>
                <span className="text-sm text-muted-foreground truncate max-w-[300px]">{bill.shortTitle || bill.title}</span>
              </div>
              <Badge className={cn(
                analytics.predictedStance === "Undecided" ? "bg-amber-100 text-amber-700" :
                analytics.predictedStance.includes("Against") ? "bg-red-100 text-red-700" :
                "bg-green-100 text-green-700"
              )}>
                {analytics.predictedStance}
              </Badge>
            </div>
          )}

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="voting" className="text-xs">Voting History</TabsTrigger>
              <TabsTrigger value="influence" className="text-xs">Influence Factors</TabsTrigger>
              <TabsTrigger value="strategy" className="text-xs">Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    Key Issue Alignment
                  </h4>
                  <div className="space-y-4">
                    {analytics.keyIssues.map((issue) => (
                      <div key={issue.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <issue.icon className="w-4 h-4 text-muted-foreground" />
                            {issue.name}
                          </span>
                          <span className="font-mono text-muted-foreground">{issue.alignment}%</span>
                        </div>
                        <Progress value={issue.alignment} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Constituent Demographics
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Urban</span>
                        <span>Rural</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: `${analytics.demographics.urbanVsRural.urban}%` }}
                        />
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${analytics.demographics.urbanVsRural.rural}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{analytics.demographics.urbanVsRural.urban}%</span>
                        <span>{analytics.demographics.urbanVsRural.rural}%</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground uppercase mb-2">Party Registration</div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">D: {analytics.demographics.partyRegistration.dem}%</Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700">R: {analytics.demographics.partyRegistration.rep}%</Badge>
                        <Badge variant="outline">I: {analytics.demographics.partyRegistration.ind}%</Badge>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground uppercase mb-2">Top Constituent Concerns</div>
                      <div className="flex flex-wrap gap-1">
                        {analytics.demographics.topConcerns.map((concern) => (
                          <Badge key={concern} variant="secondary" className="text-xs">{concern}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  AI-Generated Strategy
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{strategy}</p>
              </Card>
            </TabsContent>

            <TabsContent value="voting" className="mt-4">
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Recent Voting Record
                </h4>
                <div className="space-y-3">
                  {analytics.votingHistory.map((vote, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          vote.vote === "YES" ? "bg-green-100" : "bg-red-100"
                        )}>
                          {vote.vote === "YES" ? (
                            <ThumbsUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <ThumbsDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{vote.title}</div>
                          <div className="text-xs text-muted-foreground">{vote.bill}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={vote.vote === "YES" ? "default" : "destructive"} className={vote.vote === "YES" ? "bg-green-100 text-green-700" : ""}>
                          {vote.vote}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">{vote.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="influence" className="mt-4">
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Influence Factor Analysis
                </h4>
                <div className="space-y-4">
                  {analytics.influenceFactors.map((factor) => (
                    <div key={factor.factor} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{factor.factor}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{factor.impact}%</span>
                          {factor.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {factor.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {factor.trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <Progress value={factor.impact} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h5 className="text-sm font-medium mb-3">Analysis Summary</h5>
                  <p className="text-sm text-muted-foreground">
                    {status === "Swing" 
                      ? `Sen. ${member.lastName} shows high susceptibility to constituent pressure (${analytics.influenceFactors[0].impact}%) and moderate donor influence. Focus outreach on grassroots mobilization and local economic impact messaging.`
                      : status === "Leaning"
                      ? `Sen. ${member.lastName} is moderately influenced by party leadership but shows openness to constituent concerns. A targeted approach combining bipartisan framing with local testimonials may be effective.`
                      : `Sen. ${member.lastName} demonstrates strong party alignment. Resources may be better allocated to more persuadable targets unless they hold a key committee position.`
                    }
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="strategy" className="mt-4">
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Recommended Persuasion Approaches
                  </h4>
                  <div className="space-y-3">
                    {analytics.persuasionApproaches.map((approach, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {approach.recommended && (
                            <Badge className="bg-green-100 text-green-700">Recommended</Badge>
                          )}
                          <span className="text-sm font-medium">{approach.approach}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Effectiveness:</span>
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                approach.effectiveness >= 75 ? "bg-green-500" :
                                approach.effectiveness >= 50 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${approach.effectiveness}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm w-10">{approach.effectiveness}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-primary/5 border-primary/20">
                  <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-2" onClick={handleDraftEmail} disabled={isPending || !billId}>
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      Draft AI Email
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Call Office
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Briefcase className="w-4 h-4" />
                      View Full Profile
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Email to Sen. {member.firstName} {member.lastName}
            </DialogTitle>
            <DialogDescription>
              AI-generated persuasive email tailored to this senator's profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Your Position</Label>
              <RadioGroup 
                value={voteIntention} 
                onValueChange={(v) => setVoteIntention(v as "YES" | "NO")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="YES" id="yes" />
                  <Label htmlFor="yes" className="font-normal">Support (Vote YES)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NO" id="no" />
                  <Label htmlFor="no" className="font-normal">Oppose (Vote NO)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                data-testid="input-email-subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                data-testid="textarea-email-body"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleCopy} 
                className="flex-1 gap-2"
                data-testid="button-copy-email"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setVoteIntention(voteIntention === "YES" ? "NO" : "YES");
                  handleDraftEmail();
                }}
                disabled={isPending}
                data-testid="button-regenerate-email"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Regenerate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
