import React, { useState } from 'react';
import AdvancedConfigDrawer from '../../../Molecules/RHS/Start/AdvancedConfigDrawer';

export default {
  title: 'Agent Builder/Organisms/Drawer/AdvancedConfig',
  component: AdvancedConfigDrawer,
  parameters: { layout: 'fullscreen' },
};

const defaultValues = {
  llmModel: 'Fast',
  language: 'English',
  voice: [],
  voiceSpeed: 1,
  voiceTemperature: 1,
  voiceVolume: 1,
  expressiveMode: false,
  audioTags: [],
  storeCallAudio: true,
  backchanneling: true,
  backchannelFrequency: 0.6,
  backchannelWords: 'Yeah,Hmm',
  reminderIntervalSeconds: 10,
  reminderMaxCount: 1,
  voicemailDetection: false,
  ivrHangup: false,
  endCallOnSilence: 10,
  maxCallDuration: 1,
  ringDuration: 30,
  recordCall: false,
  zeroRetentionMode: false,
  conversationsRetentionPeriod: -1,
  enableCoaching: false,
  enableAuthentication: false,
  allowlist: [],
};

function DrawerWrapper({ channels, initialValues }) {
  const [values, setValues] = useState(initialValues);
  const handleChange = (field, val) => setValues((prev) => ({ ...prev, [field]: val }));

  return (
    <div style={{ height: '100vh', background: 'rgba(33,33,33,0.24)' }}>
      <AdvancedConfigDrawer
        channels={channels}
        values={values}
        onChange={handleChange}
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

export const VoiceOnly = {
  render: () => <DrawerWrapper channels={['Voice']} initialValues={defaultValues} />,
};

export const TextOnly = {
  render: () => <DrawerWrapper channels={['Text']} initialValues={defaultValues} />,
};

export const WebchatOnly = {
  render: () => <DrawerWrapper channels={['Webchat']} initialValues={defaultValues} />,
};

export const AllChannels = {
  render: () => <DrawerWrapper channels={['Voice', 'Text', 'Webchat']} initialValues={defaultValues} />,
};

export const VoiceWithOverrides = {
  render: () => (
    <DrawerWrapper
      channels={['Voice', 'Text']}
      initialValues={{
        ...defaultValues,
        voice: ['nova'],
        voiceOverrides: { llmModel: 'Advanced', language: 'Spanish' },
      }}
    />
  ),
};
