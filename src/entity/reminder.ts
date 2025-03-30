import {EmbedBuilder} from "discord.js";
import {dateToDiscordTimestamp} from "../utility";

export interface Reminder {
    reminderId: number | null
    reminderDatetime: Date
    createdDatetime: Date
    serverId: string
    channelId: string
    userId: string
    reminderText: string
    rolePingId: string | null
    action: string | null
}

export async function reminderToEmbed(reminder: Reminder): Promise<EmbedBuilder> {

    let embed = new EmbedBuilder()
        .setColor('#23bed2')
        .setDescription(`Reminder set for ${dateToDiscordTimestamp(reminder.reminderDatetime, "F")} (${dateToDiscordTimestamp(reminder.reminderDatetime, "R")})`)
        .setTitle(reminder.reminderText)

    return embed
}