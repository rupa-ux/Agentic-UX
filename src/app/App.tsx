import { useState } from "react";
import { Toaster } from "sonner";
import { TopBar } from "./components/TopBar";
import { IconStrip, L2NavPanel } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { SharedByMe } from "./components/SharedByMe";
import { type DraftReport } from "./components/draftStore";

export type AppView = "dashboard" | "shared-by-me";

export default function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [editingDraft, setEditingDraft] = useState<DraftReport | null>(null);

  const handleEditDraft = (draft: DraftReport) => {
    setEditingDraft(draft);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleViewReport = (reportName: string) => {
    setEditingDraft(null);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleAiPanelChange = (open: boolean) => {
    setAiPanelOpen(open);
    if (!open) setEditingDraft(null);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* L1 icon strip – full height on the far left */}
      <IconStrip />

      {/* Everything to the right of the icon strip */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar spans above both L2 nav and content */}
        <TopBar currentView={currentView} onViewChange={setCurrentView} />

        {/* Below TopBar: L2 nav + main content side by side */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-[#e0e5eb]">
          {/* L2 nav panel (hidden when AI panel is open) */}
          {!aiPanelOpen && (
            <L2NavPanel currentView={currentView} onViewChange={setCurrentView} />
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {currentView === "shared-by-me" ? (
              <SharedByMe onEditDraft={handleEditDraft} onViewReport={handleViewReport} />
            ) : (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
