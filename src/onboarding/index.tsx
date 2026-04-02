import { createRoot } from 'react-dom/client';
import { OnboardingApp } from './App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<OnboardingApp />);
}
