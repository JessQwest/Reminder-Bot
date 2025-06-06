import { client } from "./index"
const { SlashCommandBuilder } = require('discord.js');
import { writeData, readData } from "./data_persistence"
import { SlashCommandStringOption, SlashCommandSubcommandBuilder } from "@discordjs/builders"

const commandVersion = "4";

async function checkCommandVersion(): Promise<boolean> {
    try {
        const storedVersion = await readData("commandversion");
        if (storedVersion !== commandVersion) {
            console.log(`Command version mismatch: stored=${storedVersion}, current=${commandVersion}. Running update function.`);
            await writeData("commandversion", commandVersion);
            console.log(`Command version updated to ${commandVersion}`);
            return true
        } else {
            console.log(`Command version is up-to-date: ${commandVersion}`);
            return false
        }
    } catch (error) {
        console.error("Error checking/updating command version:", error);
    }
    return false
}


export async function resetCommands() {
    if (!client.application) return;

    let updateNeeded = await checkCommandVersion();
    if (!updateNeeded) return;

    try {
        // Fetch and delete all global commands
        const globalCommands = await client.application.commands.fetch();
        for (const command of globalCommands.values()) {
            await command.delete();
            console.log(`Deleted global command: ${command.name}`);
        }

        // Fetch and delete all guild commands
        for (const guild of client.guilds.cache.values()) {
            const guildCommands = await guild.commands.fetch();
            for (const command of guildCommands.values()) {
                await command.delete();
                console.log(`Deleted command '${command.name}' in guild: ${guild.id}`);
            }
        }

        console.log('All commands deleted. Now registering new commands...');

        // Register new "reminder" command
        const commandData1 = new SlashCommandBuilder()
            .setName('reminder')
            .setDescription('Set a reminder')
            .addStringOption((option: SlashCommandStringOption) =>
                option.setName('time')
                    .setDescription('The time to set the reminder for')
                    .setAutocomplete(true)
                    .setRequired(true)
            )
            .addStringOption((option: SlashCommandStringOption) =>
                option.setName('text')
                    .setDescription('The message content to send')
                    .setRequired(true)
            )
            .addRoleOption((option: SlashCommandStringOption) =>
                option.setName('role')
                    .setDescription('The role to ping with this reminder')
                    .setRequired(false)
            )
            .addRoleOption((option: SlashCommandStringOption) =>
                option.setName('action')
                    .setDescription('API to call. in format "GET:https://www.google.com"')
                    .setRequired(false)
            )

        await client.application.commands.create(commandData1);
        console.log(`New command "${commandData1.name}" registered successfully.`);

        // Register new "urialias" command
        const commandData2 = new SlashCommandBuilder()
            .setName('urialias')
            .setDescription('Manage URI aliases')
            .addSubcommand(() =>
                new SlashCommandSubcommandBuilder()
                    .setName('list')
                    .setDescription('List all URI aliases')
            )
            .addSubcommand(() =>
                new SlashCommandSubcommandBuilder()
                    .setName('add')
                    .setDescription('Add a new URI alias')
                    .addStringOption(option =>
                        option.setName('key')
                            .setDescription('The key for the URI alias')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option.setName('value')
                            .setDescription('The value for the URI alias')
                            .setRequired(true)
                    )
            )
            .addSubcommand(() =>
                new SlashCommandSubcommandBuilder()
                    .setName('delete')
                    .setDescription('Delete an existing URI alias')
                    .addStringOption(option =>
                        option.setName('key')
                            .setDescription('The key of the URI alias to delete')
                            .setRequired(true)
                    )
            );

        await client.application.commands.create(commandData2);
        console.log(`New command "${commandData2.name}" registered successfully.`);
    } catch (error) {
        console.error('Error resetting commands:', error);
    }
}