"use client";

import { getCustomerByClientId } from "@/actions/customers";
import { fetchTodayAttendance, TodayAttendanceRecord } from "@/actions/dashboard";
import useUserDetails from "@/hooks/useUserDetails";
import { IndividualCustomer } from "@/types/Customer";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import WhiteCard from "./WhiteCard";

type AttendanceRecordWithCustomer = TodayAttendanceRecord & {
  customerData?: IndividualCustomer | null;
};

const TodayAttendance = () => {
  const { user } = useUserDetails();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const lastRecordIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const customerDataCache = useRef<Map<string, IndividualCustomer | null>>(new Map());
  const notifiedUnpaidClientsRef = useRef<Set<string>>(new Set());
  const userHasInteractedRef = useRef<boolean>(false);
  const audioPlaybackBlockedRef = useRef<boolean>(false);
  
  // Check if user should fetch attendance data
  // Only fetch if isAdmin = false AND isFullTime = false (part-time staff only)
  const shouldFetchAttendance = Boolean(
    user && 
    user.isAdmin === false && 
    user.isFullTime === false
  );
  
  // Audio toggle state - load from localStorage on mount
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('attendance-audio-enabled');
      // Default to true if not set (backward compatibility)
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  
  // Strong state management: Map to hold all records for today by ID
  const todayRecordsMapRef = useRef<Map<string, AttendanceRecordWithCustomer>>(new Map());
  const currentDayRef = useRef<string>('');
  
  // Helper function to get current day string (YYYY-MM-DD)
  const getCurrentDayString = useCallback((): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
  
  // Helper function to check if a record belongs to today
  const isRecordFromToday = useCallback((attendedDateTime: string): boolean => {
    try {
      const recordDate = new Date(attendedDateTime);
      const today = new Date();
      
      return (
        recordDate.getFullYear() === today.getFullYear() &&
        recordDate.getMonth() === today.getMonth() &&
        recordDate.getDate() === today.getDate()
      );
    } catch {
      return false;
    }
  }, []);
  
  // Reset state when day changes
  const resetForNewDay = useCallback(() => {
    console.log('[ATTENDANCE] Day changed - resetting state');
    todayRecordsMapRef.current.clear();
    lastRecordIdsRef.current.clear();
    notifiedUnpaidClientsRef.current.clear();
    customerDataCache.current.clear();
    setAttendanceRecords([]);
    currentDayRef.current = getCurrentDayString();
  }, [getCurrentDayString]);
  
  // Check for day change and reset if needed
  const checkAndHandleDayChange = useCallback(() => {
    const currentDay = getCurrentDayString();
    if (currentDayRef.current && currentDayRef.current !== currentDay) {
      resetForNewDay();
    } else if (!currentDayRef.current) {
      // Initialize on first run
      currentDayRef.current = currentDay;
    }
  }, [getCurrentDayString, resetForNewDay]);

  // Initialize audio for notification sound and track user interaction
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
      
      // Track user interaction to enable audio playback
      const handleUserInteraction = () => {
        userHasInteractedRef.current = true;
        // Remove listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
      
      // Listen for user interaction
      document.addEventListener('click', handleUserInteraction, { once: true });
      document.addEventListener('keydown', handleUserInteraction, { once: true });
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      
      return () => {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    // Check if audio is enabled via toggle
    if (!audioEnabled) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUDIO] Audio disabled by user toggle - skipping notification');
      }
      return;
    }
    
    // If audio playback was previously blocked, skip audio and use speech synthesis
    if (audioPlaybackBlockedRef.current) {
      if (globalThis.speechSynthesis !== undefined) {
        const utterance = new SpeechSynthesisUtterance('Gym subscription is not paid');
        utterance.lang = 'en-US';
        globalThis.speechSynthesis.speak(utterance);
      }
      return;
    }
    
    // Try to play audio if user has interacted and audio element exists
    if (audioRef.current && userHasInteractedRef.current) {
      // Reset audio to beginning in case it was already played
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        // Check if it's a NotAllowedError (autoplay blocked)
        if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
          // Mark audio as blocked and use speech synthesis
          audioPlaybackBlockedRef.current = true;
          if (globalThis.speechSynthesis !== undefined) {
            const utterance = new SpeechSynthesisUtterance('Gym subscription is not paid');
            utterance.lang = 'en-US';
            globalThis.speechSynthesis.speak(utterance);
          }
        } else {
          // Other errors - log only in development
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error playing audio:', error);
          }
          // Fallback to speech synthesis
          if (globalThis.speechSynthesis !== undefined) {
            const utterance = new SpeechSynthesisUtterance('Gym subscription is not paid');
            utterance.lang = 'en-US';
            globalThis.speechSynthesis.speak(utterance);
          }
        }
      });
    } else if (globalThis.speechSynthesis !== undefined) {
      // Use speech synthesis if audio not available or user hasn't interacted
      const utterance = new SpeechSynthesisUtterance('Gym subscription is not paid');
      utterance.lang = 'en-US';
      globalThis.speechSynthesis.speak(utterance);
    }
  }, [audioEnabled]);

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
    // Only fetch if user is not admin and not full-time
    if (!shouldFetchAttendance) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[ATTENDANCE] Skipping fetch - user isAdmin:', user?.isAdmin, 'isFullTime:', user?.isFullTime);
      }
      setLoading(false);
      return;
    }
    
    try {
      // Check for day change first
      checkAndHandleDayChange();
      
      const data = await fetchTodayAttendance();
      
      if (Array.isArray(data)) {
        // Filter only records from today
        const todayRecords = data.filter(record => isRecordFromToday(record.attendedDateTime));
        
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ATTENDANCE] Fetched ${data.length} total records, ${todayRecords.length} from today`);
        }
        
        // Check for new records
        const currentRecordIds = new Set(todayRecords.map(record => record._id));
        const newRecordIds = todayRecords
          .map(record => record._id)
          .filter(id => !todayRecordsMapRef.current.has(id));
        
        if (process.env.NODE_ENV !== 'production' && newRecordIds.length > 0) {
          console.log(`[ATTENDANCE] Found ${newRecordIds.length} new record(s):`, newRecordIds);
        }
        
        // Fetch customer data for all records (including existing ones to ensure data is up-to-date)
        const recordsWithCustomerData: AttendanceRecordWithCustomer[] = await Promise.all(
          todayRecords.map(async (record) => {
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
        
        // Merge new records into the persistent map (update existing, add new)
        for (const record of recordsWithCustomerData) {
          todayRecordsMapRef.current.set(record._id, record);
        }
        
        // Check for unpaid customers after fetching their data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        
        // Check each record for unpaid status and play sound when unpaid attendance record is fetched
        const newlyDetectedUnpaidClients: string[] = [];
        const isNewRecord = (recordId: string) => !lastRecordIdsRef.current.has(recordId);
        
        for (const record of recordsWithCustomerData) {
          const clientId = record.clientId || record.customerId;
          if (!clientId) continue;
          
          const customerData = record.customerData || customerDataCache.current.get(clientId);
          const deactivateAt = customerData?.deactivateAt || record.deactivateAt;
          
          if (!deactivateAt) continue;
          
          const deactivateDate = new Date(deactivateAt);
          deactivateDate.setHours(0, 0, 0, 0);
          deactivateDate.setMinutes(0);
          deactivateDate.setSeconds(0);
          deactivateDate.setMilliseconds(0);
          
          // Check if date has PASSED (before today)
          const isUnpaid = deactivateDate < today;
          
          if (!isUnpaid) continue;
          
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
        }
        
        // Play sound when unpaid user attendance record is fetched
        if (newlyDetectedUnpaidClients.length > 0) {
          playNotificationSound();
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[AUDIO] Playing notification for ${newlyDetectedUnpaidClients.length} unpaid customer(s):`, newlyDetectedUnpaidClients);
          }
        }
        
        // Update last seen record IDs
        lastRecordIdsRef.current = currentRecordIds;
        
        // Get all records from the persistent map and sort by attendedDateTime descending (newest first)
        const allTodayRecords = Array.from(todayRecordsMapRef.current.values());
        const sortedData = [...allTodayRecords].sort((a, b) => {
          const dateA = new Date(a.attendedDateTime).getTime();
          const dateB = new Date(b.attendedDateTime).getTime();
          return dateB - dateA;
        });
        
        // Update state with ALL records from today (no limit)
        setAttendanceRecords(sortedData);
        
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ATTENDANCE] State updated with ${sortedData.length} total record(s) for today`);
        }
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchCustomerData, playNotificationSound, checkAndHandleDayChange, isRecordFromToday, shouldFetchAttendance, user]);

  useEffect(() => {
    // Only set up polling if user should fetch attendance
    if (!shouldFetchAttendance) {
      setLoading(false);
      return;
    }
    
    // Initialize current day
    currentDayRef.current = getCurrentDayString();
    
    // Initial fetch
    fetchAttendance();
    
    // Set up interval to fetch every 2.5 seconds
    const intervalId = setInterval(fetchAttendance, 2500);
    
    // Set up day change checker - check every minute to detect day change
    const dayCheckIntervalId = setInterval(() => {
      checkAndHandleDayChange();
    }, 60000); // Check every minute
    
    // Set up midnight reset - calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeoutId = setTimeout(() => {
      resetForNewDay();
      // After reset, fetch new day's attendance
      fetchAttendance();
    }, msUntilMidnight);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(dayCheckIntervalId);
      clearTimeout(midnightTimeoutId);
    };
  }, [fetchAttendance, getCurrentDayString, checkAndHandleDayChange, resetForNewDay, shouldFetchAttendance]);

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

  // Toggle audio on/off and save to localStorage
  const toggleAudio = useCallback(() => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('attendance-audio-enabled', String(newValue));
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIO] Audio ${newValue ? 'enabled' : 'disabled'} by user`);
    }
  }, [audioEnabled]);

  return (
    <WhiteCard className="flex flex-col gap-[10px]">
      <div className="flex gap-[5px] w-full items-center justify-between">
        <div className="flex gap-[5px] items-center">
          <i className="calendar-icon size-[18px] text-[#3D3D3D]" />
          <h1 className="text-[12px] font-medium text-[#3D3D3D]">Today Attendance</h1>
        </div>
        
        {/* Audio Toggle Button */}
        <button
          onClick={toggleAudio}
          className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          title={audioEnabled ? 'Disable audio notifications' : 'Enable audio notifications'}
          aria-label={audioEnabled ? 'Disable audio notifications' : 'Enable audio notifications'}
        >
          {audioEnabled ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <span className="text-[10px] text-green-600 font-medium">ON</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
              <span className="text-[10px] text-gray-400 font-medium">OFF</span>
            </>
          )}
        </button>
      </div>
      
      <div className="h-[600px] overflow-y-auto pr-2">
        {(() => {
          // Show message if user is admin or full-time (should not fetch)
          if (!shouldFetchAttendance) {
            return (
              <div className="flex items-center justify-center h-full">
                <p className="text-[12px] text-[#6D6D6D]">
                  Attendance tracking is only available for part-time staff
                </p>
              </div>
            );
          }
          
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

