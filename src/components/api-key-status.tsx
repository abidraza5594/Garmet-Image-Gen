'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Key, AlertTriangle, Wifi, Server, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiKeyAttempt {
  key: string;
  source: 'predefined' | 'user' | 'environment';
  index?: number;
  status: 'trying' | 'success' | 'failed';
  error?: string;
  errorType?: 'quota_exceeded' | 'invalid_key' | 'network_error' | 'unknown_error';
}

interface ApiKeyStatusProps {
  attempts: ApiKeyAttempt[];
  currentAttempt?: ApiKeyAttempt;
  isGenerating?: boolean;
  className?: string;
}

const getErrorIcon = (errorType?: string) => {
  switch (errorType) {
    case 'quota_exceeded':
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case 'invalid_key':
      return <Key className="h-4 w-4 text-red-500" />;
    case 'network_error':
      return <Wifi className="h-4 w-4 text-blue-500" />;
    default:
      return <Server className="h-4 w-4 text-gray-500" />;
  }
};

const getErrorMessage = (errorType?: string, error?: string) => {
  switch (errorType) {
    case 'quota_exceeded':
      return 'Quota limit exceeded';
    case 'invalid_key':
      return 'Invalid API key';
    case 'network_error':
      return 'Network connection error';
    default:
      return error || 'Unknown error';
  }
};

const getKeyDisplayName = (attempt: ApiKeyAttempt) => {
  if (attempt.source === 'environment') {
    return 'Environment Key';
  } else if (attempt.source === 'user') {
    return 'Your API Key';
  } else if (attempt.index !== undefined) {
    return `API Key #${attempt.index + 1}`;
  }
  return 'API Key';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'trying':
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'failed':
      return 'bg-red-50 border-red-200';
    case 'trying':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export default function ApiKeyStatus({ 
  attempts, 
  currentAttempt, 
  isGenerating = false,
  className 
}: ApiKeyStatusProps) {
  const allAttempts = [...attempts];
  if (currentAttempt && !attempts.find(a => a.key === currentAttempt.key)) {
    allAttempts.push(currentAttempt);
  }

  if (allAttempts.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Key className="h-4 w-4" />
          API Key Status
          {isGenerating && (
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1 animate-spin" />
              Generating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allAttempts.map((attempt, index) => (
          <div
            key={`${attempt.key}-${index}`}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              getStatusColor(attempt.status)
            )}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(attempt.status)}
              <div>
                <div className="font-medium text-sm">
                  {getKeyDisplayName(attempt)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {attempt.key.substring(0, 12)}...{attempt.key.substring(attempt.key.length - 4)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {attempt.status === 'failed' && attempt.errorType && (
                <div className="flex items-center gap-1 text-xs">
                  {getErrorIcon(attempt.errorType)}
                  <span className="text-muted-foreground">
                    {getErrorMessage(attempt.errorType, attempt.error)}
                  </span>
                </div>
              )}
              
              {attempt.status === 'success' && (
                <Badge variant="default" className="text-xs">
                  Success
                </Badge>
              )}
              
              {attempt.status === 'trying' && (
                <Badge variant="secondary" className="text-xs">
                  Trying...
                </Badge>
              )}
            </div>
          </div>
        ))}

        {isGenerating && currentAttempt && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Currently trying {getKeyDisplayName(currentAttempt)}. 
              {attempts.length > 0 && ` Previous attempts: ${attempts.length} failed.`}
            </AlertDescription>
          </Alert>
        )}

        {attempts.length > 0 && !isGenerating && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Total attempts: {attempts.length} • 
            Failed: {attempts.filter(a => a.status === 'failed').length} • 
            Success: {attempts.filter(a => a.status === 'success').length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
