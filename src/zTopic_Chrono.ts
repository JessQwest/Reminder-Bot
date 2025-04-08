import { DST_END, DST_START, TIMEZONE, TIMEZONE_OFFSET_DURING_DST, TIMEZONE_OFFSET_NON_DST } from "./index";
import * as chrono from 'chrono-node';
import {
    AmbiguousTimezoneMap,
    getLastWeekdayOfMonth,
    getNthWeekdayOfMonth,
    Month,
    TIMEZONE_ABBR_MAP,
    TimezoneAbbrMap,
    Weekday
} from "./entity/chrono";

export const ADDITIONAL_TIMEZONES: TimezoneAbbrMap = {
    // British time is missing from chrono-node, so it is added here
    BT: {
        timezoneOffsetDuringDst: 60,
        timezoneOffsetNonDst: 0,
        dstStart: (year: number) => getLastWeekdayOfMonth(year, Month.MARCH, Weekday.SUNDAY, 1),
        dstEnd: (year: number) => getLastWeekdayOfMonth(year, Month.OCTOBER, Weekday.SUNDAY, 2),
    },
}

export var CHRONO_PARSING_OPTION: chrono.ParsingOption
export var CHRONO_PARSING_REFERENCE: chrono.ParsingReference

export function generateChronoSettings() {
    console.log("Preparing Chrono Settings")
    // Prepare Chrono settings
    let timezone = 'UTC'
    //let customTimezone: TimezoneAbbrMap | undefined = undefined
    console.log(`reading custom timezones as ${TIMEZONE_ABBR_MAP}`)
    let validTimezones = Object.keys(TIMEZONE_ABBR_MAP)
    let validCustomTimezones = Object.keys(ADDITIONAL_TIMEZONES)

    if (TIMEZONE !== undefined) {
        if ([...validTimezones, validCustomTimezones].includes(TIMEZONE)) {
            timezone = TIMEZONE
        } else {
            console.warn("Unrecognised input timezone!")
        }
    }

    let userDefinedTimezone: TimezoneAbbrMap = {}
    if (TIMEZONE_OFFSET_DURING_DST !== null && TIMEZONE_OFFSET_DURING_DST !== "" &&
        TIMEZONE_OFFSET_NON_DST !== null && TIMEZONE_OFFSET_NON_DST !== "" &&
        DST_START !== null && DST_START !== "" &&
        DST_END !== null && DST_END !== "" ) {

        console.log("Processing DST values")
        console.log(TIMEZONE_OFFSET_DURING_DST)
        console.log(TIMEZONE_OFFSET_NON_DST)
        console.log(DST_START)
        console.log(DST_END)

        const customTimeZone: AmbiguousTimezoneMap = {
            timezoneOffsetDuringDst: TIMEZONE_OFFSET_DURING_DST,
            timezoneOffsetNonDst: TIMEZONE_OFFSET_NON_DST,
            dstStart: timeZoneStringToDateFunction(DST_START),
            dstEnd: timeZoneStringToDateFunction(DST_END)
        }

        userDefinedTimezone = {
            CUSTOM: customTimeZone,
        }
        timezone = "CUSTOM"
    }

    CHRONO_PARSING_OPTION = {
        forwardDate: true,
        timezones: Object.keys(userDefinedTimezone).length > 0 ? userDefinedTimezone : ADDITIONAL_TIMEZONES
    }

    CHRONO_PARSING_REFERENCE = {
        timezone: timezone
    }

    const specificTimeZoneSetting = Object.keys(userDefinedTimezone).length > 0 ? userDefinedTimezone : ADDITIONAL_TIMEZONES[timezone]
    console.log(`Timezone configuration set to ${CHRONO_PARSING_REFERENCE.timezone} with settings ${JSON.stringify(specificTimeZoneSetting)}`)
}

// convert a string such a '3, 6, last, 2' to a date function defining "the last sunday of march at 2am"
// uses the format "Month, Weekday, Week in month, Hour of day"
function timeZoneStringToDateFunction(input: string): (year: number) => Date {
    const parts = input.split(',').map(part => part.trim());
    const month: number = parseInt(parts[0], 10);
    const weekday: number = parseInt(parts[1], 10);
    const weekNo: number | string = isNaN(Number(parts[2])) ? parts[2] : parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);

    if (weekNo === 'last') {
        return (year: number) => getLastWeekdayOfMonth(year, month, weekday, hour);
    } else if (!isNaN(Number(weekNo)) && [1,2,3,4].includes(weekNo as number)) { // if its a valid number
        return (year: number) => getNthWeekdayOfMonth(year, month, weekday, weekNo as 1 | 2 | 3 | 4, hour)
    } else {
        throw "Invalid weekNo input!"
    }
}