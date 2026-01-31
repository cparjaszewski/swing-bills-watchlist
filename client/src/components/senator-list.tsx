import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, Award, TrendingUp, AlertCircle, Loader2, Copy, Check } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SenatorAnalysis } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useDraftEmail } from "@/hooks/use-email";
import { useToast } from "@/hooks/use-toast";

interface SenatorListProps {
  senators: SenatorAnalysis[];
  billId?: string;
}

export function SenatorList({ senators, billId }: SenatorListProps) {
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
              <SenatorCard key={item.member.id} analysis={item} billId={billId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SenatorCard({ analysis, billId }: { analysis: SenatorAnalysis; billId?: string }) {
  const { member, status, strategy } = analysis;
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [voteIntention, setVoteIntention] = useState<"YES" | "NO">("YES");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { mutate: draftEmail, isPending } = useDraftEmail();

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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-xs font-semibold" data-testid={`button-view-analysis-${member.id}`}>
                View Analysis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">
                  Sen. {member.firstName} {member.lastName}
                </DialogTitle>
                <DialogDescription>
                  Detailed persuasion analysis and contact points.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground">Generated Strategy</h4>
                  <p className="text-base leading-relaxed">{strategy}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">State</label>
                    <p className="font-medium">{member.state}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Party</label>
                    <p className="font-medium">{member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent'}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <Phone className="w-4 h-4" /> Call Office
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 gap-2"
                    onClick={handleDraftEmail}
                    disabled={isPending || !billId}
                    data-testid={`button-draft-email-dialog-${member.id}`}
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Draft Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
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
