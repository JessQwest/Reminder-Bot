import { interactionCreateCommand } from "./action_interactionCreateCommand"
import * as dotenv from 'dotenv'
import { CacheType, Events, GuildTextBasedChannel, Interaction, Message } from "discord.js"
import * as db_setup from './db_setup'
import * as scheduled_jobs from './scheduled_jobs'
import * as command_management from './command_management'
import { messageCreate } from "./action_messageCreate"
import { interactionAutoComplete } from "./action_interactionAutoComplete"
const { ActivityType } = require('discord.js');

var cron = require('node-cron')
const config = require("config")

dotenv.config()
const mysql = require('mysql2')

const {Client, GatewayIntentBits, Partials} = require('discord.js')

function loadOption(key: string): any {
    const modifiedKey = key.replace(/\./g, '_')
    if (process.env[modifiedKey] !== undefined) {
        return process.env[modifiedKey]
    }
    return config.get(key)
}


// debug constants
export var DEBUGMODE = loadOption('debug-mode.enabled')
export const DEBUG_SERVER_ID = loadOption('debug-mode.debug-server-id')
export const DEBUG_CHANNEL_ID = loadOption('debug-mode.debug-channel-id')

export const LOGGING_SERVER_ID = loadOption('server-info.logging-server-id')
export const LOGGING_CHANNEL_ID = loadOption('server-info.logging-channel-id')

console.log(`Running with debug mode set to ${DEBUGMODE}`)

// channel constants


// server constants
export const MAIN_SERVER_ID = loadOption('server-info.server-id')

// other constants
export const ADMIN_USER_ID = loadOption('server-info.admin-user-id')

//CONSTANTS END

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
    ]
})

const dbHost: String = DEBUGMODE ? loadOption('debug-mode.debughost') : loadOption('database.host')
const dbPort: String = DEBUGMODE ? loadOption('debug-mode.debugport') : loadOption('database.port')
const dbUser: String = DEBUGMODE ? loadOption('debug-mode.debuguser') : loadOption('database.user')
const dbPassword: String = DEBUGMODE ? loadOption('debug-mode.debugpassword') : loadOption('database.password')
const dbDatabase: String = DEBUGMODE ? loadOption('debug-mode.debugdatabase') : loadOption('database.database')

console.log(`Attempting to create SQL connection to db ${dbDatabase} with ${dbHost}:${dbPort} ${dbUser}/${dbPassword}`)
export const con = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbDatabase
})

export var debugchannel: GuildTextBasedChannel
export var loggingchannel: GuildTextBasedChannel

client.on(Events.ClientReady, async () => {

    console.log("Environment Variables:")
    for (const [key, value] of Object.entries(process.env)) {
        console.log(`${key}: ${value}`)
    }

    db_setup.setupDatabaseTables()

    await command_management.resetCommands()

    if (client.user != null) {
        client.user.setActivity(`📜Remembering Everything!`, {type: ActivityType.Custom})
    }

    debugchannel = await client.channels.fetch(DEBUG_CHANNEL_ID) as GuildTextBasedChannel
    loggingchannel = await client.channels.fetch(LOGGING_CHANNEL_ID) as GuildTextBasedChannel

    console.info(`The bot is ready ${new Date().toISOString()}`)

    await loggingchannel.send("Bot Started")
})

client.on(Events.MessageCreate, async (message: Message) => {
    await messageCreate(client, message)
})

client.on(Events.InteractionCreate, async (i: Interaction<CacheType>) => {
    if (!i.isChatInputCommand()) return
    await interactionCreateCommand(client, i)
})

client.on(Events.InteractionCreate, async (i: Interaction) => {
    if (!i.isAutocomplete()) return;
    await interactionAutoComplete(client, i)
});

// hourly housekeep
cron.schedule('0 * * * *', async () => {
    await scheduled_jobs.hourlyHousekeepTask()
})

process.on('unhandledRejection', error => {
    console.warn(`error time ${new Date().toISOString()}`)
    console.error('Unhandled promise rejection:', error)
    if (error == null || !(error instanceof Error)) {
        console.log(`Error is invalid (jx0032)`)
        return
    }
    loggingchannel.send(`Unhandled promise rejection: ${error} \n\n${error.stack}`)
})

client.on('shardError', (error: { stack: any }) => {
    if (loggingchannel === undefined) {
        console.error("You are probably missing your environment key!")
    }
    console.warn(`error time ${new Date().toISOString()}`)
    console.warn('A websocket connection encountered an error:', error)
    loggingchannel.send(`A websocket connection encountered an error: ${error} \n\n${error.stack}`)
})

process.on('uncaughtException', error => {
    console.warn(`error time ${new Date().toISOString()}`)
    console.warn('Unhandled exception:', error)
})

//post all errors into the log channel
const originalError = console.error
console.error = function (...args) {
    // Call the original console.error function to print the error message
    originalError.apply(console, args)
}

client.login(process.env.TOKEN).then(() => {
    console.log("Logged in using token successfully!")
})