import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeErrorHandling } from './utils/errorHandling'

// Initialize global error handling to suppress noisy extension and GSAP warnings
initializeErrorHandling()

createRoot(document.getElementById("root")!).render(<App />);
