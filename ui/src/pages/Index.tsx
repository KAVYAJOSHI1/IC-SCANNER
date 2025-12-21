import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HomePage } from "@/components/inspection/HomePage";
import { VendorHub } from "@/components/inspection/VendorHub";
import { InspectionDashboard } from "@/components/inspection/InspectionDashboard";
import { FlaggedQueue } from "@/components/inspection/FlaggedQueue";
import { HistoryLog } from "@/components/inspection/HistoryLog";
import { Analytics } from "@/components/inspection/Analytics";
import { NewLotForm } from "@/components/inspection/NewLotForm";
import { Scan, History, Flag, Layers, BarChart3, Home } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Page = "home" | "hub" | "new-lot" | "inspection" | "flagged" | "history" | "analytics";

// UPDATE: This now matches the database schema (snake_case)
export interface Lot {
  vendor: string;
  lotId: string;
  partNumber: string;
  files: File[];
}

export interface InspectionRecord {
  id: number;
  vendor: string;
  lot_id: string;
  part_number: string;
  result: "pass" | "fail" | "overridden";
  operator: string;
  image_url?: string;
  confidence: number;
  created_at: string;
}

const Index = () => {
  const [activeScreen, setActiveScreen] = useState<Page>("home");
  const [historyRecords, setHistoryRecords] = useState<InspectionRecord[]>([]);
  const [currentLot, setCurrentLot] = useState<Lot | null>(null);

  // FETCH data from Supabase when the component first loads
  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from('inspection_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching records:", error);
      } else if (data) {
        setHistoryRecords(data);
      }
    };
    fetchRecords();
  }, []);

  // Calculate flagged items from the main history list
  const flaggedItems = historyRecords.filter((record) => record.result === "fail");

  const stats = historyRecords.reduce(
    (acc, record) => {
      if (record.result === "pass" || record.result === "overridden") acc.pass++;
      else acc.fail++;
      return acc;
    }, { pass: 0, fail: 0 }
  );

  // This function now adds the new record to the top of the existing list
  const addToHistory = (record: InspectionRecord) => {
    setHistoryRecords((prev) => [record, ...prev]);
  };

  const handleFlaggedAction = async (itemId: number, action: "approve" | "reject") => {
    if (action === "approve") {
      const { error } = await supabase
        .from('inspection_records')
        .update({ result: 'overridden' })
        .eq('id', itemId);

      if (error) {
        console.error("Error updating record:", error);
      } else {
        setHistoryRecords((prev) =>
          prev.map((record) => (record.id === itemId ? { ...record, result: "overridden" as const } : record))
        );
      }
    }
    // Note: 'reject' does nothing to the database, it just visually removes it from the queue if needed.
    // To handle this, we can refetch or just filter the local state.
    // For now, we'll rely on the historyRecords state to be the source of truth.
  };

  const startManualInspection = () => {
    setCurrentLot(null);
    setActiveScreen("inspection");
  };

  const handleLotCreate = (lot: Lot) => {
    setCurrentLot(lot);
    setActiveScreen("inspection");
  };

  const navItems = [
    { id: "home" as Page, label: "Home", icon: Home },
    { id: "hub" as Page, label: "Inspection Hub", icon: Layers },
    { id: "flagged" as Page, label: "Flagged Queue", icon: Flag, badge: flaggedItems.length },
    { id: "analytics" as Page, label: "Analytics", icon: BarChart3 },
    { id: "history" as Page, label: "History", icon: History },
  ];

  const renderContent = () => {
    switch (activeScreen) {
      case "home":
        return <HomePage onLaunch={() => setActiveScreen("hub")} />;
      case "hub":
        return <VendorHub onStartManual={startManualInspection} onNewLot={() => setActiveScreen("new-lot")} />;
      case "new-lot":
        return <NewLotForm onLotCreate={handleLotCreate} onBack={() => setActiveScreen("hub")} />;
      case "inspection":
        return <InspectionDashboard currentLot={currentLot} stats={stats} onAddRecord={addToHistory} />;
      case "flagged":
        return <FlaggedQueue items={flaggedItems} onAction={handleFlaggedAction} />;
      case "analytics":
        return <Analytics records={historyRecords} />;
      case "history":
        return <HistoryLog records={historyRecords} />;
      default:
        return <HomePage onLaunch={() => setActiveScreen("hub")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveScreen("home")}>
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-glow">
                <Scan className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                MarkScan AI
              </h1>
            </div>
            <nav className="flex gap-2">
              {navItems.map((item) => (
                <Button key={item.id} variant={activeScreen === item.id ? "default" : "ghost"} className="relative" onClick={() => setActiveScreen(item.id)}>
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (<Badge className="ml-2 bg-destructive text-destructive-foreground">{item.badge}</Badge>)}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;