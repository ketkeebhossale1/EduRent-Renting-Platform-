import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { IndianRupee, Star } from "lucide-react";
import { motion } from "motion/react";

export interface RentalObject {
  id: string;
  name: string;
  category: "books" | "equipment" | "electronics" | "study-aids" | "lab-equipment";
  pricePerDay: number;
  image: string;
  condition: "excellent" | "good" | "fair";
  description: string;
  owner: {
    name: string;
    phone: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  available: boolean;
  depositAmount: number;
  rating: number;
}

interface ObjectCardProps {
  object: RentalObject;
  onViewDetails: (object: RentalObject) => void;
  index: number;
}

export function ObjectCard({ object, onViewDetails, index }: ObjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-300">
        <div className="relative group">
          <motion.img
            src={object.image}
            alt={object.name}
            className="w-full h-48 object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {!object.available && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm"
            >
              <Badge variant="destructive" className="text-lg">
                Not Available
              </Badge>
            </motion.div>
          )}
          <Badge className="absolute top-3 left-3 capitalize bg-gradient-to-r from-purple-500 to-pink-500 border-0">
            {object.category}
          </Badge>
          <div
            className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
              object.available ? "bg-green-500" : "bg-red-500"
            } animate-pulse`}
          />
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{object.name}</h3>
            <div className="flex items-center gap-2 justify-between">
              <Badge
                variant="outline"
                className={`text-xs capitalize ${
                  object.condition === "excellent"
                    ? "border-green-500 text-green-700"
                    : object.condition === "good"
                    ? "border-blue-500 text-blue-700"
                    : "border-orange-500 text-orange-700"
                }`}
              >
                {object.condition}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{object.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {object.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-1">
              <IndianRupee className="size-5 text-green-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {object.pricePerDay}
              </span>
              <span className="text-gray-600 text-sm">/day</span>
            </div>
            <Button
              onClick={() => onViewDetails(object)}
              disabled={!object.available}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}