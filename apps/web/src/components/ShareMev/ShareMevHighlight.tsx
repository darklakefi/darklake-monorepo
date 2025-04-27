import { formatMoney } from "@/utils/number";
interface ShareMevHighlightProps {
  totalSolExtracted: number;
  totalUsdExtracted?: number;
}
export function ShareMevHighlight({ totalSolExtracted, totalUsdExtracted }: ShareMevHighlightProps) {
  totalUsdExtracted = 100;
  const solAmountFormatted = formatMoney(totalSolExtracted, 5);
  const solAmountParts = solAmountFormatted.toString().split(".");
  return (
    <div
      style={{
        display: "flex",

        color: "#1A9A56",
        textTransform: "uppercase",
      }}
    >
      <div
        style={{
          backgroundColor: "#2CFF8E",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "1.5rem",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.875rem",
            lineHeight: "1",
            display: "flex",
            whiteSpace: "nowrap",
          }}
        >
          Total extracted
        </div>

        <p
          style={{
            color: "#041C0F",
            height: "4rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            marginBottom: "2.25rem",
          }}
        >
          <div
            style={{
              fontSize: "8rem",
              lineHeight: 0,

              display: "flex",
            }}
          >
            {solAmountParts[0]}
          </div>
          <div
            style={{
              fontSize: "2.25rem",
              lineHeight: 0,
              display: "flex",
            }}
          >
            {!!solAmountParts[1] && `.${solAmountParts[1]}`} SOL
          </div>
        </p>
        {!!totalUsdExtracted && (
          <div style={{ display: "flex", fontSize: "1.875rem", lineHeight: 0 }}>
            {formatMoney(totalUsdExtracted)} USDC
          </div>
        )}
      </div>
    </div>
  );
}
