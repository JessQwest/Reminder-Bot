import { client } from "./index"
const { SlashCommandBuilder } = require('discord.js');
import { writeData, readData } from "./data_persistence"

const commandVersion = "1";

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
        const commandData = new SlashCommandBuilder()
            .setName('reminder')
            .setDescription('Set a reminder')
            .addStringOption((option: { setName: (arg0: string) => { (): any; new(): any; setDescription: { (arg0: string): { (): any; new(): any; setRequired: { (arg0: boolean): any; new(): any; }; }; new(): any; }; }; }) =>
                option.setName('text')
                    .setDescription('Reminder text')
                    .setRequired(true)
            );

        await client.application.commands.create(commandData);
        console.log('New command "reminder" registered successfully.');
    } catch (error) {
        console.error('Error resetting commands:', error);
    }
}