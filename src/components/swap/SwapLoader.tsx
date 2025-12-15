import { lazy, Suspense } from 'react';
import { LoadingScreen } from '../LoadingScreen';

const SwapInfiniteFeed = lazy(() => {
  // Add minimum display time for loading screen
  return Promise.all([
    import('./SwapInfiniteFeed'),
    new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 seconds minimum
  ]).then(([moduleExports]) => ({ default: moduleExports.SwapInfiniteFeed }));
});

interface SwapLoaderProps {
  userId: string | null;
  accessToken: string | null;
  onBack: () => void;
  onPlusButtonTrigger?: () => void;
}

export function SwapLoader(props: SwapLoaderProps) {
  return (
    <Suspense fallback={<LoadingScreen message="Loading SWAP Shop" variant="swap" />}>
      <SwapInfiniteFeed {...props} />
    </Suspense>
  );
}