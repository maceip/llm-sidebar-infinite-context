import { useState, useEffect, useCallback } from 'react';
import { MessageTypes } from '../../scripts/constants';
import type {
  TabInfo,
  GetContextRequest,
  GetContextResponse,
  GetCurrentTabRequest,
  GetCurrentTabResponse,
} from '../../scripts/types';

interface ContextState {
  pinnedTabs: TabInfo[];
  currentTab: TabInfo | null;
}

export function useContext(intervalMs = 3000) {
  const [state, setState] = useState<ContextState>({
    pinnedTabs: [],
    currentTab: null,
  });

  const refresh = useCallback(async () => {
    try {
      const [ctxRes, tabRes] = await Promise.all([
        chrome.runtime.sendMessage<GetContextRequest, GetContextResponse>({
          type: MessageTypes.GET_CONTEXT,
        }),
        chrome.runtime.sendMessage<GetCurrentTabRequest, GetCurrentTabResponse>(
          {
            type: MessageTypes.GET_CURRENT_TAB,
          },
        ),
      ]);

      setState({
        pinnedTabs: ctxRes?.pinnedContexts ?? [],
        currentTab: tabRes?.tab ?? null,
      });
    } catch {
      // background not ready
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);

    // Also listen for push updates from background
    const listener = (message: { type?: string; tab?: TabInfo }) => {
      if (message.type === MessageTypes.CURRENT_TAB_INFO && message.tab) {
        setState((prev) => ({ ...prev, currentTab: message.tab! }));
      }
      if (message.type === MessageTypes.CHECK_PINNED_TABS) {
        refresh();
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    return () => {
      clearInterval(id);
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [intervalMs, refresh]);

  return state;
}
