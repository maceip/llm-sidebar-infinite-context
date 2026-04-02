import { useState, useEffect } from 'react';
import { MessageTypes } from '../../scripts/constants';
import type {
  ContextRetrievalSnapshot,
  GetContextSnapshotRequest,
} from '../../scripts/types';

interface SnapshotResponse {
  success: boolean;
  snapshot: ContextRetrievalSnapshot | null;
}

export function useContextSnapshot(intervalMs = 5000) {
  const [snapshot, setSnapshot] = useState<ContextRetrievalSnapshot | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        const msg: GetContextSnapshotRequest = {
          type: MessageTypes.GET_CONTEXT_SNAPSHOT,
        };
        const res = (await chrome.runtime.sendMessage(msg)) as SnapshotResponse;
        if (mounted && res?.success && res.snapshot) {
          setSnapshot(res.snapshot);
        }
      } catch {
        // background not ready
      }
    };

    fetch();
    const id = setInterval(fetch, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return snapshot;
}
