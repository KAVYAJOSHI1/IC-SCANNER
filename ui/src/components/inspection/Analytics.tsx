import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Package, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { InspectionRecord } from "@/pages/Index";

interface AnalyticsProps { records: InspectionRecord[]; }
interface VendorStats { vendor: string; totalScanned: number; passed: number; failed: number; passRate: number; avgConfidence: number; lots: Set<string>; }

export const Analytics = ({ records }: AnalyticsProps) => {
  // Calculate overall statistics
  const totalScans = records.length;
  const totalPassed = records.filter((r) => r.result === "pass" || r.result === "overridden").length;
  const totalFailed = records.filter((r) => r.result === "fail").length;
  const overallPassRate = totalScans > 0 ? (totalPassed / totalScans) * 100 : 0;
  // UPDATE: Calculate average confidence and convert to percentage
  const avgConfidence = totalScans > 0 ? (records.reduce((sum, r) => sum + r.confidence, 0) / totalScans) * 100 : 0;

  // Calculate vendor-specific statistics
  const vendorStatsMap = new Map<string, VendorStats>();
  records.forEach((record) => {
    if (!vendorStatsMap.has(record.vendor)) {
      vendorStatsMap.set(record.vendor, { vendor: record.vendor, totalScanned: 0, passed: 0, failed: 0, passRate: 0, avgConfidence: 0, lots: new Set() });
    }
    const stats = vendorStatsMap.get(record.vendor)!;
    stats.totalScanned++;
    // UPDATE: Use snake_case for lot_id
    stats.lots.add(record.lot_id);
    if (record.result === "pass" || record.result === "overridden") stats.passed++; else stats.failed++;
  });

  // Calculate derived metrics for each vendor
  const vendorStats = Array.from(vendorStatsMap.values()).map((stats) => {
    const vendorRecords = records.filter((r) => r.vendor === stats.vendor);
    const totalConfidence = vendorRecords.reduce((sum, r) => sum + r.confidence, 0);
    return { 
      ...stats, 
      passRate: (stats.passed / stats.totalScanned) * 100, 
      // UPDATE: Calculate average confidence and convert to percentage
      avgConfidence: stats.totalScanned > 0 ? (totalConfidence / stats.totalScanned) * 100 : 0
    };
  }).sort((a, b) => b.totalScanned - a.totalScanned);

  // Calculate lot-specific statistics
  const lotStatsMap = new Map<string, { lotId: string; vendor: string; passed: number; failed: number; total: number }>();
  records.forEach((record) => {
    // UPDATE: Use snake_case for lot_id
    const key = `${record.vendor}-${record.lot_id}`;
    if (!lotStatsMap.has(key)) {
      lotStatsMap.set(key, { lotId: record.lot_id, vendor: record.vendor, passed: 0, failed: 0, total: 0 });
    }
    const lotStats = lotStatsMap.get(key)!;
    lotStats.total++;
    if (record.result === "pass" || record.result === "overridden") lotStats.passed++; else lotStats.failed++;
  });

  const lotStats = Array.from(lotStatsMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const getQualityStatus = (passRate: number) => {
    if (passRate >= 95) return { label: "Excellent", color: "text-success", bg: "bg-success/10", border: "border-success/20" };
    if (passRate >= 85) return { label: "Good", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
    if (passRate >= 70) return { label: "Fair", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" };
    return { label: "Poor", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" };
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">{totalScans} Total Inspections</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card border-border"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Scanned</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">{totalScans}</div><p className="text-xs text-muted-foreground mt-1">Across {vendorStats.length} vendors</p></CardContent></Card>
        <Card className="shadow-card border-border"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Passed</CardTitle><CheckCircle2 className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-3xl font-bold text-success">{totalPassed}</div><p className="text-xs text-muted-foreground mt-1">{overallPassRate.toFixed(1)}% pass rate</p></CardContent></Card>
        <Card className="shadow-card border-border"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Failed</CardTitle><XCircle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-3xl font-bold text-destructive">{totalFailed}</div><p className="text-xs text-muted-foreground mt-1">{(100 - overallPassRate).toFixed(1)}% failure rate</p></CardContent></Card>
        <Card className="shadow-card border-border"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Confidence</CardTitle><TrendingUp className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-3xl font-bold">{avgConfidence.toFixed(1)}%</div><p className="text-xs text-muted-foreground mt-1">Detection accuracy</p></CardContent></Card>
      </div>
      <Card className="shadow-card border-border">
        <CardHeader><CardTitle>Vendor Performance Analysis</CardTitle><CardDescription>Verification statistics and quality ratings by vendor</CardDescription></CardHeader>
        <CardContent>
          {vendorStats.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No vendor data available yet</p></div>) : (
            <div className="space-y-6">
              {vendorStats.map((vendor) => {
                const quality = getQualityStatus(vendor.passRate);
                return (
                  <div key={vendor.vendor} className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{vendor.vendor}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.lots.size} lot(s) • {vendor.totalScanned} components scanned</p>
                      </div>
                      <Badge className={`${quality.bg} ${quality.color} ${quality.border}`}>{quality.label}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-muted/30 rounded-lg p-4 border border-border"><div className="text-sm text-muted-foreground mb-1">Pass Rate</div><div className="text-2xl font-bold flex items-center gap-2">{vendor.passRate.toFixed(1)}%{vendor.passRate >= 85 ? (<TrendingUp className="w-5 h-5 text-success" />) : (<TrendingDown className="w-5 h-5 text-destructive" />)}</div></div>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border"><div className="text-sm text-muted-foreground mb-1">Passed / Failed</div><div className="text-2xl font-bold"><span className="text-success">{vendor.passed}</span>{" / "}<span className="text-destructive">{vendor.failed}</span></div></div>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border"><div className="text-sm text-muted-foreground mb-1">Avg Confidence</div><div className="text-2xl font-bold">{vendor.avgConfidence.toFixed(1)}%</div></div>
                    </div>
                    <div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Quality Score</span><span className="font-semibold">{vendor.passRate.toFixed(0)}/100</span></div><Progress value={vendor.passRate} className="h-2" /></div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-card border-border">
        <CardHeader><CardTitle>Top Lot Performance</CardTitle><CardDescription>Most frequently scanned lots and their verification results</CardDescription></CardHeader>
        <CardContent>
          {lotStats.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No lot data available yet</p></div>) : (
            <div className="space-y-4">
              {lotStats.map((lot) => {
                const passRate = (lot.passed / lot.total) * 100;
                const quality = getQualityStatus(passRate);
                return (
                  <div key={`${lot.vendor}-${lot.lotId}`} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex-1"><div className="font-semibold mb-1">{lot.lotId}</div><div className="text-sm text-muted-foreground">{lot.vendor}</div></div>
                    <div className="text-center px-4"><div className="text-2xl font-bold">{lot.total}</div><div className="text-xs text-muted-foreground">Scanned</div></div>
                    <div className="text-center px-4"><div className="text-lg font-semibold text-success">{lot.passed}</div><div className="text-xs text-muted-foreground">Passed</div></div>
                    <div className="text-center px-4"><div className="text-lg font-semibold text-destructive">{lot.failed}</div><div className="text-xs text-muted-foreground">Failed</div></div>
                    <div className="w-32"><div className="text-sm font-semibold mb-1">{passRate.toFixed(1)}%</div><Progress value={passRate} className="h-2" /></div>
                    <Badge className={`${quality.bg} ${quality.color} ${quality.border}`}>{quality.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader><CardTitle>Overall Quality Distribution</CardTitle><CardDescription>Pass/fail ratio across all vendors</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4"><div className="w-24 text-sm font-medium text-success">Passed</div><Progress value={(totalPassed / totalScans) * 100} className="flex-1 h-3" /><div className="w-16 text-right font-semibold">{totalPassed}</div></div>
              <div className="flex items-center gap-4"><div className="w-24 text-sm font-medium text-destructive">Failed</div><Progress value={(totalFailed / totalScans) * 100} className="flex-1 h-3 [&>div]:bg-destructive" /><div className="w-16 text-right font-semibold">{totalFailed}</div></div>
            </div>
            <div className="mt-6 pt-6 border-t border-border"><div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">System Pass Rate</span><span className="text-2xl font-bold">{overallPassRate.toFixed(1)}%</span></div></div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardHeader><CardTitle>Confidence Score Distribution</CardTitle><CardDescription>Average detection confidence by vendor</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorStats.slice(0, 5).map((vendor) => (<div key={vendor.vendor} className="flex items-center gap-4"><div className="w-32 text-sm font-medium truncate">{vendor.vendor}</div><Progress value={vendor.avgConfidence} className="flex-1 h-3" /><div className="w-16 text-right font-semibold">{vendor.avgConfidence.toFixed(0)}%</div></div>))}
            </div>
            <div className="mt-6 pt-6 border-t border-border"><div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">System Avg Confidence</span><span className="text-2xl font-bold">{avgConfidence.toFixed(1)}%</span></div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};