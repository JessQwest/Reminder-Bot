import {
    CacheType,
    ChatInputCommandInteraction,
    Client, CommandInteractionOptionResolver
} from "discord.js"
import * as chrono from 'chrono-node';
import { dateToDiscordTimestamp } from "./utility"

async function option(options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">, name: string): Promise<any> {
    const optionObject = options.get(name)
    if (optionObject === null) return null
    return optionObject.value
}

export async function interactionCreateCommand(client: Client, i: ChatInputCommandInteraction) {
    if (!i.isChatInputCommand()) return

    const { commandName, options, user, member, guild } = i

    if (commandName === "reminder") {
        const timeInput: string = await option(options, "time")
        const textInput: string = await option(options, "text")

        const date: Date | null = chrono.parseDate(`in ${timeInput}`)

        if (date === null) {
            await i.reply("I couldn't understand the time you provided. Please try again.")
            return
        }

        await i.reply(`Reminder time parsed as ${dateToDiscordTimestamp(date)}`)
        return
    }
}