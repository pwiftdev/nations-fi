import type { NationCoinRow } from "@/types/screener";
import { ChartButton } from "./chart-button";
import { TradeButton } from "./trade-button";

export function ScreenerRowActions({
  row,
  compact = false,
  onChartClick,
}: {
  row: NationCoinRow;
  compact?: boolean;
  onChartClick: (row: NationCoinRow) => void;
}) {
  const mint = row.contractAddress ?? row.id;
  const canChart = Boolean(row.chartAddress ?? mint);

  return (
    <div className="flex justify-end gap-1">
      <ChartButton
        compact={compact}
        disabled={!canChart}
        onClick={() => onChartClick(row)}
      />
      <TradeButton mint={mint} compact={compact} />
    </div>
  );
}
