import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MobileTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  is24Hour?: boolean;
}

export default function MobileTimePicker({ value, onChange, is24Hour = true }: MobileTimePickerProps) {
  const [hours, minutes] = value.split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);
  const [selectedPeriod, setSelectedPeriod] = useState(hours >= 12 ? 'PM' : 'AM');
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  
  // Generate hours array (0-23 for 24h format, 1-12 for 12h format)
  const hoursArray = is24Hour 
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minutes array (0-59)
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);
  
  // Generate period array (AM/PM)
  const periodArray = ['AM', 'PM'];
  
  useEffect(() => {
    // Scroll to selected hour
    if (hourRef.current) {
      const hourElement = hourRef.current.querySelector(`[data-hour="${selectedHour}"]`);
      if (hourElement) {
        hourElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // Scroll to selected minute
    if (minuteRef.current) {
      const minuteElement = minuteRef.current.querySelector(`[data-minute="${selectedMinute}"]`);
      if (minuteElement) {
        minuteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // Scroll to selected period
    if (!is24Hour && periodRef.current) {
      const periodElement = periodRef.current.querySelector(`[data-period="${selectedPeriod}"]`);
      if (periodElement) {
        periodElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);
  
  useEffect(() => {
    // Convert to 24-hour format if needed
    let hour24 = selectedHour;
    if (!is24Hour) {
      if (selectedPeriod === 'PM' && selectedHour < 12) {
        hour24 = selectedHour + 12;
      } else if (selectedPeriod === 'AM' && selectedHour === 12) {
        hour24 = 0;
      }
    }
    
    // Format the time string (HH:MM)
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onChange(timeString);
  }, [selectedHour, selectedMinute, selectedPeriod, is24Hour, onChange]);
  
  const handleHourScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 40; // Height of each time item
    const offset = 80; // Offset for padding
    const index = Math.round((scrollTop - offset) / itemHeight);
    
    if (index >= 0 && index < hoursArray.length) {
      setSelectedHour(hoursArray[index]);
    }
  };
  
  const handleMinuteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 40; // Height of each time item
    const offset = 80; // Offset for padding
    const index = Math.round((scrollTop - offset) / itemHeight);
    
    if (index >= 0 && index < minutesArray.length) {
      setSelectedMinute(minutesArray[index]);
    }
  };
  
  const handlePeriodScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 40; // Height of each time item
    const offset = 80; // Offset for padding
    const index = Math.round((scrollTop - offset) / itemHeight);
    
    if (index >= 0 && index < periodArray.length) {
      setSelectedPeriod(periodArray[index]);
    }
  };
  
  return (
    <div className="flex gap-2">
      {/* Hours */}
      <div className="time-picker-container flex-1">
        <div 
          ref={hourRef}
          className="time-picker-scroll"
          onScroll={handleHourScroll}
        >
          {hoursArray.map((hour) => (
            <div 
              key={`hour-${hour}`}
              data-hour={hour}
              className={`time-picker-item ${selectedHour === hour ? 'selected' : ''}`}
              onClick={() => setSelectedHour(hour)}
            >
              {hour.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
        <div className="time-picker-overlay"></div>
        <div className="time-picker-center-line"></div>
      </div>
      
      {/* Minutes */}
      <div className="time-picker-container flex-1">
        <div 
          ref={minuteRef}
          className="time-picker-scroll"
          onScroll={handleMinuteScroll}
        >
          {minutesArray.map((minute) => (
            <div 
              key={`minute-${minute}`}
              data-minute={minute}
              className={`time-picker-item ${selectedMinute === minute ? 'selected' : ''}`}
              onClick={() => setSelectedMinute(minute)}
            >
              {minute.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
        <div className="time-picker-overlay"></div>
        <div className="time-picker-center-line"></div>
      </div>
      
      {/* AM/PM (only for 12-hour format) */}
      {!is24Hour && (
        <div className="time-picker-container w-20">
          <div 
            ref={periodRef}
            className="time-picker-scroll"
            onScroll={handlePeriodScroll}
          >
            {periodArray.map((period) => (
              <div 
                key={`period-${period}`}
                data-period={period}
                className={`time-picker-item ${selectedPeriod === period ? 'selected' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </div>
            ))}
          </div>
          <div className="time-picker-overlay"></div>
          <div className="time-picker-center-line"></div>
        </div>
      )}
    </div>
  );
}