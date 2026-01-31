import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WhipCountProps {
  counts: {
    yes: number;
    no: number;
    swing: number;
  };
}

export function WhipCountCard({ counts }: WhipCountProps) {
  const total = counts.yes + counts.no + counts.swing;
  
  const data = [
    { name: "Yes (Loyalist)", value: counts.yes, color: "#22c55e" }, // Green-500
    { name: "No (Opposition)", value: counts.no, color: "#ef4444" }, // Red-500
    { name: "Swing (Undecided)", value: counts.swing, color: "#a855f7" }, // Purple-500
  ];

  return (
    <Card className="overflow-hidden border-border/50 shadow-lg shadow-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Whip Count Projection</span>
          <Badge variant="outline" className="font-mono text-xs">{total} Total Votes</Badge>
        </CardTitle>
        <CardDescription>Current vote distribution based on historical alignment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="h-48 w-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-foreground font-serif">
                {Math.round((counts.yes / total) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            {data.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{item.name}</span>
                  <span className="font-bold font-mono">{item.value}</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
