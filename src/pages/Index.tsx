import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Brain, Calendar, ChevronRight, Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen pb-24 bg-background p-4 space-y-6">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-xl phase-bg-follicular"
      >
        <div className="relative z-10">
          <h2 className="text-sm font-medium opacity-80 uppercase tracking-wider">Follicular Phase</h2>
          <h1 className="text-4xl font-bold mt-1">Day 8</h1>
          <p className="mt-4 text-lg opacity-90">Your energy is rising. A great time for creative projects and high-intensity workouts.</p>
        </div>
        
        {/* Decorative Circle */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 glass-strong border-none shadow-lg rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Insight</h3>
              <p className="text-sm text-muted-foreground mt-1">Based on your cycle, your estrogen levels are peaking. You might feel more social today.</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-3xl glass border-none shadow-sm">
          <Droplets className="text-primary" />
          <span>Log Period</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-3xl glass border-none shadow-sm">
          <Activity className="text-accent" />
          <span>Log Symptoms</span>
        </Button>
      </div>

      {/* Stats Preview */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground px-1">Upcoming</h3>
        <Card className="p-4 flex items-center justify-between rounded-2xl glass border-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-xl">
              <Calendar size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Next Period</p>
              <p className="text-xs text-muted-foreground">Estimated in 12 days</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </Card>
      </div>
    </div>
  );
};

export default Index;
