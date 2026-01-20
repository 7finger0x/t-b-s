import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://base-standard.xyz";

  const manifest = {
    accountAssociation: {
      // You will fill this in Step 5 using the Base Build tool
      header: "",
      payload: "",
      signature: "",
    },
    miniapp: {
      version: "1",
      name: "The Base Standard",
      homeUrl: appUrl,
      iconUrl: `${appUrl}/icons/icon-512x512.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0052ff",
      webhookUrl: `${appUrl}/api/frame/webhook`, // Optional if you have a webhook
      subtitle: "Provable Value Contribution",
      description: "Check your PVC Score and mint your tier badge.",
      primaryCategory: "social",
      tags: ["reputation", "base", "miniapp"],
      screenshotUrls: [
        `${appUrl}/screenshots/1.png`,
        `${appUrl}/screenshots/2.png`
      ],
    },
  };

  return NextResponse.json(manifest);
}