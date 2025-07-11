// "use client";


// import Link from "next/link";
// import { usePathname } from "next/navigation";

// import { sidebarData } from "@/data/sidebar";
// import { cn } from "@/lib/utils";

// const MobileSidebar = () => {
//   const pathname = usePathname();

//   return (
//     <div className="flex flex-row items-center justify-between w-full h-[60px] sticky top-[49px] z-50 bg-white">
//       {sidebarData.map((item) => (
//         <Link
//           key={item.id}
//           href={item.url}
//           className={cn(
//             "size-full w-1/6 min-h-[60px] group shrink-0 h-full flex flex-col justify-center items-center gap-0.5",
//             pathname.split("/")[1] === item.url.split("/")[1]
//               ? "text-[#FFFFFF] text-[9px] font-[500px] bg-[#F04237]"
//               : "text-[#4C4E64] text-[9px] font-[400px]"
//           )}
//           prefetch={false}
//         >
//           <i
//             className={cn(
//               "size-6 shrink-0",
//               item.icon,
//               pathname.split("/")[1] === item.url.split("/")[1]
//                 ? "text-[#FFFFFF] text-[9px] font-[500px]"
//                 : "text-[#4C4E64] text-[9px] font-[400px]"
//             )}
//           />
//           <span>{item.title}</span>
//         </Link>
//       ))}
//     </div>
//   );
// };

// export default MobileSidebar;
