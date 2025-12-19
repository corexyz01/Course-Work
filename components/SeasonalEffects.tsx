"use client";

import Snowfall from "react-snowfall";

export function SeasonalEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      <Snowfall color="rgba(235, 245, 255, 0.95)" snowflakeCount={160} />
      <div className="seasonal-twinkle absolute inset-0" />
    </div>
  );
}
