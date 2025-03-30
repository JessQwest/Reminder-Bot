import {
    CacheType,
    ChatInputCommandInteraction,
    Client, CommandInteractionOptionResolver
} from "discord.js"
import * as chrono from 'chrono-node';
import {saveReminder} from "./db_communications";
import {Reminder, reminderToEmbed} from "./entity/reminder";

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

        let reminderDate: Date | null = chrono.parseDate(`in ${timeInput}`)
        if (reminderDate !== null) {
            if (reminderDate.getSeconds() > 0 || reminderDate.getMilliseconds() > 0) {
                reminderDate.setMinutes(reminderDate.getMinutes() + 1)
                reminderDate.setSeconds(0, 0)
            }
        } else {
            await i.reply("I couldn't understand the time you provided. Please try again.")
            return
        }

        const guildId = i.guildId
        if (guildId === null) {
            await i.reply("A reminder must be created within a server channel.")
            return
        }

        const newReminder: Reminder = {
            reminderId: null,
            reminderDatetime: reminderDate,
            createdDatetime: new Date(),
            serverId: guildId,
            channelId: i.channelId,
            userId: user.id,
            reminderText: textInput,
            rolePingId: null,
            action: null
        }

        const saveSuccess: Boolean = await saveReminder(newReminder)

        if (saveSuccess) {
            await i.reply({content: `Saved reminder successfully!`, embeds: [await reminderToEmbed(newReminder)]})
        } else {
            await i.reply("Unable to save the reminder.")
        }

        return
    }
}