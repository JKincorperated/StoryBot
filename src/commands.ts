import { SlashCommandBuilder } from "discord.js";
import { command as command_setup, execute as execute_setup } from "./commands/setup";
import { command as command_save, execute as execute_save } from "./commands/savechannel";


let commands: Map<String, Command> = new Map();

type Command = {
    slash: SlashCommandBuilder,
    execute: Function
}

commands.set(command_setup.name, {
    slash: command_setup,
    execute: execute_setup
})

commands.set(command_save.name, {
    slash: command_save,
    execute: execute_save
})

export default commands;
