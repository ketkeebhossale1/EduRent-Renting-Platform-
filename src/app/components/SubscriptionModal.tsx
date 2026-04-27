import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Check, Crown, Zap, Star } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!currentUser) {
      toast.error("Please log in to subscribe");
      return;
    }

    // Save subscription to localStorage
    const subscription = {
      userId: currentUser,
      planId: plan.id,
      planName: plan.name,
      discount: plan.discount,
      price: plan.price,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      features: plan.features,
    };

    localStorage.setItem(`edurent_subscription_${currentUser}`, JSON.stringify(subscription));
    toast.success(`Successfully subscribed to ${plan.name}! Enjoy ${plan.discount}% off all rentals.`);
    onClose();
  };

  const currentSubscription = currentUser
    ? JSON.parse(localStorage.getItem(`edurent_subscription_${currentUser}`) || "null")
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-center">
            📚 Subscription Plans
          </DialogTitle>
          <DialogDescription className="text-center mt-2 text-sm">
            Save more with our student-friendly subscription plans
          </DialogDescription>
        </DialogHeader>

        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border-2 border-green-300 rounded-lg p-3 mb-3"
          >
            <p className="text-green-800 font-semibold text-sm">
              ✅ Active: {currentSubscription.planName} - {currentSubscription.discount}% off
            </p>
            <p className="text-xs text-green-700 mt-1">
              Valid until: {new Date(currentSubscription.endDate).toLocaleDateString()}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
                currentSubscription?.planId === plan.id
                  ? "border-green-500"
                  : "border-purple-200 hover:border-purple-400"
              }`}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${plan.color} text-white p-4 text-center`}>
                <div className="flex justify-center mb-2">
                  <div className="scale-75">{plan.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-sm opacity-90">/{plan.duration}</span>
                </div>
                <div className="mt-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-block">
                  <p className="text-xs font-semibold">{plan.discount}% OFF</p>
                </div>
              </div>

              {/* Features */}
              <div className="p-4">
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="size-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity text-sm py-2`}
                  disabled={currentSubscription?.planId === plan.id}
                >
                  {currentSubscription?.planId === plan.id ? "Current Plan" : "Subscribe"}
                </Button>
              </div>

              {plan.id === "pro" && (
                <div className="absolute top-3 right-3">
                  <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    POPULAR
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>💡 Pro Tip:</strong> Auto-renews monthly. Cancel anytime. Students save avg ₹500/month!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
