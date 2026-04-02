import { useState, useEffect } from 'react';
import { MessageTypes } from '../../scripts/constants';
import type {
  NativeCompanionState,
  NativeCompanionStatusRequest,
  NativeCompanionStatusResponse,
} from '../../scripts/types';

export function useCompanionStatus(intervalMs = 10000) {
  const [state, setState] = useState<NativeCompanionState | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        const msg: NativeCompanionStatusRequest = {
          type: MessageTypes.NATIVE_COMPANION_STATUS,
        };
        const res = (await chrome.runtime.sendMessage(
          msg,
        )) as NativeCompanionStatusResponse;
        if (mounted && res?.success) setState(res.state);
      } catch {
        // not available
      }
    };

    fetch();
    const id = setInterval(fetch, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return state;
}
