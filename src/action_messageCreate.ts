import * as DiscordJS from "discord.js"
import { Client } from "discord.js"
import { debug_messageCreate } from "./debug"
import { easter_egg_messageCreate } from "./easter_egg"
import { dataFetch } from "./utility"


export async function messageCreate(client: Client, message: DiscordJS.Message) {
    if (client.user == null) {
        console.error(`client.user is null (jx0033)`)
        return
    }

    if (message.author.id === client.user.id) {
        return
    }

    await debug_messageCreate(message)
    await easter_egg_messageCreate(message)
}