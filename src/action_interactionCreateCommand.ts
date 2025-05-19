import {
    CacheType,
    ChatInputCommandInteraction,
    Client, CommandInteractionOptionResolver, EmbedBuilder
} from "discord.js"
import * as chrono from 'chrono-node';
import {saveReminder} from "./db_communications";
import {Reminder, reminderToEmbed} from "./entity/reminder";
import { actionRegex } from "./entity/zTopic_action";
import { deleteByKey, readAllData, writeData } from "./data_persistence";
import { formatMapAsStringList, stringToEmbeds } from "./utility";

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
        const actionInput: string | null = await option(options, "action")

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

        if (actionInput !== null && !actionRegex.test(actionInput)) {
            await i.reply("Invalid input for the action! It must be an API type, followed by colon, followed by a URL")
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
            action: actionInput
        }

        const saveSuccess: Boolean = await saveReminder(newReminder)

        if (saveSuccess) {
            await i.reply({content: `Saved reminder successfully!`, embeds: [await reminderToEmbed(newReminder)]})
        } else {
            await i.reply("Unable to save the reminder.")
        }

        return
    }

    if (commandName === "urialias") {
        if (options.getSubcommand() === "list") {
            readAllData("urialias").then((data) => {
                const embeds: EmbedBuilder[] = stringToEmbeds("URI Aliases", formatMapAsStringList(data))
                i.reply({embeds: embeds})
                return
            })
        } else if (options.getSubcommand() === "add") {
            const keyInput: string = await option(options, "key")
            const valueInput: string = await option(options, "value")

            if (keyInput === null || valueInput === null) {
                await i.reply("Key or value is missing.")
                return
            }

            if (keyInput.length > 30) {
                await i.reply("Key is too long. Maximum length is 30 characters.")
                return
            }

            if (valueInput.length > 300) {
                await i.reply("Value is too long. Maximum length is 300 characters.")
                return
            }

            writeData(keyInput, valueInput, "urialias")
            await i.reply({content: `Saved URI alias successfully!`})
            return
        } else if (options.getSubcommand() === "delete") {
            const keyInput: string = await option(options, "key")

            if (keyInput === null) {
                await i.reply("Key is missing.")
                return
            }

            if (keyInput.length > 30) {
                await i.reply("Key is too long. Maximum length is 30 characters.")
                return
            }

            await deleteByKey(keyInput, "urialias")
            await i.reply({content: `Deleted URI alias successfully!`})
            return
        }
    }
}