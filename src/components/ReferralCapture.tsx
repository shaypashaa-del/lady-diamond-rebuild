"use client";

import { useEffect } from "react";
import { trackReferral } from "@/server/actions/affiliate";

// Reads ?ref=CODE (plus UTM params) from the URL on first paint and hands it to
// a server action that validates the affiliate, sets the attribution cookie,
// and records a deduped click — see AUDIT.md's affiliate tracking requirements.
export function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    trackReferral(ref, window.location.pathname, {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
  }, []);

  return null;
}
