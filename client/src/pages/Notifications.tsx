import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';

export default function Notifications() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-blue-600" />
            Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with blood donation requests, messages, and system alerts
          </p>
        </div>

        <NotificationCenter />
      </motion.div>
    </div>
  );
}