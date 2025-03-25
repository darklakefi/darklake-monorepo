import { useState } from "react";
import DetailResultContent from "./DetailResultContent";
import DetailResultHeader from "./DetailResultHeader";
import LookedDetailResultContent from "./LookedDetailResultContent";

export default function DetailResults({ address }: { address: string }) {
  const [isSignedWithTwitter, setIsSignedWithTwitter] = useState(false);

  return (
    <div>
      <DetailResultHeader address={address} processedTime={new Date()} isSignedWithTwitter={isSignedWithTwitter} />

      {!isSignedWithTwitter && <LookedDetailResultContent onConnect={() => setIsSignedWithTwitter(true)} />}

      {isSignedWithTwitter && <DetailResultContent />}
    </div>
  );
}
