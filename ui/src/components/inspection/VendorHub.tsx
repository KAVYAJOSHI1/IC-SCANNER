import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, ChevronRight, PlusCircle, ScanLine } from "lucide-react";

interface VendorHubProps {
  onStartManual: () => void;
  onNewLot: () => void;
}

export const VendorHub = ({ onStartManual, onNewLot }: VendorHubProps) => {
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inspection Hub</h1>
        <p className="text-muted-foreground">Choose an inspection mode to begin.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-card border-border hover:border-primary transition-colors duration-300 group hover:shadow-lg-custom">
           <CardHeader>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Automated Inspection</CardTitle>
                <CardDescription>Scan a new batch of components from a vendor.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-6">
              Create a new inspection lot by providing the vendor details and uploading all the images of the components in the batch.
            </p>
            <Button onClick={onNewLot} size="lg" className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Lot
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border hover:border-primary transition-colors duration-300 group hover:shadow-lg-custom">
          <CardHeader>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ScanLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Manual Inspection</CardTitle>
                <CardDescription>For single components or non-batch items.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              This mode allows you to upload an image of a single component for individual verification and spot-checks.
            </p>
            <Button onClick={onStartManual} size="lg" className="w-full">
              Start Manual Scan
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};