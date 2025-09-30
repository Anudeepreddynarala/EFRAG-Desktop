import React, { useState, useEffect } from 'react';
import {
  LLMBackend,
  ModelTier,
  SystemSpecs,
  RECOMMENDED_MODELS,
  LLM_BACKEND_INFO
} from '../../types/ai.types';
import { SystemDetectionService } from '../../services/systemDetection';
import { Button } from '@/components/ui/button';

interface AISetupWizardProps {
  onClose: () => void;
  onComplete: (backend: LLMBackend, modelName: string) => void;
}

export const AISetupWizard: React.FC<AISetupWizardProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'detect' | 'model' | 'instructions'>('welcome');
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs | null>(null);
  const selectedBackend = LLMBackend.JAN; // Jan is the only option
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (step === 'detect') {
      detectSystem();
    }
  }, [step]);

  const detectSystem = async () => {
    setIsDetecting(true);
    try {
      const specs = await SystemDetectionService.detectSystemSpecs();
      setSystemSpecs(specs);
      // Auto-select first recommended model for detected tier
      const recommendedModels = RECOMMENDED_MODELS[specs.recommendedTier];
      if (recommendedModels.length > 0) {
        setSelectedModel(recommendedModels[0].name);
      }
      setTimeout(() => setStep('model'), 500);
    } catch (error) {
      console.error('Failed to detect system:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
  };

  const handleContinue = () => {
    if (selectedModel) {
      setStep('instructions');
    }
  };

  const handleFinish = () => {
    onComplete(selectedBackend, selectedModel);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">AI Assistant Setup</h2>
              <p className="text-blue-100 mt-1">🔒 100% Local Processing - Your data never leaves your computer</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'welcome' && (
            <WelcomeStep onNext={() => setStep('detect')} />
          )}

          {step === 'detect' && (
            <DetectingStep isDetecting={isDetecting} systemSpecs={systemSpecs} />
          )}

          {step === 'model' && systemSpecs && (
            <ModelStep
              systemSpecs={systemSpecs}
              selectedModel={selectedModel}
              onSelect={handleModelSelect}
              onContinue={handleContinue}
              onBack={() => setStep('detect')}
            />
          )}

          {step === 'instructions' && (
            <InstructionsStep
              model={selectedModel}
              onFinish={handleFinish}
              onBack={() => setStep('model')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Welcome Step
const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="text-center py-8">
    <div className="text-6xl mb-6">🤖</div>
    <h3 className="text-2xl font-bold mb-4 text-foreground">AI-Powered Form Filling</h3>
    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
      Upload your sustainability documents or paste text, and let AI automatically fill out your VSME form.
      All processing happens on your computer - no data is sent to external servers.
    </p>
    <div className="bg-accent border border-border rounded-lg p-4 mb-6 max-w-xl mx-auto">
      <h4 className="font-semibold text-foreground mb-2">What you'll need:</h4>
      <ul className="text-left text-foreground space-y-2">
        <li className="flex items-start">
          <span className="text-green-600 mr-2">✓</span>
          <span>A local AI model (we'll help you choose and download one)</span>
        </li>
        <li className="flex items-start">
          <span className="text-green-600 mr-2">✓</span>
          <span>2-10 GB of free disk space for the model</span>
        </li>
        <li className="flex items-start">
          <span className="text-green-600 mr-2">✓</span>
          <span>Your sustainability documents (PDF, text files, etc.)</span>
        </li>
      </ul>
    </div>
    <Button
      onClick={onNext}
      size="lg"
      className="px-8 font-semibold"
    >
      Get Started
    </Button>
  </div>
);

// Detecting Step
const DetectingStep: React.FC<{ isDetecting: boolean; systemSpecs: SystemSpecs | null }> = ({
  isDetecting,
  systemSpecs
}) => (
  <div className="text-center py-8">
    <div className="text-5xl mb-6">🔍</div>
    <h3 className="text-2xl font-bold mb-4 text-foreground">Analyzing Your System</h3>
    {isDetecting ? (
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Detecting RAM and CPU specifications...</p>
      </div>
    ) : systemSpecs && (
      <div className="bg-accent border border-border rounded-lg p-6 max-w-xl mx-auto">
        <h4 className="font-semibold text-foreground mb-4">System Detected</h4>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-muted-foreground text-sm">Total RAM</p>
            <p className="font-semibold text-foreground">{SystemDetectionService.formatRAM(systemSpecs.totalRAM)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Available RAM</p>
            <p className="font-semibold text-foreground">{SystemDetectionService.formatRAM(systemSpecs.availableRAM)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">CPU Cores</p>
            <p className="font-semibold text-foreground">{systemSpecs.cpuCores}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Recommended Tier</p>
            <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${SystemDetectionService.getTierColor(systemSpecs.recommendedTier)}`}>
              {systemSpecs.recommendedTier}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Model Selection Step
const ModelStep: React.FC<{
  systemSpecs: SystemSpecs;
  selectedModel: string;
  onSelect: (model: string) => void;
  onContinue: () => void;
  onBack: () => void;
}> = ({ systemSpecs, selectedModel, onSelect, onContinue, onBack }) => {
  const recommendedModels = RECOMMENDED_MODELS[systemSpecs.recommendedTier];
  const janInfo = LLM_BACKEND_INFO[LLMBackend.JAN];

  return (
    <div className="py-4">
      <h3 className="text-2xl font-bold mb-2 text-foreground">Choose Your AI Model</h3>
      <p className="text-muted-foreground mb-4">
        Based on your system ({SystemDetectionService.formatRAM(systemSpecs.totalRAM)} RAM),
        we recommend <span className="font-semibold text-foreground">{systemSpecs.recommendedTier}</span> tier models
      </p>

      <div className="bg-accent border border-border rounded-lg p-3 mb-4">
        <p className="text-sm text-foreground">
          💡 <strong>These models are optimized for data extraction tasks</strong> and will perform best for filling out your sustainability forms.
        </p>
      </div>

      <div className="bg-accent border border-border rounded-lg p-3 mb-6">
        <p className="text-sm text-foreground">
          📦 <strong>Using Jan</strong> - {janInfo.description}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {recommendedModels.map((model) => (
          <button
            key={model.name}
            onClick={() => onSelect(model.name)}
            className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
              selectedModel === model.name
                ? 'border-primary bg-accent'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-foreground">{model.name}</h4>
              <span className="text-sm text-muted-foreground ml-2">{model.size}</span>
            </div>
            <p className="text-muted-foreground text-sm">{model.description}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selectedModel}
          className="flex-1 font-semibold"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// Instructions Step
const InstructionsStep: React.FC<{
  model: string;
  onFinish: () => void;
  onBack: () => void;
}> = ({ model, onFinish, onBack }) => {
  const info = LLM_BACKEND_INFO[LLMBackend.JAN];

  return (
    <div className="py-4">
      <h3 className="text-2xl font-bold mb-2 text-foreground">Setup Instructions</h3>
      <p className="text-muted-foreground mb-6">
        Follow these simple steps to set up <strong className="text-foreground">{info.name}</strong> with <strong className="text-foreground">{model}</strong>
      </p>

      <div className="bg-accent border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-foreground">
          ℹ️ <strong>Jan is user-friendly:</strong> No command line needed! It works like ChatGPT but runs completely on your computer.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {info.setupSteps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-foreground">{step}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-accent border border-border rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-foreground mb-2">Download {info.name}</h4>
        <a
          href={info.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
        >
          <span>Open Download Page</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={onFinish}
          className="flex-1 font-semibold"
        >
          I've Installed It - Let's Go!
        </Button>
      </div>
    </div>
  );
};
