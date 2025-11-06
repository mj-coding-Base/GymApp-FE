"use client";

import { fetchTodayAttendance, TodayAttendanceRecord } from "@/actions/dashboard";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import WhiteCard from "./WhiteCard";

const TodayAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<TodayAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const lastRecordIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notification sound
  useEffect(() => {
    // Create audio element for the notification sound
    // Note: You'll need to add an audio file to the public folder
    // For now, we'll use Web Speech API as fallback
    if (globalThis.window !== undefined) {
      // Try to load audio file if it exists
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audioRef.current = audio;
      } catch {
        // Audio file not available, will use speech synthesis as fallback
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Audio file not found, will use speech synthesis as fallback');
        }
      }
    }
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to speech synthesis
        if (globalThis.speechSynthesis !== undefined) {
          const utterance = new SpeechSynthesisUtterance('Gym subscription is not paid');
          utterance.lang = 'en-US';
          globalThis.speechSynthesis.speak(utterance);
        }
      });
    } else if (globalThis.speechSynthesis !== undefined) {
      const utterance = new SpeechSynthesisUtterance('Gym subscription is not paid');
      utterance.lang = 'en-US';
      globalThis.speechSynthesis.speak(utterance);
    }
  };

  const fetchAttendance = useCallback(async () => {
    try {
      const data = await fetchTodayAttendance();
      
      if (Array.isArray(data)) {
        // Check for new records
        const currentRecordIds = new Set(data.map(record => record._id));
        const newRecords = data.filter(record => !lastRecordIdsRef.current.has(record._id));
        
        // If there are new records, check if any have deactivateAt < today
        if (newRecords.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const unpaidRecords = newRecords.filter(record => {
            if (!record.deactivateAt) return false;
            const deactivateDate = new Date(record.deactivateAt);
            deactivateDate.setHours(0, 0, 0, 0);
            return deactivateDate < today;
          });
          
          // Play sound if there are unpaid records
          if (unpaidRecords.length > 0) {
            playNotificationSound();
          }
        }
        
        // Update last seen record IDs
        lastRecordIdsRef.current = currentRecordIds;
        
        // Sort by attendedDateTime descending (newest first)
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.attendedDateTime).getTime();
          const dateB = new Date(b.attendedDateTime).getTime();
          return dateB - dateA;
        });
        
        setAttendanceRecords(sortedData.slice(0, 20)); // Limit to 20 records
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAttendance();
    
    // Set up interval to fetch every 30 seconds
    const intervalId = setInterval(fetchAttendance, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchAttendance]);

  const isUnpaid = (record: TodayAttendanceRecord): boolean => {
    if (!record.deactivateAt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deactivateDate = new Date(record.deactivateAt);
    deactivateDate.setHours(0, 0, 0, 0);
    return deactivateDate < today;
  };

  const formatTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), "hh:mm a");
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const isDeactivated = (record: TodayAttendanceRecord): boolean => {
    if (!record.deactivateAt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deactivateDate = new Date(record.deactivateAt);
    deactivateDate.setHours(0, 0, 0, 0);
    return deactivateDate < today;
  };

  return (
    <WhiteCard className="flex flex-col gap-[10px]">
      <div className="flex gap-[5px] w-full">
        <i className="calendar-icon size-[18px] text-[#3D3D3D]" />
        <h1 className="text-[12px] font-medium text-[#3D3D3D]">Today Attendance</h1>
      </div>
      
      <div className="h-[600px] overflow-y-auto pr-2">
        {(() => {
          if (loading && attendanceRecords.length === 0) {
            return (
              <div className="flex items-center justify-center h-full">
                <p className="text-[12px] text-[#6D6D6D]">Loading attendance...</p>
              </div>
            );
          }
          if (attendanceRecords.length === 0) {
            return (
              <div className="flex items-center justify-center h-full">
                <p className="text-[12px] text-[#6D6D6D]">No attendance records for today</p>
              </div>
            );
          }
          return (
          <div className="flex flex-col gap-[8px] ">
            {attendanceRecords.map((record) => {
              const unpaid = isUnpaid(record);
              const deactivated = isDeactivated(record);
              return (
                <div
                  key={record._id}
                  className={`p-[12px] rounded-[10px] p-2 border ${
                    unpaid
                      ? "bg-[#FFEBEE] border-[#F44336]"
                      : deactivated
                      ? "bg-[#FFF3E0] border-[#FF9800]"
                      : "bg-[#F8F9FA] border-[#E0E0E0]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-[#363636]">
                          {record.firstName} {record.lastName}
                        </p>
                        {record.deactivateAt && (
                          <span className="text-[10px] text-[#6D6D6D] font-normal">
                            ({formatDate(record.deactivateAt)})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6D6D6D] mt-1">
                        {record.reference || record.clientId || record.customerId || "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-[12px] font-medium text-[#363636]">
                        {formatTime(record.attendedDateTime)}
                      </p>
                      {unpaid && (
                        <span className="text-[10px] text-[#F44336] font-semibold mt-1">
                          Unpaid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          );
        })()}
      </div>
    </WhiteCard>
  );
};

export default TodayAttendance;

