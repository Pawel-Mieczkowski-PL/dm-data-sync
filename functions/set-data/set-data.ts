import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from '../update/update'

export const handler: Handler = async (event, context) => {


  try {
    const { ids } = JSON.parse(event.body);
    const _sanity = sanity // configured Sanity client
    const _sanityAlgolia = sanityAlgolia // configured sanity-algolia

    const body = `{"projectId":"${process.env['SANITY_PROJECT_ID']}","dataset":"production","ids":{"created":${ids},"deleted":[],"updated":[]}}`
    _sanityAlgolia.webhookSync(_sanity, JSON.parse(body))

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Hello, world!`,
      }),
    }
  } catch (e) {
    console.log({ e });
    return {
      statusCode: 500,
      message: e
    }
  }
}
