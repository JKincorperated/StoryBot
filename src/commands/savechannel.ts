import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { Database } from "sqlite";
import sqlite3 from 'sqlite3'

const command = new SlashCommandBuilder()
	.setName('savechannel')
	.setDescription('Set the channel where results will be sent.');

async function execute(interaction: ChatInputCommandInteraction<CacheType>, database: Database<sqlite3.Database, sqlite3.Statement>) {
    let channel = interaction.channel;

    if (!channel) {
        await interaction.reply("You must run this command in a channel!");
        return;
    }

    if (!channel.isTextBased()) {
        await interaction.reply("You must run this command in a text channel!");
        return;
    }

    channel = channel as TextChannel;

    await interaction.reply({ content: "Set save channel here!", ephemeral: true });

    await database.run(`UPDATE server_config SET output_channel_id = ? WHERE server_id = ?`, [
        channel.id,
        interaction.guildId,
    ]);
}


export { command, execute }

