/* eslint-disable @next/next/no-img-element */
interface ShareMevWaddlesImageProps {
  siteUrl: string;
}

export function ShareMevWaddlesImage({ siteUrl }: ShareMevWaddlesImageProps) {
  return (
    <div style={{ display: "flex" }}>
      <img
        src={`${siteUrl}/images/image-twitter-share-waddles-shadow.png`}
        alt="waddles shadow"
        width={597}
        height={84}
        style={{
          position: "absolute",
          bottom: "-42px",
          left: "-42px",
        }}
      />
      <img
        src={`${siteUrl}/images/image-waddles-2.png`}
        alt="waddles"
        width={464.625}
        height={543.951}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
