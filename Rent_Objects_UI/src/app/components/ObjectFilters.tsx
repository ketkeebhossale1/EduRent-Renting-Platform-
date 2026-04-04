import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { useState } from "react";
import { Star } from "lucide-react";

interface ObjectFiltersProps {
  onFilterChange: (filters: ObjectFilterState) => void;
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

export interface ObjectFilterState {
  category: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
}

const categories = [
  { value: "all", label: "All Items", icon: "📚" },
  { value: "books", label: "Books", icon: "📖" },
  { value: "equipment", label: "Equipment", icon: "🔬" },
  { value: "electronics", label: "Electronics", icon: "💻" },
  { value: "study-aids", label: "Study Aids", icon: "✏️" },
  { value: "lab-equipment", label: "Lab Equipment", icon: "🧪" },
];

export function ObjectFilters({ onFilterChange, onCategorySelect, selectedCategory }: ObjectFiltersProps) {
  const [condition, setCondition] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("0");

  const updateFilters = (
    newCondition: string,
    newMinPrice: string,
    newMaxPrice: string,
    newRating: string
  ) => {
    onFilterChange({
      category: selectedCategory,
      condition: newCondition,
      minPrice: newMinPrice ? parseFloat(newMinPrice) : 0,
      maxPrice: newMaxPrice ? parseFloat(newMaxPrice) : Infinity,
      rating: parseFloat(newRating),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6 space-y-4"
    >
      {/* Category Badges */}
      <Card className="border-2 border-purple-100">
        <CardContent className="p-4">
          <Label className="mb-3 block text-lg font-semibold">Categories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                    selectedCategory === cat.value
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-lg"
                      : "hover:bg-purple-50 hover:border-purple-300"
                  }`}
                  onClick={() => onCategorySelect(cat.value)}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Filters */}
      <Card className="border-2 border-purple-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="condition" className="mb-2 block font-semibold">
                Condition
              </Label>
              <Select
                value={condition}
                onValueChange={(value) => {
                  setCondition(value);
                  updateFilters(value, minPrice, maxPrice, rating);
                }}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Any condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Condition</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="minPrice" className="mb-2 block font-semibold">
                Min Price (₹/day)
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateFilters(condition, e.target.value, maxPrice, rating);
                }}
                className="bg-white"
              />
            </div>

            <div>
              <Label htmlFor="maxPrice" className="mb-2 block font-semibold">
                Max Price (₹/day)
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateFilters(condition, minPrice, e.target.value, rating);
                }}
                className="bg-white"
              />
            </div>

            <div>
              <Label htmlFor="rating" className="mb-2 block font-semibold flex items-center gap-1">
                <Star className="size-4 text-yellow-400 fill-yellow-400" />
                Min Rating
              </Label>
              <Select
                value={rating}
                onValueChange={(value) => {
                  setRating(value);
                  updateFilters(condition, minPrice, maxPrice, value);
                }}
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.8">4.8+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
