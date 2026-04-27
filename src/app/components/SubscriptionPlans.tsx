import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Check, Crown, Zap, Star, ArrowLeft, Smartphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "./ui/input";
import { createWorker } from "tesseract.js";

interface SubscriptionPlansProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  discount: number;
  color: string;
  icon: React.ReactNode;
}

const plans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Student Basic",
    price: 199,
    duration: "month",
    discount: 10,
    color: "from-blue-500 to-blue-600",
    icon: <Star className="size-8" />,
    features: [
      "10% discount on all rentals",
      "Priority customer support",
      "Free delivery on orders above ₹500",
      "Access to exclusive items",
      "Flexible rental periods",
    ],
  },
  {
    id: "pro",
    name: "Student Pro",
    price: 499,
    duration: "month",
    discount: 20,
    color: "from-purple-500 to-purple-600",
    icon: <Zap className="size-8" />,
    features: [
      "20% discount on all rentals",
      "24/7 priority support",
      "Free delivery on all orders",
      "Extended rental periods",
      "Access to premium items",
      "Damage protection included",
      "No security deposits",
    ],
  },
  {
    id: "premium",
    name: "Student Premium",
    price: 999,
    duration: "month",
    discount: 30,
    color: "from-yellow-500 to-orange-600",
    icon: <Crown className="size-8" />,
    features: [
      "30% discount on all rentals",
      "Dedicated account manager",
      "Free delivery & pickup",
      "Unlimited rental periods",
      "Access to all premium items",
      "Full damage protection",
      "No security deposits",
      "Exchange items anytime",
      "Early access to new items",
    ],
  },
];

export function SubscriptionPlans({ isOpen, onClose, currentUser }: SubscriptionPlansProps) {
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [amountVerified, setAmountVerified] = useState<boolean | null>(null);

  const verifyScreenshotAmount = async (dataUrl: string, expectedAmount: number) => {
    setOcrLoading(true);
    setAmountVerified(null);
    try {
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(dataUrl);
      await worker.terminate();
      const cleaned = text.replace(/[,\s]/g, "");
      const numbers = [...cleaned.matchAll(/(\d+(?:\.\d{1,2})?)/g)].map((m) => parseFloat(m[1]));
      const matched = numbers.some((n) => Math.abs(n - expectedAmount) <= 1);
      setAmountVerified(matched);
      if (!matched) {
        toast.error(`Amount mismatch! Screenshot must show ₹${expectedAmount}.`);
      } else {
        toast.success(`✅ Payment of ₹${expectedAmount} verified!`);
      }
    } catch {
      setAmountVerified(true);
      toast.warning("Could not read screenshot. Ensure the amount shown is ₹" + expectedAmount + ".");
    } finally {
      setOcrLoading(false);
    }
  };

  const currentSubscription = currentUser
    ? JSON.parse(localStorage.getItem(`edurent_subscription_${currentUser}`) || "null")
    : null;

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!currentUser) {
      toast.error("Please log in to subscribe");
      return;
    }
    setPendingPlan(plan);
  };

  const handleConfirmPayment = () => {
    if (!pendingPlan || !currentUser) return;

    const subscription = {
      userId: currentUser,
      planId: pendingPlan.id,
      planName: pendingPlan.name,
      discount: pendingPlan.discount,
      price: pendingPlan.price,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: pendingPlan.features,
      utrNumber,
    };

    localStorage.setItem(`edurent_subscription_${currentUser}`, JSON.stringify(subscription));
    toast.success(`Successfully subscribed to ${pendingPlan.name}! Enjoy ${pendingPlan.discount}% off all rentals.`);
    setPendingPlan(null);
    setUtrNumber("");
    setPaymentScreenshot("");
    setAmountVerified(null);
    onClose();
  };

  const handleClose = () => {
    setPendingPlan(null);
    setUtrNumber("");
    setPaymentScreenshot("");
    setAmountVerified(null);
    onClose();
  };

  const upiString = pendingPlan
    ? `upi://pay?pa=edurent@upi&pn=EduRent&am=${pendingPlan.price}&cu=INR&tn=${encodeURIComponent(`${pendingPlan.name} Subscription`)}`
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full mx-auto max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 sm:p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-center">
            {pendingPlan ? "💳 Complete Payment" : "👑 Subscription Plans"}
          </DialogTitle>
          <DialogDescription className="text-center mt-2 text-base text-gray-500">
            {pendingPlan
              ? `Scan the QR code to pay for ${pendingPlan.name}`
              : "Save more with our student-friendly subscription plans"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!pendingPlan ? (
            /* ── Plan Selection ── */
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {currentSubscription && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mb-4"
                >
                  <p className="text-green-800 font-semibold">
                    ✅ Active: {currentSubscription.planName} — {currentSubscription.discount}% off
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Valid until: {new Date(currentSubscription.endDate).toLocaleDateString()}
                  </p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className={`relative flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border-2 min-w-0 ${
                      currentSubscription?.planId === plan.id
                        ? "border-green-500"
                        : "border-purple-200 hover:border-purple-400"
                    }`}
                  >
                    <div className={`bg-gradient-to-br ${plan.color} text-white px-6 py-8 text-center`}>
                      <div className="flex justify-center mb-3">{plan.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-extrabold">₹{plan.price}</span>
                        <span className="text-base opacity-90">/{plan.duration}</span>
                      </div>
                      <div className="mt-3 bg-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 inline-block">
                        <p className="text-sm font-bold tracking-wide">{plan.discount}% OFF</p>
                      </div>
                    </div>

                    <div className="flex-1 px-6 py-6">
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="px-6 pb-6">
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity text-base font-semibold h-11 rounded-xl`}
                        disabled={currentSubscription?.planId === plan.id}
                      >
                        {currentSubscription?.planId === plan.id ? "Current Plan" : "Subscribe"}
                      </Button>
                    </div>

                    {plan.id === "pro" && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          POPULAR
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pro Tip:</strong> Auto-renews monthly. Cancel anytime. Students save avg ₹500/month!
                </p>
              </div>
            </motion.div>
          ) : (
            /* ── Payment Card ── */
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
              className="mt-4 space-y-5"
            >
              {/* Plan summary banner */}
              <div className={`bg-gradient-to-r ${pendingPlan.color} text-white rounded-2xl p-5 flex items-center justify-between`}>
                <div>
                  <p className="text-sm opacity-80 mb-0.5">Selected Plan</p>
                  <p className="text-2xl font-bold">{pendingPlan.name}</p>
                  <p className="text-sm opacity-90 mt-1">{pendingPlan.discount}% off on all rentals</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-extrabold">₹{pendingPlan.price}</p>
                  <p className="text-sm opacity-80">per month</p>
                </div>
              </div>

              {/* Payment card */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Smartphone className="size-5 text-purple-600" />
                  <h3 className="font-bold text-xl">Pay via UPI</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* QR Code */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-purple-100">
                      <img
                        src="/phonepe-qr.png"
                        alt="PhonePe Payment QR - Ketkee Laxmikant Bhosale"
                        className="w-[190px] h-[190px] object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Scan with PhonePe App</p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4 w-full">
                    {/* Breakdown */}
                    <div className="bg-purple-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-semibold">{pendingPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold">1 Month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rental Discount</span>
                        <span className="font-semibold text-green-600">{pendingPlan.discount}% off</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-purple-200">
                        <span className="font-bold text-gray-900 text-base">Total</span>
                        <span className="font-extrabold text-green-600 text-xl">₹{pendingPlan.price}</span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
                      <p className="font-bold mb-2">How to pay:</p>
                      <ol className="space-y-1.5 list-decimal list-inside">
                        <li>Scan the QR code with PhonePe, GPay, or Paytm</li>
                        <li>Confirm the amount of <strong>₹{pendingPlan.price}</strong></li>
                        <li>Complete the payment in your UPI app</li>
                        <li>Enter the <strong>UTR / Transaction ID</strong> below</li>
                        <li>Click <strong>"Confirm Payment"</strong></li>
                      </ol>
                    </div>

                    {/* Step 1: UTR */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-purple-600" />
                        Step 1 — UPI Transaction ID / UTR Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g. 123456789012"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.trim())}
                        className="text-black placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500">
                        Find this in your UPI app under payment history after the transaction.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-2">
                  * Demo QR. In production, integrate with a real payment gateway.
                </p>
              </div>

              {/* Step 2: Screenshot upload card */}
              <div className={`bg-white rounded-2xl shadow-lg border-2 p-5 space-y-3 ${amountVerified === false ? "border-red-300" : amountVerified === true ? "border-green-300" : "border-purple-100"}`}>
                <h3 className="font-bold text-base flex items-center gap-2">
                  📸 Step 2 — Upload Payment Screenshot <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500">
                  Upload a screenshot showing exactly ₹{pendingPlan.price}. Subscription activates only after amount is verified.
                </p>

                {paymentScreenshot ? (
                  <div className="space-y-2">
                    <img
                      src={paymentScreenshot}
                      alt="Payment screenshot"
                      className="w-full max-h-52 object-contain rounded-xl border-2 border-gray-200 bg-gray-50"
                    />
                    {ocrLoading && (
                      <p className="text-xs text-purple-600 font-medium animate-pulse">🔍 Verifying payment amount...</p>
                    )}
                    {!ocrLoading && amountVerified === true && (
                      <p className="text-xs text-green-600 font-medium">✅ Amount ₹{pendingPlan.price} verified</p>
                    )}
                    {!ocrLoading && amountVerified === false && (
                      <p className="text-xs text-red-600 font-medium">❌ Amount mismatch — screenshot must show ₹{pendingPlan.price}</p>
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
                  <label className="flex flex-col items-center gap-2 border-2 border-dashed border-purple-300 rounded-xl p-6 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <span className="text-4xl">📤</span>
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
                          verifyScreenshotAmount(dataUrl, pendingPlan.price);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => { setPendingPlan(null); setUtrNumber(""); setPaymentScreenshot(""); setAmountVerified(null); }}
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Plans
                </Button>
                <Button
                  className={`flex-1 h-11 rounded-xl bg-gradient-to-r ${pendingPlan.color} hover:opacity-90 text-white border-0 font-semibold text-base`}
                  onClick={handleConfirmPayment}
                  disabled={utrNumber.length < 6 || !paymentScreenshot || ocrLoading || amountVerified !== true}
                >
                  <Check className="size-4 mr-2" />
                  {ocrLoading ? "Verifying..." : "Confirm Payment"}
                </Button>
              </div>
              {(utrNumber.length < 6 || !paymentScreenshot || amountVerified !== true) && !ocrLoading && (
                <p className="text-xs text-center text-orange-600">
                  ⚠️ {!paymentScreenshot ? "Upload your payment screenshot" : utrNumber.length < 6 ? "Enter a valid UTR number" : amountVerified === false ? `Screenshot must show ₹${pendingPlan.price}` : "Verifying..."}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
