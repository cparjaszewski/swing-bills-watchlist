import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Heart, 
  GraduationCap, 
  Leaf, 
  TrendingUp, 
  Globe, 
  Shield, 
  Scale, 
  Building, 
  Cpu, 
  Gavel,
  Target,
  Wheat,
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTopics, useSavePreferences } from "@/hooks/use-preferences";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  heart: Heart,
  "graduation-cap": GraduationCap,
  leaf: Leaf,
  "trending-up": TrendingUp,
  globe: Globe,
  shield: Shield,
  scale: Scale,
  building: Building,
  cpu: Cpu,
  gavel: Gavel,
  target: Target,
  wheat: Wheat,
};

const categoryColors: Record<string, string> = {
  Social: "from-purple-500 to-indigo-500",
  Environment: "from-green-500 to-emerald-500",
  Economic: "from-amber-500 to-orange-500",
  Security: "from-red-500 to-rose-500",
  Technology: "from-blue-500 to-cyan-500",
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { data: topics, isLoading } = useTopics();
  const { mutate: savePreferences, isPending } = useSavePreferences();
  const { toast } = useToast();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) 
        ? prev.filter(t => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleContinue = () => {
    if (step === 1) {
      if (selectedTopics.length === 0) {
        toast({
          title: "Select at least one topic",
          description: "Choose the issues that matter most to you.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else {
      savePreferences(
        { 
          selectedTopics, 
          onboardingComplete: true 
        },
        {
          onSuccess: () => {
            toast({
              title: "Preferences saved!",
              description: "Your personalized experience is ready.",
            });
            setLocation("/");
          },
          onError: () => {
            toast({
              title: "Failed to save",
              description: "Please try again.",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Personalized Experience</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
            {step === 1 ? "What matters to you?" : "You're all set!"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {step === 1 
              ? "Select the policy topics you care about most. We'll filter bills and alerts to match your interests."
              : "We'll personalize your SwingVote experience based on your selections."
            }
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className={cn(
              "w-16 h-1 rounded-full transition-all",
              step >= 2 ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topics?.map((topic) => {
                  const Icon = iconMap[topic.icon || "heart"] || Heart;
                  const isSelected = selectedTopics.includes(topic.name);
                  const gradientClass = categoryColors[topic.category || "Social"] || categoryColors.Social;
                  
                  return (
                    <motion.div
                      key={topic.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={cn(
                          "cursor-pointer transition-all duration-300 h-full",
                          isSelected 
                            ? "ring-2 ring-primary shadow-lg shadow-primary/20" 
                            : "hover:shadow-md"
                        )}
                        onClick={() => toggleTopic(topic.name)}
                        data-testid={`topic-card-${topic.name.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                            isSelected ? gradientClass : "from-muted to-muted"
                          )}>
                            <Icon className={cn(
                              "w-6 h-6",
                              isSelected ? "text-white" : "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{topic.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {topic.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Selected: {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Your selected topics:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.map(topic => (
                    <span 
                      key={topic} 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Bills filtered to your interests
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Personalized swing vote alerts
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  AI-powered persuasion strategies
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          {step === 2 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              data-testid="button-back"
            >
              Back
            </Button>
          )}
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={isPending}
            className="gap-2 min-w-[200px]"
            data-testid="button-continue"
          >
            {isPending ? "Saving..." : step === 1 ? "Continue" : "Get Started"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {step === 1 && (
          <p className="text-center mt-6 text-sm text-muted-foreground">
            <button 
              onClick={() => setLocation("/")} 
              className="underline hover:text-primary"
              data-testid="link-skip"
            >
              Skip for now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
