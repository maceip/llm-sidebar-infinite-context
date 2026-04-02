export const MODULE_COLORS = {
  'short-term': { bg: '#78b4fe', text: '#00325b', label: 'SHORT-TERM' },
  'long-term': { bg: '#006e00', text: '#82f76c', label: 'LONG-TERM' },
  retriever: { bg: '#FFB900', text: '#000000', label: 'RETRIEVER' },
  consolidator: { bg: '#fe2c15', text: '#000000', label: 'CONSOLIDATOR' },
  forgetting: { bg: '#881798', text: '#ffffff', label: 'FORGETTING' },
  assembler: { bg: '#767575', text: '#000000', label: 'ASSEMBLER' },
  system: { bg: '#2c2c2c', text: '#adaaaa', label: 'SYSTEM' },
} as const;

export type ModuleId = keyof typeof MODULE_COLORS;
