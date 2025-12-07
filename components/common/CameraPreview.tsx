"use client";

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Camera, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

interface CameraPreviewProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  open,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera when dialog opens
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Set video source when stream is available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error('Error playing video:', err);
        setError('Failed to start camera preview');
      });
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setError(null);
      setCapturedImage(null);
      setCapturedBlob(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // Use front camera
      });
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    // Clean up blob URLs
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setCapturedBlob(null);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            // Store both the blob and the URL
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
            setCapturedBlob(blob);
            // Stop the camera stream
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              setStream(null);
            }
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const retakePhoto = async () => {
    // Clean up previous capture
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setCapturedBlob(null);
    // Restart camera
    await startCamera();
  };

  const handleUsePhoto = () => {
    if (capturedBlob) {
      // Create File from blob
      const file = new File([capturedBlob], 'camera-capture.jpg', { type: 'image/jpeg' });
      onCapture(file);
      // Clean up
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
      stopCamera();
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-lg">Take Photo</DialogTitle>
          <DialogDescription className="text-sm">
            Position yourself in the frame and click capture
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="relative w-full h-[240px] bg-black rounded-lg overflow-hidden">
          {capturedImage ? (
            <div className="relative w-full h-full">
              <Image
                src={capturedImage}
                alt="Captured preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                aria-label="Camera preview"
              >
                <track kind="captions" />
              </video>
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {capturedImage ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={retakePhoto}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 h-9"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Retake</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 h-9"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
              <Button
                type="button"
                onClick={handleUsePhoto}
                className="bg-[#378644] hover:bg-[#2d7038] flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 h-9"
              >
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="text-xs sm:text-sm px-3 py-2 h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={captureImage}
                disabled={!stream}
                className="bg-[#378644] hover:bg-[#2d7038] flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 h-9"
              >
                <Camera className="w-3.5 h-3.5" />
                Capture
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

