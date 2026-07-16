import { History } from "lucide-react";
import { Card } from "../../../shared/components";
import { DashboardSectionTitle } from "./DashboardSectionTitle";
import type { RecentActivityItem } from "../types";

type RecentActivitySectionProps = {
  items: RecentActivityItem[];
};

function RecentActivitySection({ items }: RecentActivitySectionProps) {
  return (
    <section className="space-y-4">
      <DashboardSectionTitle
        title="Atividade Recente"
        icon={<History className="size-[18px]" />}
      />

      <Card className="rounded-[4px] border-[#464554] bg-[#121212] p-4 shadow-none">
        <div className="border-l border-[#353437] pl-6">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="relative space-y-1">
                <span
                  className={`absolute -left-[29px] top-1 size-3 rounded-full border-2 bg-[#201f22] ${
                    item.highlighted ? "border-primary" : "border-[#464554]"
                  }`}
                  aria-hidden="true"
                />
                <p className="text-[13px] leading-[1.5] text-[#e5e1e4]">
                  {item.content}
                </p>
                <p className="text-[11px] tracking-[0.03em] text-[#c7c4d7]">
                  {item.timestamp}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}

export { RecentActivitySection };
