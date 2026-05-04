import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { IconStrip, ReviewsL2NavPanel } from '@/app/components/Sidebar';
import { MonitorNotificationsProvider } from '@/app/context/MonitorNotificationsContext';
import {
  APP_MAIN_CONTENT_SHELL_CLASS,
  APP_SHELL_BELOW_TOPBAR_CARD_CLASS,
  APP_SHELL_GUTTER_SURFACE_CLASS,
  APP_SHELL_RAIL_SURFACE_CLASS,
} from '@/app/components/layout/appShellClasses';
import MetricsGroup from '../../Organisms/MetricsGroup/MetricsGroup';
import AgentsTable from '../../Organisms/DataViews/AgentsTable/AgentsTable';
import TemplateLibrary from '../../Organisms/TemplateLibrary/TemplateLibrary';

const DEFAULT_TABS = [
  { id: 'agents',  label: 'Agents' },
  { id: 'library', label: 'Library' },
];

const DEFAULT_AGENTS = [
  { id: 1, name: 'Review response agent replying autonomously - North Region', status: 'Running',  reviewsResponded: 102, responseRate: '15%', avgResponseTime: '20m', timeSaved: '4h 20m', locations: 500 },
  { id: 2, name: 'Review response agent replying autonomously - East Region',  status: 'Running',  reviewsResponded: 98,  responseRate: '9%',  avgResponseTime: '5m',  timeSaved: '1h 10m', locations: 250 },
  { id: 3, name: 'Review response agent replying autonomously - South Region', status: 'Paused',   reviewsResponded: 53,  responseRate: '9%',  avgResponseTime: '10m', timeSaved: '45m',    locations: 200 },
  { id: 4, name: 'Review response agent replying autonomously - West Region',  status: 'Draft',    reviewsResponded: 35,  responseRate: '8%',  avgResponseTime: '2m',  timeSaved: '3h 20m', locations: 100 },
];

const DEFAULT_METRICS = [
  { value: '835', title: 'Reviews responded',     showTrend: true, trend: '+1.3%', trendPositive: true },
  { value: '92%', title: 'Response rate',          showTrend: true, trend: '+1.3%', trendPositive: true },
  { value: '20m', title: 'Average response time',  showTrend: true, trend: '+1.3%', trendPositive: true },
];

const iconStyle = { fontSize: 20, fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20", lineHeight: 1 };

export default function AgentsDashboardTemplate({
  pageTitle = 'Review response agents',
  tabs = DEFAULT_TABS,
  metrics = DEFAULT_METRICS,
  primaryMetricValue = '6h 20m',
  agents,
  agentsTable,
  templates,
  onCreateAgent,
  onUseTemplate,
  onTemplateClick,
  onAgentClick,
  onNavChange,
  onEditAgent,
  onOutcomesAgent,
  activeNavId = 'reviews',
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const [currentNavId, setCurrentNavId] = useState(activeNavId);
  const [libraryView, setLibraryView] = useState('grid');
  const [localAgents, setLocalAgents] = useState(agents ?? DEFAULT_AGENTS);

  function handleAgentAction(action, agent) {
    switch (action) {
      case 'Edit':   onEditAgent?.(agent); break;
      case 'Pause':
        setLocalAgents(prev => prev.map(a =>
          a.id === agent.id ? { ...a, status: a.status === 'Paused' ? 'Running' : 'Paused' } : a
        ));
        break;
      case 'Duplicate': {
        const dup = { ...agent, id: Date.now(), name: `${agent.name} (copy)` };
        setLocalAgents(prev => {
          const idx = prev.findIndex(a => a.id === agent.id);
          const next = [...prev];
          next.splice(idx + 1, 0, dup);
          return next;
        });
        break;
      }
      case 'Outcomes': onOutcomesAgent?.(agent); break;
      case 'Delete':   setLocalAgents(prev => prev.filter(a => a.id !== agent.id)); break;
    }
  }

  const handleNavChange = (id) => { setCurrentNavId(id); onNavChange?.(id); };

  return (
    <MonitorNotificationsProvider onNavigateToMonitor={() => handleNavChange('agents-monitor')}>
      <div className={`relative h-screen w-screen flex overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>

        <IconStrip currentView={currentNavId} onViewChange={handleNavChange} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className={`h-[48px] flex items-center px-4 shrink-0 rounded-tr-lg ${APP_SHELL_RAIL_SURFACE_CLASS}`}>
            <p className="text-[16px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.31px] font-normal">Reviews AI</p>
          </div>

          <div className={`flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
            <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
              <ReviewsL2NavPanel />

              <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
                {/* Page Header */}
                <div className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-app-shell-border bg-app-shell-main">
                  <span className="text-[18px] font-normal text-foreground tracking-[-0.36px]">{pageTitle}</span>
                  {activeTab === 'library' ? (
                    <div className="flex items-center gap-2">
                      <button className="w-9 h-9 border border-border rounded-md bg-background flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-muted-foreground" style={iconStyle}>search</span>
                      </button>
                      <div className="flex items-center gap-1 h-9 border border-border rounded-md bg-background px-2">
                        <button onClick={() => setLibraryView('grid')} className={`w-6 h-6 rounded flex items-center justify-center border-none cursor-pointer transition-colors ${libraryView === 'grid' ? 'bg-accent' : 'bg-transparent'}`}>
                          <span className="material-symbols-outlined text-foreground" style={{ ...iconStyle, fontSize: 16 }}>grid_view</span>
                        </button>
                        <button onClick={() => setLibraryView('table')} className={`w-6 h-6 rounded flex items-center justify-center border-none cursor-pointer transition-colors ${libraryView === 'table' ? 'bg-accent' : 'bg-transparent'}`}>
                          <span className="material-symbols-outlined text-foreground" style={{ ...iconStyle, fontSize: 16 }}>table_rows</span>
                        </button>
                      </div>
                      <button className="w-9 h-9 border border-border rounded-md bg-background flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-muted-foreground" style={iconStyle}>filter_list</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors cursor-pointer border-none bg-transparent">
                        <span className="material-symbols-outlined" style={iconStyle}>search</span>
                      </button>
                      <Button onClick={onCreateAgent}>Create agent</Button>
                      <button className="w-9 h-9 border border-border rounded-md bg-background flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-muted-foreground" style={iconStyle}>filter_list</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col overflow-hidden bg-app-shell-main">
                  <div className="px-6 shrink-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        {tabs.map((t) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
                      </TabsList>
                    </Tabs>
                  </div>

                  {activeTab === 'agents' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="px-6 pt-5 shrink-0">
                        <MetricsGroup primaryValue={primaryMetricValue} primaryType="time" showTrend primaryTrend="+1.3%" primaryTrendPositive metrics={metrics} />
                      </div>
                      <div className="flex-1 px-6 pt-5 overflow-auto">
                        {agentsTable || <AgentsTable agents={localAgents} onRowClick={onAgentClick} onAction={handleAgentAction} />}
                      </div>
                    </div>
                  )}

                  {activeTab === 'library' && (
                    <div className="flex-1 p-6 overflow-auto">
                      <TemplateLibrary variant={libraryView === 'table' ? 'list' : 'grid'} templates={templates} onUseTemplate={onUseTemplate} onTemplateClick={onTemplateClick} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MonitorNotificationsProvider>
  );
}

AgentsDashboardTemplate.propTypes = {
  pageTitle: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, label: PropTypes.string })),
  metrics: PropTypes.array,
  primaryMetricValue: PropTypes.string,
  agents: PropTypes.array,
  onCreateAgent: PropTypes.func,
  onUseTemplate: PropTypes.func,
  onTemplateClick: PropTypes.func,
  onAgentClick: PropTypes.func,
  onNavChange: PropTypes.func,
  onEditAgent: PropTypes.func,
  onOutcomesAgent: PropTypes.func,
  activeNavId: PropTypes.string,
  agentsTable: PropTypes.node,
  templates: PropTypes.array,
};
