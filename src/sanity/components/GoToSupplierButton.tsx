import React from 'react';
import { Button, Card, Flex, Stack, Text, Badge } from '@sanity/ui';

interface GoToSupplierButtonProps {
  type: any;
  value: any;
  onChange: (patch: any) => void;
  onFocus: () => void;
  onBlur: () => void;
  readOnly?: boolean;
  markers?: any[];
  presence?: any[];
}

export const GoToSupplierButton = React.forwardRef<HTMLInputElement, GoToSupplierButtonProps>(
  (props, ref) => {
    const { value, readOnly } = props;
    
    // Get the supplier URL from the parent order item
    const getSupplierUrl = () => {
      // This will be populated by the parent order item's supplierUrl field
      return value || null;
    };

    const supplierUrl = getSupplierUrl();

    const handleGoToSupplier = () => {
      if (supplierUrl) {
        window.open(supplierUrl, '_blank', 'noopener,noreferrer');
      }
    };

    if (!supplierUrl) {
      return (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>
            No supplier URL available
          </Text>
        </Card>
      );
    }

    return (
      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3}>
          <Flex align="center" gap={2}>
            <Text size={2} weight="semibold">
              Supplier Product Link
            </Text>
            <Badge tone="primary" mode="outline" size={1}>
              External
            </Badge>
          </Flex>

          <Text size={1} muted>
            Click the button below to open the supplier product page in a new tab.
          </Text>

          <Button
            mode="default"
            onClick={handleGoToSupplier}
            disabled={readOnly}
            text="🔄 Go to Supplier"
            tone="primary"
          />

          <Card padding={3} radius={2} tone="primary">
            <Text size={1} style={{ wordBreak: 'break-all' }}>
              <strong>URL:</strong> {supplierUrl}
            </Text>
          </Card>
        </Stack>
      </Card>
    );
  }
);

GoToSupplierButton.displayName = 'GoToSupplierButton'; 