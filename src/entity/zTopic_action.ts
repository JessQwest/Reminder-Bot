
export const actionRegex: RegExp = /^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD):https?:\/\/[^\s]+$/

export interface ApiResponseType {
    responseCode: string,
    responseBody: string,
}

const FAIL_RESPONSE: ApiResponseType = {
    responseCode: "500",
    responseBody: "Internal Server Error",
}

export async function processAction(action: string): Promise<boolean> {
    if (!actionRegex.test(action)) {
        console.log(`Invalid string input for process action! (${action})`)
        return false
    }
    return true
}

export async function apiCall(requestType: string, requestURI: string): Promise<ApiResponseType> {
    console.log(`API Call: ${requestType} ${requestURI}`)
    const response = await fetch(requestURI, {
        method: requestType,
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (response.ok) {
        const responseBody = await response.text()
        return {
            responseCode: String(response.status),
            responseBody: responseBody,
        }
    } else return FAIL_RESPONSE
}