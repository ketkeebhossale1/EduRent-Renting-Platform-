import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DamageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
}

export function DamageReportModal({ isOpen, onClose, currentUser }: DamageReportModalProps) {
  const [itemName, setItemName] = useState("");
  const [damageType, setDamageType] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!itemName || !damageType || !description) {
      toast.error("Please fill in all fields.");
      return;
    }

    const report = {
      id: `RPT-${Date.now()}`,
      userId: currentUser,
      itemName,
      damageType,
      description,
      reportedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem(`edurent_damage_reports_${currentUser}`) || "[]");
    existing.unshift(report);
    localStorage.setItem(`edurent_damage_reports_${currentUser}`, JSON.stringify(existing));

    toast.success("Damage report submitted successfully!");
    setItemName("");
    setDamageType("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="size-5 text-orange-500" />
            Report Damage
          </DialogTitle>
          <DialogDescription>
            Report any damage to a rented item so we can resolve it quickly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="itemName" className="mb-1 block font-semibold">Item Name</Label>
            <Input
              id="itemName"
              placeholder="e.g. Microscope 400X"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="damageType" className="mb-1 block font-semibold">Damage Type</Label>
            <Select value={damageType} onValueChange={setDamageType}>
              <SelectTrigger id="damageType">
                <SelectValue placeholder="Select damage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scratch">Scratch / Surface Damage</SelectItem>
                <SelectItem value="broken">Broken / Cracked</SelectItem>
                <SelectItem value="missing-parts">Missing Parts</SelectItem>
                <SelectItem value="not-working">Not Working / Malfunction</SelectItem>
                <SelectItem value="water-damage">Water Damage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="mb-1 block font-semibold">Description</Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the damage in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0"
              onClick={handleSubmit}
            >
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
