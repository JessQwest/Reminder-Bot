import * as DiscordJS from "discord.js"
import { ADMIN_USER_ID, DEBUG_CHANNEL_ID } from "./index"

export async function debug_messageCreate(message: DiscordJS.Message) {
    if (message.author.bot) return
    if (message.content === "remindertest" && message.author.id === ADMIN_USER_ID && message.channelId === DEBUG_CHANNEL_ID) {
        await message.reply("reminder test!")
        return
    }
}