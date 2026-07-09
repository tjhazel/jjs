import { Overlay } from '@mantine/core';

export default function HiddenOverlay() {
   return (
      <Overlay
         zIndex={1}
         style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(160, 160, 160, 0.25) 14px, rgba(160, 160, 160, 0.25) 16px)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
         }}
      />
   );
}
