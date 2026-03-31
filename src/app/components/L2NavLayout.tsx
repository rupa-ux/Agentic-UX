/**
 * L2NavLayout — shared layout primitive for ALL L2 navigation panels.
 *
 * DEFAULT EXPANSION RULE (applies to every panel automatically):
 *   • If a section named "Actions" exists → expand only that section.
 *   • If no "Actions" section exists → expand only the first section.
 *   • All other sections start collapsed.
 *
 * DEFAULT ACTIVE RULE:
 *   • If defaultActive is provided → use it.
 *   • Otherwise → auto-select the first child of the expanded section.
 *
 * To build a new product L2 nav, pass a config object — no styling decisions needed:
 *
 *   <L2NavLayout
 *     headerAction={{ label: "Send a review request" }}
 *     sections={[
 *       { label: "Actions", children: ["Reply manually", "Monitor agent replies"] },
 *       { label: "Reviews", children: ["All", "Google", "Yelp"] },
 *     ]}
 *     footerLink={{ label: "Reports", external: true }}
 *   />
 */

import { useState } from "react";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

/* ─────────────────────────────────────────────────────
   Design tokens — edit here to update every L2 panel
   ───────────────────────────────────────────────────── */
export const PANEL =
  "w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#e5e9f0] dark:border-[#2e3340] rounded-tr-[8px] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300";

// Shared row geometry — same for headers, children, footer
export const ROW =
  "flex items-center justify-between w-full px-[8px] py-[6px] text-[13px] rounded-[4px] transition-colors tracking-[-0.26px]";

export const HOVER = "hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]";

export const SECTION_HEADER    = `${ROW} ${HOVER} text-[#212121] dark:text-[#e4e4e4]`;
export const CHILD_INACTIVE    = `${ROW} ${HOVER} text-left text-[#555] dark:text-[#9ba2b0]`;
export const CHILD_ACTIVE      = `${ROW} text-left text-[#1E44CC] dark:text-[#7fa8ff] bg-[#dce5ff] dark:bg-[#1e2d5e]`;
export const FOOTER_ROW_CLS    = `${ROW} ${HOVER} text-[#212121] dark:text-[#e4e4e4]`;

/* ─────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────── */
export interface L2Section {
  label: string;
  children: string[];
}

export interface L2HeaderAction {
  label: string;
}

export interface L2FooterLink {
  label: string;
  external?: boolean;
}

export interface L2NavLayoutProps {
  /** Top row with a + button (e.g. "Send a review request") */
  headerAction?: L2HeaderAction;
  /** Color of the + button in the headerAction. Defaults to "blue". */
  headerActionColor?: "blue" | "green";
  /** Flat clickable items rendered BEFORE sections (key = "standalone/{label}") */
  standaloneItems?: string[];
  /** Collapsible sections */
  sections: L2Section[];
  /** Single bottom row, optionally with an external-link icon */
  footerLink?: L2FooterLink;
  /**
   * Initial active item in "Section/Child" format.
   * Defaults to the first child of the default-expanded section.
   */
  defaultActive?: string;
  /** Controlled active item (for Storybook stories / testing) */
  activeItem?: string;
  onActiveItemChange?: (key: string) => void;
  "data-no-print"?: boolean;
}

/* ─────────────────────────────────────────────────────
   Helper — resolve which section opens by default
   ───────────────────────────────────────────────────── */
function resolveDefaultExpanded(sections: L2Section[]): string {
  return sections.find(s => s.label === "Actions")?.label ?? sections[0]?.label ?? "";
}

/* ─────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────── */
export function L2NavLayout({
  headerAction,
  headerActionColor = "blue",
  standaloneItems,
  sections,
  footerLink,
  defaultActive,
  activeItem: controlledActive,
  onActiveItemChange,
  "data-no-print": noprint,
}: L2NavLayoutProps) {

  // Expansion state — only the default section is open initially
  const defaultExpandedLabel = resolveDefaultExpanded(sections);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map(s => [s.label, s.label === defaultExpandedLabel]))
  );

  // Active item — auto-resolve to first child of expanded section if not provided
  const resolvedDefault =
    defaultActive ??
    sections.find(s => s.label === defaultExpandedLabel)?.children[0]
      ? `${defaultExpandedLabel}/${sections.find(s => s.label === defaultExpandedLabel)?.children[0]}`
      : "";

  const [internalActive, setInternalActive] = useState(resolvedDefault);
  const active = controlledActive ?? internalActive;

  const toggle = (label: string) =>
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));

  const activate = (key: string) => {
    setInternalActive(key);
    onActiveItemChange?.(key);
  };

  const plusBg = headerActionColor === "green" ? "bg-[#4caf50]" : "bg-[#1E44CC]";

  return (
    <div className={PANEL} data-no-print={noprint}>
      <div className="flex-1 overflow-y-auto px-[8px] pt-3 pb-4">

        {/* Header action */}
        {headerAction && (
          <button className={`${FOOTER_ROW_CLS} mb-[6px]`} style={{ fontSize: 14 }}>
            <span className="text-[14px]">{headerAction.label}</span>
            <div className={`w-[18px] h-[18px] ${plusBg} rounded-full flex items-center justify-center shrink-0`}>
              <span className="text-white text-[12px] leading-none select-none">+</span>
            </div>
          </button>
        )}

        {/* Standalone items (flat, before sections) */}
        {standaloneItems && standaloneItems.map(label => {
          const key = `standalone/${label}`;
          const isActive = active === key;
          return (
            <button
              key={label}
              onClick={() => activate(key)}
              className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
              style={{ fontWeight: isActive ? 400 : 300 }}
            >
              {label}
            </button>
          );
        })}

        {/* Sections */}
        {sections.map(section => (
          <div key={section.label}>
            <button
              onClick={() => toggle(section.label)}
              className={SECTION_HEADER}
              style={{ fontWeight: 400 }}
            >
              <span>{section.label}</span>
              {expanded[section.label]
                ? <ChevronUp   className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
              }
            </button>

            {expanded[section.label] && section.children.map(child => {
              const key = `${section.label}/${child}`;
              const isActive = active === key;
              return (
                <button
                  key={child}
                  onClick={() => activate(key)}
                  className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
                  style={{ fontWeight: isActive ? 400 : 300 }}
                >
                  {child}
                </button>
              );
            })}
          </div>
        ))}

        {/* Footer link */}
        {footerLink && (
          <button className={`${FOOTER_ROW_CLS} mt-[2px]`} style={{ fontWeight: 400 }}>
            <span>{footerLink.label}</span>
            {footerLink.external && (
              <ExternalLink className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
            )}
          </button>
        )}

      </div>
    </div>
  );
}
