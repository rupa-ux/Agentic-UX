/**
 * Search AI — Recommendations 2.0 (prototype)
 *
 * Design reference: Figma **Recommendations 2.0** — node `86-40295`
 * https://www.figma.com/design/h2UBW91Ecj9rwQHMJfZHE4/Recommendations-2.0?node-id=86-40295
 *
 * Engineering notes (audit placeholder until design signs off pixel-perfect):
 * - Variants: default list, priority filters, per-card impact + actions.
 * - Tokens: semantic Tailwind only on this surface (`bg-card`, `border-border`, …).
 * - Badges / chips: sentence case per product UI rules.
 */
import { Lightbulb, Sparkles, TrendingUp, Filter, MoreVertical, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";

export type SearchAIRecommendation = {
  id: string;
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  category: string;
  locations: number;
};

const MOCK_RECOMMENDATIONS: SearchAIRecommendation[] = [
  {
    id: "r1",
    title: "Pizza delivery",
    description: "Adding pizza delivery to the service section enhances SEO, improving visibility for relevant local searches for pizza delivery. Potential Reach - 450K",
    impact: "High",
    category: "Services",
    locations: 1,
  },
  {
    id: "r2",
    title: "Close-up shot of freshly baked pizza",
    description: "Upload an image showcasing close-up shot of freshly baked pizza to attract and engage customers effectively.",
    impact: "Low",
    category: "Photos",
    locations: 1,
  },
  {
    id: "r3",
    title: "Delivery person handing pizza to customer",
    description: "Upload an image showcasing delivery person handing pizza to customer to attract and engage customers effectively.",
    impact: "Low",
    category: "Photos",
    locations: 1,
  },
  {
    id: "r4",
    title: "Relax The Back® in Alpharetta...",
    description: "Adding \"pizza delivery\" helps target local searches, even by stating that it is not offered, which clarifies services.",
    impact: "Low",
    category: "Google description",
    locations: 1,
  },
  {
    id: "r5",
    title: "Silver Shop delivers comprehensive...",
    description: "Adding roofing, concrete work, and project planning will help people find Silver Shop's specialized services, boosting SEO ranking.",
    impact: "Low",
    category: "Google description",
    locations: 1,
  },
];

const FILTER_CHIPS = ["All", "High impact", "Medium impact", "Low impact"] as const;

function impactVariant(impact: SearchAIRecommendation["impact"]): "default" | "secondary" | "outline" {
  if (impact === "High") return "default";
  if (impact === "Medium") return "secondary";
  return "outline";
}

export function SearchAIRecommendationsPanel() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-start justify-between border-b border-border px-6 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">AI recommendations</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Enhance your business's search ranking with AI-driven recommendations and one-click optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="shrink-0">
            <MoreVertical size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
          </Button>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-8 pt-6">
        <div className="mx-auto flex w-full flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">5</span>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-foreground">Pending</span>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">1</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth className="text-emerald-500" />
                <span className="text-xs font-medium text-foreground">Accepted</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">1</span>
              <div className="flex items-center gap-2">
                <XCircle size={12} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Rejected</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium">Recommendations</TableHead>
                  <TableHead className="text-xs font-medium w-[160px]">
                    <div className="flex items-center gap-1">
                      Ranking Impact
                      <ChevronDown size={14} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-medium w-auto"></TableHead>
                  <TableHead className="text-xs font-medium w-[120px]">
                    <div className="flex items-center gap-1">
                      Locations
                      <ChevronDown size={14} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
                    </div>
                  </TableHead>
                  <TableHead className="w-[48px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_RECOMMENDATIONS.map((rec) => (
                  <TableRow key={rec.id} className="group">
                    <TableCell className="py-4 align-top w-[300px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{rec.category}</span>
                        <span className="text-sm font-medium text-foreground">{rec.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <Badge variant={rec.impact === "High" ? "destructive" : "secondary"} className={rec.impact === "High" ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-50" : ""}>
                        {rec.impact}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <p className="text-sm text-foreground leading-relaxed">
                        {rec.description}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <span className="text-sm text-foreground">{rec.locations}</span>
                    </TableCell>
                    <TableCell className="py-4 align-top text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
