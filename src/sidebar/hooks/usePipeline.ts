import { useMemo } from 'react';
import { useMemoryStats } from './useMemoryStats';
import { useContextSnapshot } from './useContextSnapshot';
import { useContext } from './useContext';
import { useCompanionStatus } from './useCompanionStatus';
import { useApiKeyStatus } from './useApiKeyStatus';
import type { NativeCompanionConnectionState } from '../../scripts/types';

export interface PipelineState {
  shortTerm: {
    recentCount: number;
    retentionLabel: string;
    barData: number[];
  };
  longTerm: {
    episodeCount: number;
    maxEpisodes: number;
    turnRatio: number;
    summaryRatio: number;
  };
  retriever: {
    hitCount: number;
    totalCandidates: number;
    latencyLabel: string;
    dotCells: boolean[];
  };
  consolidator: {
    mergeRate: number;
    lineWidths: number[];
  };
  forgetting: {
    decayLabel: string;
    droppedRatio: number;
  };
  assembler: {
    budgetUsed: number;
    totalChars: number;
    constructLabel: string;
  };
  system: {
    healthLabel: string;
    loadRatio: number;
    pinnedTabCount: number;
    currentTabTitle: string;
    companionState: NativeCompanionConnectionState | null;
    hasApiKey: boolean;
  };
}

export function usePipeline(): PipelineState {
  const stats = useMemoryStats();
  const snapshot = useContextSnapshot();
  const ctx = useContext();
  const companion = useCompanionStatus();
  const hasApiKey = useApiKeyStatus();

  return useMemo(() => {
    const episodeCount = stats?.episodeCount ?? 0;
    const maxEpisodes = stats?.maxEpisodes ?? 160;
    const pinnedTabCount = stats?.pinnedTabCount ?? 0;
    const recent = stats?.recentEpisodes ?? [];

    const turns = recent.filter((e) => e.kind === 'turn').length;
    const summaries = recent.filter((e) => e.kind === 'summary').length;
    const recentTotal = recent.length || 1;

    const retrieved = snapshot?.retrievedEpisodes ?? [];
    const candidateCount = snapshot?.candidateCount ?? 0;
    const budgetUsed = snapshot?.budgetUsedRatio ?? 0;
    const totalChars = snapshot?.totalChars ?? 0;

    // Bar data from recent episodes — normalize by time recency
    const now = Date.now();
    const barData =
      recent.length > 0
        ? recent.slice(0, 10).map((ep) => {
            const age = (now - ep.createdAt) / (1000 * 60 * 60); // hours
            return Math.max(0.1, 1 - age / 24); // decay over 24h
          })
        : [0.1, 0.1, 0.1, 0.1]; // empty state

    // Dot grid: 6 cells, filled based on retrieval hits
    const dotCells = Array.from({ length: 6 }, (_, i) => i < retrieved.length);

    // Merge rate: ratio of summaries to total
    const mergeRate = summaries / recentTotal;

    // Forgetting: capacity used
    const capacityRatio = episodeCount / maxEpisodes;

    // Converging lines based on actual compaction
    const lineWidths =
      summaries > 0 ? [1, mergeRate, mergeRate * 0.5] : [1, 0.7, 0.4];

    // System health
    const healthParts: string[] = [];
    if (!hasApiKey) healthParts.push('NO_KEY');
    if (companion?.connectionState === 'disconnected')
      healthParts.push('NO_COMPANION');
    const healthLabel =
      healthParts.length > 0
        ? healthParts.join(' | ')
        : stats
          ? 'NOMINAL'
          : 'OFFLINE';

    return {
      shortTerm: {
        recentCount: recent.length,
        retentionLabel: `${recent.length} active`,
        barData,
      },
      longTerm: {
        episodeCount,
        maxEpisodes,
        turnRatio: turns / recentTotal,
        summaryRatio: summaries / recentTotal,
      },
      retriever: {
        hitCount: retrieved.length,
        totalCandidates: candidateCount,
        latencyLabel: snapshot ? `${retrieved.length}/${candidateCount}` : '--',
        dotCells,
      },
      consolidator: {
        mergeRate,
        lineWidths,
      },
      forgetting: {
        decayLabel: `${(capacityRatio * 100).toFixed(0)}% used`,
        droppedRatio: capacityRatio,
      },
      assembler: {
        budgetUsed,
        totalChars,
        constructLabel:
          totalChars > 0 ? `${(totalChars / 1000).toFixed(1)}K chars` : '--',
      },
      system: {
        healthLabel,
        loadRatio: capacityRatio,
        pinnedTabCount,
        currentTabTitle: ctx.currentTab?.title ?? 'No tab',
        companionState: companion?.connectionState ?? null,
        hasApiKey,
      },
    };
  }, [stats, snapshot, ctx, companion, hasApiKey]);
}
