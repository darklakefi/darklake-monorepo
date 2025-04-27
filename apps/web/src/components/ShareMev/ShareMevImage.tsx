import { getSiteUrl } from "@/utils/env";
import { ShareMevText } from "@/components/ShareMev/ShareMevText";
import { ShareMevHeader } from "@/components/ShareMev/ShareMevHeader";
import { ShareMevHighlight } from "@/components/ShareMev/ShareMevHighlight";
import { ShareMevWaddlesImage } from "@/components/ShareMev/ShareMevWaddlesImage";

export async function ShareMevImage({
  totalSolExtracted,
  totalUsdExtracted,
  solAmount,
}: {
  totalSolExtracted: number;
  totalUsdExtracted: number;
  solAmount: number;
}) {
  const siteUrl = getSiteUrl();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Bitsumishi",
      }}
    >
      <div
        style={{
          borderRadius: "2.5rem",
          backgroundColor: "#062916",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `url(${siteUrl}/images/bg-twitter-share-card.jpg)`,
        }}
      >
        <div style={{ padding: "6rem", display: "flex", flexDirection: "column", flex: 1 }}>
          <ShareMevHeader siteUrl={siteUrl!} />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <ShareMevHighlight totalSolExtracted={totalSolExtracted} totalUsdExtracted={totalUsdExtracted} />

              <div style={{ display: "flex", flexDirection: "column", fontFamily: "Bitsumishi" }}>
                <ShareMevText solAmount={solAmount} />
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, height: "100%" }}>
              <ShareMevWaddlesImage siteUrl={siteUrl!} />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            backgroundColor: "#35D688",
            position: "absolute",
            bottom: 0,
            width: "100%",
            fontSize: "2rem",
            padding: "1rem",
            margin: 0,
            flexDirection: "row",
            justifyContent: "center",
            fontFamily: "ClassicConsoleNeue",
          }}
        >
          Check how much you got MEV&apos;d at darklake.fi/mev
        </div>
      </div>
    </div>
  );
}
