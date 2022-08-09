import {
  Application,
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import { CommandType } from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import { registerCommandsOptions } from "../typings/client";
import { Event } from "./Event";
import { Player } from "discord-player";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  player: Player;
  commands: Collection<string, CommandType> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });
  }

  start() {
    this.initializePlayer();
    this.registerModules();
    this.login(process.env.botToken);
  }
  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  initializePlayer() {
    this.player = new Player(this, {
      ytdlOptions: { quality: "highestaudio", highWaterMark: 1 << 25 },
    });
  }

  async registerCommands({ commands, guildId }: registerCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId).commands.set(commands);
      console.log(`Registered ${commands.length} commands for ${guildId}`);
    } else {
      this.application?.commands.set(commands);
      console.log("Registering global commands");
    }
  }

  async registerModules() {
    // Command registration goes here
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(
      `${__dirname}/../commands/*/*{.ts,.js}`
    );

    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;
      console.log(command);

      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      console.log(event);

      this.on(event.event, event.run);
    });

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: process.env.guildId,
      });
    });
  }
}
