/* eslint-disable @next/next/no-img-element */
export function ShareMevHeader({ siteUrl }: { siteUrl: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: "8rem",
      }}
    >
      <img src={`${siteUrl}/images/logo-h-darklake.png`} alt="logo" width={293.96} height={48} />
    </div>
  );
}
