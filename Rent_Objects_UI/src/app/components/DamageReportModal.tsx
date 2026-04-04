import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface DamageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectName?: string;
  currentUser: string | null;
}

export interface DamageReport {
  id: string;
  objectName: string;
  userName: string;
  damageDescription: string;
  estimatedCost: number;
  reportDate: string;
  photoUrl?: string;
  status: "pending" | "reviewed" | "resolved";
}

export function DamageReportModal({ isOpen, onClose, objectName, currentUser }: DamageReportModalProps) {
  const [formData, setFormData] = useState({
    objectName: objectName || "",
    damageDescription: "",
    estimatedCost: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please log in to submit a damage report");
      return;
    }

    const report: DamageReport = {
      id: `REPORT-${Date.now()}`,
      objectName: formData.objectName,
      userName: currentUser,
      damageDescription: formData.damageDescription,
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
      reportDate: new Date().toISOString(),
      photoUrl: photoPreview || undefined,
      status: "pending",
    };

    // Save report to localStorage
    const reports = JSON.parse(localStorage.getItem("edurent_damage_reports") || "[]");
    reports.unshift(report);
    localStorage.setItem("edurent_damage_reports", JSON.stringify(reports));

    toast.success("Damage report submitted successfully! We'll review it soon.");
    
    // Reset form
    setFormData({
      objectName: "",
      damageDescription: "",
      estimatedCost: "",
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-orange-50 to-red-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 flex items-center gap-2">
            <AlertTriangle className="size-6 text-orange-600" />
            Report Damage
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            Please provide details about any damage to the rented item
          </p>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
        >
          <div>
            <Label htmlFor="objectName">Item Name *</Label>
            <Input
              id="objectName"
              value={formData.objectName}
              onChange={(e) => setFormData({ ...formData, objectName: e.target.value })}
              required
              placeholder="Enter the name of the damaged item"
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="damageDescription">Damage Description *</Label>
            <Textarea
              id="damageDescription"
              value={formData.damageDescription}
              onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
              required
              placeholder="Please describe the damage in detail..."
              className="bg-white min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="estimatedCost">Estimated Repair Cost (₹)</Label>
            <Input
              id="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="Optional: Estimated cost to repair"
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="photo">Upload Photo (Optional)</Label>
            <div className="mt-2">
              {!photoPreview ? (
                <label
                  htmlFor="photo"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                >
                  <Upload className="size-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload damage photo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Damage preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Damage reports are reviewed by our team. If the damage is found to be
              beyond normal wear and tear, repair costs may be deducted from your security deposit.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Submit Report
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
