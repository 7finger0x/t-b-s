#components/FarcasterInit.tsx

"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

export default function FarcasterInit() {
  useEffect(() => {
    // Tells Farcaster the app is loaded and ready to show
    sdk.actions.ready();
  }, []);

  return null; // This component doesn't render anything visible
}