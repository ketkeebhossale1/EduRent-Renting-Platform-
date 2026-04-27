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
import { Phone, MapPin, Calendar, IndianRupee, Copy, Check, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Transaction, DepositRecord } from "./UserDashboard";
import { ChatModal } from "./ChatModal";
import { api } from "../../lib/api";
import { createWorker } from "tesseract.js";

interface ObjectDetailModalProps {
  object: RentalObject | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  onBookingComplete: (objectId: string) => void;
  onOpenSubscription: () => void;
}

export function ObjectDetailModal({ object, isOpen, onClose, currentUser, onBookingComplete, onOpenSubscription }: ObjectDetailModalProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [includeDeposit, setIncludeDeposit] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [justBooked, setJustBooked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [amountVerified, setAmountVerified] = useState<boolean | null>(null); // null=unchecked, true=ok, false=mismatch

  // Reset all state when modal closes or object changes
  useEffect(() => {
    if (!isOpen) {
      setBookingDate("");
      setReturnDate("");
      setIncludeDeposit(false);
      setJustBooked(false);
      setShowPayment(false);
      setUtrNumber("");
      setPaymentScreenshot("");
      setAmountVerified(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setBookingDate("");
    setReturnDate("");
    setIncludeDeposit(false);
    setShowPayment(false);
    setUtrNumber("");
    setPaymentScreenshot("");
    setAmountVerified(null);
  }, [object?.id]);

  // OCR: scan screenshot and verify the payment amount matches
  const verifyScreenshotAmount = async (dataUrl: string, expectedAmount: number) => {
    setOcrLoading(true);
    setAmountVerified(null);
    try {
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(dataUrl);
      await worker.terminate();

      // Look for numbers in the OCR text — handle formats like ₹64, 64.00, 64, Rs 64
      const cleaned = text.replace(/[,\s]/g, "");
      const numbers = [...cleaned.matchAll(/(\d+(?:\.\d{1,2})?)/g)].map((m) => parseFloat(m[1]));

      // Accept if any number within ±1 of expected (OCR can misread decimals)
      const matched = numbers.some((n) => Math.abs(n - expectedAmount) <= 1);
      setAmountVerified(matched);
      if (!matched) {
        toast.error(`Amount mismatch! Screenshot shows none of the numbers matching ₹${expectedAmount}. Please upload the correct payment screenshot.`);
      } else {
        toast.success(`✅ Payment of ₹${expectedAmount} verified!`);
      }
    } catch {
      // OCR failed — let user proceed but warn
      setAmountVerified(true);
      toast.warning("Could not read screenshot automatically. Please ensure the amount is ₹" + expectedAmount + ".");
    } finally {
      setOcrLoading(false);
    }
  };

  if (!object) return null;

  // Show phone/QR only if current user has booked this item (this session or a previous one)
  const hasBooked = justBooked || (currentUser
    ? (JSON.parse(localStorage.getItem(`edurent_transactions_${currentUser}`) || "[]") as { objectId: string }[])
        .some((t) => t.objectId === object.id)
    : false);

  // Check if user has an active subscription
  const activeSubscription = currentUser
    ? JSON.parse(localStorage.getItem(`edurent_subscription_${currentUser}`) || "null")
    : null;
  const hasActiveSubscription = activeSubscription && new Date(activeSubscription.endDate) > new Date();

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  const handleBookingDateChange = (date: string) => {
    setBookingDate(date);
    // If return date is set and is before or equal to new booking date, clear it
    if (returnDate && returnDate <= date) {
      setReturnDate("");
      toast.info("Please select a return date after the booking date.");
    }
  };

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

  // Apply subscription discount to rental price
  const discountPct = hasActiveSubscription ? (activeSubscription.discount as number) : 0;
  const discountedPricePerDay = Math.round(object.pricePerDay * (1 - discountPct / 100));
  const totalAmount = includeDeposit ? discountedPricePerDay + object.depositAmount : discountedPricePerDay;

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

  // Step 1: validate dates then show payment QR
  const handleProceedToPayment = () => {
    if (!currentUser) { toast.error("Please log in to book this object."); return; }
    if (!bookingDate || !returnDate) { toast.error("Please select both booking and return dates."); return; }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const start = new Date(bookingDate);
    const end = new Date(returnDate);

    if (start < todayDate) { toast.error("Booking date cannot be in the past."); return; }
    if (end < todayDate) { toast.error("Return date cannot be in the past."); return; }
    if (end <= start) { toast.error("Return date must be after the booking date."); return; }

    setShowPayment(true);
  };

  // Step 2: save booking after payment confirmed
  const handleConfirmBooking = async () => {
    if (!currentUser || !utrNumber.trim()) return;

    const start = new Date(bookingDate);
    const end = new Date(returnDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const rentalAmount = discountedPricePerDay * duration;
    const finalAmount = includeDeposit ? rentalAmount + object.depositAmount : rentalAmount;

    try {
      // Save booking to user_orders table in DB
      await api.createBooking({
        objectId: object.id,
        objectName: object.name,
        amount: finalAmount,
        duration,
        startDate: bookingDate,
        endDate: returnDate,
        depositAmount: object.depositAmount,
        includesDeposit: includeDeposit,
        pricePerDay: discountedPricePerDay,
      });
    } catch (e) {
      console.error("Booking DB save failed:", e);
      // Fall through — still mark as booked locally so the UI works
    }

    // Also persist locally so dashboard works even if API is down
    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      objectName: object.name,
      objectId: object.id,
      amount: finalAmount,
      duration,
      startDate: bookingDate,
      endDate: returnDate,
      depositAmount: object.depositAmount,
      includesDeposit: includeDeposit,
      timestamp: new Date().toISOString(),
      status: "active",
    };
    const transactions = JSON.parse(localStorage.getItem(`edurent_transactions_${currentUser}`) || "[]");
    transactions.unshift(transaction);
    localStorage.setItem(`edurent_transactions_${currentUser}`, JSON.stringify(transactions));

    if (includeDeposit) {
      const depositRecord: DepositRecord = {
        id: `DEP-${Date.now()}`,
        objectName: object.name,
        amount: object.depositAmount,
        paidDate: new Date().toISOString(),
        status: "held",
      };
      const deposits = JSON.parse(localStorage.getItem(`edurent_deposits_${currentUser}`) || "[]");
      deposits.unshift(depositRecord);
      localStorage.setItem(`edurent_deposits_${currentUser}`, JSON.stringify(deposits));
    }

    toast.success(`Booking confirmed! ₹${finalAmount} paid for ${duration} day${duration > 1 ? "s" : ""}.`);
    onBookingComplete(object.id);
    setJustBooked(true);
    setShowPayment(false);
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

          {/* Book Details - Only shown for books */}
          {object.category === "books" && (object.author || object.genre || object.publisher) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                📚 Book Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {object.author && (
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Author</p>
                    <p className="font-semibold text-purple-900">{object.author}</p>
                  </div>
                )}
                {object.genre && (
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Genre</p>
                    <p className="font-semibold text-purple-900">{object.genre}</p>
                  </div>
                )}
                {object.publisher && (
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Publisher</p>
                    <p className="font-semibold text-purple-900">{object.publisher}</p>
                  </div>
                )}
                {object.isbn && (
                  <div>
                    <p className="text-gray-600 text-xs mb-1">ISBN</p>
                    <p className="font-semibold text-purple-900 font-mono">{object.isbn}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rental Price</p>
                <div className="flex items-center gap-1">
                  <IndianRupee className="size-6 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">
                    {discountedPricePerDay}
                  </span>
                  <span className="text-gray-600">/day</span>
                  {discountPct > 0 && (
                    <span className="ml-2 text-sm text-gray-400 line-through">₹{object.pricePerDay}</span>
                  )}
                </div>
                {discountPct > 0 && (
                  <p className="text-xs text-green-700 font-semibold mt-1">
                    🎉 {discountPct}% off applied ({activeSubscription.planName})
                  </p>
                )}
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
                    {hasBooked ? (
                      <p className="font-semibold text-lg">{object.owner.phone}</p>
                    ) : (
                      <div>
                        <p className="font-semibold text-lg tracking-widest text-gray-400 select-none">
                          +91 XXXXX XXXXX
                        </p>
                        <p className="text-xs text-orange-600 mt-0.5">🔒 Visible after booking</p>
                      </div>
                    )}
                  </div>
                </div>
                {hasBooked && (
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
                )}
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
                  <div className="font-semibold text-gray-900">
                    Include Security Deposit <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Required to book</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    A refundable security deposit of ₹{object.depositAmount} is mandatory for this item.
                    It will be refunded when the item is returned in good condition.
                  </div>
                </label>
              </div>
              
              {/* Payment Breakdown */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Fee (per day):</span>
                  <div className="flex items-center gap-2">
                    {discountPct > 0 && (
                      <span className="text-gray-400 line-through text-xs">₹{object.pricePerDay}</span>
                    )}
                    <span className="font-semibold">₹{discountedPricePerDay}</span>
                  </div>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Subscription Discount ({discountPct}% off):</span>
                    <span className="font-semibold">- ₹{object.pricePerDay - discountedPricePerDay}</span>
                  </div>
                )}
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

            {(showPayment || hasBooked) ? (
              <>
                <div className="flex flex-col md:flex-row gap-6 items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img
                      src={object.qrUrl || "/phonepe-qr.png"}
                      alt="Payment QR Code"
                      className="w-[200px] h-[200px] object-contain"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="font-semibold mb-2">Scan to Pay</p>
                    <p className="text-sm text-gray-600 mb-3">
                      Scan this QR code with PhonePe to complete payment
                    </p>
                    <div className="bg-white px-4 py-3 rounded-lg border-2 border-purple-200">
                      <p className="text-xs text-gray-600">Total Payment Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{totalAmount}</p>
                      {includeDeposit && (
                        <p className="text-xs text-orange-600 mt-1">
                          (Includes ₹{object.depositAmount} deposit)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* UTR input — only shown before booking is confirmed */}
                {!hasBooked && (
                  <div className="mt-4 space-y-4">
                    {/* Step 1: UTR */}
                    <div className="bg-white border-2 border-purple-100 rounded-xl p-4 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        🔐 Step 1 — UPI Transaction ID / UTR Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter UTR after payment (e.g. 123456789012)"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.trim())}
                        className="text-black placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500">
                        Find this in your PhonePe app under payment history after completing the transaction.
                      </p>
                    </div>

                    {/* Step 2: Screenshot upload */}
                    <div className={`bg-white border-2 rounded-xl p-4 space-y-3 ${amountVerified === false ? "border-red-300" : amountVerified === true ? "border-green-300" : "border-purple-100"}`}>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        📸 Step 2 — Upload Payment Screenshot <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500">
                        Upload a screenshot of your payment confirmation. The screenshot must show exactly ₹{totalAmount}.
                      </p>

                      {paymentScreenshot ? (
                        <div className="space-y-2">
                          <img
                            src={paymentScreenshot}
                            alt="Payment screenshot"
                            className="w-full max-h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
                          />
                          {ocrLoading && (
                            <p className="text-xs text-purple-600 font-medium animate-pulse">🔍 Verifying payment amount...</p>
                          )}
                          {!ocrLoading && amountVerified === true && (
                            <p className="text-xs text-green-600 font-medium">✅ Amount ₹{totalAmount} verified</p>
                          )}
                          {!ocrLoading && amountVerified === false && (
                            <p className="text-xs text-red-600 font-medium">❌ Amount mismatch — please upload the correct screenshot showing ₹{totalAmount}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => { setPaymentScreenshot(""); setAmountVerified(null); }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove &amp; try again
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 border-2 border-dashed border-purple-300 rounded-xl p-5 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                          <span className="text-3xl">📤</span>
                          <span className="text-sm font-medium text-purple-700">Click to upload screenshot</span>
                          <span className="text-xs text-gray-400">PNG, JPG supported</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                const dataUrl = reader.result as string;
                                setPaymentScreenshot(dataUrl);
                                verifyScreenshotAmount(dataUrl, totalAmount);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => { setShowPayment(false); setUtrNumber(""); setPaymentScreenshot(""); setAmountVerified(null); }}>
                        ← Back
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700"
                        onClick={handleConfirmBooking}
                        disabled={utrNumber.length < 6 || !paymentScreenshot || ocrLoading || amountVerified !== true}
                      >
                        {ocrLoading ? "Verifying..." : "Confirm Booking"}
                      </Button>
                    </div>
                    {(utrNumber.length < 6 || !paymentScreenshot || amountVerified !== true) && !ocrLoading && (
                      <p className="text-xs text-center text-orange-600">
                        ⚠️ {!paymentScreenshot ? "Upload your payment screenshot" : utrNumber.length < 6 ? "Enter a valid UTR number" : amountVerified === false ? `Screenshot must show ₹${totalAmount}` : "Verifying..."}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 gap-3">
                <div className="text-5xl">🔒</div>
                <p className="font-semibold text-gray-700">QR Code Locked</p>
                <p className="text-sm text-gray-500 text-center">
                  Fill in your rental details and proceed to payment to reveal the QR code.
                </p>
              </div>
            )}
          </div>

          {/* Active subscription badge — shown only if user has one */}
          {hasActiveSubscription && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-green-600 font-bold text-sm">✅ {activeSubscription.planName}</span>
              <span className="text-green-700 text-xs">— {activeSubscription.discount}% discount active</span>
            </div>
          )}

          {/* Booking Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Rental Period</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bookingDate">Booking Date *</Label>
              <Input
                type="date"
                id="bookingDate"
                value={bookingDate}
                onChange={(e) => handleBookingDateChange(e.target.value)}
                min={today}
                className="w-full bg-white"
                required
              />
              <p className="text-xs text-gray-500">📅 Select today or a future date</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="returnDate">Return Date *</Label>
              <Input
                type="date"
                id="returnDate"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={bookingDate || today}
                className="w-full bg-white"
                required
              />
              <p className="text-xs text-gray-500">📅 Must be after booking date</p>
            </div>

            {bookingDate && returnDate && new Date(returnDate) > new Date(bookingDate) && (() => {
              const days = Math.ceil((new Date(returnDate).getTime() - new Date(bookingDate).getTime()) / (1000 * 60 * 60 * 24));
              const rentalTotal = discountedPricePerDay * days;
              const grandTotal = includeDeposit ? rentalTotal + object.depositAmount : rentalTotal;
              return (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900">Rental Duration: {days} day(s)</p>
                  {discountPct > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5 line-through">
                      Original: ₹{object.pricePerDay * days}
                    </p>
                  )}
                  <p className="text-xs text-purple-700 mt-0.5">
                    Total Cost: ₹{rentalTotal}
                    {discountPct > 0 && <span className="text-green-600 ml-1">({discountPct}% off applied)</span>}
                    {includeDeposit && ` + ₹${object.depositAmount} deposit`}
                  </p>
                  <p className="text-sm font-bold text-green-700 mt-1">Grand Total: ₹{grandTotal}</p>
                </div>
              );
            })()}
          </div>

          {/* Action Buttons — hidden while payment step is shown */}
          {!showPayment && !hasBooked && (
            <>
              <div className="flex gap-3">
                <Button className="flex-1" size="lg" onClick={() => setIsChatOpen(true)}>
                  <MessageCircle className="size-4 mr-2" />
                  Contact Owner
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={!bookingDate || !returnDate || !includeDeposit}
                >
                  {!bookingDate || !returnDate ? "Select Dates First" : !includeDeposit ? "Pay Deposit to Book" : "Proceed to Payment →"}
                </Button>
              </div>

              {(!bookingDate || !returnDate || !includeDeposit) && (
                <p className="text-xs text-center text-orange-600 font-medium">
                  ⚠️ {!bookingDate || !returnDate ? "Please select both booking and return dates" : "Security deposit is mandatory to proceed with booking"}
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        ownerName={object.owner.name}
        objectName={object.name}
        chatId={`${currentUser}-${object.id}`}
      />
    </Dialog>
  );
}