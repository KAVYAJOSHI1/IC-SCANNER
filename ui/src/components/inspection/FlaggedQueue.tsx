import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Search } from "lucide-react";
import type { InspectionRecord } from "@/pages/Index";

interface FlaggedQueueProps {
  items: InspectionRecord[];
  onAction: (itemId: number, action: "approve" | "reject") => void;
}

export const FlaggedQueue = ({ items, onAction }: FlaggedQueueProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lot_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Flagged Components Queue</h2>
      <Card className="shadow-card border-border mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="🔍 Search queue..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>
      {filteredItems.length === 0 ? (
        <Card className="shadow-card border-border">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Queue is Clear</h3>
            <p className="text-muted-foreground">No flagged components require review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="shadow-card border-l-4 border-l-destructive hover:shadow-lg-custom transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-lg">{item.part_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.lot_id}</p>
                  </div>
                  <Badge variant="destructive" className="shrink-0">Failed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {item.image_url && (
                  <div className="aspect-video bg-black rounded-lg mb-4 overflow-hidden border border-border">
                    <img src={item.image_url} alt={`Flagged ${item.part_number}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="bg-muted/50 rounded-lg p-3 mb-4 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Details</div>
                  <div className="font-mono text-sm">
                    <div>Vendor: {item.vendor}</div>
                    <div>Confidence: {Math.round(item.confidence * 100)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => onAction(item.id, "approve")} variant="outline" size="sm" className="flex-1 border-success text-success hover:bg-success hover:text-success-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-1" />Mark Legit
                  </Button>
                  <Button onClick={() => onAction(item.id, "reject")} variant="outline" size="sm" className="flex-1">
                    <XCircle className="w-4 h-4 mr-1" />Confirm Fake
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};