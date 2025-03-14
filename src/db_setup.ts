import { con } from "./index"

export function setupDatabaseTables() {
    con.query('CREATE TABLE IF NOT EXISTS `data` (`datakey` VARCHAR(30) NOT NULL, `datavalue` MEDIUMTEXT NOT NULL, PRIMARY KEY (`datakey`))', function (err: any, result: any, fields: any) {
        if (err) throw err
        console.log(`data table created if not exists`)
    })

    con.query('CREATE TABLE IF NOT EXISTS `reminders` (`reminderid` INT AUTO_INCREMENT, `reminderdatetime` DATETIME NOT NULL, `createddatetime` DATETIME NOT NULL, `channelid` VARCHAR(20) NOT NULL, `userid` VARCHAR(20) NOT NULL, `remindertext` VARCHAR(300) NOT NULL, `rolepingid` VARCHAR(20) NOT NULL, `action` VARCHAR(50) NOT NULL, PRIMARY KEY (`reminderid`))', function (err: any, result: any, fields: any) {
        if (err) throw err
        console.log(`reminders table created if not exists`)
    })
}