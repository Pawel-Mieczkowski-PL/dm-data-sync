import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from '../update/update'
var fs = require('fs');

export const handler: Handler = async (event, context) => {


  try {
    const { ids, req } = JSON.parse(event.body);

    // const _sanity = sanity // configured Sanity client
    // const _sanityAlgolia = sanityAlgolia // configured sanity-algolia

    // // const body = `{"projectId":"${process.env['SANITY_PROJECT_ID']}","dataset":"production","}`
    // // console.log('body', body);

    // const bodyObj = {
    //   projectId: process.env['SANITY_PROJECT_ID'],
    //   "dataset": "production",
    //   ids: {
    //     "created": ids,
    //     "deleted": [],
    //     "updated": []
    //   }
    // }

    

    // const req = await _sanityAlgolia.webhookSync(_sanity, bodyObj)

    console.log('req', req)
    console.log('ids', ids.slice(0,4))

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
