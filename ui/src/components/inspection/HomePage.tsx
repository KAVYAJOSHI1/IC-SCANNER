import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, Search, BarChart3 } from "lucide-react";

interface HomePageProps {
  onLaunch: () => void;
}

export const HomePage = ({ onLaunch }: HomePageProps) => {
  return (
    <div className="animate-fade-in text-center">
      <div className="py-20">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          MarkScan AI Verification
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Automated, AI-powered inspection for integrated circuits. Ensure authenticity and quality with high-speed batch analysis.
        </p>
        <Button onClick={onLaunch} size="lg" className="mt-8">
          Launch Inspector
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Card className="shadow-card border-border">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Automated Analysis</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create a batch, upload component images, and let our AI perform a detailed inspection on each unit.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Instant Results</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Receive immediate pass/fail feedback with confidence scores, and review any flagged items in a dedicated queue.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Vendor Analytics</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Track vendor quality over time with comprehensive analytics and a complete audit trail of all inspections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};