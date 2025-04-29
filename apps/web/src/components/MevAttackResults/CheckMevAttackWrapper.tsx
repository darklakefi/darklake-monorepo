"use client";

import { cn } from "@/utils/common";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function BackgroundRevealElement() {
  const [isMounted, setIsMounted] = useState(false);
  const element = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setIsMounted(true);
    function handler(e: MouseEvent) {
      if (element.current) {
        const x = e.clientX,
          y = e.clientY;
        element.current.style.visibility = "visible";
        element.current.style.clipPath = `circle(200px at ${x}px ${y}px)`;
        element.current.style.maskImage = "url(/images/reveal-cursor-mask.png)";
        element.current.style.maskSize = "400px";
        element.current.style.maskRepeat = "no-repeat";
        element.current.style.maskPosition = `${x - 200}px ${y - 200}px`;
      }
    }

    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);
  const className = cn(
    "bg-[url(/images/bg-masked.png)] mouse-tracker fixed w-screen",
    "h-screen z-10 top-0 left-0 opacity-90 bg-cover bg-no-repeat bg-fixed invisible",
  );
  return isMounted
    ? createPortal(
        <>
          <div className={className} ref={element} />
        </>,
        document.body,
      )
    : null;
}

const className = cn(
  "bg-[url(/images/bg-body.png)] bg-cover",
  "bg-no-repeat bg-fixed relative top-0 left-0 bg-brand-80 text-brand-20",
);

export default function CheckMevAttackWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={className}>
      <div className="xl:container w-full mx-auto flex flex-col justify-between z-20 relative">
        <BackgroundRevealElement />

        {children}
      </div>
    </div>
  );
}
