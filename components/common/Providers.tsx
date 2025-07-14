"use client";

import PaymentCollectionIndividual from "@/components/dashboard/sheets/CollectPaymentIndividual";
import PaymentCollectionGroup from "@/components/dashboard/sheets/MarkAttendanceGroup";
import { Toaster } from "react-hot-toast";
import AddNewGroup from "../customers/group/AddNewGroup";
import ViewGroupMemberProfile from "../customers/group/GroupMemberProfile";
import TransferMemberToAGroup from "../customers/group/TransferMemberToAGroup";
import TransferMemberToExistingGroup from "../customers/group/TransferMemberToExistingGroup";
import UpdateGroupMember from "../customers/group/UpdateGroupMemberDetails";
// import ViewGroupDetails from "../customers/group/ViewGroupDetails";
import CollectPaymentGroup from "../dashboard/sheets/CollectPaymentGroup";
import CollectPaymentIndividual from "../dashboard/sheets/CollectPaymentIndividual";
import CollectPaymentSuccessGroup from "../dashboard/sheets/CollectPaymentSuccessGroup";
import MarkAttendanceIndividual from "../dashboard/sheets/MarkAttendanceIndividual";
import ProfileDetails from "../dashboard/sheets/ProfileDetails";
import ResetPassword from "../dashboard/sheets/ResetPassword";
import SuccessModal from "./SuccessModal";
import WarningModal from "./WarningModal";
import { Suspense } from "react";
// import { sampleNotifications } from "@/data/notifications";

const Providers =  () => {
    // const session = await getSession();
  // const notifications = await getNotifications();
  // const notifications = sampleNotifications;
  return (
    <>
      <Suspense fallback={null}>
      <CollectPaymentIndividual />
      <CollectPaymentGroup />
      <MarkAttendanceIndividual />
      <PaymentCollectionIndividual />
      <PaymentCollectionGroup />
      <ProfileDetails />
      <ResetPassword />
      <CollectPaymentSuccessGroup />
      {/* <ViewGroupDetails /> */}
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
