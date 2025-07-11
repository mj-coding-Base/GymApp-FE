
import { Badge } from "@/components/ui/badge";
import { useActions } from "@/hooks/modals/useActions";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import { useGroupDetailsStore } from "@/hooks/useGroupDetailsStore";
import { CommonResponseDataType } from "@/types/Common";
import { GroupCustomer } from "@/types/Customer";

interface Props {
  groupMember: GroupCustomer;
}

const GroupDetailsCard = ({ groupMember }: Props) => {
  const {
    setOpenViewGroupDetails,
    setOpenGroupMemberProfile,
    setOpenUpdateGroupMember,
  } = useViewGroupDetails();

  const { setUpdateGroupMemberData } = useGroupDetailsStore();
  const { handleAction } = useActions();

  const dummyAsyncFunction = async (): Promise<CommonResponseDataType> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      status: "SUCCESS",
      message: "Payment approved successfully",
      data: null, // or any dummy data you want to include
    };
  };

  return (
    <div className="border-b-[1px] border-b-[#E0E0E0] p-[15px] bg-white relative">
      <div className="flex flex-col gap-[15px]">
        <div className="flex gap-9">
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Date Registered
            </p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {groupMember.createdAt}
            </p>
          </div>
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Status
            </p>
            <Badge
              variant={
                groupMember.status === "ACTIVE" ? "success" : "destructive"
              }
              className="rounded-[15px] text-[11px]/[13px] font-semibold"
            >
              {groupMember.status === "ACTIVE" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">NIC</p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {groupMember.nic}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            Member
          </p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {`${groupMember.firstName} ${groupMember.lastName}`}
          </p>
        </div>

        <div className="flex gap-9">
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Mobile Number
            </p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {groupMember.mobileNumber}
            </p>
          </div>

          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Relationship
            </p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {groupMember.isPrimaryMember
                ? "Primary Member"
                : groupMember.relationToPrimaryMember}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            Payment Status
          </p>
          <Badge
            variant={groupMember.isPaid ? "success" : "destructive"}
            className="rounded-[15px] text-[11px]/[13px] font-semibold"
          >
            {groupMember.isPaid ? "Paid" : "Not Paid"}
          </Badge>
        </div>
      </div>

      <div className="absolute right-0 inset-y-0 flex flex-col gap-[10px] items-center justify-center">
        <i
          onClick={() => {
            setOpenViewGroupDetails(false);
            setOpenGroupMemberProfile(true);
          }}
          className="view-details w-[32.63px] h-[45px]"
        />
        <i
          onClick={() => {
            setUpdateGroupMemberData(null);
            setOpenViewGroupDetails(false);
            setOpenUpdateGroupMember(true);
          }}
          className="edit-with-bg w-[32.63px] h-[45px]"
        />
        <i
          onClick={() => {
            handleAction(
              async () => dummyAsyncFunction(),
              `Are you sure you want to remove this member from group? This client will move as a individual user.`,
              `Group Member Removed!`,
              "Remove",
              "Done",
              undefined,
              "red",
              `Remove from Group?`,
              `The group member has been successfully removed!`
            );
          }}
          className="remove-from-group w-[32.63px] h-[45px]"
        />
        <i
          onClick={() => {
            handleAction(
              async () => dummyAsyncFunction(),
              `Are you sure you want to deactivate this client?`,
              `The client has been successfully deactivated!`,
              "Deactivate",
              "Done",
              undefined,
              "red"
            );
          }}
          className="deactivate-customer w-[32.63px] h-[45px]"
        />
      </div>
    </div>
  );
};

export default GroupDetailsCard;
