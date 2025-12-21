import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft } from "lucide-react";
import type { Lot } from "@/pages/Index";

interface NewLotFormProps {
  onLotCreate: (lot: Lot) => void;
  onBack: () => void;
}

export const NewLotForm = ({ onLotCreate, onBack }: NewLotFormProps) => {
  const [vendor, setVendor] = useState("");
  const [lotId, setLotId] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendor && lotId && partNumber && files.length > 0) {
      onLotCreate({ vendor, lotId, partNumber, files });
    } else {
      alert("Please fill in all fields and upload at least one image.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Hub
      </Button>
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Create New Inspection Lot</CardTitle>
          <CardDescription>Enter the lot details and upload all component images for automated scanning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor Name</Label>
              <Input id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g., TechSupply Inc." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotId">Lot ID</Label>
                <Input id="lotId" value={lotId} onChange={(e) => setLotId(e.target.value)} placeholder="e.g., LOT-2024-001" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number</Label>
                <Input id="partNumber" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} placeholder="e.g., IC-STM32F407" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Component Images</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
                <Input id="file-upload" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-md font-semibold">
                    {files.length > 0 ? `${files.length} image(s) selected` : "Click to select or drag & drop"}
                  </h3>
                  <p className="text-xs text-muted-foreground">Select all images for this batch</p>
                </Label>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Begin Automated Scan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};