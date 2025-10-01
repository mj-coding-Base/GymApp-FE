"use client";
import { Suspense } from 'react';
import { Toaster } from "react-hot-toast";
import AddNewGroup from "../customers/group/AddNewGroup";
import ViewGroupMemberProfile from "../customers/group/GroupMemberProfile";
import TransferMemberToAGroup from "../customers/group/TransferMemberToAGroup";
import TransferMemberToExistingGroup from "../customers/group/TransferMemberToExistingGroup";
import UpdateGroupMember from "../customers/group/UpdateGroupMemberDetails";
import ViewGroupDetails from "../customers/group/ViewGroupDetails";
import CollectPaymentGroup from "../dashboard/sheets/CollectPaymentGroup";
import CollectPaymentIndividual from "../dashboard/sheets/CollectPaymentIndividual";
import CollectPaymentSuccessGroup from "../dashboard/sheets/CollectPaymentSuccessGroup";
import MarkAttendanceGroup from "../dashboard/sheets/MarkAttendanceGroup";
import MarkAttendanceIndividual from "../dashboard/sheets/MarkAttendanceIndividual";
import ProfileDetails from "../dashboard/sheets/ProfileDetails";
import ResetPassword from "../dashboard/sheets/ResetPassword";
import SuccessModal from "./SuccessModal";
import WarningModal from "./WarningModal";

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
