import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

interface AddObjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (object: any) => void;
}

export function AddObjectForm({ isOpen, onClose, onAdd }: AddObjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "appliance",
    pricePerDay: "",
    condition: "good",
    description: "",
    ownerName: "",
    ownerPhone: "",
    ownerAddress: "",
    latitude: "",
    longitude: "",
    imageUrl: "",
    depositAmount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newObject = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category as any,
      pricePerDay: parseInt(formData.pricePerDay),
      condition: formData.condition as any,
      description: formData.description,
      image: formData.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      owner: {
        name: formData.ownerName,
        phone: formData.ownerPhone,
        address: formData.ownerAddress,
        coordinates: {
          lat: parseFloat(formData.latitude) || 28.6139,
          lng: parseFloat(formData.longitude) || 77.2090,
        },
      },
      available: true,
      depositAmount: parseInt(formData.depositAmount) || 500,
    };

    onAdd(newObject);
    toast.success("Object added successfully!");
    onClose();
    
    // Reset form
    setFormData({
      name: "",
      category: "appliance",
      pricePerDay: "",
      condition: "good",
      description: "",
      ownerName: "",
      ownerPhone: "",
      ownerAddress: "",
      latitude: "",
      longitude: "",
      imageUrl: "",
      depositAmount: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add New Rental Object
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to list your object for rent. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Object Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Object Details</h3>
            
            <div>
              <Label htmlFor="name">Object Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Samsung Washing Machine"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appliance">Appliance</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="garden">Garden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="price">Price per Day (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                required
                placeholder="150"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the object, its features, and condition..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="depositAmount">Security Deposit Amount (₹) *</Label>
              <Input
                id="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                required
                placeholder="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Refundable security deposit. Suggested: ₹300-500 (low value), ₹500-1000 (medium), ₹1000+ (high value items)
              </p>
            </div>
          </div>

          {/* Owner Details */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Owner Details</h3>
            
            <div>
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="ownerPhone">Contact Number *</Label>
              <Input
                id="ownerPhone"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                required
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <Label htmlFor="ownerAddress">Pickup Address *</Label>
              <Textarea
                id="ownerAddress"
                value={formData.ownerAddress}
                onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
                required
                placeholder="123 Street Name, City, State, PIN"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="28.6139"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="77.2090"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="size-4 mr-2" />
              Add Object
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}