import { QueryType } from "discord-player";
import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../structures/Command";
export default new Command({
  name: "start",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "url",
      description: "The url of the song to play",
      required: true,
    },
  ],
  description: "Start the music",
  run: async ({ client, interaction, args }) => {
    if (!interaction.member.voice.channel) {
      return interaction.editReply(
        "You need to be in a voice channel to use this command"
      );
    }
    // Initialize Queue
    const queue = client.player.createQueue(interaction.guild);
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let url = args.getString("url", true);

    const result = await client.player.search(url, {
      requestedBy: interaction.user,
      searchEngine: QueryType.YOUTUBE_VIDEO,
    });
    if (result.tracks.length === 0) {
      return interaction.editReply("No results found");
    }

    const song = result.tracks[0];
    await queue.addTrack(song);

    interaction.followUp(
      `[${song.title}], ${song.url} has been added to the queue`
    );
    if (!queue.playing) {
      await queue.play();
    }
  },
});
