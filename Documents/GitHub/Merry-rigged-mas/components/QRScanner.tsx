import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';

// Declare jsQR on window since we are loading it via script tag
declare global {
  interface Window {
    jsQR: (data: Uint8ClampedArray, width: number, height: number, options?: any) => { data: string; location: any } | null;
  }
}

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Required to tell iOS safari we don't want fullscreen
          videoRef.current.setAttribute("playsinline", "true"); 
          await videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied. Please allow camera permissions to scan.");
        setScanning(false);
      }
    };

    const tick = () => {
      if (!scanning) return;
      
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (window.jsQR) {
                const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
                });
    
                if (code && code.data) {
                   onScan(code.data);
                   return; 
                }
            }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, scanning]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
       <button 
         onClick={onClose}
         className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full backdrop-blur-md z-10 hover:bg-white/30"
       >
         <X size={24} />
       </button>

       {error ? (
         <div className="text-center p-6 text-white max-w-xs">
           <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
           <p>{error}</p>
         </div>
       ) : (
         <div className="relative w-full h-full flex flex-col items-center justify-center">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanner Frame UI */}
            <div className="relative z-10 w-64 h-64 border-2 border-yellow-400/50 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(250,204,21,0.2)]">
               <div className="absolute inset-0 border-[3px] border-yellow-400 rounded-3xl animate-pulse"></div>
               {/* Corner Markers */}
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-xl"></div>
               
               {/* Scanning Line */}
               <div className="w-full h-1 bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.8)] absolute top-0 animate-[scan_2s_linear_infinite]" />
            </div>
            
            <p className="relative z-10 mt-8 text-white font-bold tracking-wide text-lg bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2">
               <Camera size={18} /> Point at a House Code
            </p>
         </div>
       )}
       
       <style>{`
         @keyframes scan {
           0% { top: 0%; opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { top: 100%; opacity: 0; }
         }
       `}</style>
    </div>
  );
};
export default QRScanner;