import {
    AutocompleteInteraction,
    Client, CommandInteractionOptionResolver
} from "discord.js"
import * as chrono from 'chrono-node';
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");

momentDurationFormatSetup(moment);

export async function interactionAutoComplete(client: Client, i: AutocompleteInteraction) {
    if (!i.isAutocomplete()) return

    const { commandName, options, user, member, guild } = i

    if (!(options instanceof CommandInteractionOptionResolver)) {
        return
    }

    // @ts-ignore
    const focusedObject = options.getFocused(true);

    const optionName = focusedObject.name
    const optionType = focusedObject.type
    const optionFocused = focusedObject.focused
    const optionValue = focusedObject.value

    if (!optionFocused) {
        await i.respond([]);
        return
    }

    if (commandName === "reminder" && optionName === "time") {
        if (optionValue === "" || optionValue === null) {
            await i.respond([{name: "Start typing a time!", value: "Start typing a time!"}]);
            return
        }

        const date: Date | null = chrono.parseDate(`in ${optionValue}`, new Date(), { forwardDate: true })

        if (date === null) {
            await i.respond([{name: "Unknown time input", value: "Unknown time input"}]);
            return
        }

        const diffMilliseconds = date.getTime() - new Date().getTime()

        let relative = ""

        if (diffMilliseconds > 1000 * 60 * 60 * 24) {
            // For durations 24 hours or more, show days and hours
            relative = moment.duration(diffMilliseconds, "milliseconds").format();
        } else {
            // For durations less than 24 hours, show hours and minutes
            relative = moment.duration(diffMilliseconds, "milliseconds").format("h [hours], m [minutes]");
        }

        let choices = [optionValue, relative];
        await i.respond(
            choices.map(choice => ({ name: choice, value: choice })),
        );
        return
    }
}