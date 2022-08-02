export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      botToken: string;
      guildId: string;
      environemnt: "dev" | "prod" | "debug";
    }
  }
}
