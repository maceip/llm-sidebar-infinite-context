import { useState, useEffect } from 'react';
import { MessageTypes } from '../../scripts/constants';
import type {
  MemoryStatsResponse,
  GetMemoryStatsRequest,
} from '../../scripts/types';

export function useMemoryStats(intervalMs = 5000) {
  const [stats, setStats] = useState<MemoryStatsResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        const msg: GetMemoryStatsRequest = {
          type: MessageTypes.GET_MEMORY_STATS,
        };
        const res = await chrome.runtime.sendMessage<
          GetMemoryStatsRequest,
          MemoryStatsResponse
        >(msg);
        if (mounted && res?.success) setStats(res);
      } catch {
        // background not ready yet
      }
    };

    fetch();
    const id = setInterval(fetch, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return stats;
}
