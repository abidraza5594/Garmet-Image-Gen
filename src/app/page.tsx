'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { generateECommerceImages } from '@/ai/flows/generate-model-preview';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateMarketingCopy } from '@/ai/flows/generate-marketing-copy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Download, AlertCircle, UploadCloud, FileDown, RefreshCw, Eye, X, Copy } from 'lucide-react';
import ImageUploader from '@/components/image-uploader';
import ApiKeyInput from '@/components/api-key-input';
import ApiKeyStatus from '@/components/api-key-status';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GARMENT_CATEGORIES, getGarmentCategory, getGarmentSubcategory, type GarmentCategory, type GarmentSubcategory } from '@/lib/garment-categories';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface GeneratedImage {
  imageUrl: string;
}

type ModelGender = 'male' | 'female' | 'any';
type ModelAge = '18-25' | '25-35' | '35+';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [socialMediaPost, setSocialMediaPost] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isMarketingLoading, setIsMarketingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [addWatermark, setAddWatermark] = useState(false);
  const [modelGender, setModelGender] = useState<ModelGender>('male');
  const [modelAge, setModelAge] = useState<ModelAge>('18-25');
  const [selectedCategory, setSelectedCategory] = useState<string>('shirts');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('dress_shirts');
  const [garmentDescription, setGarmentDescription] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [lastUsedApiKey, setLastUsedApiKey] = useState<string | undefined>();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [allKeysExhausted, setAllKeysExhausted] = useState(false);
  const [failureSummary, setFailureSummary] = useState<{
    totalAttempts: number;
    quotaExceeded: number;
    invalidKeys: number;
    networkErrors: number;
    unknownErrors: number;
  } | undefined>();
  const [apiKeyAttempts, setApiKeyAttempts] = useState<Array<{
    key: string;
    source: 'predefined' | 'user' | 'environment';
    index?: number;
    status: 'trying' | 'success' | 'failed';
    error?: string;
    errorType?: 'quota_exceeded' | 'invalid_key' | 'network_error' | 'unknown_error';
  }>>([]);
  const [currentApiKeyAttempt, setCurrentApiKeyAttempt] = useState<{
    key: string;
    source: 'predefined' | 'user' | 'environment';
    index?: number;
    status: 'trying' | 'success' | 'failed';
  } | undefined>();
  const [isFailoverInProgress, setIsFailoverInProgress] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const { toast } = useToast();
  const watermarkText = 'uniqe casua store';

  useEffect(() => {
    if (!carouselApi || previewImageIndex === null) return;
    carouselApi.scrollTo(previewImageIndex, true);
  }, [carouselApi, previewImageIndex]);

  const fetchMarketingCopy = useCallback(async (currentTitle: string, currentDescription: string) => {
    if (currentTitle && currentDescription) {
        setIsMarketingLoading(true);
        setSocialMediaPost('');
        setSeoKeywords([]);
        try {
            const result = await generateMarketingCopy({ title: currentTitle, description: currentDescription, apiKey: lastUsedApiKey });
            if (result.error) {
                if (result.allKeysExhausted) {
                    setAllKeysExhausted(true);
                    setFailureSummary(result.failureSummary);
                    setShowApiKeyInput(true);
                }
                toast({
                    variant: 'destructive',
                    title: 'Marketing Assistant Failed',
                    description: result.allKeysExhausted ?
                        'All API keys exhausted. Please provide your own API key.' :
                        `Could not generate content. Error: ${result.error}`,
                });
            } else {
                setSocialMediaPost(result.socialMediaPost);
                setSeoKeywords(result.seoKeywords);
                // Reset failure states on success
                setAllKeysExhausted(false);
                setFailureSummary(undefined);
                setShowApiKeyInput(false);

                // Update attempts if available
                if (result.attempts) {
                    setApiKeyAttempts(result.attempts);
                }
            }
        } catch (e) {
             toast({
                variant: 'destructive',
                title: 'Marketing Assistant Failed',
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsMarketingLoading(false);
        }
    }
  }, [lastUsedApiKey, toast]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMarketingCopy(title, description);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [title, description, fetchMarketingCopy]);


  const handleImageUpload = (dataUrl: string) => {
    setOriginalImage(dataUrl);
    setGeneratedImages([]);
    setError(null);
    setErrorTitle(null);
    setTitle('');
    setDescription('');
    setSocialMediaPost('');
    setSeoKeywords([]);
    setTempApiKey('');
    setShowApiKeyInput(false);
    triggerGeneration(dataUrl);
  };

  const triggerGeneration = async (image: string, apiKeyOverride?: string) => {
    if (!image) return;

    setIsImageLoading(true);
    setIsTextLoading(true);
    setError(null);
    setErrorTitle(null);
    setLastUsedApiKey(apiKeyOverride);
    setApiKeyAttempts([]);
    setCurrentApiKeyAttempt(undefined);
    setIsFailoverInProgress(false);
    
    // Don't clear content on retry
    if (!apiKeyOverride) {
      setGeneratedImages([]);
      setTitle('');
      setDescription('');
      setSocialMediaPost('');
      setSeoKeywords([]);
    }

    try {
      const [imageResult, textResult] = await Promise.all([
        generateECommerceImages({
          garmentDataUri: image,
          addWatermark: addWatermark,
          watermarkText: watermarkText,
          modelGender: modelGender,
          modelAge: modelAge,
          garmentCategory: selectedCategory,
          garmentSubcategory: selectedSubcategory,
          garmentDescription: garmentDescription,
          ...(apiKeyOverride && { apiKey: apiKeyOverride }),
        }),
        generateProductDescription({
          garmentDataUri: image,
          garmentCategory: selectedCategory,
          garmentSubcategory: selectedSubcategory,
          garmentDescription: garmentDescription,
          ...(apiKeyOverride && { apiKey: apiKeyOverride }),
        })
      ]);

      let hasError = false;
      const handleError = (titleTxt: string, message: string, showKeyInput = false, failureSummaryData?: any) => {
        setError(message);
        setErrorTitle(titleTxt);
        setShowApiKeyInput(showKeyInput);
        if (showKeyInput) {
          setAllKeysExhausted(true);
          setFailureSummary(failureSummaryData);
        }
        toast({
          variant: 'destructive',
          title: titleTxt,
          description: message,
        });
        hasError = true;
      };

      // SILENT FAILOVER: Only show errors when ALL keys are exhausted
      const imageKeysExhausted = imageResult.allKeysExhausted;
      const textKeysExhausted = textResult.allKeysExhausted;
      const anyKeysExhausted = imageKeysExhausted || textKeysExhausted;

      const combinedFailureSummary = imageResult.failureSummary || textResult.failureSummary;
      const combinedError = imageResult.error || textResult.error;

      // Update API key attempts from the results (for debugging/status)
      const allAttempts = [...(imageResult.attempts || []), ...(textResult.attempts || [])];
      if (allAttempts.length > 0) {
        setApiKeyAttempts(allAttempts);
        // Detect if failover happened (multiple attempts means failover was used)
        const failedAttempts = allAttempts.filter(attempt => attempt.status === 'failed');
        if (failedAttempts.length > 0) {
          setIsFailoverInProgress(true);
        }
      }

      // ONLY show errors when ALL API keys are exhausted
      // This ensures silent failover - users don't see intermediate failures
      if (combinedError && anyKeysExhausted) {
        const totalAttempts = combinedFailureSummary?.totalAttempts || 0;
        const quotaExceeded = combinedFailureSummary?.quotaExceeded || 0;
        const invalidKeys = combinedFailureSummary?.invalidKeys || 0;

        let detailedMessage = 'All available API keys have been exhausted. ';
        if (quotaExceeded > 0) {
          detailedMessage += `${quotaExceeded} key(s) reached their daily quota. `;
        }
        if (invalidKeys > 0) {
          detailedMessage += `${invalidKeys} key(s) were invalid. `;
        }
        detailedMessage += 'Please provide your own Google Gemini API key to continue generating images.';

        handleError(
          'API Keys Exhausted',
          detailedMessage,
          true,
          combinedFailureSummary
        );
      }
      // If there's an error but keys aren't exhausted, the failover system is still working
      // so we don't show any error to the user - they just see loading states
      
      setIsImageLoading(false);
      setIsTextLoading(false);

      if (hasError) {
        return;
      }
      
      setShowApiKeyInput(false);
      setTempApiKey('');
      setAllKeysExhausted(false);
      setFailureSummary(undefined);
      setIsFailoverInProgress(false);

      // Update API key attempts with success information
      const successAttempts = [...(imageResult.attempts || []), ...(textResult.attempts || [])];
      if (successAttempts.length > 0) {
        setApiKeyAttempts(successAttempts);
      }

      setGeneratedImages(imageResult.generatedImages);
      setTitle(textResult.title);
      setDescription(textResult.description);

      if (imageResult.generatedImages.length > 0) {
        // Find which API key was used successfully
        const successfulAttempt = successAttempts.find(attempt => attempt.status === 'success');
        const keyInfo = successfulAttempt ?
          (successfulAttempt.source === 'environment' ? 'Environment API Key' :
           successfulAttempt.source === 'user' ? 'Your API Key' :
           `API Key #${(successfulAttempt.index || 0) + 1}`) : 'API Key';

        toast({
          title: 'Success!',
          description: `Your product assets have been generated using ${keyInfo}.`,
        });
      } else {
        setErrorTitle('Generation Failed');
        setError('No images were generated. This might be due to a safety filter. Please try a different image.');
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'No images were generated. Try a different image.',
        });
      }
    } catch (e: any) {
      console.error(e);
      let titleTxt = 'An Unexpected Error Occurred';
      let message = 'Something went wrong. Please check the console for details and try again.';

      if (e.message && (e.message.toLowerCase().includes('network') || e.message.toLowerCase().includes('failed to fetch'))) {
        titleTxt = 'Network Error';
        message = 'Could not connect to the AI service. Please check your internet connection and try again.';
      }
      
      setError(message);
      setErrorTitle(titleTxt);
      toast({
        variant: 'destructive',
        title: titleTxt,
        description: message,
      });
      setIsImageLoading(false);
      setIsTextLoading(false);
      setShowApiKeyInput(false);
    }
  };
  
  const handleDownloadImage = (imageUrl: string, index: number) => {
    saveAs(imageUrl, `generated-image-${index + 1}.png`);
  };

  const handleCopyText = (text: string, type: string) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: `${type} Copied!`,
                description: 'The text has been copied to your clipboard.',
            });
        });
    }
  };
  
  const handleDownloadAll = async () => {
    if (generatedImages.length === 0) return;
    const zip = new JSZip();

    const fetchTasks = generatedImages.map(async (img, index) => {
      const response = await fetch(img.imageUrl);
      const blob = await response.blob();
      zip.file(`image-${index + 1}.png`, blob);
    });
    
    await Promise.all(fetchTasks);

    let details = `Title: ${title}\n\nDescription:\n${description}`;
    if (socialMediaPost) {
        details += `\n\nSocial Media Post:\n${socialMediaPost}`;
    }
    if (seoKeywords.length > 0) {
        details += `\n\nSEO Keywords:\n${seoKeywords.join(', ')}`;
    }
    zip.file('details.txt', details);

    toast({ title: 'Zipping files...', description: 'Your download will begin shortly.' });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'ecommerce-assets.zip');
  };

  const handleStartOver = () => {
    setOriginalImage(null);
    setGeneratedImages([]);
    setError(null);
    setErrorTitle(null);
    setTitle('');
    setDescription('');
    setSocialMediaPost('');
    setSeoKeywords([]);
    setShowApiKeyInput(false);
    setTempApiKey('');
    setLastUsedApiKey(undefined);
    setAllKeysExhausted(false);
    setFailureSummary(undefined);
    setApiKeyAttempts([]);
    setCurrentApiKeyAttempt(undefined);
  };

  const isLoading = isImageLoading || isTextLoading;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center py-8 border-b mb-8">
          <h1 className="font-headline text-4xl md:text-5xl">Virtual Vogue</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Upload a single garment photo and our AI will generate professional e-commerce product shots, titles, and descriptions for you.
          </p>
        </header>

        {!originalImage && !isLoading && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline">1. Upload Image</CardTitle>
                <CardDescription>Select a single, clear photo of your product.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onImageUpload={handleImageUpload} className="h-64" />
            </CardContent>
            <CardHeader className="pt-4">
                <CardTitle className="font-headline">2. Customize Your Model</CardTitle>
                <CardDescription>Choose the model you'd like to see in your photos.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <Label htmlFor="model-gender">Model Gender</Label>
                  <Select value={modelGender} onValueChange={(value: ModelGender) => setModelGender(value)}>
                      <SelectTrigger id="model-gender">
                          <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                  </Select>
               </div>
               <div>
                  <Label htmlFor="model-age">Model Age</Label>
                  <Select value={modelAge} onValueChange={(value: ModelAge) => setModelAge(value)}>
                      <SelectTrigger id="model-age">
                          <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="18-25">18-25 years</SelectItem>
                          <SelectItem value="25-35">25-35 years</SelectItem>
                          <SelectItem value="35+">35+ years</SelectItem>
                      </SelectContent>
                  </Select>
               </div>
            </CardContent>
            <CardHeader className="pt-4">
                <CardTitle className="font-headline">3. Garment Details</CardTitle>
                <CardDescription>Specify the type of garment and its characteristics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <Label htmlFor="garment-category">Garment Category</Label>
                     <Select value={selectedCategory} onValueChange={(value) => {
                       setSelectedCategory(value);
                       const category = getGarmentCategory(value);
                       if (category && category.subcategories.length > 0) {
                         setSelectedSubcategory(category.subcategories[0].id);
                       }
                     }}>
                         <SelectTrigger id="garment-category">
                             <SelectValue placeholder="Select category" />
                         </SelectTrigger>
                         <SelectContent>
                             {GARMENT_CATEGORIES.map((category) => (
                               <SelectItem key={category.id} value={category.id}>
                                 {category.label}
                               </SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                  </div>
                  <div>
                     <Label htmlFor="garment-subcategory">Specific Type</Label>
                     <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                         <SelectTrigger id="garment-subcategory">
                             <SelectValue placeholder="Select type" />
                         </SelectTrigger>
                         <SelectContent>
                             {getGarmentCategory(selectedCategory)?.subcategories.map((subcategory) => (
                               <SelectItem key={subcategory.id} value={subcategory.id}>
                                 {subcategory.label}
                               </SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                  </div>
               </div>
               <div>
                  <Label htmlFor="garment-description">Garment Description</Label>
                  <Input
                      id="garment-description"
                      value={garmentDescription}
                      onChange={(e) => setGarmentDescription(e.target.value)}
                      placeholder={getGarmentSubcategory(selectedCategory, selectedSubcategory)?.placeholderText || 'Describe the garment details...'}
                      className="mt-1"
                  />
               </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 p-6">
                <div className="flex items-center space-x-2">
                    <Checkbox id="watermark-upload" checked={addWatermark} onCheckedChange={(checked) => setAddWatermark(checked === true)} />
                    <Label htmlFor="watermark-upload" className="cursor-pointer whitespace-nowrap">Add watermark to images</Label>
                </div>
            </CardFooter>
          </Card>
        )}

        {(isLoading || generatedImages.length > 0 || error) && (
          <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
              <Button variant="outline" onClick={handleStartOver}>
                  <UploadCloud className="mr-2 h-4 w-4" /> Start Over
              </Button>
              
              <div className="flex items-center gap-4">
                <Button onClick={handleDownloadAll} disabled={generatedImages.length === 0 || isLoading}>
                    <FileDown className="mr-2 h-4 w-4" /> Download All
                </Button>
              </div>
            </div>
            
            {(isTextLoading || title) && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="font-headline">Product Details</CardTitle>
                  <CardDescription>Our AI-generated title and description. Feel free to edit them.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isTextLoading ? (
                    <>
                      <Skeleton className="h-10 w-3/4" />
                      <Skeleton className="h-24 w-full" />
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="product-title" className="font-medium text-base">Title</Label>
                        <Input
                          id="product-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="mt-1"
                          placeholder="Product Title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-description" className="font-medium text-base">Description</Label>
                        <Textarea
                          id="product-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 min-h-[120px]"
                          placeholder="Product Description"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {(isMarketingLoading || socialMediaPost || seoKeywords.length > 0) && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="font-headline">Marketing Assistant</CardTitle>
                        <CardDescription>AI-generated social media content and SEO keywords.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isMarketingLoading ? (
                            <>
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-1/4" />
                                    <div className="flex flex-wrap gap-2">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-32" />
                                        <Skeleton className="h-8 w-28" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {socialMediaPost && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <Label htmlFor="social-post" className="font-medium text-base">Social Media Post</Label>
                                            <Button variant="ghost" size="sm" onClick={() => handleCopyText(socialMediaPost, 'Post')}>
                                                <Copy className="mr-2 h-4 w-4" /> Copy
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="social-post"
                                            value={socialMediaPost}
                                            onChange={(e) => setSocialMediaPost(e.target.value)}
                                            className="min-h-[140px]"
                                            placeholder="Social media post"
                                        />
                                    </div>
                                )}
                                {seoKeywords.length > 0 && (
                                    <div>
                                        <Label className="font-medium text-base">SEO Keywords</Label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {seoKeywords.map((keyword, index) => (
                                                <Badge key={index} variant="secondary">{keyword}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            <h2 className="font-headline text-2xl md:text-3xl text-center mb-6">Generated Images</h2>

            {isImageLoading && (
              <div className="space-y-4">
                {isFailoverInProgress && (
                  <div className="text-center text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Optimizing generation quality...</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="w-full aspect-square" />
                      <div className="p-2">
                        <Skeleton className="w-full h-10" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {error && !isLoading && !showApiKeyInput && (
               <div className="flex flex-col items-center justify-center text-center p-16 border-2 border-dashed rounded-lg bg-destructive/10">
                    <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                    <h3 className="font-headline text-2xl text-destructive">{errorTitle || 'Generation Failed'}</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <div className="mt-6 w-full max-w-sm space-y-2">
                        <Button
                            className="w-full"
                            onClick={() => triggerGeneration(originalImage!)}
                            disabled={isLoading}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Generation
                        </Button>
                    </div>
              </div>
            )}

            {showApiKeyInput && !isLoading && (
              <div className="flex flex-col items-center justify-center p-8">
                <ApiKeyInput
                  onApiKeySubmit={(apiKey: string) => {
                    setTempApiKey(apiKey);
                    triggerGeneration(originalImage!, apiKey);
                  }}
                  isLoading={isLoading}
                  errorMessage={allKeysExhausted ? undefined : error || undefined}
                  failureSummary={failureSummary}
                  className="max-w-lg"
                />
              </div>
            )}

            {!isImageLoading && generatedImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {generatedImages.map((image, index) => (
                  <Card key={index} className="overflow-hidden group relative">
                    <CardContent className="p-0">
                      <Image
                        src={image.imageUrl}
                        alt={`Generated e-commerce image ${index + 1}`}
                        width={500}
                        height={500}
                        className="w-full aspect-square object-contain bg-card"
                      />
                    </CardContent>
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPreviewImageIndex(index)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                            <Button size="sm" onClick={() => handleDownloadImage(image.imageUrl, index)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* API Key Status Display */}
            {(apiKeyAttempts.length > 0 || isLoading) && (
              <div className="mt-6">
                <ApiKeyStatus
                  attempts={apiKeyAttempts}
                  currentAttempt={currentApiKeyAttempt}
                  isGenerating={isLoading}
                  className="max-w-2xl mx-auto"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={previewImageIndex !== null} onOpenChange={(isOpen) => { if (!isOpen) setPreviewImageIndex(null); }}>
        <DialogContent className="max-w-[90vw] w-full p-0 bg-transparent border-none shadow-none flex items-center justify-center h-[90vh]">
          {generatedImages.length > 0 && previewImageIndex !== null && (
            <div className="relative w-full h-full">
              <Carousel setApi={setCarouselApi} opts={{ loop: true, ...{} }} className="w-full h-full">
                <CarouselContent className="h-full">
                  {generatedImages.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="relative p-1 flex items-center justify-center h-full">
                        <Image
                          src={image.imageUrl}
                          alt={`Generated image preview ${index + 1}`}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 text-white bg-black/50 hover:bg-black/80 hover:text-white" />
                <CarouselNext className="absolute right-2 text-white bg-black/50 hover:bg-black/80 hover:text-white" />
              </Carousel>
              <DialogClose className="absolute right-4 top-4 z-50 rounded-full p-1 bg-black/50 text-white opacity-70 hover:opacity-100 transition-opacity">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
