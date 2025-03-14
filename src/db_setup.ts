import { con } from "./index"

export function setupDatabaseTables() {
    con.query('CREATE TABLE IF NOT EXISTS `data` (`datakey` VARCHAR(30) NOT NULL, `datavalue` MEDIUMTEXT NOT NULL, PRIMARY KEY (`datakey`))', function (err: any, result: any, fields: any) {
        if (err) throw err
        console.log(`data table created if not exists`)
    })
}