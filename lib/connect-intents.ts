export const CONNECT_INTENTS = [
  "BUSINESS",
  "INTRODUCTION",
  "INVITATION",
  "MEDIA",
  "IDEA",
  "OPPORTUNITY",
  "MEETING",
  "OTHER",
] as const;

export type ConnectIntent = (typeof CONNECT_INTENTS)[number];
