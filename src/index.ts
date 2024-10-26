import { Client, Events, SlashCommandBuilder, TextChannel } from "discord.js";
import { config } from "./config";
import { open_database, serverConfig } from "./database";
import commands from "./commands"
import { Database } from "sqlite";
import sqlite3 from "sqlite3";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

var db: Database<sqlite3.Database, sqlite3.Statement>;

(async () => {
  console.log("Bot is starting...");
  console.log("Loading Database...")
  db = await open_database();
  client.login(config.DISCORD_TOKEN)
})();

client.on("ready", async () => {
  console.log(`Bot has logged in! ${client.user?.displayName}#${client.user?.discriminator}`);
  console.log("Refreshing Commands...")
  // Refresh for every guild
  client.guilds.cache.forEach((guild) => {
    let cmds: SlashCommandBuilder[] = [];
    commands.forEach((command, _name) => {
      cmds.push(command.slash);
    });
    guild.commands.set(cmds);
  });
  console.log("Bot started!")
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.guild === null) return;
  if (message.channel.isDMBased()) return;

  const serverConfig: serverConfig | undefined = await db.get(`SELECT * FROM server_config WHERE server_id = ?`, [
    message.guild.id,
  ]);
  if (!serverConfig) return;
  if (serverConfig.channel_id !== message.channel.id) return;

  if (serverConfig.last_sender == message.author.id) {
    let nmesg = await message.reply("You cannot send more than one message in a row!");
    setTimeout(() => {
      try { nmesg.delete(); } catch (e) { }
      try { message.delete(); } catch (e) { }
    }, 5000);
    return;
  }

  let content = message.content.toLowerCase();

  if (content == "." || content == "!" || content == "?") {
    let current = serverConfig.current_passage.split(/[.!?]/g);
    let last = current[current.length - 1].split(" ").length;
    if (last < 3) {
      let nmesg = await message.reply("You cannot end a sentence this early.");
      setTimeout(() => {
        try {
          try { nmesg.delete(); } catch (e) { }
          try { message.delete(); } catch (e) { }
        } catch (e) { }
      }, 5000);
      return;
    }
    let new_passage = serverConfig.current_passage + content;

    if (current.length > 4) {
      if (serverConfig.output_channel_id) {
        let channel = client.channels.cache.get(serverConfig.output_channel_id);
        if (channel) {
          (channel as TextChannel).send(new_passage);
        }
      }

      new_passage = "";

      await message.channel.send("The text has been completed");
      await message.channel.send("Welcome to StoryBot! Starting from this point only one word messages are allowed and you must build a text together.");
      await message.channel.send("If you wish to save these, please run the `/savechannel` command in the channel you wish to save in.");
      await message.channel.send("Rules: ");
      await message.channel.send("1. Only one word messages are allowed\n2. You cannot send more than one message in a row\n3. The text automatically resets after 5 sentences\n4. Sentences must be longer that 3 words and shorter than 50 words.\n5. Only 'real' words are allowed.\n6. Punctuation must be in a separate message.");
    }

    db.run("UPDATE server_config SET current_passage = ?, last_sender = ? WHERE server_id = ?", [
      new_passage,
      message.author.id,
      message.guild.id,
    ]);

    message.react("✅");
    return;
  };


  if (config.WORDS.get(content) === undefined) {
    let nmesg = await message.reply("That word is not in the dictionary!");
    setTimeout(() => {
      try { nmesg.delete(); } catch (e) { }
      try { message.delete(); } catch (e) { }
    }, 5000);
    return;
  }

  let current = serverConfig.current_passage.split(/[.!?]/g);
  let last = current[current.length - 1].split(" ").length;
  if (last > 50) {
    let nmesg = await message.reply("This sentence is too long, end it using either `?`, `!` or `.`");
    setTimeout(() => {
      try { nmesg.delete(); } catch (e) { }
      try { message.delete(); } catch (e) { }
    }, 5000);
    return;
  }

  let current_passage = serverConfig.current_passage + " " + content;

  db.run("UPDATE server_config SET current_passage = ?, last_sender = ? WHERE server_id = ?", [
    current_passage,
    message.author.id,
    message.guild.id,
  ]);

  message.react("✅");
});

client.on(Events.InteractionCreate, interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;
  command.execute(interaction, db).catch(console.error);
});


// https://discord.com/oauth2/authorize?client_id=1299473989344825505&permissions=10240&scope=bot%20applications.commands