import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function Analytics() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            System Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights and metrics for the blood donation management system
          </p>
        </div>

        <AnalyticsDashboard />
      </motion.div>
    </div>
  );
}