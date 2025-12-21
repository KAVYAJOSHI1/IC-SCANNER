import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, CheckCircle2, XCircle } from "lucide-react";
import type { Lot, InspectionRecord } from "@/pages/Index";

// Interfaces to match the backend API response
interface Detection {
  label: "Perfect" | "Defective";
  confidence: number;
}
interface ApiResponse {
  detections: Detection[];
}

interface InspectionDashboardProps {
  currentLot: Lot | null;
  stats: { pass: number; fail: number };
  onAddRecord: (record: InspectionRecord) => void;
}

export const InspectionDashboard = ({ currentLot, stats, onAddRecord }: InspectionDashboardProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<{ result: "pass" | "fail"; confidence: number; marking: string; } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasStartedProcessing = useRef(false);
  const objectUrls = useRef<string[]>([]);
  const isManualMode = !currentLot;

  // --- AUTO-SCAN useEffect with FULL FormData ---
  useEffect(() => {
    if (isManualMode || !currentLot.files.length || hasStartedProcessing.current) {
      return;
    }

    const processFiles = async () => {
      hasStartedProcessing.current = true;
      const totalFiles = currentLot.files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = currentLot.files[i];
        const imageUrl = URL.createObjectURL(file);
        objectUrls.current.push(imageUrl);

        setUploadedImage(imageUrl);
        setScanResult(null);

        const formData = new FormData();
        formData.append("file", file);
        // --- CHANGE: ADDING REQUIRED METADATA ---
        formData.append("vendor", currentLot.vendor);
        formData.append("lotId", currentLot.lotId);
        formData.append("partNumber", currentLot.partNumber);
        formData.append("operator", "System Auto");

        try {
          const response = await fetch('https://ic-scanner-api.onrender.com/predict/', {  method: "POST", body: formData });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API call failed for ${file.name}`);
          }
          
          const data: ApiResponse = await response.json();
          let result: "pass" | "fail" = "fail";
          let confidence = 0;

          if (data.detections && data.detections.length > 0) {
            const topDetection = data.detections[0];
            result = topDetection.label === "Defective" ? "fail" : "pass";
            confidence = topDetection.confidence * 100;
          }

          setScanResult({ result, confidence, marking: `${currentLot.partNumber}\nLOT: ${currentLot.lotId}` });
          
          const record: InspectionRecord = {
            id: Date.now() + i, vendor: currentLot.vendor, lotId: currentLot.lotId, partNumber: currentLot.partNumber,
            result, timestamp: new Date().toISOString(), operator: "System Auto", image: imageUrl, confidence,
          };
          onAddRecord(record);
        
        } catch (error) {
          console.error("Error processing file:", file.name, error);
          const errorRecord: InspectionRecord = {
            id: Date.now() + i, vendor: currentLot.vendor, lotId: currentLot.lotId, partNumber: currentLot.partNumber,
            result: 'fail', timestamp: new Date().toISOString(), operator: 'System Auto', image: imageUrl, confidence: 0,
          };
          onAddRecord(errorRecord);
        }
        
        setAutoProgress(((i + 1) / totalFiles) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    processFiles();

    return () => {
      objectUrls.current.forEach(URL.revokeObjectURL);
      objectUrls.current = [];
    };
  }, [currentLot, onAddRecord, isManualMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setUploadedImage(event.target?.result as string);
      reader.readAsDataURL(file);
      setScanResult(null);
    }
  };

  // --- MANUAL SCAN with FULL FormData ---
  const handleScan = async () => {
    if (!imageFile) return alert("Please upload an image first.");
    setIsScanning(true);
    setScanResult(null);
    
    const formData = new FormData();
    formData.append("file", imageFile);
    // --- CHANGE: ADDING REQUIRED METADATA FOR MANUAL SCANS ---
    formData.append("vendor", "Manual");
    formData.append("lotId", "N/A");
    formData.append("partNumber", "N/A");
    formData.append("operator", "K. Joshi");

    try {
      const response = await fetch("http://127.0.0.1:8000/predict/", { method: "POST", body: formData });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server responded with an error");
      }

      const data: ApiResponse = await response.json();
      let result: "pass" | "fail" = "fail";
      let confidence = 0;

      if (data.detections && data.detections.length > 0) {
        const topDetection = data.detections[0];
        result = topDetection.label === "Defective" ? "fail" : "pass";
        confidence = topDetection.confidence * 100;
      }

      setScanResult({ result, confidence, marking: "Detected from Manual Scan" });

    } catch (error) {
      console.error("API call failed:", error);
      alert(`Could not get a result from the server. Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleMarkResult = (decision: "pass" | "fail") => {
    if (!scanResult) return;
    const record: InspectionRecord = {
      id: Date.now(), vendor: "Manual", lotId: "N/A", partNumber: "N/A",
      result: decision, timestamp: new Date().toISOString(), operator: "K. Joshi",
      image: uploadedImage || undefined, confidence: scanResult?.confidence || 0,
    };
    onAddRecord(record);
    setUploadedImage(null);
    setImageFile(null);
    setScanResult(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isManualMode ? "Manual Scan Mode" : `${currentLot.vendor} - ${currentLot.lotId}`}</CardTitle>
                  <CardDescription>{isManualMode ? "Upload an image to verify a single component" : `Part: ${currentLot.partNumber} | Automated scan for ${currentLot.files.length} units`}</CardDescription>
                </div>
                {!isManualMode && <Badge className="bg-primary/10 text-primary border-primary/20">Auto Scan Active</Badge>}
              </div>
            </CardHeader>
          </Card>
          
          {isManualMode ? (
            <Card className="shadow-card border-border">
              <CardContent className="pt-6">
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-all duration-300 bg-muted/30" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload IC Image</h3>
                  <p className="text-sm text-muted-foreground">Click to select or drag & drop image</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card border-border">
              <CardContent className="pt-6">
                <div className="bg-black rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center">
                  <Camera className="w-16 h-16 text-primary mb-4 animate-pulse-glow" />
                  <p className="text-primary font-semibold mb-4">Automated Scanning in Progress...</p>
                  <Progress value={autoProgress} className="w-64" />
                  <p className="text-sm text-muted-foreground mt-2">{Math.round(autoProgress)}% Complete</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-card border-border">
              <CardHeader><CardTitle className="text-base">Captured Image</CardTitle></CardHeader>
              <CardContent>
                <div className="aspect-square bg-black rounded-lg flex items-center justify-center border border-border">
                  {uploadedImage ? (<img src={uploadedImage} alt="Captured IC" className="max-w-full max-h-full object-contain rounded-lg" />) : ( <span className="text-muted-foreground">Awaiting scan</span> )}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardHeader><CardTitle className="text-base">OEM Reference</CardTitle></CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center border border-border">
                  <span className="text-muted-foreground text-center px-4">{isManualMode ? "N/A" : currentLot?.partNumber}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {scanResult && (
            <Card className={`shadow-card border-2 ${scanResult.result === "pass" ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}`}>
              <CardContent className="pt-6 text-center">
                {scanResult.result === "pass" ? ( <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" /> ) : ( <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" /> )}
                <h3 className="text-2xl font-bold mb-2">{scanResult.result === "pass" ? "✓ Genuine" : "✗ Counterfeit"}</h3>
                <p className="text-muted-foreground">Confidence: {Math.round(scanResult.confidence)}%</p>
              </CardContent>
            </Card>
          )}

          {isManualMode && (
            <div className="flex gap-3">
              <Button onClick={handleScan} disabled={!uploadedImage || isScanning} className="flex-1" size="lg">{isScanning ? "Analyzing..." : "🔍 Scan & Verify"}</Button>
              <Button onClick={() => handleMarkResult("pass")} disabled={!scanResult} variant="outline" className="flex-1 border-success text-success hover:bg-success hover:text-success-foreground" size="lg">✓ Mark as Pass</Button>
              <Button onClick={() => handleMarkResult("fail")} disabled={!scanResult} variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" size="lg">✗ Flag as Fail</Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="shadow-card border-border">
            <CardHeader><CardTitle>Live Statistics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="text-3xl font-bold text-success">{stats.pass}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-3xl font-bold text-destructive">{stats.fail}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence</span>
                  <span className="font-semibold">{scanResult ? `${Math.round(scanResult.confidence)}%` : "-"}</span>
                </div>
                <Progress value={scanResult?.confidence || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardHeader><CardTitle className="text-base">Detected Marking</CardTitle></CardHeader>
            <CardContent><pre className="text-sm bg-muted/50 p-4 rounded-lg border border-border font-mono">{scanResult?.marking || "Awaiting scan..."}</pre></CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardHeader><CardTitle className="text-base">Expected Marking</CardTitle></CardHeader>
            <CardContent><pre className="text-sm bg-muted/50 p-4 rounded-lg border border-border font-mono">{isManualMode ? "-" : `${currentLot?.partNumber}\nLOT: ${currentLot?.lotId}`}</pre></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};