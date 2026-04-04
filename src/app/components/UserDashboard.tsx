import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { motion } from "motion/react";
import { History, Package, Wallet, Calendar, ArrowLeft, IndianRupee } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "../../lib/api";

export interface Transaction {
  id: string;
  objectName: string;
  objectId: string;
  amount: number;
  duration: number;
  startDate: string;
  endDate: string;
  depositAmount: number;
  includesDeposit: boolean;
  timestamp: string;
  status: "active" | "completed";
}

export interface DepositRecord {
  id: string;
  objectName: string;
  amount: number;
  paidDate: string;
  returnDate?: string;
  status: "held" | "returned";
}

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onReturnDeposit: (depositId: string, objectId: string) => void;
}

export function UserDashboard({ isOpen, onClose, username, onReturnDeposit }: UserDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);

  useEffect(() => {
    if (!isOpen || !username || !api.getToken()) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await api.getDashboard();
        if (cancelled) return;
        const tx = (d.transactions ?? []) as unknown as Transaction[];
        const dep = (d.deposits ?? []) as unknown as DepositRecord[];
        setTransactions(
          tx.map((t) => ({
            ...t,
            timestamp:
              typeof t.timestamp === "string"
                ? t.timestamp
                : (t as unknown as { created_at?: string }).created_at ?? new Date().toISOString(),
          }))
        );
        setDeposits(dep);
      } catch {
        if (!cancelled) {
          setTransactions([]);
          setDeposits([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, username]);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const activeRentals = transactions.filter((t) => t.status === "active").length;
  const activeDeposits = deposits.filter((d) => d.status === "held");
  const totalDepositsHeld = activeDeposits.reduce((sum, d) => sum + d.amount, 0);

  const handleReturnItem = (depositId: string, objectId: string) => {
    onReturnDeposit(depositId, objectId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-2">
            <History className="size-8 text-purple-600" />
            Your Dashboard
          </DialogTitle>
          <p className="text-gray-600 mt-2">Welcome back, {username}! 👋</p>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <IndianRupee className="size-8 mb-2 opacity-80" />
            <p className="text-sm opacity-90">Total Spent</p>
            <p className="text-3xl font-bold">₹{totalSpent}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <Package className="size-8 mb-2 opacity-80" />
            <p className="text-sm opacity-90">Active Rentals</p>
            <p className="text-3xl font-bold">{activeRentals}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <Wallet className="size-8 mb-2 opacity-80" />
            <p className="text-sm opacity-90">Deposits Held</p>
            <p className="text-3xl font-bold">₹{totalDepositsHeld}</p>
          </motion.div>
        </div>

        {/* Active Deposits */}
        {activeDeposits.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet className="size-6 text-yellow-600" />
              Active Deposits (Refundable)
            </h3>
            <div className="space-y-3">
              {activeDeposits.map((deposit) => (
                <motion.div
                  key={deposit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{deposit.objectName}</p>
                      <p className="text-sm text-gray-600">
                        Paid on: {new Date(deposit.paidDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-yellow-700">₹{deposit.amount}</p>
                      <Button
                        size="sm"
                        onClick={() => handleReturnItem(deposit.id, deposit.objectName)}
                        className="mt-2 bg-green-600 hover:bg-green-700"
                      >
                        <ArrowLeft className="size-4 mr-1" />
                        Return & Get Refund
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History className="size-6 text-purple-600" />
            Transaction History
          </h3>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-5 rounded-xl shadow-md border-2 border-purple-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="size-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-800">{transaction.objectName}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>
                            Duration: {transaction.duration} day{transaction.duration > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Rental Period:</span>{" "}
                          {new Date(transaction.startDate).toLocaleDateString()} -{" "}
                          {new Date(transaction.endDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Booked on:</span>{" "}
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                        {transaction.includesDeposit && (
                          <div className="text-yellow-700 font-medium">
                            🛡️ Deposit: ₹{transaction.depositAmount} (Refundable)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">₹{transaction.amount}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Paid</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <Package className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start renting to see your history here!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
