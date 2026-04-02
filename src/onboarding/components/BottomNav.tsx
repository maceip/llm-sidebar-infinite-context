interface BottomNavProps {
  onBack?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export function BottomNav({
  onBack,
  onNext,
  onCancel,
  backDisabled = false,
  nextDisabled = false,
  nextLabel = 'NEXT',
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#f4f4f1] h-24 flex justify-between items-center px-12 border-t border-[#e0bfb9]/30 shadow-[inset_0_1px_0_0_rgba(224,191,185,0.2)]">
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex flex-col items-center justify-center text-[#5f5e5e] opacity-70 px-8 py-2 hover:bg-[#e2e3e0] transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined mb-1">close</span>
          <span className="font-[Manrope] tracking-[0.1em] uppercase text-[10px] font-black">
            CANCEL
          </span>
        </button>
        <button
          onClick={onBack}
          disabled={backDisabled}
          className="flex flex-col items-center justify-center text-[#5f5e5e] px-8 py-2 hover:bg-[#e2e3e0] transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <span className="material-symbols-outlined mb-1">arrow_back_ios</span>
          <span className="font-[Manrope] tracking-[0.1em] uppercase text-[10px] font-black">
            BACK
          </span>
        </button>
      </div>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex flex-col items-center justify-center bg-[#982616] text-white px-10 py-3 active:scale-[0.98] active:brightness-110 transition-all disabled:bg-[#e8e8e5] disabled:text-[#5f5e5e] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined mb-1">
          arrow_forward_ios
        </span>
        <span className="font-[Manrope] tracking-[0.1em] uppercase text-[10px] font-black">
          {nextLabel}
        </span>
      </button>
    </nav>
  );
}
