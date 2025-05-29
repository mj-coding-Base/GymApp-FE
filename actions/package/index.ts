import axios from "@/utils/axios";
import { z } from "zod";
// src/actions/packages.ts
import { Package } from "@/types/Packages";
import { PackageData } from "@/types/Packages";
import { MemberData } from "@/types/Packages";

export const fetchAllPackages = async (): Promise<Package[]> => {
  try {
    const response = await axios.get(`/packages/get-all`);
    const rawData = response.data.data;

    const packages: Package[] = rawData.map((item: any) => ({
      packageId: item._id,
      packageName: item.name,
      description: item.description || "",
      sessionCount: item.sessions,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || "",
      isActive: item.isActive ?? true,
      status: item.status || "active",
    }));

    return packages;
  } catch (error: unknown) {
    console.error("Failed to fetch packages. Using dummy data instead.", error);

    const dummyPackages: Package[] = [
      {
        packageId: "6830a79f752e9e2af9e82d07",
        packageName: "Basic Package",
        description: "Introductory sessions for beginners.",
        sessionCount: 5,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
        isActive: true,
        status: "active",
      },
      {
        packageId: "6830a9002d012bd53631011e",
        packageName: "Premium Package",
        description: "Advanced training sessions.",
        sessionCount: 10,
        createdAt: "2024-01-10",
        updatedAt: "2024-01-11",
        isActive: true,
        status: "active",
      },
    ];

    return dummyPackages;
  }
};




export const packageSchema = z.object({
  packageName: z.string().min(1, "Package name is required"),
  sessionsAllocated: z.number().min(1, "Must allocate at least 1 session"),
});

export type PackageFormData = z.infer<typeof packageSchema>;

export async function createNewPackage(data: PackageFormData): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
  data?: any;
}> {
  try {
    const response = await axios.post("/packages", {
      name: data.packageName,
      sessionCount: data.sessionsAllocated,
    });

    return {
      status: "SUCCESS",
      message: "Package created successfully",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Failed to create package:", error);
    return {
      status: "FAIL",
      message: error.response?.data?.message || "Failed to create package",
    };
  }
}

export async function getPackageMembers(packageId: string): Promise<MemberData[]> {
  try {
    const response = await axios.get(`/packages/${packageId}/members`);
    return response.data.map((member: any) => ({
      id: member._id,
      dateRegistered: new Date(member.registeredAt).toLocaleDateString('en-GB'),
      clientName: `${member.firstName} ${member.lastName}`,
      currentSession: member.sessionCount,
      clientType: member.type,
      nic: member.nic,
    }));
  } catch (error) {
    console.error("Failed to fetch package members:", error);
    // Return dummy data if API fails
    return [
      {
        id: "1",
        dateRegistered: "03/03/25",
        clientName: "Isuru Sampath",
        currentSession: 11,
        clientType: "Individual",
        nic: "123456789",
      },
      // Add more dummy members as needed
    ];
  }
}



export async function getPackages(): Promise<PackageData[]> {
  try {
    const response = await axios.get("/packages");
    return response.data.map((pkg: any) => ({
      id: pkg._id,
      dateCreated: new Date(pkg.createdAt).toLocaleDateString('en-GB'),
      packageName: pkg.name,
      sessions: pkg.sessionCount,
      members: pkg.memberCount,
    }));
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    // Return dummy data if API fails
    return [
      {
        id: "1",
        dateCreated: "06/03/25",
        packageName: "BoxFit Extreme",
        sessions: 15,
        members: 120,
      },
      
    ];
  }
}


export const updatePackageSchema = z.object({
  packageName: z.string().min(1),
  sessions: z.number().min(1),
});

export type UpdatePackageData = z.infer<typeof updatePackageSchema>;

export async function updatePackage(
  packageId: string,
  data: UpdatePackageData
): Promise<{
  status: "SUCCESS" | "FAIL";
  message?: string;
}> {
  try {
    await axios.put(`/packages/${packageId}`, {
      name: data.packageName,
      sessionCount: data.sessions,
    });

    return {
      status: "SUCCESS",
      message: "Package updated successfully",
    };
  } catch (error: any) {
    console.error("Failed to update package:", error);
    return {
      status: "FAIL",
      message: error.response?.data?.message || "Failed to update package",
    };
  }
}