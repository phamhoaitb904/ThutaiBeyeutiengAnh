import { useState, useEffect, useRef } from 'react';
import { Smile } from 'lucide-react';

interface Props {
  onGesture: (gestureIndex: number) => void;
  isCameraEnabled: boolean;
  isLocked: boolean;
}

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export const CameraFaceTracker = ({ onGesture, isCameraEnabled, isLocked }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Đang tải Camera & AI...');
  const gestureHistory = useRef<number[]>([]);
  
  useEffect(() => {
    if (!isCameraEnabled) return;

    let camera: any = null;
    let faceMesh: any = null;
    let isMounted = true; 

    const initMediaPipe = async () => {
      if (!isMounted) return;
      setStatus('Đang tải mô hình AI...');
      
      const loadScript = (src: string) => new Promise<void>((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
      } catch (err) {
        if (isMounted) setStatus('Lỗi tải script AI.');
        return;
      }

      if (!window.FaceMesh || !window.Camera) {
        if (isMounted) setStatus('Lỗi tải AI. Vui lòng dùng chuột.');
        return;
      }

      if (!isMounted) return;
      setStatus('Khởi động Camera...');
      
      faceMesh = new window.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults((results: any) => {
        if (!isMounted || !canvasRef.current || !videoRef.current) return;
        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          
          canvasCtx.fillStyle = '#ef4444'; 
          const keyPoints = [33, 263, 61, 291, 13, 14, 10, 152];
          keyPoints.forEach(idx => {
            const x = landmarks[idx].x * canvasRef.current.width;
            const y = landmarks[idx].y * canvasRef.current.height;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 3, 0, 2 * Math.PI);
            canvasCtx.fill();
          });

          const getDist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const mouthLeft = landmarks[61];
          const mouthRight = landmarks[291];
          const mouthTop = landmarks[13];
          const mouthBottom = landmarks[14];

          const dx = rightEye.x - leftEye.x;
          const dy = rightEye.y - leftEye.y;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          const eyeDist = getDist(leftEye, rightEye);
          const mouthWidth = getDist(mouthLeft, mouthRight);
          const mouthHeight = getDist(mouthTop, mouthBottom);

          const smileRatio = mouthWidth / eyeDist;
          const openRatio = mouthHeight / eyeDist;

          let detectedGesture = -1; 
          let gestureName = "";

          if (isLocked) {
             gestureHistory.current = [];
             gestureName = "Đang chờ...";
          } else {
            if (openRatio > 0.25) {
              detectedGesture = 2; 
              gestureName = "Há Miệng";
            } else if (smileRatio > 0.8) {
              detectedGesture = 3; 
              gestureName = "Nhe Răng";
            } else if (angle > 15 || angle < -15) {
              detectedGesture = 0; 
              gestureName = "Nghiêng Đầu";
            } else {
              detectedGesture = 1; 
              gestureName = "Thẳng Đầu";
            }

            if (detectedGesture !== -1) {
              gestureHistory.current.push(detectedGesture);
              if (gestureHistory.current.length > 21) {
                gestureHistory.current.shift();
              }
              
              const isConsistent = gestureHistory.current.length === 21 && 
                                  gestureHistory.current.every(val => val === detectedGesture);
                                  
              if (isConsistent) {
                onGesture(detectedGesture);
                gestureHistory.current = []; 
              }
            } else {
               gestureHistory.current = []; 
            }
          }

          canvasCtx.font = "bold 18px Arial";
          canvasCtx.fillStyle = "#10b981";
          canvasCtx.fillText(`AI: ${gestureName || "Bình thường"}`, 10, 30);
        } else {
          gestureHistory.current = [];
        }
        canvasCtx.restore();
      });

      camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (!isMounted || !videoRef.current || !faceMesh) return;
          try {
            await faceMesh.send({ image: videoRef.current });
          } catch (e) {
            if (isMounted) console.error("Camera frame drop:", e);
          }
        },
        width: 320,
        height: 240
      });
      
      camera.start().then(() => {
        if (isMounted) setStatus('');
      }).catch(() => {
        if (isMounted) setStatus('Không có quyền truy cập Camera.');
      });
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      if (camera) camera.stop();
      if (faceMesh) {
        setTimeout(() => {
          try { faceMesh.close(); } catch (e) {}
        }, 200);
      }
    };
  }, [isCameraEnabled, onGesture, isLocked]);

  if (!isCameraEnabled) return null;

  return (
    <div className="relative rounded-xl overflow-hidden border-4 border-cyan-400 shadow-lg bg-black w-48 h-36 flex items-center justify-center mt-4">
      <video ref={videoRef} className="hidden" playsInline autoPlay />
      <canvas ref={canvasRef} width="320" height="240" className="w-full h-full object-cover transform scale-x-[-1]" />
      {status && <div className="absolute text-white text-xs text-center px-2 z-10 font-bold bg-black/50 p-2 rounded">{status}</div>}
      <div className="absolute bottom-1 right-1 text-white opacity-50"><Smile size={16}/></div>
    </div>
  );
};
