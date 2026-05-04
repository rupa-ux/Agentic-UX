import React, { useState } from 'react';
import ChannelConfig from './ChannelConfig';
import AdvancedConfigDrawer from '../RHS/Start/AdvancedConfigDrawer';

export default {
  title: 'Agent Builder/Molecules/ChannelConfig',
  component: ChannelConfig,
  parameters: { layout: 'padded' },
};

function Controlled({ initialChannels = [], initialActive = null, initialValues = {} }) {
  const [channels, setChannels] = useState(initialChannels);
  const [activeChannel, setActiveChannel] = useState(initialActive);
  const [values, setValues] = useState({
    replyButtons: [],
    resolutionButtonText: '',
    escalationButtonText: '',
    aiAgentName: '',
    fallbackEnabled: true,
    fallbackDuringHours: '',
    fallbackAfterHours: '',
    voice: [],
    language: [],
    llmModelVoice: 'Fast',
    llmModelText: 'Fast',
    thinkModeText: 'standard',
    ...initialValues,
  });
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  const handleChannelChange = (vals) => {
    setChannels(vals);
    setActiveChannel((prev) => (vals.includes(prev) ? prev : vals[0] ?? null));
  };

  return (
    <div style={{ width: 340 }}>
      {showAdvancedConfig && (
        <AdvancedConfigDrawer
          values={values}
          onChange={(field, val) => setValues((v) => ({ ...v, [field]: val }))}
          onBack={() => setShowAdvancedConfig(false)}
        />
      )}
      <ChannelConfig
        channels={channels}
        activeChannel={activeChannel}
        values={values}
        onChange={(field, val) => setValues((v) => ({ ...v, [field]: val }))}
        onChannelChange={handleChannelChange}
        onActiveChannelChange={setActiveChannel}
        onAdvancedConfig={() => setShowAdvancedConfig(true)}
      />
    </div>
  );
}

export const NoChannels = {
  render: () => <Controlled />,
};

export const WebchatSelected = {
  render: () => (
    <Controlled
      initialChannels={['Webchat']}
      initialActive="Webchat"
      initialValues={{
        replyButtons: ['escalation'],
        fallbackMessages: ['during', 'after'],
        fallbackDuringHours: "I'm sorry, I don't have an answer for that right now. Please try rephrasing your question.",
        fallbackAfterHours: "I'm not able to answer that right now. Our team is currently offline, but we'll get back to you as soon as possible once we're back online.",
        aiAgentName: 'Robin',
      }}
    />
  ),
};

export const VoiceSelected = {
  render: () => (
    <Controlled
      initialChannels={['Voice']}
      initialActive="Voice"
      initialValues={{ voice: 'nova', language: 'Spanish', llmModelVoice: 'Advanced' }}
    />
  ),
};

export const TextSelected = {
  render: () => (
    <Controlled
      initialChannels={['Text']}
      initialActive="Text"
    />
  ),
};

export const AllChannels = {
  render: () => (
    <Controlled
      initialChannels={['Webchat', 'Voice', 'Text']}
      initialActive="Webchat"
    />
  ),
};
