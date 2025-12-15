// ============================================================================
// DISCOVERY MATCH MODAL - Phase 1 Sprint 1.1
// ============================================================================
// Main entry point for Discovery Match feature
// User spends NADA to find relevant hemp organizations
// ============================================================================

import { useState } from 'react';
import { X, Sparkles, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import DiscoveryRequestForm from './DiscoveryRequestForm';
import DiscoveryMatchResults from './DiscoveryMatchResults';

interface DiscoveryMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNadaBalance: number;
}

type Step = 'form' | 'results' | 'history';

export default function DiscoveryMatchModal({
  isOpen,
  onClose,
  userNadaBalance,
}: DiscoveryMatchModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<number>(0);

  const handleRequestCreated = (id: string, count: number) => {
    setRequestId(id);
    setMatchCount(count);
    setStep('results');
  };

  const handleClose = () => {
    setStep('form');
    setRequestId(null);
    setMatchCount(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/30">
        <DialogTitle className="sr-only">Discovery Match</DialogTitle>
        <DialogDescription className="sr-only">
          Find hemp organizations that match your needs. Spend NADA to get personalized matches.
        </DialogDescription>
        
        {/* Header */}
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Discovery Match
            </h2>
            <p className="text-slate-300">
              Find hemp organizations that match your needs
            </p>
          </div>

          {/* NADA Balance */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-slate-800/30 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-300">Your NADA Balance:</span>
            <span className="font-bold text-emerald-400">{userNadaBalance}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          {step === 'form' && (
            <DiscoveryRequestForm
              userNadaBalance={userNadaBalance}
              onRequestCreated={handleRequestCreated}
              onCancel={handleClose}
            />
          )}

          {step === 'results' && requestId && (
            <DiscoveryMatchResults
              requestId={requestId}
              matchCount={matchCount}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}