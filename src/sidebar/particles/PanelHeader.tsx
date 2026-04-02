import { MetroText } from '../primitives/MetroText';

interface PanelHeaderProps {
  version?: string;
}

export function PanelHeader({ version = '3.0.1' }: PanelHeaderProps) {
  return (
    <div className="flex items-baseline justify-between px-3 py-3">
      <MetroText variant="display">CONTEXT_OS</MetroText>
      <MetroText variant="micro" color="#484848">
        V{version}
      </MetroText>
    </div>
  );
}
