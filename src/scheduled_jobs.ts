import { client } from "./index"
import {getPastReminders} from "./db_communications";

export async function hourlyHousekeepTask() {
    if (client.user != null) {

    }
}

export async function reminderCheck() {
    console.log("Reminder Check");
    const reminders = await getPastReminders();
    if (reminders.length === 0) return
    console.log(`Fetched ${reminders.length} reminders`);
    console.log(JSON.stringify(reminders))
    for (const reminder of reminders) {
        const serverId = reminder.serverId;
        const channelId = reminder.channelId;

        try {
            console.log(`Fetching guild: ${serverId} with channel ${channelId}`);
            const guild = await client.guilds.fetch(serverId);
            console.log(`Fetched guild: ${guild.name}`);
            const channel = await guild.channels.fetch(channelId);
            console.log(`Fetched channel: ${channel.name}`);
            if (channel && channel.isTextBased()) {
                await channel.send({ content: `REMINDER ${reminder.reminderText}` });
            }
        } catch (error) {
            console.error(`Error fetching guild or channel: ${error}`);
        }
    }
}