import { useState } from "react";
import DetailResultContent from "./DetailResultContent";
import DetailResultHeader from "./DetailResultHeader";
import LookedDetailResultContent from "./LookedDetailResultContent";

export default function DetailResults({ address }: { address: string }) {
  const [isSignedWithTwitter, setIsSignedWithTwitter] = useState(false);

  return (
    <div>
      <DetailResultHeader address={address} processedTime={new Date()} isSignedWithTwitter={isSignedWithTwitter} />
      {/* TODO: unhide when ready, hidden temporary while twitter login and API wiring wip */}
      <div className="hidden">
        {!isSignedWithTwitter && <LookedDetailResultContent onConnect={() => setIsSignedWithTwitter(true)} />}
        {isSignedWithTwitter && <DetailResultContent />}
      </div>
    </div>
  );
}
