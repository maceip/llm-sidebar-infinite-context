import { useCallback, useEffect } from 'react';
import type { ExtensionMessage } from '../../scripts/types';

export function useSendMessage() {
  return useCallback(
    <T>(message: ExtensionMessage): Promise<T> =>
      chrome.runtime.sendMessage(message),
    [],
  );
}

export function useMessageListener(handler: (message: unknown) => void) {
  useEffect(() => {
    const listener = (message: unknown) => {
      handler(message);
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [handler]);
}
