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
import { Plus, Upload, QrCode, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

interface AddObjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (object: any) => void;
}

export function AddObjectForm({ isOpen, onClose, onAdd }: AddObjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "books",
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
    author: "",
    genre: "",
    publisher: "",
    isbn: "",
  });
  const [qrPreview, setQrPreview] = useState<string>("");
  const qrInputRef = useRef<HTMLInputElement>(null);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQrPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate QR code upload
    if (!qrPreview) {
      toast.error("Payment QR code is required! Please upload your UPI QR code.");
      return;
    }

    // Validate book-specific fields
    if (formData.category === "books") {
      if (!formData.author || !formData.genre || !formData.publisher) {
        toast.error("For books, Author, Genre, and Publisher are mandatory fields!");
        return;
      }
      if (!formData.description) {
        toast.error("Book description is required!");
        return;
      }
    }

    const newObject: any = {
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
      depositAmount: parseInt(formData.depositAmount) || 100,
      rating: 4.5,
      qrUrl: qrPreview,
    };

    // Add book-specific fields
    if (formData.category === "books") {
      newObject.author = formData.author;
      newObject.genre = formData.genre;
      newObject.publisher = formData.publisher;
      if (formData.isbn) {
        newObject.isbn = formData.isbn;
      }
    }

    onAdd(newObject);

    // Reset form
    setFormData({
      name: "",
      category: "books",
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
      author: "",
      genre: "",
      publisher: "",
      isbn: "",
    });
    setQrPreview("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add New Educational Item
          </DialogTitle>
          <DialogDescription>
            List your educational item for rent. For books, author, genre, and publisher are mandatory. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Object Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Item Details</h3>

            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., NCERT Physics Textbook Class 12"
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
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="study-aids">Study Aids</SelectItem>
                    <SelectItem value="lab-equipment">Lab Equipment</SelectItem>
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
                placeholder="15"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the educational item, its features, edition, and condition..."
                rows={3}
              />
            </div>

            {formData.category === "books" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                      placeholder="e.g., J.K. Rowling"
                      className="bg-yellow-50 border-yellow-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Genre *</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      required
                      placeholder="e.g., Science, Fiction, Academic"
                      className="bg-yellow-50 border-yellow-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publisher">Publisher *</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      required
                      placeholder="e.g., NCERT, Penguin Books"
                      className="bg-yellow-50 border-yellow-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="isbn">ISBN (Optional)</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="e.g., 978-3-16-148410-0"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    📚 <strong>Book Listing:</strong> Author, Genre, and Publisher are mandatory fields for book listings. Make sure to provide accurate information.
                  </p>
                </div>
              </>
            )}

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
                placeholder="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Refundable security deposit. Suggested: ₹50-150 (books), ₹150-300 (equipment), ₹300+ (electronics)
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

          {/* Payment QR Code */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <QrCode className="size-5 text-purple-600" />
              Payment QR Code <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-500">
              Upload your UPI payment QR code. Renters will scan this to pay you directly.
            </p>

            {qrPreview ? (
              <div className="relative inline-block">
                <img
                  src={qrPreview}
                  alt="Payment QR preview"
                  className="w-40 h-40 object-contain border-2 border-purple-300 rounded-xl bg-white p-2"
                />
                <button
                  type="button"
                  onClick={() => { setQrPreview(""); if (qrInputRef.current) qrInputRef.current.value = ""; }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X className="size-3.5" />
                </button>
                <p className="text-xs text-green-600 mt-1 font-medium">✅ QR code uploaded</p>
              </div>
            ) : (
              <div
                onClick={() => qrInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Upload className="size-8 text-purple-400" />
                <p className="text-sm font-medium text-purple-700">Click to upload QR code</p>
                <p className="text-xs text-gray-400">PNG, JPG supported</p>
              </div>
            )}

            <input
              ref={qrInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQrUpload}
            />
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
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}