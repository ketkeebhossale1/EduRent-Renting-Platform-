import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { RentalObject } from "./ObjectCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Phone, MapPin, Calendar, IndianRupee, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { api } from "../../lib/api";

interface ObjectDetailModalProps {
  object: RentalObject | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  onBookingComplete: (objectId: string) => void;
}

export function ObjectDetailModal({ object, isOpen, onClose, currentUser, onBookingComplete }: ObjectDetailModalProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [includeDeposit, setIncludeDeposit] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  if (!object) return null;

  const copyToClipboard = (text: string, type: "phone" | "address") => {
    navigator.clipboard.writeText(text);
    if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const totalAmount = includeDeposit ? object.pricePerDay + object.depositAmount : object.pricePerDay;

  // Generate payment UPI string
  const upiPaymentString = `upi://pay?pa=owner@upi&pn=${encodeURIComponent(
    object.owner.name
  )}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(
    `Rent for ${object.name}`
  )}`;

  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${object.owner.coordinates.lat},${object.owner.coordinates.lng}&zoom=15`;
  
  // For demo, using a static map image URL
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${object.owner.coordinates.lat},${object.owner.coordinates.lng}&zoom=15&size=600x300&markers=color:red%7C${object.owner.coordinates.lat},${object.owner.coordinates.lng}&key=YOUR_API_KEY`;

  const handleBooking = async () => {
    if (!currentUser) {
      toast.error("Please log in to book this object.");
      return;
    }
    if (!bookingDate || !returnDate) {
      toast.error("Please select both booking and return dates.");
      return;
    }

    const start = new Date(bookingDate);
    const end = new Date(returnDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (duration <= 0) {
      toast.error("Return date must be after booking date.");
      return;
    }

    const rentalAmount = object.pricePerDay * duration;
    const finalAmount = includeDeposit ? rentalAmount + object.depositAmount : rentalAmount;

    try {
      await api.createBooking({
        objectId: object.id,
        objectName: object.name,
        amount: finalAmount,
        duration,
        startDate: bookingDate,
        endDate: returnDate,
        depositAmount: object.depositAmount,
        includesDeposit: includeDeposit,
        pricePerDay: object.pricePerDay,
      });

      toast.success(`Booking confirmed! Total: ₹${finalAmount} for ${duration} day${duration > 1 ? "s" : ""}`);
      onBookingComplete(object.id);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{object.name}</DialogTitle>
          <DialogDescription>
            <Badge className="capitalize mt-2">{object.category}</Badge>
            <Badge variant="outline" className="ml-2 capitalize">
              {object.condition} Condition
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="rounded-lg overflow-hidden">
            <img
              src={object.image}
              alt={object.name}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{object.description}</p>
          </div>

          {/* Pricing */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rental Price</p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="size-6 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">
                    {object.pricePerDay}
                  </span>
                  <span className="text-gray-600">/day</span>
                </div>
              </div>
              <Calendar className="size-8 text-green-600" />
            </div>
          </div>

          <Separator />

          {/* Owner Information */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Owner Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Owner Name</p>
                  <p className="font-semibold">{object.owner.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="font-semibold text-lg">{object.owner.phone}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(object.owner.phone, "phone")}
                >
                  {copiedPhone ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-start justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-orange-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Pickup Address</p>
                    <p className="font-semibold">{object.owner.address}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(object.owner.address, "address")}
                >
                  {copiedAddress ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Pickup Location</h3>
            <div className="rounded-lg overflow-hidden border">
              {/* Using iframe for Google Maps - replace with actual API key */}
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${object.owner.coordinates.lat},${object.owner.coordinates.lng}&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Coordinates: {object.owner.coordinates.lat}, {object.owner.coordinates.lng}
            </div>
          </div>

          <Separator />

          {/* Payment QR Code */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Payment via UPI</h3>
            
            {/* Deposit Checkbox */}
            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="includeDeposit"
                  checked={includeDeposit}
                  onChange={(e) => setIncludeDeposit(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-purple-600 cursor-pointer"
                />
                <label htmlFor="includeDeposit" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-gray-900">Include Security Deposit</div>
                  <div className="text-sm text-gray-600 mt-1">
                    A refundable security deposit of ₹{object.depositAmount} is required for this item. 
                    Check this box to pay the deposit along with the rental fee.
                  </div>
                </label>
              </div>
              
              {/* Payment Breakdown */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Fee (per day):</span>
                  <span className="font-semibold">₹{object.pricePerDay}</span>
                </div>
                {includeDeposit && (
                  <div className="flex justify-between text-orange-700">
                    <span>Security Deposit:</span>
                    <span className="font-semibold">+ ₹{object.depositAmount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-yellow-300">
                  <span className="font-bold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-green-600 text-lg">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCodeSVG
                  value={upiPaymentString}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center md:text-left">
                <p className="font-semibold mb-2">Scan to Pay</p>
                <p className="text-sm text-gray-600 mb-3">
                  Scan this QR code with any UPI app to make the payment
                </p>
                <div className="bg-white px-4 py-3 rounded-lg border-2 border-purple-200">
                  <p className="text-xs text-gray-600">Total Payment Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalAmount}
                  </p>
                  {includeDeposit && (
                    <p className="text-xs text-orange-600 mt-1">
                      (Includes ₹{object.depositAmount} deposit)
                    </p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              * This is a demo QR code. In production, integrate with a real payment gateway.
            </p>
          </div>

          {/* Booking Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="bookingDate">Booking Date</Label>
              <Input
                type="date"
                id="bookingDate"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="returnDate">Return Date</Label>
              <Input
                type="date"
                id="returnDate"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1" size="lg">
              Contact Owner
            </Button>
            <Button variant="outline" className="flex-1" size="lg" onClick={handleBooking}>
              Request Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}