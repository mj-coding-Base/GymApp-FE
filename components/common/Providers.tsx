"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import CollectPaymentIndividual from "../dashboard/sheets/CollectPaymentIndividual";
import CollectPaymentGroup from "../dashboard/sheets/CollectPaymentGroup";
import MarkAttendanceIndividual from "../dashboard/sheets/MarkAttendanceIndividual";
import ProfileDetails from "../dashboard/sheets/ProfileDetails";
import ResetPassword from "../dashboard/sheets/ResetPassword";
import CollectPaymentSuccessGroup from "../dashboard/sheets/CollectPaymentSuccessGroup";
import ViewGroupDetails from "../customers/group/ViewGroupDetails";
import ViewGroupMemberProfile from "../customers/group/GroupMemberProfile";
import AddNewGroup from "../customers/group/AddNewGroup";
import UpdateGroupMember from "../customers/group/UpdateGroupMemberDetails";
import TransferMemberToAGroup from "../customers/group/TransferMemberToAGroup";
import TransferMemberToExistingGroup from "../customers/group/TransferMemberToExistingGroup";
import SuccessModal from "./SuccessModal";
import WarningModal from "./WarningModal";
import PaymentCollectionIndividual from "@/components/dashboard/sheets/CollectPaymentIndividual"
// import {PaymentCollectionExtra} from "@/components/dashboard/sheets/PaymentCollectionExtra"
import PaymentCollectionGroup from "@/components/dashboard/sheets/MarkAttendanceGroup"
// import { sampleNotifications } from "@/data/notifications";

const Providers =  () => {
    // const session = await getSession();
  // const notifications = await getNotifications();
  // const notifications = sampleNotifications;
  return (
    <>
      <CollectPaymentIndividual />
      <CollectPaymentGroup />
      <MarkAttendanceIndividual />
      <PaymentCollectionIndividual />
      {/* <PaymentCollectionExtra /> */}
      <PaymentCollectionGroup />
      <ProfileDetails />
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
