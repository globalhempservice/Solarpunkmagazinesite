/**
 * QUICK BUTTON TEST PAGE
 * Minimal component to quickly test the new button system
 * Add this to your app routing to view the showcase
 */

import { ButtonShowcase } from './ButtonShowcase'

export function QuickButtonTest() {
  return (
    <div className="min-h-screen">
      <ButtonShowcase />
    </div>
  )
}

// To use this in your app, add a route or temporary view:
// 
// In App.tsx, add to your view switching:
// 
// {currentView === 'button-test' && <QuickButtonTest />}
// 
// Then navigate to it:
// setCurrentView('button-test')
// 
// Or add a temporary button in your navbar:
// <button onClick={() => setCurrentView('button-test')}>
//   Test Buttons
// </button>
