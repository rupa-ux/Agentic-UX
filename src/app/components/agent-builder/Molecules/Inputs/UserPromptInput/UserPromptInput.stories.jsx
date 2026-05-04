import React, { useState } from 'react';
import UserPromptInput from './UserPromptInput';

export default {
  title: 'Agent Builder/Molecules/Inputs/UserPromptInput',
  component: UserPromptInput,
};

export const Default = {
  render: () => {
    const [tokens, setTokens] = useState([]);
    return (
      <div style={{ width: 360, padding: 16 }}>
        <UserPromptInput tokens={tokens} onTokensChange={setTokens} required />
      </div>
    );
  },
};

export const WithInlineChips = {
  render: () => {
    const [tokens, setTokens] = useState([
      { type: 'text', value: 'Use response from ' },
      { type: 'variable', label: '4. Response.ai_text' },
      { type: 'text', value: '\nand respond using ' },
      { type: 'tool', label: 'Review responder' },
    ]);
    return (
      <div style={{ width: 360, padding: 16 }}>
        <UserPromptInput tokens={tokens} onTokensChange={setTokens} required />
      </div>
    );
  },
};
