import React from 'react';
import LHSTwoLevelGroup from './LHSTwoLevelGroup';

export default {
  title: 'Agent Builder/Molecules/LHS/LHSTwoLevelGroup',
  component: LHSTwoLevelGroup,
  parameters: { layout: 'padded' },
};

const INBOX_TRIGGER_PLATFORMS = {
  Chat: {
    icon: 'chat',
    items: ['New message received', 'Conversation assigned', 'Conversation closed', 'Conversation reopened'],
  },
  Call: {
    icon: 'call',
    items: ['Inbound call received', 'Outbound call made', 'Call missed', 'Call completed', 'Voicemail received'],
  },
  SMS: {
    icon: 'sms',
    items: ['SMS received', 'SMS delivered', 'SMS failed to deliver', 'Opt-out received'],
  },
};

const INBOX_TASK_PLATFORMS = {
  Chat: {
    icon: 'chat',
    items: ['Send message', 'Close conversation', 'Assign conversation', 'Add note'],
  },
  Call: {
    icon: 'call',
    items: ['Make outbound call', 'Transfer call', 'End call', 'Leave voicemail'],
  },
  SMS: {
    icon: 'sms',
    items: ['Send SMS', 'Schedule SMS', 'Opt out contact'],
  },
};

export const InboxTrigger = {
  args: {
    title: 'Inbox',
    platforms: INBOX_TRIGGER_PLATFORMS,
    nodeType: 'trigger',
  },
};

export const InboxTask = {
  args: {
    title: 'Inbox',
    platforms: INBOX_TASK_PLATFORMS,
    nodeType: 'task',
  },
};
