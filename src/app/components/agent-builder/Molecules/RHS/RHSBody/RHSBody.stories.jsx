import React from 'react';
import RHSBody from './RHSBody';
import LLMTaskBody from '../../../Organisms/Panels/RHS/LLMTaskBody';
import EntityTaskBody from '../../../Organisms/Panels/RHS/EntityTaskBody';
import EntityTriggerBody from '../../../Organisms/Panels/RHS/EntityTriggerBody';
import AgentDetailsBody from '../../../Organisms/Panels/RHS/AgentDetailsBody';
import BranchBody from '../../../Organisms/Panels/RHS/BranchBody';
import ControlBranchBody from '../../../Organisms/Panels/RHS/ControlBranchBody';
import DelayBody from '../../../Organisms/Panels/RHS/DelayBody';
import ParallelBody from '../../../Organisms/Panels/RHS/ParallelBody';
import LoopBody from '../../../Organisms/Panels/RHS/LoopBody';
import { ScheduleBasedBody } from '../Trigger/ScheduleBased/ScheduleBased';
import CustomTriggerBody from '../../../Organisms/Panels/RHS/CustomTriggerBody';
import ConversationNodeBody from '../../../Organisms/Panels/RHS/ResponseNodeBody';
import TransferNodeBody from '../../../Organisms/Panels/RHS/TransferNodeBody';
import EndNodeBody from '../../../Organisms/Panels/RHS/EndNodeBody';

export default {
  title: 'Agent Builder/Molecules/RHS/RHSBody',
  component: RHSBody,
  parameters: { layout: 'fullscreen' },
};

const wrap = (children) => (
  <div style={{ width: 390, height: '100vh', display: 'flex', flexDirection: 'column', border: '1px solid #e5e9f0' }}>
    <RHSBody>{children}</RHSBody>
  </div>
);

export const CustomTask = {
  render: () => wrap(
    <LLMTaskBody initialValues={{
      taskName: 'Classify Sentiment',
      description: 'Determine the sentiment and extract key themes from the review text',
      llmModel: 'Standard',
      systemPrompt: 'You are a sentiment analysis expert.',
      userPrompt: 'Review: {{review_text}}',
      outputFields: [
        { fieldName: 'sentiment_score', fieldType: 'Number' },
        { fieldName: 'key_themes', fieldType: 'Text' },
      ],
    }} />
  ),
};

export const EntityTask = {
  render: () => wrap(
    <EntityTaskBody initialValues={{
      taskName: 'Send Review Response',
      description: 'Post a reply to the selected review from the Reviews source',
      tool: { id: 'birdeye', name: 'Send review response', logo: 'birdeye' },
    }} />
  ),
};

export const EntityTrigger = {
  render: () => wrap(
    <EntityTriggerBody initialValues={{
      triggerName: 'New Review Received',
      description: 'Triggers when a new or updated review is received across all sources and locations',
    }} />
  ),
};

export const StartNode = {
  render: () => wrap(
    <AgentDetailsBody />
  ),
};

export const ScheduledTrigger = {
  render: () => wrap(
    <ScheduleBasedBody
      frequencyOptions={['Hourly', 'Daily', 'Weekly', 'Monthly']}
      dayOptions={['1 day', '2 days', '3 days', '7 days', '14 days', '30 days']}
      timeOptions={['12:00 AM', '6:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '3:00 PM', '6:00 PM']}
      defaultFrequency="Daily"
      defaultDay="7 days"
      defaultTime="9:00 AM"
    />
  ),
};

export const Branch = {
  render: () => wrap(
    <BranchBody initialValues={{
      branchName: 'Positive Reviews',
      description: 'Branch for reviews with a rating of 4 stars or above',
      logic: 'AND',
      conditions: [
        {
          id: 1,
          fieldOptions: [{ value: 'rating', label: 'Rating' }, { value: 'sentiment', label: 'Sentiment' }],
          operatorOptions: [{ value: 'greater_than', label: 'Greater than' }, { value: 'equals', label: 'Equals' }],
          valueOptions: [{ value: '4', label: '4 stars' }, { value: '5', label: '5 stars' }],
          fieldValue: 'rating',
          operatorValue: 'greater_than',
          valueValue: '4',
        },
      ],
    }} />
  ),
};

export const ControlBranch = {
  render: () => wrap(
    <ControlBranchBody initialValues={{
      basedOn: 'conditions',
      branches: [
        { id: 1, name: 'Positive Reviews' },
        { id: 2, name: 'Negative Reviews' },
        { id: 3, name: 'Neutral Reviews' },
      ],
    }} />
  ),
};

export const Delay = {
  render: () => wrap(
    <DelayBody initialValues={{
      name: 'Wait for Processing',
      duration: '24',
      unit: 'hours',
    }} />
  ),
};

export const Parallel = {
  render: () => wrap(
    <ParallelBody initialValues={{
      nodeName: 'Process Multiple Sources',
      description: 'Handle reviews from different sources simultaneously',
      branches: [
        { name: 'Reviews Handler' },
        { name: 'Inbox Handler' },
        { name: 'Survey Handler' },
      ],
    }} />
  ),
};

export const Loop = {
  render: () => wrap(
    <LoopBody initialValues={{
      name: 'Process All Reviews',
      description: 'Iterate through each review in the collection and apply the workflow',
      loopMode: 'variable',
      loopOver: 'reviews_list',
    }} />
  ),
};

export const CustomTrigger = {
  render: () => wrap(
    <CustomTriggerBody initialValues={{
      entityType: 'Inbox',
      selectedEvents: ['New message received', 'Conversation assigned'],
    }} />
  ),
};

export const ResponseTask = {
  name: 'Response Task',
  render: () => wrap(
    <ConversationNodeBody
      initialValues={{
        taskName: 'Response',
        description: 'Handle inbound support chat',
        channels: ['Webchat', 'Voice'],
        conversationalGoal: 'Understand the issue and resolve it or route to a human agent.',
        systemPrompt: 'You are a helpful support agent. Be concise and empathetic.',
      }}
    />
  ),
};

export const TransferTask = {
  render: () => wrap(
    <TransferNodeBody initialValues={{
      transferTo: 'agent',
      selectedAgent: 'agent-1',
      delayBeforeTransfer: '30',
      transferMessage: 'Please hold while I connect you with a specialist.',
    }} />
  ),
};

export const EndTask = {
  render: () => wrap(
    <EndNodeBody initialValues={{
      closingMessage: 'Thank you for reaching out! Is there anything else I can help you with?',
      collectFeedback: true,
      feedbackType: 'CSAT',
      endState: 'resolved',
    }} />
  ),
};
