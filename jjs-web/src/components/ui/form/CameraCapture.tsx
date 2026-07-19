import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActionIcon, Box, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconCamera, IconCameraRotate } from '@tabler/icons-react';

export interface CameraCaptureHandle {
  open: () => void;
}

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(
  ({ onCapture }, ref) => {
    const [opened, setOpened] = useState(false);
    const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useImperativeHandle(ref, () => ({
      open: () => { setCapturedDataUrl(null); setCameraError(null); setOpened(true); },
    }));

    // Start/stop the camera stream based on modal state and capture phase.
    useEffect(() => {
      if (!opened) {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        return;
      }
      if (capturedDataUrl) return; // Preview showing; don't restart stream.

      // navigator.mediaDevices is undefined on HTTP or unsupported browsers.
      // Accessing it without this guard throws a TypeError that bubbles to the
      // root error boundary and shows the "Something went wrong" page.
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is not available. Make sure the page is loaded over HTTPS and your browser supports camera access.');
        return;
      }

      let cancelled = false;
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode }, audio: false })
        .then(stream => {
          if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const name = err instanceof DOMException ? err.name : '';
          if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
            setCameraError('Camera permission was denied. Please allow camera access in your browser settings and try again.');
          } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
            setCameraError('No camera was found on this device.');
          } else if (name === 'NotReadableError' || name === 'TrackStartError') {
            setCameraError('Camera is already in use by another app. Close it and try again.');
          } else if (name === 'OverconstrainedError') {
            // Requested facingMode isn't available — retry without the constraint.
            navigator.mediaDevices
              .getUserMedia({ video: true, audio: false })
              .then(stream => {
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
              })
              .catch(() => {
                if (!cancelled) setCameraError('Could not start camera. Please try again.');
              });
          } else {
            setCameraError('Could not start camera. Please try again.');
          }
        });

      return () => { cancelled = true; };
    }, [opened, capturedDataUrl, facingMode]);

    const capture = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCapturedDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };

    const retake = () => { setCameraError(null); setCapturedDataUrl(null); };

    const usePhoto = () => {
      canvasRef.current?.toBlob(blob => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setOpened(false);
        setCapturedDataUrl(null);
        onCapture(file);
      }, 'image/jpeg', 0.92);
    };

    const close = () => { setOpened(false); setCapturedDataUrl(null); setCameraError(null); };

    return (
      <Modal opened={opened} onClose={close} title="Capture Image" centered size="lg">
        <Stack gap="sm">
          {/* Error state */}
          {cameraError && (
            <Text c="red" size="sm">{cameraError}</Text>
          )}

          {/* Live feed */}
          {!cameraError && (
            <Box style={{
              position: 'relative', background: '#000', borderRadius: 4,
              overflow: 'hidden', display: capturedDataUrl ? 'none' : 'block',
            }}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{ width: '100%', maxHeight: '60vh', display: 'block', objectFit: 'contain' }}
              />
              <ActionIcon
                variant="filled" color="dark" size="md"
                style={{ position: 'absolute', top: 8, right: 8, opacity: 0.7 }}
                onClick={() => { setCameraError(null); setFacingMode(m => m === 'user' ? 'environment' : 'user'); }}
                aria-label="Flip camera"
              >
                <IconCameraRotate size={16} />
              </ActionIcon>
            </Box>
          )}

          {/* Captured preview */}
          {capturedDataUrl && (
            <Box style={{ background: '#000', borderRadius: 4, overflow: 'hidden' }}>
              <img
                src={capturedDataUrl}
                alt="Captured"
                style={{ width: '100%', maxHeight: '60vh', display: 'block', objectFit: 'contain' }}
              />
            </Box>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <Group justify="flex-end">
            {capturedDataUrl ? (
              <>
                <Button variant="default" onClick={retake}>Retake</Button>
                <Button onClick={usePhoto}>Use Photo</Button>
              </>
            ) : (
              <Button
                leftSection={<IconCamera size={16} />}
                onClick={capture}
                disabled={!!cameraError}
              >
                Capture
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
    );
  },
);

CameraCapture.displayName = 'CameraCapture';
export default CameraCapture;
