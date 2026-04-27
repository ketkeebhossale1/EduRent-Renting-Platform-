import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { ObjectCard, RentalObject } from "./components/ObjectCard";
import { ObjectFilters, ObjectFilterState } from "./components/ObjectFilters";
import { ObjectDetailModal } from "./components/ObjectDetailModal";
import { AddObjectForm } from "./components/AddObjectForm";
import { RulesModal } from "./components/RulesModal";
import { AIChatWidget } from "./components/AIChatWidget";
import { RentifyLogo } from "./components/RentifyLogo";
import { AuthModal } from "./components/AuthModal";
import { UserDashboard } from "./components/UserDashboard";
import { DamageReportModal } from "./components/DamageReportModal";
import { SubscriptionPlans } from "./components/SubscriptionPlans";
import { Search, Plus, MessageCircle, FileText, User, LogOut, AlertTriangle, Crown } from "lucide-react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { motion } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const initialRentalObjects: RentalObject[] = [
  {
    id: "1",
    name: "Concepts of Physics Vol 1",
    category: "books",
    pricePerDay: 18,
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Comprehensive physics guide by H.C. Verma covering mechanics, thermodynamics, and waves with detailed problem-solving techniques.",
    author: "H.C. Verma",
    genre: "Academic - Physics",
    publisher: "Bharati Bhawan Publishers",
    isbn: "978-8177091878",
    owner: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      address: "123 MG Road, Bangalore, Karnataka 560001",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    available: true,
    depositAmount: 120,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Scientific Calculator Casio FX-991EX",
    category: "equipment",
    pricePerDay: 20,
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Advanced scientific calculator with 552 functions, perfect for engineering and science students.",
    owner: {
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      address: "456 Nehru Place, New Delhi, Delhi 110019",
      coordinates: { lat: 28.6139, lng: 77.2090 },
    },
    available: true,
    depositAmount: 150,
    rating: 4.9,
  },
  {
    id: "3",
    name: "Digital Drawing Tablet Wacom",
    category: "electronics",
    pricePerDay: 50,
    image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Wacom drawing tablet for digital art, design projects, and online teaching. Includes stylus and software.",
    owner: {
      name: "Amit Patel",
      phone: "+91 76543 21098",
      address: "789 SG Highway, Ahmedabad, Gujarat 380015",
      coordinates: { lat: 23.0225, lng: 72.5714 },
    },
    available: true,
    depositAmount: 200,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Microscope 400X Magnification",
    category: "lab-equipment",
    pricePerDay: 40,
    image: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Compound microscope with LED illumination, perfect for biology students and lab work.",
    owner: {
      name: "Suresh Reddy",
      phone: "+91 65432 10987",
      address: "321 Banjara Hills, Hyderabad, Telangana 500034",
      coordinates: { lat: 17.4065, lng: 78.4772 },
    },
    available: true,
    depositAmount: 250,
    rating: 4.9,
  },
  {
    id: "5",
    name: "Arduino Uno Starter Kit",
    category: "electronics",
    pricePerDay: 35,
    image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Complete Arduino kit with sensors, LEDs, breadboard, and components. Great for robotics projects.",
    owner: {
      name: "Mohammad Ali",
      phone: "+91 54321 09876",
      address: "654 Park Street, Kolkata, West Bengal 700016",
      coordinates: { lat: 22.5726, lng: 88.3639 },
    },
    available: false,
    depositAmount: 180,
    rating: 4.8,
  },
  {
    id: "6",
    name: "Geometry Box Premium Set",
    category: "study-aids",
    pricePerDay: 10,
    image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "High-quality geometry set with compass, protractor, rulers, and set squares. Essential for math students.",
    owner: {
      name: "Deepak Singh",
      phone: "+91 43210 98765",
      address: "987 Civil Lines, Jaipur, Rajasthan 302006",
      coordinates: { lat: 26.9124, lng: 75.7873 },
    },
    available: true,
    depositAmount: 50,
    rating: 4.6,
  },
  {
    id: "7",
    name: "Chemistry Lab Glassware Set",
    category: "lab-equipment",
    pricePerDay: 30,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Complete glassware set including beakers, test tubes, flasks, and burettes for chemistry experiments.",
    owner: {
      name: "Kavita Menon",
      phone: "+91 32109 87654",
      address: "147 Marine Drive, Mumbai, Maharashtra 400002",
      coordinates: { lat: 18.9220, lng: 72.8347 },
    },
    available: true,
    depositAmount: 200,
    rating: 4.7,
  },
  {
    id: "8",
    name: "Organic Chemistry",
    category: "books",
    pricePerDay: 20,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Morrison & Boyd's comprehensive Organic Chemistry textbook with detailed mechanisms, reactions, and practice problems.",
    author: "Robert Thornton Morrison & Robert Neilson Boyd",
    genre: "Academic - Chemistry",
    publisher: "Pearson Education",
    isbn: "978-0136436690",
    owner: {
      name: "Arjun Nair",
      phone: "+91 21098 76543",
      address: "258 Infopark, Kochi, Kerala 682042",
      coordinates: { lat: 9.9312, lng: 76.2673 },
    },
    available: true,
    depositAmount: 140,
    rating: 4.9,
  },
  {
    id: "9",
    name: "Laptop Dell i5 for Coding",
    category: "electronics",
    pricePerDay: 80,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Dell laptop with i5 processor, 8GB RAM, perfect for programming, coding bootcamps, and projects.",
    owner: {
      name: "Vikram Singh",
      phone: "+91 98123 45678",
      address: "45 Cyber City, Gurugram, Haryana 122002",
      coordinates: { lat: 28.4595, lng: 77.0266 },
    },
    available: true,
    depositAmount: 500,
    rating: 4.8,
  },
  {
    id: "10",
    name: "Engineering Graphics",
    category: "books",
    pricePerDay: 16,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Comprehensive engineering drawing textbook covering orthographic projections, isometric views, and sectional drawings with detailed examples.",
    author: "N.D. Bhatt",
    genre: "Academic - Engineering",
    publisher: "Charotar Publishing House",
    isbn: "978-9380358208",
    owner: {
      name: "Neha Kapoor",
      phone: "+91 87234 56789",
      address: "89 Koramangala, Bangalore, Karnataka 560095",
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    available: true,
    depositAmount: 110,
    rating: 4.7,
  },
  {
    id: "11",
    name: "3D Printing Pen for Design Projects",
    category: "equipment",
    pricePerDay: 30,
    image: "https://images.unsplash.com/photo-1612428441198-f5d2c3e98a74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "3D printing pen with filament refills. Perfect for art, architecture, and design students.",
    owner: {
      name: "Rohit Verma",
      phone: "+91 76345 67890",
      address: "234 Sector 62, Noida, Uttar Pradesh 201301",
      coordinates: { lat: 28.6271, lng: 77.3734 },
    },
    available: true,
    depositAmount: 180,
    rating: 4.6,
  },
  {
    id: "12",
    name: "Whiteboard with Markers Set",
    category: "study-aids",
    pricePerDay: 20,
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Portable whiteboard with stand, markers, and eraser. Great for study groups and presentations.",
    owner: {
      name: "Sanjay Mehta",
      phone: "+91 65456 78901",
      address: "567 Bodakdev, Ahmedabad, Gujarat 380054",
      coordinates: { lat: 23.0404, lng: 72.5076 },
    },
    available: true,
    depositAmount: 100,
    rating: 4.5,
  },
  {
    id: "13",
    name: "Multimeter Digital",
    category: "equipment",
    pricePerDay: 15,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Digital multimeter for electrical measurements. Essential for electronics and electrical engineering students.",
    owner: {
      name: "Kiran Desai",
      phone: "+91 54567 89012",
      address: "890 Bandra West, Mumbai, Maharashtra 400050",
      coordinates: { lat: 19.0596, lng: 72.8295 },
    },
    available: true,
    depositAmount: 80,
    rating: 4.8,
  },
  {
    id: "14",
    name: "Cambridge IELTS 17 Academic",
    category: "books",
    pricePerDay: 15,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Authentic IELTS practice tests with answer keys and comprehensive listening audio materials for exam preparation.",
    author: "Cambridge Assessment",
    genre: "Test Preparation - English",
    publisher: "Cambridge University Press",
    isbn: "978-1316637593",
    owner: {
      name: "Alok Sharma",
      phone: "+91 43678 90123",
      address: "123 Whitefield, Bangalore, Karnataka 560066",
      coordinates: { lat: 12.9698, lng: 77.7499 },
    },
    available: true,
    depositAmount: 100,
    rating: 4.8,
  },
  {
    id: "15",
    name: "Telescope for Astronomy Students",
    category: "equipment",
    pricePerDay: 60,
    image: "https://images.unsplash.com/photo-1615653058464-841639bb85ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "70mm refractor telescope with tripod and multiple eyepieces. Perfect for astronomy enthusiasts.",
    owner: {
      name: "Manoj Kumar",
      phone: "+91 32789 01234",
      address: "456 Malviya Nagar, Jaipur, Rajasthan 302017",
      coordinates: { lat: 26.8467, lng: 75.8231 },
    },
    available: true,
    depositAmount: 300,
    rating: 4.9,
  },
  {
    id: "16",
    name: "Introduction to Algorithms",
    category: "books",
    pricePerDay: 25,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "The classic CLRS algorithms textbook covering sorting, graph theory, dynamic programming, and computational complexity.",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    genre: "Computer Science - Algorithms",
    publisher: "MIT Press",
    isbn: "978-0262033848",
    owner: {
      name: "Rahul Joshi",
      phone: "+91 21890 12345",
      address: "789 Connaught Place, New Delhi, Delhi 110001",
      coordinates: { lat: 28.6304, lng: 77.2177 },
    },
    available: true,
    depositAmount: 160,
    rating: 4.9,
  },
  {
    id: "17",
    name: "Biology Model Human Skeleton",
    category: "lab-equipment",
    pricePerDay: 45,
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Life-size human skeleton model on stand. Perfect for medical and biology students.",
    owner: {
      name: "Sunil Gupta",
      phone: "+91 10901 23456",
      address: "321 Salt Lake, Kolkata, West Bengal 700091",
      coordinates: { lat: 22.5858, lng: 88.4197 },
    },
    available: true,
    depositAmount: 250,
    rating: 4.7,
  },
  {
    id: "18",
    name: "USB Webcam HD for Online Classes",
    category: "electronics",
    pricePerDay: 25,
    image: "https://images.unsplash.com/photo-1526942623694-42b4b7052fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "1080p HD webcam with microphone. Ideal for online classes, presentations, and video conferences.",
    owner: {
      name: "Prakash Reddy",
      phone: "+91 99012 34567",
      address: "654 Jubilee Hills, Hyderabad, Telangana 500033",
      coordinates: { lat: 17.4326, lng: 78.4071 },
    },
    available: true,
    depositAmount: 120,
    rating: 4.6,
  },
  {
    id: "19",
    name: "Drafting Table with T-Square",
    category: "equipment",
    pricePerDay: 35,
    image: "https://images.unsplash.com/photo-1629330926628-084ac41675c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Adjustable drafting table with T-square and parallel bar. Essential for architecture students.",
    owner: {
      name: "Geeta Iyer",
      phone: "+91 88123 45678",
      address: "987 T Nagar, Chennai, Tamil Nadu 600017",
      coordinates: { lat: 13.0418, lng: 80.2341 },
    },
    available: true,
    depositAmount: 200,
    rating: 4.5,
  },
  {
    id: "20",
    name: "Flash Cards Set for Vocabulary",
    category: "study-aids",
    pricePerDay: 12,
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "500+ vocabulary flash cards with examples and usage. Great for competitive exam preparation.",
    owner: {
      name: "Ankit Malhotra",
      phone: "+91 77234 56789",
      address: "234 Cyber Hub, Gurugram, Haryana 122018",
      coordinates: { lat: 28.4947, lng: 77.0881 },
    },
    available: true,
    depositAmount: 60,
    rating: 4.7,
  },
  {
    id: "21",
    name: "Oscilloscope for Electronics Lab",
    category: "lab-equipment",
    pricePerDay: 70,
    image: "https://images.unsplash.com/photo-1581092918484-8313e1f7e8dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Digital storage oscilloscope with dual channels. Perfect for electronics engineering projects.",
    owner: {
      name: "DJ Arjun",
      phone: "+91 66345 67890",
      address: "567 Versova, Mumbai, Maharashtra 400061",
      coordinates: { lat: 19.1329, lng: 72.8115 },
    },
    available: true,
    depositAmount: 400,
    rating: 4.9,
  },
  {
    id: "22",
    name: "Gray's Anatomy for Students",
    category: "books",
    pricePerDay: 28,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Comprehensive human anatomy textbook with clinical correlations, detailed illustrations, and surface anatomy features.",
    author: "Richard Drake, Wayne Vogl, Adam W.M. Mitchell",
    genre: "Medical - Anatomy",
    publisher: "Elsevier",
    isbn: "978-0323393041",
    owner: {
      name: "Harish Patel",
      phone: "+91 55456 78901",
      address: "890 Satellite, Ahmedabad, Gujarat 380015",
      coordinates: { lat: 23.0258, lng: 72.5098 },
    },
    available: true,
    depositAmount: 180,
    rating: 4.9,
  },
  {
    id: "23",
    name: "Portable Projector for Presentations",
    category: "electronics",
    pricePerDay: 75,
    image: "https://images.unsplash.com/photo-1594125675255-44580a4f738a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Compact mini projector with HDMI and USB connectivity. Perfect for group presentations and seminars.",
    owner: {
      name: "Pooja Singh",
      phone: "+91 44567 89012",
      address: "123 Gomti Nagar, Lucknow, Uttar Pradesh 226010",
      coordinates: { lat: 26.8550, lng: 80.9803 },
    },
    available: true,
    depositAmount: 350,
    rating: 4.7,
  },
  {
    id: "24",
    name: "Mind Maps & Study Planners Set",
    category: "study-aids",
    pricePerDay: 14,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Visual learning tools with mind maps, study planners, and organizational charts for better retention.",
    owner: {
      name: "Ravi Shankar",
      phone: "+91 33678 90123",
      address: "456 Hitech City, Hyderabad, Telangana 500081",
      coordinates: { lat: 17.4483, lng: 78.3808 },
    },
    available: true,
    depositAmount: 70,
    rating: 4.6,
  },
  {
    id: "25",
    name: "Graphing Calculator TI-84",
    category: "equipment",
    pricePerDay: 35,
    image: "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Texas Instruments TI-84 Plus graphing calculator. Essential for advanced math and calculus students.",
    owner: {
      name: "Aryan Malhotra",
      phone: "+91 22789 01234",
      address: "789 Indiranagar, Bangalore, Karnataka 560038",
      coordinates: { lat: 12.9716, lng: 77.6412 },
    },
    available: true,
    depositAmount: 200,
    rating: 4.9,
  },
  {
    id: "26",
    name: "Mastering AutoCAD 2024",
    category: "books",
    pricePerDay: 22,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Complete guide to AutoCAD with step-by-step tutorials, advanced 3D modeling techniques, and real-world project examples.",
    author: "George Omura & Brian C. Benton",
    genre: "Technical - CAD/Design",
    publisher: "Sybex",
    isbn: "978-1119900344",
    owner: {
      name: "Sameer Khan",
      phone: "+91 11890 12345",
      address: "321 DLF Phase 2, Gurugram, Haryana 122002",
      coordinates: { lat: 28.4777, lng: 77.0884 },
    },
    available: true,
    depositAmount: 140,
    rating: 4.7,
  },
  {
    id: "27",
    name: "Periodic Table 3D Model",
    category: "lab-equipment",
    pricePerDay: 25,
    image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Interactive 3D periodic table model with element samples. Great visual learning tool for chemistry.",
    owner: {
      name: "Dr. Meera Shah",
      phone: "+91 90901 23456",
      address: "654 Civil Hospital Road, Ahmedabad, Gujarat 380006",
      coordinates: { lat: 23.0283, lng: 72.5681 },
    },
    available: true,
    depositAmount: 150,
    rating: 4.8,
  },
  {
    id: "28",
    name: "Noise Cancelling Headphones",
    category: "electronics",
    pricePerDay: 30,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Sony noise-canceling headphones perfect for focused study sessions and online lectures.",
    owner: {
      name: "Prof. Arun Verma",
      phone: "+91 79012 34567",
      address: "987 Observatory Hill, Pune, Maharashtra 411008",
      coordinates: { lat: 18.5196, lng: 73.8553 },
    },
    available: true,
    depositAmount: 180,
    rating: 4.9,
  },
  {
    id: "29",
    name: "Robotics Kit with Motors & Sensors",
    category: "equipment",
    pricePerDay: 55,
    image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Complete robotics kit with motors, sensors, microcontroller, and building components for projects.",
    owner: {
      name: "Karthik Prasad",
      phone: "+91 68123 45678",
      address: "234 Electronic City, Bangalore, Karnataka 560100",
      coordinates: { lat: 12.8456, lng: 77.6603 },
    },
    available: true,
    depositAmount: 300,
    rating: 4.8,
  },
  {
    id: "30",
    name: "Study Lamp LED Desk Light",
    category: "study-aids",
    pricePerDay: 10,
    image: "https://images.unsplash.com/photo-1565697980348-f0e72e0e999f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Adjustable LED desk lamp with touch control and multiple brightness levels. Eye-friendly for long study hours.",
    owner: {
      name: "Simran Kaur",
      phone: "+91 57234 56789",
      address: "567 Defence Colony, New Delhi, Delhi 110024",
      coordinates: { lat: 28.5678, lng: 77.2345 },
    },
    available: true,
    depositAmount: 50,
    rating: 4.6,
  },
  {
    id: "31",
    name: "Concepts of Physics Vol 2",
    category: "books",
    pricePerDay: 18,
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Second volume by H.C. Verma covering electricity, magnetism, optics, and modern physics with extensive problem sets.",
    author: "H.C. Verma",
    genre: "Academic - Physics",
    publisher: "Bharati Bhawan Publishers",
    isbn: "978-8177092318",
    owner: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      address: "123 MG Road, Bangalore, Karnataka 560001",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    available: true,
    depositAmount: 120,
    rating: 4.9,
  },
  {
    id: "32",
    name: "Higher Algebra",
    category: "books",
    pricePerDay: 16,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Classic mathematics textbook covering algebraic equations, permutations, combinations, and binomial theorem.",
    author: "Hall & Knight",
    genre: "Academic - Mathematics",
    publisher: "Arihant Publications",
    isbn: "978-8182836587",
    owner: {
      name: "Prof. Sanjay Mishra",
      phone: "+91 92345 67890",
      address: "45 University Road, Varanasi, UP 221005",
      coordinates: { lat: 25.2677, lng: 82.9913 },
    },
    available: true,
    depositAmount: 100,
    rating: 4.7,
  },
  {
    id: "33",
    name: "Python Crash Course",
    category: "books",
    pricePerDay: 20,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Hands-on Python programming guide with practical projects including data visualization, web apps, and game development.",
    author: "Eric Matthes",
    genre: "Computer Science - Programming",
    publisher: "No Starch Press",
    isbn: "978-1593279288",
    owner: {
      name: "Ananya Desai",
      phone: "+91 81234 56789",
      address: "678 IT Park, Pune, Maharashtra 411014",
      coordinates: { lat: 18.5642, lng: 73.7769 },
    },
    available: true,
    depositAmount: 130,
    rating: 4.8,
  },
  {
    id: "34",
    name: "Objective Physics for NEET",
    category: "books",
    pricePerDay: 17,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Complete physics preparation guide for NEET with MCQs, previous year questions, and detailed solutions.",
    author: "D.C. Pandey",
    genre: "Test Preparation - Medical",
    publisher: "Arihant Publications",
    isbn: "978-9325796829",
    owner: {
      name: "Dr. Kavita Reddy",
      phone: "+91 70123 45678",
      address: "234 Medical College Road, Hyderabad, Telangana 500095",
      coordinates: { lat: 17.4435, lng: 78.3496 },
    },
    available: true,
    depositAmount: 110,
    rating: 4.8,
  },
  {
    id: "35",
    name: "Economic Survey of India 2023-24",
    category: "books",
    pricePerDay: 14,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Official Economic Survey document with comprehensive analysis of Indian economy, policies, and statistical data.",
    author: "Ministry of Finance, Government of India",
    genre: "Economics - Policy",
    publisher: "Oxford University Press",
    isbn: "978-0199497461",
    owner: {
      name: "Rohan Kapoor",
      phone: "+91 61234 56789",
      address: "89 Connaught Place, New Delhi, Delhi 110001",
      coordinates: { lat: 28.6315, lng: 77.2167 },
    },
    available: true,
    depositAmount: 90,
    rating: 4.6,
  },
  {
    id: "36",
    name: "Fundamentals of Electrical Engineering",
    category: "books",
    pricePerDay: 19,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "good",
    description: "Comprehensive guide covering circuits, network theory, electromagnetism, and electrical machines for engineering students.",
    author: "B.L. Theraja",
    genre: "Academic - Electrical Engineering",
    publisher: "S. Chand Publishing",
    isbn: "978-8121924405",
    owner: {
      name: "Vikram Singh",
      phone: "+91 50123 45678",
      address: "567 Engineering College, Roorkee, Uttarakhand 247667",
      coordinates: { lat: 29.8543, lng: 77.8880 },
    },
    available: true,
    depositAmount: 120,
    rating: 4.7,
  },
  {
    id: "37",
    name: "A Brief History of Time",
    category: "books",
    pricePerDay: 12,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "Stephen Hawking's iconic book exploring cosmology, black holes, the nature of time, and the universe's fundamental laws.",
    author: "Stephen Hawking",
    genre: "Popular Science - Cosmology",
    publisher: "Bantam Books",
    isbn: "978-0553380163",
    owner: {
      name: "Meera Shah",
      phone: "+91 41234 56789",
      address: "123 Science Centre Road, Bangalore, Karnataka 560094",
      coordinates: { lat: 13.0112, lng: 77.5656 },
    },
    available: true,
    depositAmount: 80,
    rating: 4.9,
  },
];

export default function App() {
  const [rentalObjects, setRentalObjects] = useState<RentalObject[]>(initialRentalObjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState<ObjectFilterState>({
    category: "all",
    condition: "all",
    minPrice: 0,
    maxPrice: Infinity,
    rating: 0,
  });
  const [selectedObject, setSelectedObject] = useState<RentalObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isDamageReportOpen, setIsDamageReportOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem("edurent_current_user"));

  // Load items from DB on startup and merge with hardcoded defaults
  useEffect(() => {
    api.getRentalObjects().then((dbItems: any[]) => {
      if (dbItems.length === 0) return;
      setRentalObjects((prev) => {
        const dbIds = new Set(dbItems.map((item: any) => String(item.id)));
        const hardcodedOnly = prev.filter((item) => !dbIds.has(String(item.id)));
        return [...(dbItems as unknown as RentalObject[]), ...hardcodedOnly];
      });
    }).catch(() => {
      // Server unavailable — keep hardcoded items
    });
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem("edurent_current_user", username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("edurent_current_user");
    toast.success("Logged out successfully!");
  };

  const handleBookingComplete = (objectId: string) => {
    setRentalObjects((objects) =>
      objects.map((obj) => (obj.id === objectId ? { ...obj, available: false } : obj))
    );
  };

  const handleReturnDeposit = (depositId: string, objectName: string) => {
    if (!currentUser) return;

    const deposits = JSON.parse(localStorage.getItem(`edurent_deposits_${currentUser}`) || "[]");
    const updatedDeposits = deposits.map((d: any) =>
      d.id === depositId ? { ...d, status: "returned", returnDate: new Date().toISOString() } : d
    );
    localStorage.setItem(`edurent_deposits_${currentUser}`, JSON.stringify(updatedDeposits));

    setRentalObjects((objects) =>
      objects.map((obj) => (obj.name === objectName ? { ...obj, available: true } : obj))
    );

    const deposit = deposits.find((d: any) => d.id === depositId);
    toast.success(`₹${deposit.amount} deposit refunded! Object returned successfully.`);
    
    setIsUserDashboardOpen(false);
    setTimeout(() => setIsUserDashboardOpen(true), 100);
  };

  const handleViewDetails = (object: RentalObject) => {
    if (!currentUser) {
      toast.error("Please login to view item details and make bookings!");
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedObject(object);
    setIsModalOpen(true);
  };

  const handleAddObject = async (newObject: RentalObject) => {
    // Show item immediately so the user sees it right away
    setRentalObjects((prev) => [newObject, ...prev]);
    setIsAddFormOpen(false);
    toast.success(`${newObject.category === "books" ? "Book" : "Item"} added!`);

    try {
      const saved = await api.saveRentalObject(newObject as any);
      // Replace the optimistic item with the saved version from DB
      setRentalObjects((prev) =>
        prev.map((obj) => (obj.id === newObject.id ? (saved as unknown as RentalObject) : obj))
      );
    } catch (e: any) {
      console.error("Save item error:", e);
      toast.error("Item shown but not saved to database — will disappear on reload. Check if the server is running.");
    }
  };

  const filteredObjects = rentalObjects.filter((object) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        object.name.toLowerCase().includes(query) ||
        object.description.toLowerCase().includes(query) ||
        object.category.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (selectedCategory !== "all" && object.category !== selectedCategory) {
      return false;
    }

    if (filters.condition !== "all" && object.condition !== filters.condition) {
      return false;
    }

    if (object.pricePerDay < filters.minPrice || object.pricePerDay > filters.maxPrice) {
      return false;
    }

    if (object.rating < filters.rating) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Toaster />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-2xl sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <RentifyLogo />

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  if (!currentUser) {
                    toast.error("Please login to view subscription plans!");
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsSubscriptionOpen(true);
                }}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
              >
                <Crown className="size-4 mr-2" />
                Subscriptions
              </Button>
              <Button
                onClick={() => {
                  if (!currentUser) {
                    toast.error("Please login to report damage!");
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsDamageReportOpen(true);
                }}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <AlertTriangle className="size-4 mr-2" />
                Report Damage
              </Button>
              <Button
                onClick={() => setIsRulesModalOpen(true)}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <FileText className="size-4 mr-2" />
                Rules
              </Button>
              <Button
                onClick={() => {
                  if (!currentUser) {
                    toast.error("Please login to add items for rent!");
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsAddFormOpen(true);
                }}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                <Plus className="size-4 mr-2" />
                Add Item
              </Button>
              {currentUser ? (
                <>
                  <Button
                    onClick={() => setIsUserDashboardOpen(true)}
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    <User className="size-4 mr-2" />
                    {currentUser}
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <LogOut className="size-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-white text-purple-600 hover:bg-purple-50"
                >
                  <User className="size-4 mr-2" />
                  Login/Signup
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for books, calculators, lab equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white shadow-lg border-2 border-purple-200 focus:border-purple-400 text-black placeholder:text-gray-400"
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex items-center justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-purple-100">
                {filteredObjects.filter(o => o.available).length} items available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-purple-100">{rentalObjects.length} educational items</span>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ObjectFilters
          onFilterChange={setFilters}
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {/* Objects Grid */}
        {filteredObjects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredObjects.map((object, index) => (
              <ObjectCard
                key={object.id}
                object={object}
                onViewDetails={handleViewDetails}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search criteria
            </p>
          </motion.div>
        )}
      </main>

      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
      >
        <MessageCircle className="size-6" />
      </motion.button>

      {/* Modals */}
      <ObjectDetailModal
        object={selectedObject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onBookingComplete={handleBookingComplete}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />
      <AddObjectForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onAdd={handleAddObject}
      />
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
      <AIChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
      <UserDashboard
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
        username={currentUser || ""}
        onReturnDeposit={handleReturnDeposit}
      />
      <DamageReportModal
        isOpen={isDamageReportOpen}
        onClose={() => setIsDamageReportOpen(false)}
        currentUser={currentUser}
      />
      <SubscriptionPlans
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}