import { Badge } from "@/components/ui/badge";
import { useViewGroupDetails } from "@/hooks/useGroupDetailsSheet";
import { useGroupDetailsStore } from "@/hooks/useGroupDetailsStore";
import { GroupShort } from "@/types/Customer";
interface Props {
  group: GroupShort;
}

const GroupCard = ({ group }: Props) => {
  const { setOpenViewGroupDetails } = useViewGroupDetails();
  const { setSelectedGroupData } = useGroupDetailsStore();

  const formattedDate = group.createdAt
    ? new Date(group.createdAt).toISOString().split("T")[0]
    : "N/A";

  return (
    <div className="border border-b border-[#DAD9DE] p-[15px] bg-white relative">
      <div className="flex flex-col gap-[15px]">
        <div className="flex gap-9">
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Date Registered
            </p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {formattedDate}
            </p>
          </div>
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Status
            </p>
            <Badge
              variant={group.status === "ACTIVE" ? "success" : "destructive"}
              className="rounded-[15px] text-[11px]/[13px] font-semibold"
            >
              {group.status === "ACTIVE" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            No. of Members
          </p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {group.number_of_members}
          </p>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
            Group Member
          </p>
          <p className="text-[12px]/[15px] text-[#434745] font-medium">
            {group.primaryMember}
          </p>
        </div>

        <div className="flex gap-9">
          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">Group ID</p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {group._id}
            </p>
          </div>

          <div className="flex flex-col gap-[5px]">
            <p className="text-[10px]/[12px] text-[#6D6D6D] font-medium">
              Package
            </p>
            <p className="text-[12px]/[15px] text-[#434745] font-medium">
              {group.package_name}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-0 inset-y-0 flex flex-col gap-[10px] items-center justify-center">
        <i
          onClick={() => {
            setSelectedGroupData(group._id);
            setOpenViewGroupDetails(true);
          }}
          className="view-details w-[40px] h-[50px]"
        />
      </div>
    </div>
  );
};

export default GroupCard;