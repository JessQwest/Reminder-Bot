import {Reminder} from "./entity/reminder";
import {con} from "./index";

export async function saveReminder(reminder: Reminder): Promise<Boolean> {
    const queryCheck = `SELECT * FROM reminders WHERE reminderDatetime = ? AND reminderText = ? AND serverId = ? AND channelId = ?`;
    const queryInsert = `INSERT INTO reminders (reminderDatetime, createdDatetime, serverId, channelId, userId, reminderText, rolePingId, action) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        const [rows] = await con.promise().query(queryCheck, [reminder.reminderDatetime, reminder.reminderText, reminder.serverId, reminder.channelId]);
        if (rows.length === 0) {
            await con.promise().query(queryInsert, [
                reminder.reminderDatetime,
                reminder.createdDatetime,
                reminder.serverId,
                reminder.channelId,
                reminder.userId,
                reminder.reminderText,
                reminder.rolePingId,
                reminder.action
            ]);
            return true
        } else return false
    } catch (error) {
        console.error("Error saving reminder:", error);
        return false
    }
}

export async function getPastReminders(): Promise<Reminder[]> {
    const querySelect = `SELECT * FROM reminders WHERE reminderDatetime < NOW()`;
    const queryDelete = `DELETE FROM reminders WHERE reminderDatetime < NOW()`;

    try {
        const [rows] = await con.promise().query(querySelect);
        await con.promise().query(queryDelete);
        return rows;
    } catch (error) {
        console.error("Error fetching or deleting past reminders:", error);
        return [];
    }
}