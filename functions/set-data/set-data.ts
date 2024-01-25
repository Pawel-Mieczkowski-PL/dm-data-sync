import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from '../update/update'
var fs = require('fs');

export const handler: Handler = async (event, context) => {


  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Set data!`,
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
