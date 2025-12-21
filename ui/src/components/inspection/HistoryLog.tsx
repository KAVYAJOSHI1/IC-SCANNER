import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { InspectionRecord } from "@/pages/Index";

interface HistoryLogProps {
  records: InspectionRecord[];
}

export const HistoryLog = ({ records }: HistoryLogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = records.filter(
    (record) =>
      record.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.lot_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (result: string) => {
    if (result === "overridden") return <Badge className="bg-primary/10 text-primary border-primary/20">Pass (Overridden)</Badge>;
    if (result === "pass") return <Badge className="bg-success/10 text-success border-success/20">Pass</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Fail</Badge>;
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Audit History</h2>
      <Card className="shadow-card border-border mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="🔍 Search history..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Lot ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Part Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Result</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Confidence</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No history records found</td></tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm">{new Date(record.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{record.vendor}</td>
                    <td className="px-6 py-4 text-sm font-mono">{record.lot_id}</td>
                    <td className="px-6 py-4 text-sm font-mono">{record.part_number}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(record.result)}</td>
                    <td className="px-6 py-4 text-sm">{Math.round(record.confidence * 100)}%</td>
                    <td className="px-6 py-4 text-sm">{record.operator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};