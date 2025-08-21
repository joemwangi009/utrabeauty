import React, { useState } from 'react';
import { Button, Card, Flex, Stack, Text, TextInput, Badge, Spinner } from '@sanity/ui';
import { set, unset } from 'sanity';
import { PatchEvent } from 'sanity';

interface ImportFromAlibabaProps {
  type: any;
  value: any;
  onChange: (patch: PatchEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  readOnly?: boolean;
  markers?: any[];
  presence?: any[];
}

interface ScrapedProduct {
  title: string;
  description: string;
  price: string;
  images: string[];
  scrapedAt: string;
}

interface ScrapingResult {
  success: boolean;
  data?: ScrapedProduct;
  message?: string;
  error?: string;
  details?: string;
}

export const ImportFromAlibaba = React.forwardRef<HTMLInputElement, ImportFromAlibabaProps>(
  (props, ref) => {
    const { onChange, value, readOnly } = props;
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ScrapingResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
      if (!url) {
        setError('Please enter an Alibaba URL');
        return;
      }

      if (!url.includes('alibaba.com') && !url.includes('aliexpress.com')) {
        setError('Only Alibaba and AliExpress URLs are supported');
        return;
      }

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(`/api/scrape-alibaba?url=${encodeURIComponent(url)}`);
        const data: ScrapingResult = await response.json();

        if (data.success && data.data) {
          setResult(data);
          
          // Auto-fill the product fields
          const patches = [];

          // Set title
          patches.push(set(data.data.title, ['title']));
          
          // Set description
          patches.push(set(data.data.description, ['description']));
          
          // Set price (convert to number)
          const price = parseFloat(data.data.price.replace(/[^\d.,]/g, '')) || 0;
          patches.push(set(price, ['price']));
          
          // Set supplier URL
          patches.push(set(url, ['supplierUrl']));
          
          // Set importedFromAlibaba to true
          patches.push(set(true, ['importedFromAlibaba']));
          
          // Extract supplier name from URL or set default
          let supplierName = 'Alibaba Supplier';
          try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('alibaba.com')) {
              supplierName = 'Alibaba Supplier';
            } else if (urlObj.hostname.includes('aliexpress.com')) {
              supplierName = 'AliExpress Supplier';
            }
          } catch (e) {
            // If URL parsing fails, use default
            supplierName = 'Alibaba Supplier';
          }
          patches.push(set(supplierName, ['supplierName']));
          
          // Set import metadata
          patches.push(set({
            importedFrom: url.includes('aliexpress.com') ? 'aliexpress' : 'alibaba',
            importedAt: new Date().toISOString(),
            originalUrl: url
          }, ['importMetadata']));

          // Apply all patches
          onChange(PatchEvent.from(patches));

          setError(null);
        } else {
          setError(data.error || 'Failed to scrape product');
          setResult(data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setResult({
          success: false,
          error: 'Network error',
          details: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleClear = () => {
      setUrl('');
      setResult(null);
      setError(null);
    };

    return (
      <Card padding={4} radius={2} shadow={1}>
        <Stack space={4}>
          <Flex align="center" gap={2}>
            <Text size={2} weight="semibold">
              Import from Alibaba
            </Text>
            <Badge tone="primary" mode="outline" size={1}>
              Beta
            </Badge>
          </Flex>

          <Text size={1} muted>
            Paste an Alibaba or AliExpress product URL to automatically import product details.
          </Text>

          <Stack space={3}>
            <TextInput
              ref={ref}
              placeholder="https://alibaba.com/product-detail/..."
              value={url}
              onChange={(event) => setUrl(event.currentTarget.value)}
              disabled={isLoading || readOnly}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleImport();
                }
              }}
            />

            <Flex gap={2}>
              <Button
                mode="default"
                onClick={handleImport}
                disabled={isLoading || !url || readOnly}
                text={isLoading ? 'Importing...' : 'Import Product'}
                icon={isLoading ? Spinner : undefined}
              />
              
              {result && (
                <Button
                  mode="ghost"
                  onClick={handleClear}
                  text="Clear"
                  disabled={isLoading}
                />
              )}
            </Flex>
          </Stack>

          {error && (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1}>
                <strong>Error:</strong> {error}
              </Text>
            </Card>
          )}

          {result && result.success && result.data && (
            <Card padding={3} radius={2} tone="positive">
              <Stack space={3}>
                <Text size={1} weight="semibold">
                  ✅ Product imported successfully!
                </Text>
                
                <Stack space={2}>
                  <Flex justify="space-between">
                    <Text size={1} muted>Title:</Text>
                    <Text size={1} weight="medium">{result.data.title}</Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text size={1} muted>Price:</Text>
                    <Text size={1} weight="medium">${result.data.price}</Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text size={1} muted>Images:</Text>
                    <Text size={1} weight="medium">{result.data.images.length} found</Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text size={1} muted>Supplier URL:</Text>
                    <Text size={1} weight="medium" style={{ wordBreak: 'break-all' }}>
                      {url.substring(0, 50)}...
                    </Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text size={1} muted>Scraped at:</Text>
                    <Text size={1} weight="medium">
                      {new Date(result.data.scrapedAt).toLocaleString()}
                    </Text>
                  </Flex>
                </Stack>
              </Stack>
            </Card>
          )}

          {result && !result.success && (
            <Card padding={3} radius={2} tone="caution">
              <Stack space={2}>
                <Text size={1} weight="semibold">
                  ⚠️ Import failed
                </Text>
                <Text size={1}>
                  {result.error}: {result.details}
                </Text>
              </Stack>
            </Card>
          )}

          {isLoading && (
            <Card padding={3} radius={2} tone="primary">
              <Flex align="center" gap={2}>
                <Spinner />
                <Text size={1}>Scraping product data from Alibaba...</Text>
              </Flex>
            </Card>
          )}
        </Stack>
      </Card>
    );
  }
);

ImportFromAlibaba.displayName = 'ImportFromAlibaba'; 