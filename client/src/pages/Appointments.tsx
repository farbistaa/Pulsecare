import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import AppointmentScheduler from '@/components/AppointmentScheduler';

export default function Appointments() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Appointments
          </h1>
          <p className="text-gray-600">
            Schedule and manage your blood donation appointments
          </p>
        </div>

        <AppointmentScheduler />
      </motion.div>
    </div>
  );
}