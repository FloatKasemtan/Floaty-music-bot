import { ApplicationCommandDataResolvable } from "discord.js";

export interface registerCommandsOptions {
  guildId?: string;
  commands: ApplicationCommandDataResolvable[];
}
