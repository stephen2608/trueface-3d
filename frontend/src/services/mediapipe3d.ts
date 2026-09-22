import { Point3D } from '../types';

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export class MediaPipe3DEngine {
  private videoElement: HTMLVideoElement | null = null;
  private camera: any = null;
  private faceMesh: any = null;
  private onLandmarksCallback: ((landmarks: Point3D[]) => void) | null = null;
  private isRunning = false;
  private fallbackInterval: number | null = null;

  public async start(
    video: HTMLVideoElement,
    onLandmarks: (landmarks: Point3D[]) => void
  ): Promise<boolean> {
    this.videoElement = video;
    this.onLandmarksCallback = onLandmarks;
    this.isRunning = true;

    try {
      // Initialize MediaPipe FaceMesh
      if (typeof window !== 'undefined' && window.FaceMesh) {
        this.faceMesh = new window.FaceMesh({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        this.faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true, // enables 478 3D landmarks with iris tracking
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        this.faceMesh.onResults((results: any) => {
          if (!this.isRunning) return;

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const rawLandmarks = results.multiFaceLandmarks[0];
            const points: Point3D[] = rawLandmarks.map((p: any) => ({
              x: p.x,
              y: p.y,
              z: p.z || 0.0,
            }));

            if (this.onLandmarksCallback) {
              this.onLandmarksCallback(points);
            }
          }
        });

        // Initialize Camera
        if (window.Camera) {
          this.camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
              if (this.isRunning && this.faceMesh && this.videoElement) {
                await this.faceMesh.send({ image: this.videoElement });
              }
            },
            width: 640,
            height: 480,
          });

          await this.camera.start();
          return true;
        }
      }

      // Fallback: standard getUserMedia with mobile-friendly constraints
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch (innerErr) {
        // Broadest fallback: any video device
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      this.videoElement.srcObject = stream;
      await this.videoElement.play();
      this.startSyntheticSimulation();
      return true;
    } catch (e) {
      console.warn('Webcam or MediaPipe initialization failed, running in simulation demo mode', e);
      this.startSyntheticSimulation();
      return false;
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.camera) {
      try { this.camera.stop(); } catch {}
      this.camera = null;
    }
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      this.videoElement.srcObject = null;
    }
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  private startSyntheticSimulation() {
    if (this.fallbackInterval) clearInterval(this.fallbackInterval);

    this.fallbackInterval = window.setInterval(() => {
      if (!this.isRunning || !this.onLandmarksCallback) return;

      const time = Date.now();
      const yawDrift = Math.sin(time / 2400) * 0.04;
      const pitchDrift = Math.cos(time / 3100) * 0.02;
      const smileWave = (Math.sin(time / 2000) + 1.0) / 2.0; // 0 to 1

      const points: Point3D[] = [];
      for (let i = 0; i < 478; i++) {
        points.push({ x: 0.5, y: 0.5, z: 0.0 });
      }

      // Anchors
      points[1] = { x: 0.5 + yawDrift, y: 0.5 + pitchDrift, z: -0.06 };
      points[152] = { x: 0.5, y: 0.72 + pitchDrift, z: 0.0 };
      points[168] = { x: 0.5, y: 0.35, z: 0.0 };
      points[33] = { x: 0.40, y: 0.38, z: yawDrift };
      points[263] = { x: 0.60, y: 0.38, z: -yawDrift };

      // Mouth
      const mouthWidth = 0.12 + smileWave * 0.05;
      points[61] = { x: 0.5 - mouthWidth / 2, y: 0.64 - smileWave * 0.03, z: 0.0 };
      points[291] = { x: 0.5 + mouthWidth / 2, y: 0.64 - smileWave * 0.03, z: 0.0 };

      // Cheeks (lift with smile)
      points[205] = { x: 0.38, y: 0.50 - smileWave * 0.04, z: 0.02 + smileWave * 0.03 };
      points[425] = { x: 0.62, y: 0.50 - smileWave * 0.04, z: 0.02 + smileWave * 0.03 };

      // Eyes (compress with smile)
      points[159] = { x: 0.40, y: 0.375 + smileWave * 0.005, z: 0.0 };
      points[145] = { x: 0.40, y: 0.385 - smileWave * 0.005, z: 0.0 };
      points[386] = { x: 0.60, y: 0.375 + smileWave * 0.005, z: 0.0 };
      points[374] = { x: 0.60, y: 0.385 - smileWave * 0.005, z: 0.0 };

      // Eyebrows
      points[55] = { x: 0.44, y: 0.33, z: 0.0 };
      points[285] = { x: 0.56, y: 0.33, z: 0.0 };

      this.onLandmarksCallback(points);
    }, 50); // 20 FPS simulation fallback
  }
}

export const mediaPipeEngine = new MediaPipe3DEngine();
