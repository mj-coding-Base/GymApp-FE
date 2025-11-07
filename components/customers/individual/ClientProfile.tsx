"use client";

import { getProfilePictureUrl, getUserPaymentsId } from "@/actions/customers";
import { getUserAttendance } from "@/actions/session";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import useUserDetails from "@/hooks/useUserDetails";
import { AttendanceHistory, IndividualCustomer, PaymentHistory } from "@/types/Customer";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

interface ViewClientProfileProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  customer: IndividualCustomer;
}

const ViewClientProfile = ({
  isOpen,
  setIsOpen,
  customer,
}: ViewClientProfileProps) => {
  const [paymentData, setPaymentData] = useState<PaymentHistory[] | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceHistory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const { user } = useUserDetails();
  const isAdmin = user?.isAdmin === true || user?.isAdmin === "true" || user?.isAdmin === 1;
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    getUserPaymentsId(customer.clientId)
      .then((response) => {
        setPaymentData(response);
      })
      .finally(() => setLoading(false));
  }, [customer._id, customer.clientId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    getUserAttendance(customer.clientId)
      .then((response) => {
        setAttendanceData(response);
      })
      .finally(() => setLoading(false));
  }, [customer.clientId, isOpen]);

  // Load profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!customer?.clientId || !isOpen) return;

      try {
        const url = await getProfilePictureUrl(customer.clientId);
        setProfileImageUrl(url);
      } catch (error) {
        // Silently fail - customer may not have a profile picture
        console.warn('Failed to load profile picture:', error);
        setProfileImageUrl(null);
      }
    };

    fetchProfilePicture();

    // Cleanup: revoke object URL when component unmounts or closes
    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [customer?.clientId, isOpen, profileImageUrl]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        hideClose={true}
        className="rounded-t-2xl min-h-[600px] max-h-[calc(100%-40px)] px-[14px] pt-[14px] gap-0"
      >
        <SheetHeader className="hidden">
          <SheetTitle className="text-[14px] font-semibold text-[#363636] text-center">
            Client Profile
          </SheetTitle>
        </SheetHeader>
        <SheetClose className="flex gap-[5px] mb-[25px]">
          <i className="back-icon size-4 text-[#1D1B20]" />
          <p className="text-[11.2px]/[14px]">Back</p>
        </SheetClose>
        <h1 className="text-[14.4px]/[17px] font-medium text-[#363636] text-center">
          Client Profile
        </h1>
        <div className="overflow-y-auto">
          {/* Profile Picture */}
          {profileImageUrl && (
            <div className="flex justify-center mt-[16px] mb-[16px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileImageUrl}
                alt={`${customer.firstName} ${customer.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
            </div>
          )}
          
          <div className="mt-[16px] border-[1px] border-[#000000] rounded-[12px] overflow-hidden">
            <div className="flex border-b-[1px] border-b-[#000000]">
              <div className="flex-[35%] shrink-0 px-[10px] py-[7.8px] border-l-[1px]  content-center flex flex-col gap-[9px]">
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  Name
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {`${customer.firstName} ${customer.lastName}`}
                </p>
              </div>
              <div className={`flex-[20%] shrink-0 px-[10px] py-[7.8px] ${isAdmin ? 'border-l-[1px] border-l-[#000000]' : ''} content-center flex flex-col gap-[9px]`}>
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  User ID
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {customer.clientId}
                </p>
              </div>
              {isAdmin && (
                <div className="flex-[45%] shrink-0 px-[10px] py-[7.8px] border-l-[1px] border-l-[#000000] content-center flex flex-col gap-[9px]">
                  <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                    Email
                  </p>
                  <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                    {customer.email}
                  </p>
                </div>
              )}
            </div>
            <div className="flex">
              {isAdmin && (
                <div className="flex-[35%] shrink-0 px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                  <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                    NIC
                  </p>
                  <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                    {customer.nic}
                  </p>
                </div>
              )}
              <div className={`flex-[25%] shrink-0 px-[10px] py-[7.8px] ${isAdmin ? 'border-x-[1px] border-x-[#000000]' : ''} content-center flex flex-col gap-[9px]`}>
                <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                  Dactivation Date
                </p>
                <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                  {customer.deactivateAt?.slice(0, 10)}
                </p>
              </div>
              {isAdmin && (
                <div className="flex-[40%] shrink-0 px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                  <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                    Mobile
                  </p>
                  <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold">
                    {customer.mobileNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details Dropdown */}
          {isAdmin && (
            <div className="mt-[16px]">
              <button
                type="button"
                onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                className="w-full flex items-center justify-between border-[1px] border-[#000000] bg-white hover:bg-gray-50 rounded-[12px] h-[41px] px-[12px] sm:px-[16px] transition-colors"
              >
                <span className="text-[11px]/[14px] sm:text-[12px]/[15px] font-medium text-[#363636] text-left truncate flex-1 mr-2">
                  {showAdditionalDetails ? "Hide Additional Details" : "Show Additional Details"}
                </span>
                {showAdditionalDetails ? (
                  <ChevronUp className="w-4 h-4 text-[#363636] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#363636] shrink-0" />
                )}
              </button>

              {showAdditionalDetails && (
                <div className="mt-[12px] border-[1px] border-[#000000] rounded-[12px] overflow-hidden">
                  <div className="flex flex-col sm:flex-row border-b-[1px] border-b-[#000000]">
                    <div className="flex-[50%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px] sm:border-r-0 border-b-[1px] sm:border-b-0 border-b-[#000000] sm:border-r-[1px] sm:border-r-[#000000]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Date of Birth
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.dob ? new Date(customer.dob).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="flex-[50%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Gender
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.isMale ? "Male" : "Female"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row border-b-[1px] border-b-[#000000]">
                    <div className="flex-[50%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px] sm:border-r-0 border-b-[1px] sm:border-b-0 border-b-[#000000] sm:border-r-[1px] sm:border-r-[#000000]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Marital Status
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.isMarried ? "Married" : "Single"}
                      </p>
                    </div>
                    <div className="flex-[50%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Profession
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.profession || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex border-b-[1px] border-b-[#000000]">
                    <div className="flex-[100%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Why Join
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.whyJoin || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex border-b-[1px] border-b-[#000000]">
                    <div className="flex-[100%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Reference
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.reference || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-[50%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px] sm:border-r-0 border-b-[1px] sm:border-b-0 border-b-[#000000] sm:border-r-[1px] sm:border-r-[#000000]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Address Line 1
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.addressLine1 || "N/A"}
                      </p>
                    </div>
                    <div className="flex-[50%] shrink-0 px-[10px] sm:px-[10px] py-[7.8px] content-center flex flex-col gap-[9px]">
                      <p className="text-[#6D6D6D] text-[11.5px]/[14px] font-medium">
                        Address Line 2
                      </p>
                      <p className="text-[#3D3D3D] text-[12px]/[15px] font-semibold break-words">
                        {customer.addressLine2 || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="mt-[16px] mb-[13.5px] text-[12px]/[15px] text-[#888888] font-semibold">
            Payment History
          </p>
          {loading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <i className="size-[45px] animate-spin loading-icon" />
            </div>
          ) : (
            <div className="border-[#EEEEEE] border-[0.9px] rounded-[15px] overflow-hidden">
              <div className=" flex bg-[#F5F5F5] px-[13.5px] py-[15.5px]">
                <p className="w-[28.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment Date
                </p>
                <p className="w-[20.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Month
                </p>
                <p className="w-[28.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Payment ID
                </p>
                <p className="w-[20.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Amount
                </p>
              </div>
              {paymentData && paymentData.length === 0 && (
                <div className="px-[13.5px] py-[32px] text-center border-t-[#E7E7E7] border-t-[1px]">
                  <p className="text-[12px] text-[#888888]">No payment history found</p>
                </div>
              )}
              {paymentData?.map((item) => (
                <div
                  key={item._id}
                  className="flex px-[13.5px] py-[18px] border-t-[#E7E7E7] border-t-[1px]"
                >
                  <p className="w-[28.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.createdAt.slice(0, 10)}
                  </p>
                  <p className="w-[20.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.month}
                  </p>
                  <p className="w-[28.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.paymentId}
                  </p>
                  <p className="w-[20.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    LKR {item.amount}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-[16px] mb-[13.5px] text-[12px]/[15px] text-[#888888] font-semibold">
            Attendance History
          </p>
          {loading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <i className="size-[45px] animate-spin loading-icon" />
            </div>
          ) : (
            <div className="border-[#EEEEEE] border-[0.9px] rounded-[15px] overflow-hidden">
              <div className=" flex bg-[#F5F5F5] px-[13.5px] py-[15.5px]">
                <p className="w-[29.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Date
                </p>
                <p className="w-[33.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Day
                </p>
                <p className="w-[33.5%] text-[11px]/[14px] font-medium text-[#212121]">
                  Time
                </p>
              </div>
              {attendanceData?.map((item) => (
                <div
                  key={item._id}
                  className="flex px-[13.5px] py-[18px] border-t-[#E7E7E7] border-t-[1px]"
                >
                  <p className="w-[29.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {item.attendedDateTime.slice(0,10)}
                  </p>
                  <p className="w-[33.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {new Date(item.attendedDateTime).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                  <p className="w-[33.5%] text-[12px]/[13.5px] font-normal text-[#212121]">
                    {new Date(item.attendedDateTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewClientProfile;