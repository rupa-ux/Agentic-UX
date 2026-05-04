import React, { useState } from 'react';
import AgentsDashboardTemplate from './AgentsDashboardTemplate';
import AgentBuilder from '../../AgentBuilder/AgentBuilder';
import AgentPerformanceTemplate from '../AgentPerformanceTemplate/AgentPerformanceTemplate';

export default {
  title: 'Agent Builder/Templates/AgentsDashboardTemplate',
  component: AgentsDashboardTemplate,
  parameters: { layout: 'fullscreen' },
};

export const Default = {};

// Template pre-populated data keyed by template id
const TEMPLATE_DATA = {
  '1': {
    pageTitle: 'Review response agent replying using templates',
    nodeList: [
      {
        id: 'tmpl-trigger',
        flowType: 'trigger',
        data: { title: 'Trigger', subtype: 'New or updated review', stepNumber: 1, description: 'When a new review is received or updated', subtitle: 'Agent triggers on new or updated reviews across all sources and locations', hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'tmpl-task-fetch',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Fetch template', stepNumber: 2, description: 'Fetch matching response template', subtitle: 'Retrieve pre-defined template based on review type', hasAiIcon: false, hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'tmpl-task-send',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Send response', stepNumber: 3, description: 'Send a review response', subtitle: 'Reply to the review using the matched template', hasAiIcon: false, hasToggle: true, toggleEnabled: true },
      },
    ],
    nodeDetails: {
      'tmpl-trigger': { triggerName: 'New or updated review', description: 'Agent triggers on new or updated reviews across all sources and locations' },
      'tmpl-task-fetch': { taskName: 'Fetch matching response template', description: 'Retrieve pre-defined template based on review type' },
      'tmpl-task-send': { taskName: 'Send a review response', description: 'Reply to the review using the matched template' },
    },
  },
  '2': {
    pageTitle: 'Review response agent replying autonomously',
    nodeList: [
      {
        id: 'auto-trigger',
        flowType: 'trigger',
        data: { title: 'Trigger', subtype: 'New or updated review', stepNumber: 1, description: 'When a new review is received or updated', subtitle: 'Agent triggers on new or updated reviews across all sources and locations', hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'auto-task-fetch',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Fetch customer profile', stepNumber: 2, description: 'Fetch customer profile', subtitle: 'Retrieve account details and review history for the customer', hasAiIcon: false, hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'auto-task-llm',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Custom', stepNumber: 3, description: 'Generate response', subtitle: 'Generate a contextual response based on review content and customer profile', hasAiIcon: true, hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'auto-branch',
        flowType: 'branch',
        data: { title: 'Branch', subtype: 'Branch', stepNumber: 4, description: 'Based on conditions', subtitle: 'Route flow based on review type', hasToggle: true, toggleEnabled: true },
      },
    ],
    nodeDetails: {
      'auto-trigger': { triggerName: 'New or updated review', description: 'Agent triggers on new or updated reviews across all sources and locations' },
      'auto-task-fetch': { taskName: 'Fetch customer profile', description: 'Retrieve account details and review history for the customer' },
      'auto-task-llm': { taskName: 'Generate response', description: 'Generate a contextual response based on review content and customer profile', llmModel: 'Fast', systemPrompt: '', userPrompt: '' },
      'auto-branch': {
        basedOn: 'conditions',
        branches: [
          { id: 'auto-branch-path-1', name: 'Support' },
          { id: 'auto-branch-path-2', name: 'Product' },
        ],
      },
      'auto-branch-path-1': { branchName: 'Support', description: 'Reviews related to customer support experience', conditions: [], parentId: 'auto-branch', isBranchPath: true },
      'auto-branch-path-2': { branchName: 'Product', description: 'Reviews related to product quality or features', conditions: [], parentId: 'auto-branch', isBranchPath: true },
    },
  },
  '3': {
    pageTitle: 'Review response agent replying after human approval',
    nodeList: [
      {
        id: 'appr-trigger',
        flowType: 'trigger',
        data: { title: 'Trigger', subtype: 'New or updated review', stepNumber: 1, description: 'When a new review is received or updated', subtitle: 'Agent triggers on new or updated reviews', hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'appr-task-generate',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Custom', stepNumber: 2, description: 'Generate draft response', subtitle: 'Generate a context-aware draft response for human review', hasAiIcon: true, hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'appr-task-notify',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Send notification', stepNumber: 3, description: 'Notify reviewer', subtitle: 'Send draft to reviewer for approval', hasAiIcon: false, hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'appr-task-post',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Send response', stepNumber: 4, description: 'Post approved response', subtitle: 'Post the approved response to the review platform', hasAiIcon: false, hasToggle: true, toggleEnabled: true },
      },
    ],
    nodeDetails: {
      'appr-trigger': { triggerName: 'New or updated review', description: 'Agent triggers on new or updated reviews' },
      'appr-task-generate': { taskName: 'Generate draft response', description: 'Generate a context-aware draft response for human review', llmModel: 'Fast', systemPrompt: '', userPrompt: '' },
      'appr-task-notify': { taskName: 'Notify reviewer', description: 'Send draft to reviewer for approval' },
      'appr-task-post': { taskName: 'Post approved response', description: 'Post the approved response to the review platform' },
    },
  },
  '4': {
    pageTitle: 'Review response agent suggesting replies in dashboard',
    nodeList: [
      {
        id: 'sugg-trigger',
        flowType: 'trigger',
        data: { title: 'Trigger', subtype: 'New or updated review', stepNumber: 1, description: 'When a new review is received or updated', subtitle: 'Agent triggers on new or updated reviews', hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'sugg-task-llm',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Custom', stepNumber: 2, description: 'Generate suggested reply', subtitle: 'Generate a unique, context-aware suggested reply', hasAiIcon: true, hasToggle: true, toggleEnabled: true },
      },
      {
        id: 'sugg-task-show',
        flowType: 'task',
        data: { title: 'Task', subtype: 'Show in dashboard', stepNumber: 3, description: 'Display suggestion in dashboard', subtitle: 'Show the suggested reply in the dashboard for one-click posting', hasAiIcon: false, hasToggle: true, toggleEnabled: true },
      },
    ],
    nodeDetails: {
      'sugg-trigger': { triggerName: 'New or updated review', description: 'Agent triggers on new or updated reviews' },
      'sugg-task-llm': { taskName: 'Generate suggested reply', description: 'Generate a unique, context-aware suggested reply', llmModel: 'Fast', systemPrompt: '', userPrompt: '' },
      'sugg-task-show': { taskName: 'Display suggestion in dashboard', description: 'Show the suggested reply in the dashboard for one-click posting' },
    },
  },
};

function AppWithNavigation() {
  const [view, setView] = useState('dashboard');
  const [builderProps, setBuilderProps] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentCount, setAgentCount] = useState(0);

  const dashboardPageTitle = 'Review response agents';
  const agentBaseName = dashboardPageTitle.replace(/s$/, '');

  const handleCreateAgent = () => {
    const nextCount = agentCount + 1;
    setAgentCount(nextCount);
    setBuilderProps({
      pageTitle: `${agentBaseName} ${nextCount}`,
      defaultNodes: [],
      defaultNodeDetails: {},
    });
    setView('builder');
  };

  const handleUseTemplate = (templateId) => {
    const template = TEMPLATE_DATA[templateId];
    if (!template) return;
    setBuilderProps({
      pageTitle: template.pageTitle,
      defaultNodes: template.nodeList,
      defaultNodeDetails: template.nodeDetails,
    });
    setView('builder');
  };

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setView('performance');
  };

  const handleBack = () => {
    setView('dashboard');
  };

  if (view === 'builder') {
    return (
      <AgentBuilder
        appTitle="Reviews AI"
        activeNavId="reviews"
        onBack={handleBack}
        {...builderProps}
      />
    );
  }

  if (view === 'performance' && selectedAgent) {
    const perfMetrics = [
      { value: String(selectedAgent.reviewsResponded), title: 'Reviews responded', showTrend: true, trend: '+1.3%', trendPositive: true },
      { value: selectedAgent.responseRate,             title: 'Response rate',     showTrend: true, trend: '+1.3%', trendPositive: true },
      { value: selectedAgent.avgResponseTime,          title: 'Average response time', showTrend: true, trend: '+1.3%', trendPositive: true },
      { value: selectedAgent.timeSaved,                title: 'Time saved',        showTrend: true, trend: '+1.3%', trendPositive: true, showConfig: true },
    ];
    return (
      <AgentPerformanceTemplate
        agentName={selectedAgent.name}
        agentStatus={selectedAgent.status}
        metrics={perfMetrics}
        onBack={handleBack}
      />
    );
  }

  return (
    <AgentsDashboardTemplate
      pageTitle={dashboardPageTitle}
      onCreateAgent={handleCreateAgent}
      onUseTemplate={handleUseTemplate}
      onAgentClick={handleAgentClick}
    />
  );
}

export const WithNavigation = {
  render: () => <AppWithNavigation />,
};
