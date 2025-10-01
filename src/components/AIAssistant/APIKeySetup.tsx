import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { GPTModel, GPT_MODEL_INFO } from '@/types/ai.types';
import { testAPIKey, storeAPIKey } from '@/services/apiKeyStorage';

interface APIKeySetupProps {
  onComplete: (apiKey: string, model: GPTModel) => void;
  onCancel: () => void;
}

export function APIKeySetup({ onComplete, onCancel }: APIKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<GPTModel>(GPTModel.GPT4O);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, error: 'Please enter an API key' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await testAPIKey(apiKey);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = async () => {
    if (!testResult?.valid) {
      await handleTestConnection();
      return;
    }

    // Store API key
    await storeAPIKey(apiKey, selectedModel);

    // Complete setup
    onComplete(apiKey, selectedModel);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure OpenAI API</h3>
        <p className="text-sm text-muted-foreground">
          To use the AI Assistant, you need an OpenAI API key. Your key is stored encrypted on your device.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Privacy Notice:</strong> Documents you upload will be sent to OpenAI's servers for processing.
          Make sure you're comfortable with{' '}
          <a
            href="https://openai.com/policies/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            OpenAI's Privacy Policy
            <ExternalLink className="w-3 h-3" />
          </a>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !apiKey.trim()}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Don't have an API key?{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Get one here
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {testResult && (
          <Alert variant={testResult.valid ? 'default' : 'destructive'}>
            <AlertDescription className="flex items-center gap-2">
              {testResult.valid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>API key is valid!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>{testResult.error || 'Invalid API key'}</span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="model">AI Model</Label>
          <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as GPTModel)}>
            <SelectTrigger id="model" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GPT_MODEL_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span className="font-medium">{info.name}</span>
                    <span className="text-xs text-muted-foreground">{info.description}</span>
                    <span className="text-xs text-muted-foreground">
                      ~${info.inputCostPer1M}/1M input tokens
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!apiKey.trim() || testing}>
          {testResult?.valid ? 'Continue' : 'Test & Continue'}
        </Button>
      </div>
    </div>
  );
}
