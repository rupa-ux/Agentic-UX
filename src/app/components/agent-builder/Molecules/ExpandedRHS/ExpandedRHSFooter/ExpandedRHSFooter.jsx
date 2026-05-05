import React from 'react';
import { Button } from '@/app/components/ui/button';
import PromptStrength from '../../PromptStrength/PromptStrength';

export default function ExpandedRHSFooter({
  onCancel,
  onSave,
  showPromptStrength = false,
  promptStrength = 'Weak',
  promptFillWidth = 83,
}) {
  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
      background: '#ffffff',
      borderTop: '1px solid #eaeaea',
      borderRadius: '0 0 8px 8px',
      padding: '8px 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      <div style={{ flex: 1 }}>
        {showPromptStrength && (
          <PromptStrength
            promptStrength={promptStrength}
            promptFillWidth={promptFillWidth}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
}
