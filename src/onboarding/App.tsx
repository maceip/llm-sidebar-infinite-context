import { useState } from 'react';
import { AppBar } from './components/AppBar';
import { BottomNav } from './components/BottomNav';
import { WelcomeStep } from './steps/WelcomeStep';
import { ConfigStep, type ProfileId } from './steps/ConfigStep';
import { ApiKeyStep } from './steps/ApiKeyStep';
import { ProgressStep } from './steps/ProgressStep';
import { CompleteStep } from './steps/CompleteStep';
import { MessageTypes } from '../scripts/constants';

const STEPS = [
  'WELCOME',
  'CONFIGURATION',
  'API_KEY',
  'INSTALLING',
  'COMPLETE',
] as const;

export function OnboardingApp() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileId | null>(null);
  const [apiKey, setApiKey] = useState('');

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (step === 2 && apiKey.length > 5) {
      // Save API key before moving to install step
      try {
        await chrome.runtime.sendMessage({
          type: MessageTypes.SAVE_API_KEY,
          apiKey,
        });
      } catch {
        // extension not ready, continue anyway
      }
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleCancel = () => {
    window.close();
  };

  const statusMap: Record<string, string> = {
    WELCOME: 'INITIALIZING...',
    CONFIGURATION: 'SYSTEM_READY',
    API_KEY: 'STATUS: READY',
    INSTALLING: 'INSTALLING...',
    COMPLETE: 'SETUP_COMPLETE',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppBar statusText={statusMap[currentStep]} />

      {currentStep === 'WELCOME' && <WelcomeStep />}
      {currentStep === 'CONFIGURATION' && (
        <ConfigStep selected={profile} onSelect={setProfile} />
      )}
      {currentStep === 'API_KEY' && (
        <ApiKeyStep apiKey={apiKey} onApiKeyChange={setApiKey} />
      )}
      {currentStep === 'INSTALLING' && (
        <ProgressStep onComplete={() => setStep(step + 1)} />
      )}
      {currentStep === 'COMPLETE' && <CompleteStep />}

      {currentStep !== 'COMPLETE' && (
        <BottomNav
          onBack={handleBack}
          onNext={isLast ? undefined : handleNext}
          onCancel={handleCancel}
          backDisabled={step === 0}
          nextDisabled={currentStep === 'INSTALLING'}
          nextLabel={step === 2 ? 'INSTALL' : 'NEXT'}
        />
      )}
    </div>
  );
}
