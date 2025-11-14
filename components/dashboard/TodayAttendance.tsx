"use client";

import { fetchTodayAttendance, TodayAttendanceRecord } from "@/actions/dashboard";
import { getCustomerByClientId } from "@/actions/customers";
import { IndividualCustomer } from "@/types/Customer";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import WhiteCard from "./WhiteCard";

type AttendanceRecordWithCustomer = TodayAttendanceRecord & {
  customerData?: IndividualCustomer | null;
};

const TodayAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const lastRecordIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const customerDataCache = useRef<Map<string, IndividualCustomer | null>>(new Map());
  const notifiedUnpaidClientsRef = useRef<Set<string>>(new Set());

  // Initialize audio for notification sound
  useEffect(() => {
    if (globalThis.window !== undefined) {
      try {
        const audio = new Audio('/audio/gym subscription not paid.mp3');
        audio.volume = 0.5;
        audio.preload = 'auto';
        audioRef.current = audio;
      } catch (error) {
        // Audio file not available, will use speech synthesis as fallback
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Audio file not found, will use speech synthesis as fallback', error);
        }
      }
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      // Reset audio to beginning in case it was already played
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
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
  }, []);

  const fetchCustomerData = useCallback(async (clientId: string): Promise<IndividualCustomer | null> => {
    // Check cache first
    if (customerDataCache.current.has(clientId)) {
      return customerDataCache.current.get(clientId) || null;
    }
    
    try {
      const customerData = await getCustomerByClientId(clientId);
      if (customerData) {
        customerDataCache.current.set(clientId, customerData);
        return customerData;
      }
      customerDataCache.current.set(clientId, null);
      return null;
    } catch (error) {
      console.error(`Error fetching customer data for ${clientId}:`, error);
      customerDataCache.current.set(clientId, null);
      return null;
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const data = await fetchTodayAttendance();
      
      if (Array.isArray(data)) {
        // Check for new records
        const currentRecordIds = new Set(data.map(record => record._id));
        
        // Fetch customer data for all records
        const recordsWithCustomerData: AttendanceRecordWithCustomer[] = await Promise.all(
          data.map(async (record) => {
            const clientId = record.clientId || record.customerId;
            if (!clientId) {
              return { ...record, customerData: null };
            }
            
            // Check if we have cached data
            if (customerDataCache.current.has(clientId)) {
              const cachedData = customerDataCache.current.get(clientId);
              return { ...record, customerData: cachedData || null };
            }
            
            // Fetch customer data if not in cache (for new records or existing records without cache)
            const customerData = await fetchCustomerData(clientId);
            return { ...record, customerData };
          })
        );
        
        // Check for unpaid customers after fetching their data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        
        // Check each record for unpaid status and play sound when unpaid attendance record is fetched
        const newlyDetectedUnpaidClients: string[] = [];
        const isNewRecord = (recordId: string) => !lastRecordIdsRef.current.has(recordId);
        
        recordsWithCustomerData.forEach(record => {
          const clientId = record.clientId || record.customerId;
          if (!clientId) return;
          
          const customerData = record.customerData || customerDataCache.current.get(clientId);
          const deactivateAt = customerData?.deactivateAt || record.deactivateAt;
          
          if (!deactivateAt) return;
          
          const deactivateDate = new Date(deactivateAt);
          deactivateDate.setHours(0, 0, 0, 0);
          deactivateDate.setMinutes(0);
          deactivateDate.setSeconds(0);
          deactivateDate.setMilliseconds(0);
          
          // Check if date has PASSED (before today)
          const isUnpaid = deactivateDate < today;
          
          if (!isUnpaid) return;
          
          // Play sound when unpaid user attendance record is fetched
          // Check if this is a new attendance record OR if we haven't notified for this client yet
          const isNewAttendanceRecord = isNewRecord(record._id);
          const hasNotBeenNotified = !notifiedUnpaidClientsRef.current.has(clientId);
          
          if (isNewAttendanceRecord || hasNotBeenNotified) {
            // Mark as notified
            notifiedUnpaidClientsRef.current.add(clientId);
            newlyDetectedUnpaidClients.push(clientId);
            
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[AUDIO] Detected unpaid customer: ${clientId}, deactivateAt: ${deactivateAt}, isNewRecord: ${isNewAttendanceRecord}`);
            }
          }
        });
        
        // Play sound when unpaid user attendance record is fetched
        if (newlyDetectedUnpaidClients.length > 0) {
          playNotificationSound();
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[AUDIO] Playing notification for ${newlyDetectedUnpaidClients.length} unpaid customer(s):`, newlyDetectedUnpaidClients);
          }
        }
        
        // Update last seen record IDs
        lastRecordIdsRef.current = currentRecordIds;
        
        // Sort by attendedDateTime descending (newest first)
        const sortedData = [...recordsWithCustomerData].sort((a, b) => {
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
  }, [fetchCustomerData, playNotificationSound]);

  useEffect(() => {
    // Initial fetch
    fetchAttendance();
    
    // Set up interval to fetch every 5 seconds
    const intervalId = setInterval(fetchAttendance, 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchAttendance]);

  const isUnpaid = (record: AttendanceRecordWithCustomer): boolean => {
    const clientId = record.clientId || record.customerId;
    if (!clientId) {
      return false;
    }
    
    // Try to get customer data from record first, then from cache
    let customerData = record.customerData;
    if (!customerData && clientId) {
      customerData = customerDataCache.current.get(clientId) || null;
    }
    
    // Get deactivateAt from customer data first, then fallback to record
    const deactivateAt = customerData?.deactivateAt || record.deactivateAt;
    
    if (!deactivateAt) {
      return false;
    }
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);
      
      const deactivateDate = new Date(deactivateAt);
      deactivateDate.setHours(0, 0, 0, 0);
      deactivateDate.setMinutes(0);
      deactivateDate.setSeconds(0);
      deactivateDate.setMilliseconds(0);
      
      // Check if deactivateAt has PASSED (is before today, not including today)
      // If deactivateAt is before today, the customer is unpaid
      const isExpired = deactivateDate < today;
      
      // Debug log to help troubleshoot
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[isUnpaid] ClientId: ${clientId}, deactivateAt: ${deactivateAt}, deactivateDate: ${deactivateDate.toISOString()}, today: ${today.toISOString()}, isExpired: ${isExpired}, hasCustomerData: ${!!customerData}`);
      }
      
      return isExpired;
    } catch (error) {
      console.error("Error comparing dates in isUnpaid:", error, { deactivateAt, clientId });
      return false;
    }
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
              const clientId = record.clientId || record.customerId;
              // Get customer data from record first, then from cache
              let customerData = record.customerData;
              if (!customerData && clientId) {
                customerData = customerDataCache.current.get(clientId) || null;
              }
              
              // Create record with customer data for checking
              const recordWithData: AttendanceRecordWithCustomer = {
                ...record,
                customerData: customerData || record.customerData || null
              };
              
              const deactivateAt = customerData?.deactivateAt || record.deactivateAt;
              const reference = customerData?.reference || record.reference;
              
              // Check if unpaid - deactivateAt has passed (is before today)
              const unpaid = isUnpaid(recordWithData);
              
              // Debug log for rendering
              if (process.env.NODE_ENV !== 'production' && unpaid) {
                console.log(`[RENDER] Unpaid card for ${clientId}, deactivateAt: ${deactivateAt}`);
              }
              
              // Determine card styling - use inline style as well to ensure it applies
              const cardStyle = unpaid 
                ? { backgroundColor: '#FFE5E5', borderColor: '#FF9999' }
                : { backgroundColor: '#F8F9FA', borderColor: '#E0E0E0' };
              
              const cardClassName = unpaid
                ? "p-[12px] rounded-[10px] p-2 border-2 bg-[#FFE5E5] border-[#FF9999]"
                : "p-[12px] rounded-[10px] p-2 border bg-[#F8F9FA] border-[#E0E0E0]";
              
              return (
                <div
                  key={record._id}
                  className={cardClassName}
                  style={cardStyle}
                  data-unpaid={unpaid}
                  data-deactivate-at={deactivateAt || ''}
                  data-client-id={clientId || ''}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-[#363636]">
                          {record.firstName} {record.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <p className="text-[11px] text-[#6D6D6D]">
                          {clientId || "N/A"}
                        </p>
                        {deactivateAt && (
                          <>
                            <span className="text-[10px] text-[#6D6D6D]">•</span>
                            <span className="text-[11px] text-[#6D6D6D]">
                              {formatDate(deactivateAt)}
                            </span>
                          </>
                        )}
                        {reference && (
                          <>
                            <span className="text-[10px] text-[#6D6D6D]">•</span>
                            <span className="text-[11px] text-[#6D6D6D]">
                              {reference}
                            </span>
                          </>
                        )}
                      </div>
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

