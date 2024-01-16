import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
    {

        if (!context?.clientContext?.user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ mssg: 'function test: ah ah ah, you must be logged into see this' })
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Test ok.' })
        }
    }
}
