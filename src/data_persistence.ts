import {con} from "./index"

export type DataTables = 'data' | 'urialias'

export function writeData(key: string, value: string, tablename: DataTables = 'data') {
    con.query('INSERT INTO ? (datakey, datavalue) VALUES (?, ?) ON DUPLICATE KEY UPDATE datavalue = ?', [tablename, key, value, value], function (err: any, result: any, fields: any) {
        if (err) throw err
        console.log(`data written: ${key} = ${value}`)
    })
}

export function readData(key: string, tablename: DataTables = 'data'): Promise<string> {
    return new Promise((resolve, reject) => {
        con.query(`SELECT datavalue FROM ? WHERE datakey = ?`, [tablename, key], async function (err: any, result: any, fields: any) {
            if (err) return reject(err)
            if (result == null || result == "" || result.size == 0) return resolve("")

            try {
                const dataValue = result[0]['datavalue']
                resolve(dataValue)
            } catch (e) {
                console.log("ERROR IN DATA!")
                resolve("")
            }
        })
    })
}

export function readAllData(tablename: DataTables = 'data'): Promise<Map<string, string>> {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM ?`, [tablename], async function (err: any, result: any, fields: any) {
            if (err) return reject(err)
            if (result == null || result == "" || result.size == 0) return resolve(new Map())

            const dataMap = new Map<string, string>()
            for (const row of result) {
                dataMap.set(row['datakey'], row['datavalue'])
            }
            resolve(dataMap)
        })
    })
}

export function deleteByKey(key: string, tablename: DataTables = 'data') {
    return new Promise((resolve, reject) => {
        con.query(`DELETE FROM ? WHERE datakey = ?`, [tablename, key], async function (err: any, result: any, fields: any) {
            if (err) return reject(err)
            if (result == null || result == "" || result.size == 0) return resolve(new Map())

            const dataMap = new Map<string, string>()
            for (const row of result) {
                dataMap.set(row['datakey'], row['datavalue'])
            }
            resolve(dataMap)
        })
    })
}