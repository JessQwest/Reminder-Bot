import { con } from "./index"

export function setupDatabaseTables() {
    con.query('CREATE TABLE IF NOT EXISTS `data` (`datakey` VARCHAR(30) NOT NULL, `datavalue` MEDIUMTEXT NOT NULL, PRIMARY KEY (`datakey`))', function (err: any, result: any, fields: any) {
        if (err) throw err
        console.log(`data table created if not exists`)
    })

    con.query('CREATE TABLE IF NOT EXISTS `reminders` (`reminderId` INT AUTO_INCREMENT, `reminderDatetime` DATETIME NOT NULL, `createdDatetime` DATETIME NOT NULL, `serverId` VARCHAR(20) NOT NULL, `channelId` VARCHAR(20) NOT NULL, `userId` VARCHAR(20) NOT NULL, `reminderText` VARCHAR(300) NOT NULL, `rolePingId` VARCHAR(20), `action` VARCHAR(50), PRIMARY KEY (`reminderId`))', function (err: any, result: any, fields: any) {
        if (err) throw err
        console.log(`reminders table created if not exists`)
    })
}