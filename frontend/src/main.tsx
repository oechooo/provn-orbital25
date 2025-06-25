import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WorkingApp from './WorkingApp.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkingApp />
  </StrictMode>,
)
