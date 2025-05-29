/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef } from "react";

import Cropper from "react-easy-crop";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(
        new File(
          [blob as any],
          `${Math.random().toString(36).substring(7)}.jpeg`,
          { type: "image/jpeg" }
        )
      );
    }, "image/jpeg");
  });
};

interface Props {
  imgURL: string;
}

const ProfileImageUpload: React.FC<Props> = ({ imgURL }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(imgURL);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();

      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setIsDialogOpen(true);
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          return 100;
        }

        return prev + 10;
      });
    }, 500);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    if (originalImage && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(
        originalImage,
        croppedAreaPixels
      );

      const data = new FormData();

      data.append("files", croppedImage as Blob);

      // const res = await updateProfileImage(data);

      // if (res.status === "FAIL") {
      //   toast({
      //     title: res.message || "Failed to update profile picture",
      //     variant: "error",
      //   });

      //   setIsUploading(false);
      //   setIsDialogOpen(false);
      //   setUploadProgress(0);
      //   setOriginalImage(null);
      //   setCroppedAreaPixels(null);
      //   setCrop({ x: 0, y: 0 });

      //   return;
      // }

      window.location.reload();
      setAvatarUrl(URL.createObjectURL(croppedImage as Blob));
    }

    setIsUploading(false);
    setIsDialogOpen(false);
    setUploadProgress(0);
    setOriginalImage(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center gap-4 lg:gap-3 3xl:gap-4">
      <div className="relative cursor-pointer" onClick={handleAvatarClick}>
        <Avatar className="size-[81px] border-[5px] border-[#F2F6FC] cursor-pointer">
          <AvatarImage src={avatarUrl || ""} alt="Profile picture" />
          <AvatarFallback>
            <Skeleton className="size-20 lg:size-[15px] 3xl:size-20 rounded-full" />
          </AvatarFallback>
        </Avatar>
        <i className="profile-image-edit-icon size-[31px] lg:size-[23.25px] 3xl:size-[31px] absolute bottom-0 right-0 border-white border-[1.5px] rounded-full" />
      </div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border border-[#363A3D] bg-[#131619D9]">
          <DialogHeader>
            <DialogTitle className="text-[#DCDCDC]">
              Edit Profile Picture
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64">
            {originalImage && (
              <Cropper
                image={originalImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={simulateUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
          {isUploading && (
            <Progress
              value={uploadProgress}
              className="w-full mt-4 lg:mt-3 3xl:mt-4 h-2 lg:h-1.5 3xl:h-2"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileImageUpload;
