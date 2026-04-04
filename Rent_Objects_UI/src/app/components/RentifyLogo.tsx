import { motion } from "motion/react";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

export function RentifyLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Animated Logo Icon */}
      <motion.div
        className="relative w-12 h-12"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Outer rotating ring - book pages effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-blue-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
          }}
        />
        
        {/* Middle pulsing ring */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-purple-300"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: "linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(59, 130, 246, 0.4))",
          }}
        />
        
        {/* Center graduation cap icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              y: [0, -3, 0],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <GraduationCap className="size-6 text-white drop-shadow-lg" />
          </motion.div>
        </div>
        
        {/* Book sparkles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
            }}
            animate={{
              x: [0, Math.cos((i * 2 * Math.PI) / 3) * 25],
              y: [0, Math.sin((i * 2 * Math.PI) / 3) * 25],
              opacity: [1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
            }}
          >
            <BookOpen className="size-3 text-yellow-300" />
          </motion.div>
        ))}
      </motion.div>

      {/* Text Logo */}
      <div className="relative">
        <motion.h1
          className="text-4xl font-black tracking-tight relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent drop-shadow-lg relative"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            EduRent
          </motion.span>
          
          {/* Glowing effect */}
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent blur-sm"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            EduRent
          </motion.span>
        </motion.h1>
        
        <motion.p
          className="text-purple-100 text-sm font-medium mt-0.5 flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📚
          </motion.span>
          Learn More, Spend Less
        </motion.p>
      </div>
    </div>
  );
}