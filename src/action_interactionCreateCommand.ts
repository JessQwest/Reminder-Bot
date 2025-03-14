import {
    Client, Interaction
} from "discord.js"

export async function interactionCreateCommand(client: Client, i: Interaction) {
    if (!i.isCommand()) return

    const { commandName, options, user, member, guild } = i

    if (commandName === "weekend") {
        i.reply("weekend")
        return
    }
}