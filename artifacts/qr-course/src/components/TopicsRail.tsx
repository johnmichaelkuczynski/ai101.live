import { useListTopics } from "@workspace/api-client-react";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Plain vertical list of every topic covered in the course, top-left,
 * small font — no week or unit markers — plus course download buttons.
 * Shown on both the landing page and the dashboard.
 */
export function TopicsRail() {
  const { data: topics, isLoading } = useListTopics();

  return (
    <aside
      className="w-56 shrink-0 hidden md:flex flex-col gap-3 pt-6 pl-5 pr-4"
      aria-label="Topics covered in this course"
    >
      <h2 className="text-sm font-serif font-bold text-foreground">
        Topics Covered in This Course
      </h2>
      {topics && (
        <div className="text-[11px] text-muted-foreground -mt-2">
          {topics.length} topics
        </div>
      )}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {topics?.map((t) => (
            <li
              key={t.id}
              className="text-xs leading-snug text-muted-foreground"
            >
              {t.title}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-col gap-2">
        <a
          href="/api/course/download?format=pdf"
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90"
          data-testid="link-download-pdf"
        >
          <Download className="w-3.5 h-3.5" />
          Download Course (PDF)
        </a>
        <a
          href="/api/course/download?format=txt"
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border hover:bg-secondary"
          data-testid="link-download-txt"
        >
          <Download className="w-3.5 h-3.5" />
          Download as TXT
        </a>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Every lecture (short version) plus practice homework and exam
          problems.
        </p>
      </div>
    </aside>
  );
}
