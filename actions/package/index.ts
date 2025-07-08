'use server'
import axios from "@/utils/axios";
// src/actions/packages.ts
import { Package } from "@/types/Packages";
import { CommonResponseDataType } from "@/types/Common";
import { revalidatePath } from "next/cache";

export const fetchAllPackages = async (): Promise<Package[]> => {
  try {
    const response = await axios.get(`/packages/get-all`);
    const rawData = response.data.data;

    const packages: Package[] = rawData.map((item: any) => ({
      packageId: item._id,
      package_name: item.name,
      description: item.description || "",
      sessionCount: item.sessions,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || "",
      isActive: item.isActive ?? true,
      status: item.status || "active",
    }));

        console.log(packages);
    return packages;
  } catch (error: unknown) {
    console.error("Failed to fetch packages. Using dummy data instead.", error);

    const dummyPackages: Package[] = [
    ];

        console.log(dummyPackages);
    return dummyPackages;
  }
};

export interface createNewPackage{
   name :  string,
   description :  string,
   sessions : number,
   durationDays : number,
   price : number
}

export async function createNewPackage(Newpackage:createNewPackage) {
  try {
    const response = await axios.post("/packages",Newpackage);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
}

export const updatePackage = async (
  packageId: string,
  updatedData: Partial<createNewPackage>
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.patch(
      `/customers/${packageId}`,
      updatedData
    );

    revalidatePath(`/packages`);

    return res.data;
  } catch (error) {
    console.error(error);

    return error as CommonResponseDataType;
  }
};



export async function getPackages(): Promise<Package[]> {
  try {
    const response = await axios.get("/packages/get-all");
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    // Return dummy data if API fails
    return [];
  }
}

