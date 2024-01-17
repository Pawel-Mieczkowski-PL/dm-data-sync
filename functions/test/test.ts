import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
    {

        if (!context?.clientContext?.user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'You must be logged' })
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Test ok.' })
        }
    }
}
