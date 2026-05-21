import { WORLD_CUP_MAIN_MINT } from "@/data/world-cup-mint-nations";

/** Golden Ball / other event-sector mints. */
export const GOLDEN_BALL_EVENT_MINT =
  "H3pH7frVidjqQTpBpZtDhvuMZu97VkBGPHkngYegpump";

/** FIFA World Cup 2026 is hosted in the United States. */
export const EVENT_MINT_ISO2: Record<string, string> = {
  [WORLD_CUP_MAIN_MINT]: "US",
  [GOLDEN_BALL_EVENT_MINT]: "US",
};
