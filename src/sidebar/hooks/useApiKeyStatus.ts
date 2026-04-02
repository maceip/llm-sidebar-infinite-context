import { useState, useEffect } from 'react';
import { StorageKeys } from '../../scripts/constants';

export function useApiKeyStatus() {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const result = await chrome.storage.sync.get(StorageKeys.API_KEY);
        setHasKey(!!result[StorageKeys.API_KEY]);
      } catch {
        // not available
      }
    };

    check();

    // Listen for storage changes
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (StorageKeys.API_KEY in changes) {
        setHasKey(!!changes[StorageKeys.API_KEY].newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return hasKey;
}
