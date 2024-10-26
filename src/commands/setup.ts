import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { Database } from "sqlite";
import sqlite3 from 'sqlite3'

const command = new SlashCommandBuilder()
	.setName('setup')
	.setDescription('Setup StoryBot to the current channel. This will delete **ALL** messages in that channel!');

async function execute(interaction: ChatInputCommandInteraction<CacheType>, database: Database<sqlite3.Database, sqlite3.Statement>) {
    let channel = interaction.channel;
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.memberPermissions?.has("Administrator")) {
        await interaction.reply({ content: "You must be an administrator to use this command!", ephemeral: true });
        return;
    }

    if (!channel) {
        await interaction.reply("You must run this command in a channel!");
        return;
    }

    if (!channel.isTextBased()) {
        await interaction.reply("You must run this command in a text channel!");
        return;
    }

    let entry = await database.get(`SELECT * FROM server_config WHERE server_id = ?`, [
        interaction.guildId
    ]);
    if (entry) {
        await interaction.reply({ content: "StoryBot is already setup in this server!", ephemeral: true});
        return;
    }

    channel = channel as TextChannel;

    // Delete all messages in the channel
    while (true) {
        const messages = await channel.messages.fetch({ limit: 100 });
        if (messages.size === 0) break;
        try {
            await channel?.bulkDelete(messages);
        } catch (error) {
            console.warn(error);
        }
    }

    await channel.send("Welcome to StoryBot! Starting from this point only one word messages are allowed and you must build a text together.");
    await channel.send("If you wish to save these, please run the `/savechannel` command in the channel you wish to save in.");
    await channel.send("Rules: ");
    await channel.send("1. Only one word messages are allowed\n2. You cannot send more than one message in a row\n3. The text automatically resets after 5 sentences\n4. Sentences must be longer that 3 words and shorter than 50 words.\n5. Only 'real' words are allowed.\n6. Punctuation must be in a separate message.");

    await database.run(`INSERT OR REPLACE INTO server_config (server_id, channel_id, output_channel_id, current_passage, last_sender) VALUES (?, ?, ?, ?, ?)`, [
        interaction.guildId,
        channel.id,
        "",
        "",
        ""
    ]);

    await interaction.reply({ content: "Setup complete!", ephemeral: true });
}


export { command, execute }

