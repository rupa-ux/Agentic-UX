import React from 'react';
import RHSStart from './RHSStart';

export default {
  title: 'Conversation Builder/Molecules/RHS/Start',
  component: RHSStart,
  parameters: { layout: 'fullscreen' },
};

const noop = () => {};

export const Empty = {
  name: 'Empty',
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHSStart
        onClose={noop} onSave={noop} onPreview={noop} onExpand={noop}
        initialValues={{}}
      />
    </div>
  ),
};

export const Default = {
  name: 'Default',
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHSStart
        onClose={noop} onSave={noop} onPreview={noop} onExpand={noop}
        initialValues={{ name: 'Multi-channel support flow' }}
      />
    </div>
  ),
};

export const Filled = {
  name: 'Filled',
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHSStart
        onClose={noop} onSave={noop} onPreview={noop} onExpand={noop}
        initialValues={{
          name: 'Multi-channel support flow',
          goals: 'Handle inbound chat and call conversations across all locations.',
          outcomes: 'Improved CSAT, reduced average turns, lower transfer-to-human rate.',
          locations: [{ id: '1001', name: 'Mountain View, CA' }],
          channels: ['Text', 'Voice'],
          channelValues: {
            llmModelText: 'Advanced',
            thinkModeText: 'standard',
            voice: 'nova',
            language: 'English',
            llmModelVoice: 'Advanced',
          },
        }}
      />
    </div>
  ),
};
