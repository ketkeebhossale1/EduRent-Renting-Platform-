import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

interface UserAccount {
  username: string;
  password: string;
  email: string;
  createdAt: string;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      // Signup logic
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters!");
        return;
      }

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem("rentify_users") || "[]");
      const userExists = existingUsers.find((u: UserAccount) => u.username === formData.username);

      if (userExists) {
        toast.error("Username already exists!");
        return;
      }

      // Create new user
      const newUser: UserAccount = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        createdAt: new Date().toISOString(),
      };

      existingUsers.push(newUser);
      localStorage.setItem("rentify_users", JSON.stringify(existingUsers));

      // Initialize user transaction history
      localStorage.setItem(`rentify_transactions_${formData.username}`, JSON.stringify([]));
      localStorage.setItem(`rentify_deposits_${formData.username}`, JSON.stringify([]));

      toast.success("Account created successfully!");
      onLogin(formData.username);
      onClose();
    } else {
      // Login logic
      const existingUsers = JSON.parse(localStorage.getItem("rentify_users") || "[]");
      const user = existingUsers.find(
        (u: UserAccount) => u.username === formData.username && u.password === formData.password
      );

      if (user) {
        toast.success(`Welcome back, ${formData.username}!`);
        onLogin(formData.username);
        onClose();
      } else {
        toast.error("Invalid username or password!");
      }
    }

    // Reset form
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-purple-50 to-pink-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {isSignup ? "Create Account" : "Login to Rentify"}
          </DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
        >
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Enter your username"
              className="bg-white"
            />
          </div>

          {isSignup && (
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter your email"
                className="bg-white"
              />
            </div>
          )}

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
              className="bg-white"
            />
          </div>

          {isSignup && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm your password"
                className="bg-white"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSignup ? (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Sign Up
                </>
              ) : (
                <>
                  <LogIn className="size-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setFormData({
                  username: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
