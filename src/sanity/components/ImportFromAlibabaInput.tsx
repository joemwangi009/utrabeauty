import React from 'react';
import { InputProps } from 'sanity';
import { ImportFromAlibaba } from './ImportFromAlibaba';

export const ImportFromAlibabaInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    // Map InputProps to ImportFromAlibabaProps
    const mappedProps = {
      type: { name: 'string' }, // Provide a default type
      value: props.value,
      onChange: props.onChange,
      onFocus: () => {}, // Provide default empty function
      onBlur: () => {}, // Provide default empty function
      readOnly: props.readOnly
    };

    return <ImportFromAlibaba {...mappedProps} ref={ref} />;
  }
);

ImportFromAlibabaInput.displayName = 'ImportFromAlibabaInput'; 