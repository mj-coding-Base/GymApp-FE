"use client";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Toaster } from "react-hot-toast";
import { initializeCacheValidation } from '@/utils/cache-cleanup';

// Load debug utilities in development
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  import('@/utils/debug-multi-tenant').catch(() => {
    // Silently fail if debug utils can't be loaded
  });
}

// 🔒 CRITICAL SECURITY: Initialize cache validation on app startup
if (typeof window !== 'undefined') {
  initializeCacheValidation();
}

// ⚡ PERFORMANCE OPTIMIZATION: Dynamic imports to reduce initial bundle size
// These components are only loaded when actually needed (sheet/modal opens)
const AddNewGroup = dynamic(() => import("../customers/group/AddNewGroup"), { ssr: false });
const ViewGroupMemberProfile = dynamic(() => import("../customers/group/GroupMemberProfile"), { ssr: false });
const TransferMemberToAGroup = dynamic(() => import("../customers/group/TransferMemberToAGroup"), { ssr: false });
const TransferMemberToExistingGroup = dynamic(() => import("../customers/group/TransferMemberToExistingGroup"), { ssr: false });
const UpdateGroupMember = dynamic(() => import("../customers/group/UpdateGroupMemberDetails"), { ssr: false });
const ViewGroupDetails = dynamic(() => import("../customers/group/ViewGroupDetails"), { ssr: false });
const CollectPaymentGroup = dynamic(() => import("../dashboard/sheets/CollectPaymentGroup"), { ssr: false });
const CollectPaymentIndividual = dynamic(() => import("../dashboard/sheets/CollectPaymentIndividual"), { ssr: false });
const CollectPaymentSuccessGroup = dynamic(() => import("../dashboard/sheets/CollectPaymentSuccessGroup"), { ssr: false });
const MarkAttendanceGroup = dynamic(() => import("../dashboard/sheets/MarkAttendanceGroup"), { ssr: false });
const MarkAttendanceIndividual = dynamic(() => import("../dashboard/sheets/MarkAttendanceIndividual"), { ssr: false });
const ProfileDetails = dynamic(() => import("../dashboard/sheets/ProfileDetails"), { ssr: false });
const ResetPassword = dynamic(() => import("../dashboard/sheets/ResetPassword"), { ssr: false });
const SuccessModal = dynamic(() => import("./SuccessModal"), { ssr: false });
const WarningModal = dynamic(() => import("./WarningModal"), { ssr: false });

const Providers =  () => {
  return (
    <>
    <Suspense fallback="Loading...">
      <CollectPaymentIndividual  />
      <CollectPaymentGroup />
      <MarkAttendanceIndividual />
      <MarkAttendanceGroup />
      <ProfileDetails  />
      <ResetPassword />
      <CollectPaymentSuccessGroup />
      <ViewGroupDetails />
      <ViewGroupMemberProfile />
      <UpdateGroupMember />
      <AddNewGroup />
      <TransferMemberToAGroup />
      <TransferMemberToExistingGroup />
      <SuccessModal />
      <WarningModal />
    </Suspense>

      <Toaster
        position="top-right"
        containerStyle={{
          zIndex: 214748364743432,
        }}
      />
    </>
  );
};

export default Providers;
