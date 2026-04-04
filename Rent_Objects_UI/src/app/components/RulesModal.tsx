import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const rules = [
    {
      title: "Rental Agreement",
      points: [
        "A valid ID proof (Aadhar, Passport, or Driver's License) is mandatory",
        "Security deposit may be required based on the object value",
        "Rental period starts from the pickup time and date",
        "Late returns will incur additional charges at 10% of daily rate per hour",
      ],
    },
    {
      title: "Payment Terms",
      points: [
        "Full payment must be made via UPI before pickup",
        "Scan the QR code provided in the object details page",
        "Refunds are processed within 5-7 business days",
        "No cancellation charges if cancelled 24 hours before pickup",
        "50% cancellation fee applies if cancelled within 24 hours",
      ],
    },
    {
      title: "Object Condition",
      points: [
        "Inspect the object thoroughly before accepting",
        "Report any damages or defects to the owner immediately",
        "You are responsible for the object during the rental period",
        "Any damages beyond normal wear and tear will be charged",
        "Return the object in the same condition as received",
      ],
    },
    {
      title: "Usage Guidelines",
      points: [
        "Use objects only for their intended purpose",
        "Follow all safety instructions provided by the owner",
        "Do not sublease or lend the rented object to others",
        "Maintain cleanliness and hygiene of the object",
        "Store the object properly when not in use",
      ],
    },
    {
      title: "Liability & Insurance",
      points: [
        "Rentify is a platform connecting owners and renters",
        "Owners are responsible for object maintenance and safety",
        "Renters are liable for loss or damage during rental period",
        "Insurance coverage is recommended for high-value items",
        "Disputes should be resolved between owner and renter first",
      ],
    },
    {
      title: "Pickup & Return",
      points: [
        "Pickup and return at the address specified by owner",
        "Owner may charge delivery fees for home delivery",
        "Verify object condition with owner during pickup and return",
        "Take photos/videos as proof of condition",
        "Coordinate timings with owner in advance",
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Rental Rules & Regulations
          </DialogTitle>
          <DialogDescription>
            Please read and understand these rules before proceeding with your rental.
            By renting through Rentify, you agree to comply with these terms and conditions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {rules.map((section, index) => (
              <div
                key={index}
                className="border-l-4 border-purple-500 pl-4 py-2"
              >
                <h3 className="font-semibold text-lg mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <h4 className="font-semibold mb-2">Contact Support</h4>
              <p className="text-sm text-gray-700">
                For any queries or disputes, contact us at{" "}
                <span className="text-purple-600 font-semibold">support@rentify.com</span> or
                call <span className="text-purple-600 font-semibold">1800-123-4567</span>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}