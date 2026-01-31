import { motion } from "framer-motion";
import { User, Phone, Mail, Award, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SenatorAnalysis } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SenatorListProps {
  senators: SenatorAnalysis[];
}

export function SenatorList({ senators }: SenatorListProps) {
  // Group by status for better organization
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
              <SenatorCard key={item.member.id} analysis={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SenatorCard({ analysis }: { analysis: SenatorAnalysis }) {
  const { member, status, strategy } = analysis;

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
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                View Full Analysis
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
                  <Button variant="secondary" className="flex-1 gap-2">
                    <Mail className="w-4 h-4" /> Draft Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </motion.div>
  );
}
