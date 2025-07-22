'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading?: boolean;
  errorMessage?: string;
  failureSummary?: {
    totalAttempts: number;
    quotaExceeded: number;
    invalidKeys: number;
    networkErrors: number;
    unknownErrors: number;
  };
  className?: string;
}

export default function ApiKeyInput({ 
  onApiKeySubmit, 
  isLoading = false, 
  errorMessage,
  failureSummary,
  className 
}: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  const isValidApiKeyFormat = (key: string) => {
    // Basic validation for Google API key format
    return key.length > 20 && key.startsWith('AIza');
  };

  const getFailureMessage = () => {
    if (!failureSummary) return null;

    const { totalAttempts, quotaExceeded, invalidKeys, networkErrors } = failureSummary;

    if (quotaExceeded > 0 && invalidKeys === 0) {
      return {
        type: 'warning' as const,
        message: `${totalAttempts} API key${totalAttempts > 1 ? 's' : ''} exceeded quota limits. Please provide a key with available quota.`
      };
    }

    if (invalidKeys > 0 && quotaExceeded === 0) {
      return {
        type: 'error' as const,
        message: `${totalAttempts} invalid API key${totalAttempts > 1 ? 's were' : ' was'} detected. Please ensure you're using a valid Google Gemini API key.`
      };
    }

    if (networkErrors > 0) {
      return {
        type: 'warning' as const,
        message: `Network connectivity issues detected. Please check your connection and try again.`
      };
    }

    return {
      type: 'error' as const,
      message: `All ${totalAttempts} available API key${totalAttempts > 1 ? 's' : ''} failed. Please provide a working API key.`
    };
  };

  const failureInfo = getFailureMessage();

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">API Key Required</CardTitle>
        <CardDescription>
          {failureSummary ?
            "All predefined API keys have been exhausted. Please provide your own Google Gemini API key to continue generating images." :
            "Please provide your Google Gemini API key to generate AI content."
          }
        </CardDescription>
        {failureSummary && (
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <p>• Get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></p>
            <p>• Free tier includes generous daily limits</p>
            <p>• Your key is only used for this session</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {failureInfo && (
          <Alert variant={failureInfo.type === 'error' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{failureInfo.message}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium">
              Google Gemini API Key
            </label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              className={cn(
                "font-mono text-sm",
                apiKey && !isValidApiKeyFormat(apiKey) && "border-yellow-500 focus:border-yellow-500"
              )}
            />
            {apiKey && !isValidApiKeyFormat(apiKey) && (
              <p className="text-xs text-yellow-600">
                API key should start with "AIza" and be longer than 20 characters
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!apiKey.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Generate with API Key
              </>
            )}
          </Button>
        </form>

        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full text-xs"
          >
            <Info className="mr-2 h-3 w-3" />
            {showInstructions ? 'Hide' : 'Show'} instructions to get API key
          </Button>

          {showInstructions && (
            <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
              <p className="font-medium">How to get your Google Gemini API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Visit Google AI Studio</li>
                <li>Sign in with your Google account</li>
                <li>Click "Get API key" in the top navigation</li>
                <li>Create a new API key or copy an existing one</li>
                <li>Paste the key above and click "Generate"</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Open Google AI Studio
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Your API key is only used for this session and is not stored permanently.
        </div>
      </CardContent>
    </Card>
  );
}
