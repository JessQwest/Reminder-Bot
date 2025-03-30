import {Reminder} from "./entity/reminder";
import {con} from "./index";

export async function saveReminder(reminder: Reminder): Promise<Boolean> {
    const queryCheck = `SELECT * FROM reminders WHERE reminderDatetime = ? AND reminderText = ?`;
    const queryInsert = `INSERT INTO reminders (reminderDatetime, createdDatetime, channelId, userId, reminderText, rolePingId, action) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
        const [rows] = await con.promise().query(queryCheck, [reminder.reminderDatetime, reminder.reminderText]);
        if (rows.length === 0) {
            await con.promise().query(queryInsert, [
                reminder.reminderDatetime,
                reminder.createdDatetime,
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