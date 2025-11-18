import clsx from 'clsx';
import { AlertCircleIcon } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { Button } from '@components/ui/button';

export default function SyncAlertBanner() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Alert
      className={clsx([
        'border-amber-200 bg-amber-50 text-amber-600',
        !isVisible && 'hidden',
      ])}
    >
      <AlertCircleIcon />
      <AlertTitle>New device login</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p className="text-amber-600">
            Sync your data to this device to see the latest chats & messages.
          </p>
          <div className="flex w-full items-center justify-end space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-amber-100 hover:text-amber-700"
              onClick={() => setIsVisible(false)}
            >
              Later
            </Button>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Start syncing
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
