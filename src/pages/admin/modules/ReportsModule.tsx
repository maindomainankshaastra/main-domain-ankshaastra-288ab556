import { Link } from "react-router-dom";
import { ScanSearch, Wand2, Baby, BookOpen, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * REPORTS — landing page.
 *
 * Replaces the old flat "/admin/name-check-reports" route. This page shows
 * one box per report type; clicking a box navigates into that report's own
 * module (currently only Name Check has a real module — see `to` below).
 *
 * To add a new report type later: build its module + route (see
 * NameCheckReportsModule.tsx / App.tsx for the pattern), then flip that
 * entry's `to` from `null` to the real path here.
 */
interface ReportTypeCard {
  key: string;
  title: string;
  description: string;
  icon: typeof ScanSearch;
  /** Route to navigate to. `null` = not built yet, card renders as disabled. */
  to: string | null;
}

const REPORT_TYPES: ReportTypeCard[] = [
  {
    key: "name-check",
    title: "Name Check",
    description: "Full Chaldean numerology compatibility check against the customer's Mulank and Bhagyank.",
    icon: ScanSearch,
    to: "/admin/reports/name-check",
  },
  {
    key: "name-correction",
    title: "Name Correction Report",
    description: "Corrected name suggestions and rationale for customers whose current name isn't well-aligned.",
    icon: Wand2,
    to: null,
  },
  {
    key: "perfect-baby-name",
    title: "Perfect Baby Name Report",
    description: "Numerology-aligned name shortlist for a newborn, based on birth details.",
    icon: Baby,
    to: null,
  },
  {
    key: "complete-baby-blueprint",
    title: "Complete Baby Blueprint",
    description: "Full birth-chart blueprint covering naming, core numbers, and early-life guidance.",
    icon: BookOpen,
    to: null,
  },
];

function ReportCard({ report }: { report: ReportTypeCard }) {
  const Icon = report.icon;
  const isReady = report.to !== null;

  const content = (
    <Card
      className={cn(
        "h-full transition-colors",
        isReady ? "cursor-pointer hover:border-primary/50 hover:shadow-md" : "opacity-60"
      )}
    >
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {!isReady && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Coming Soon
            </Badge>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold leading-tight">{report.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{report.description}</p>
        </div>
        {isReady && (
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isReady) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link to={report.to as string} className="block h-full">
      {content}
    </Link>
  );
}

export default function ReportsModule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Choose a report type to manage its submissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORT_TYPES.map((report) => (
          <ReportCard key={report.key} report={report} />
        ))}
      </div>
    </div>
  );
}
