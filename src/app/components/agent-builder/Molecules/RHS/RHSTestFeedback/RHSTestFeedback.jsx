import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';

export default function RHSTestFeedback({ value, onChange, onSubmit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#555', fontFamily: '"Roboto", arial, sans-serif' }}>Your feedback</span>
        <Textarea
          name="feedback"
          value={value}
          onChange={onChange}
          rows={4}
          placeholder="Output look wrong? Provide feedback to improve your prompt"
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outline"
          disabled={!value || !value.trim()}
          onClick={onSubmit}
        >
          Submit to revise prompt
        </Button>
      </div>
    </div>
  );
}
