import { Globe, MoreHorizontal, ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/app/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export interface Site {
  id: string;
  name: string;
  category: string;
  locationsListed: number;
  locationsTotal: number;
  avgAccuracy: number;
  lastSynced: string;
}

export const MOCK_SITES: Site[] = [
  { id: "google",      name: "Google Business",   category: "Search",    locationsListed: 6, locationsTotal: 6, avgAccuracy: 96, lastSynced: "2h ago" },
  { id: "yelp",        name: "Yelp",               category: "Reviews",   locationsListed: 6, locationsTotal: 6, avgAccuracy: 88, lastSynced: "4h ago" },
  { id: "facebook",    name: "Facebook",            category: "Social",    locationsListed: 5, locationsTotal: 6, avgAccuracy: 82, lastSynced: "6h ago" },
  { id: "apple",       name: "Apple Maps",          category: "Maps",      locationsListed: 6, locationsTotal: 6, avgAccuracy: 91, lastSynced: "1d ago" },
  { id: "bing",        name: "Bing Places",         category: "Search",    locationsListed: 4, locationsTotal: 6, avgAccuracy: 74, lastSynced: "2d ago" },
  { id: "foursquare",  name: "Foursquare",          category: "Discovery", locationsListed: 5, locationsTotal: 6, avgAccuracy: 79, lastSynced: "3d ago" },
  { id: "tripadvisor", name: "TripAdvisor",         category: "Reviews",   locationsListed: 3, locationsTotal: 6, avgAccuracy: 68, lastSynced: "4d ago" },
  { id: "yahoo",       name: "Yahoo Local",         category: "Search",    locationsListed: 4, locationsTotal: 6, avgAccuracy: 71, lastSynced: "5d ago" },
];

export function AccuracyBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted-foreground">—</span>;
  const color = value >= 90 ? "bg-emerald-500" : value >= 70 ? "bg-amber-400" : "bg-red-400";
  const textColor = value >= 90 ? "text-emerald-700 dark:text-emerald-400" : value >= 70 ? "text-amber-700 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-medium ${textColor}`}>{value}%</span>
    </div>
  );
}

export function ListingsAllSitesPanel({ search }: { search: string }) {
  const filtered = MOCK_SITES.filter((s) =>
    [s.name, s.category].some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  const coveragePct = (s: Site) => Math.round((s.locationsListed / s.locationsTotal) * 100);

  return (
    <div className="flex-1 overflow-y-auto min-h-0 bg-card rounded-xl border border-border mx-6 mb-6 mt-6">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-medium">Directory</TableHead>
            <TableHead className="text-xs font-medium w-[100px]">Category</TableHead>
            <TableHead className="text-xs font-medium w-[150px]">Coverage</TableHead>
            <TableHead className="text-xs font-medium w-[140px]">Avg. accuracy</TableHead>
            <TableHead className="text-xs font-medium w-[120px]">Last synced</TableHead>
            <TableHead className="text-xs font-medium w-[48px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((site) => {
            const pct = coveragePct(site);
            return (
              <TableRow key={site.id} className="cursor-default">
                <TableCell className="py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Globe size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{site.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs text-muted-foreground">{site.category}</span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : pct >= 66 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{site.locationsListed}/{site.locationsTotal}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <AccuracyBar value={site.avgAccuracy} />
                </TableCell>
                <TableCell className="py-3 text-xs text-muted-foreground">{site.lastSynced}</TableCell>
                <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer">
                        <MoreHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem className="text-xs cursor-pointer">
                        <RefreshCcw size={12} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
                        Sync now
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs cursor-pointer">
                        <ExternalLink size={12} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
                        View directory
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
