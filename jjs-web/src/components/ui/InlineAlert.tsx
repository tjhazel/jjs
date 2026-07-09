import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

interface InlineAlertProps {
   message: string | null;
   color?: string;
   onClose?: () => void;
}

export default function InlineAlert({ message, color = 'red', onClose }: InlineAlertProps) {
   if (!message) return null;

   return (
      <Alert
         color={color}
         radius="none"
         icon={<IconInfoCircle size={16} />}
         withCloseButton={!!onClose}
         onClose={onClose}
      >
         {message}
      </Alert>
   );
}
