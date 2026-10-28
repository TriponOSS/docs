import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The three promises, in the severity colours the rest of the site uses. */
const claims = [
  { sev: "#ff6262", text: "overflow, a zero divisor and a bad index are defined traps" },
  { sev: "#e3c558", text: "no null, no implicit conversions, no uninitialized reads" },
  { sev: "#46d18c", text: "every diagnostic: a stable code, an exact span, a fix hint" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
          background: "#090c11",
          color: "#e4edf3",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                padding: "4px 14px",
                background: "#e4edf3",
                color: "#090c11",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {site.wordmark}
            </div>
            <div style={{ width: 15, height: 26, background: "#f0a63c" }} />
          </div>
          <div style={{ display: "flex", gap: 22, fontSize: 20, color: "#7d8f9b" }}>
            <span>{site.binary}</span>
            <span>spec v0.0</span>
            <span>{site.license}</span>
            <span>c99 + x86-64</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 54, lineHeight: 1.18, letterSpacing: -1.2, maxWidth: 1000 }}>
            {site.tagline}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13, fontSize: 21, color: "#aebecb" }}>
            {claims.map((claim) => (
              <div key={claim.text} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{ width: 11, height: 11, flexShrink: 0, background: claim.sev }} />
                <span>{claim.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 18,
            borderTop: "1px solid #1b2531",
            fontSize: 20,
            color: "#7d8f9b",
          }}
        >
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
          <span>four tiers — kernel, core, std, full</span>
        </div>
      </div>
    ),
    size,
  );
}