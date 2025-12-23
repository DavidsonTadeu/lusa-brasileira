import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";

export default function AdminAgenda() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState("all");

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-agenda', selectedProfessional],
    queryFn: () => {
      if (selectedProfessional === "all") {
        return base44.entities.Booking.filter({
          status: { $in: ['pending', 'confirmed'] }
        }, 'booking_date');
      }
      return base44.entities.Booking.filter({
        professional_id: selectedProfessional,
        status: { $in: ['pending', 'confirmed'] }
      }, 'booking_date');
    },
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => base44.entities.Professional.filter({ is_active: true }),
  });

  const weekStart = startOfWeek(currentWeek, { locale: pt });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 11 }, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`);

  const getBookingsForDayAndHour = (day, hour) => {
    return bookings.filter(b => {
      const bookingDate = new Date(b.booking_date);
      return isSameDay(bookingDate, day) && b.booking_time.startsWith(hour);
    });
  };

  const statusColors = {
    pending: 'bg-yellow-500 border-yellow-600',
    confirmed: 'bg-green-500 border-green-600'
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Agenda Semanal</h1>
          <p className="text-gray-400">Visualização completa dos agendamentos</p>
        </div>

        {/* Controls */}
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <p className="text-white font-semibold">
                  {format(weekDays[0], "dd MMM", { locale: pt })} - {format(weekDays[6], "dd MMM yyyy", { locale: pt })}
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentWeek(new Date())}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Hoje
              </Button>
            </div>
           
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-gray-700">
                <div className="p-4 bg-gray-900">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                {weekDays.map((day, i) => (
                  <div key={i} className="p-4 bg-gray-900 text-center border-l border-gray-700">
                    <p className="text-xs text-gray-400 uppercase">
                      {format(day, "EEE", { locale: pt })}
                    </p>
                    <p className={`text-lg font-semibold mt-1 ${isSameDay(day, new Date()) ? 'text-red-500' : 'text-white'
                      }`}>
                      {format(day, "dd")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div>
                {hours.map((hour, hourIndex) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-gray-700">
                    <div className="p-4 bg-gray-900 text-gray-400 text-sm font-medium">
                      {hour}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayBookings = getBookingsForDayAndHour(day, hour.split(':')[0]);
                      return (
                        <div
                          key={dayIndex}
                          className="p-2 border-l border-gray-700 min-h-[80px] bg-gray-850 hover:bg-gray-800 transition-colors"
                        >
                          <div className="space-y-1">
                            {dayBookings.map((booking) => (
                              <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-2 rounded text-xs border-l-4 ${statusColors[booking.status]}`}
                              >
                                <p className="font-semibold text-white truncate">{booking.client_name}</p>
                                <p className="text-gray-300 text-xs truncate">{booking.service_name}</p>
                                <p className="text-gray-400 text-xs">{booking.booking_time}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-400">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-400">Confirmado</span>
          </div>
        </div>
      </div>
    </div>
  );
}