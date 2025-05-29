import Navbar from "@/components/common/navbar/Navbar";
import MobileSidebar from "@/components/common/sidebar/MobileSidebar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { sampleNotifications } from "@/data/notifications";
import { getSession } from "@/lib/authentication";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  // const notifications = await getNotifications();
  const notifications = sampleNotifications;

  if (!session) {
    return (
      <div className="m-auto flex items-center justify-center w-screen h-screen bg-[#FAFAFA]">
        <i className="loading-icon size-[30px] lg:size-[33.75px] 3xl:size-[45px] animate-spin" />
      </div>
    );
  }

  // TODO-
  // const filteredSidebarData = sidebarData.filter(
  //   (item) =>
  //     session.user.privileges.includes(item.value) ||
  //     (item.value === Privileges.CUSTOMERS &&
  //       session.user.privileges.includes(Privileges.MEMBERS))
  // );

  return (
    <SessionProvider session={session} notifications={notifications}>
      <div className="flex w-full h-screen overflow-y-auto overflow-x-hidden z-0">
        <div className="flex flex-col w-full bg-[#F2F3F6] overflow-y-auto">
          <Navbar />
          <MobileSidebar />
          <div className="px-4 py-[8.44px] lg:px-6 lg:py-[17.5px] 3xl:px-8 3xl:py-[23.5px] w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
