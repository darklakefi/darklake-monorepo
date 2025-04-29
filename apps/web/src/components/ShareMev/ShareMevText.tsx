export function ShareMevText({ solAmount }: { solAmount: number }) {
  const wrapperStyle = {
    margin: 0,
    marginTop: "5rem",
    textAlign: "right" as const,
    fontSize: "2.5rem",
    lineHeight: "1",
    width: "24rem",
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "flex-end" as const,
  };
  const textStyle = {
    margin: 0,
    color: "#1A9A56",
  };

  if (solAmount < 1) {
    return (
      <div style={{ ...wrapperStyle }}>
        <p style={{ ...textStyle, marginBottom: "1.5rem" }}>Well Played!</p>
        <p style={{ ...textStyle, marginBottom: "1.5rem" }}>Your wallet has managed to dodge most MEV attacks.</p>
        <p style={textStyle}>
          You&#39;re <span style={{ color: "#35D688", marginLeft: "1.5rem" }}>trading</span>
        </p>
        <p style={{ ...textStyle, color: "#35D688" }}>smarter than most.</p>
      </div>
    );
  }

  if (solAmount < 10) {
    return (
      <div style={wrapperStyle}>
        <p style={{ ...textStyle, marginBottom: "2.5rem" }}>Ouch!</p>
        <p style={textStyle}>Your wallet was</p>
        <p style={{ ...textStyle, color: "#35D688" }}>heavily impacted</p>
        <p style={textStyle}>by MEV attacks</p>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <p style={{ ...textStyle }}>You&#39;ve lost some value to MEV -</p>
      <p style={textStyle}>not getting rekt,</p>
      <p style={textStyle}>
        but still <span style={{ color: "#35D688", marginLeft: "1.5rem" }}>leaving</span>
      </p>
      <p style={{ ...textStyle, color: "#35D688" }}> money on the table.</p>
    </div>
  );
}
