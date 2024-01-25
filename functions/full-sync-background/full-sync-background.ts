import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from '../update/update'
import fetch  from "node-fetch";

export const handler: Handler = async (event, context) => {
  {

    if (!context?.clientContext?.user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'You must be logged' })
      }
    }

    try {
      const destination = 'https://dm-data-sync.netlify.app/.netlify/functions/set-data'

      // Fetch the _id of all the documents we want to index
      // const types: any = ['article', 'seller', 'product']
      // const query: string = `* [_type in $types && !(_id in path("drafts.**"))][]._id`

      // const ids = await sanity.fetch(query, { types });
      // const bodyObj = {
      //   projectId: process.env['SANITY_PROJECT_ID'],
      //   "dataset": "production",
      //   ids: {
      //     "created": ids,
      //     "deleted": [],
      //     "updated": []
      //   }
      // }
  
      
  
      const req = await sanityAlgolia.webhookSync(sanity, bodyObj)

      fetch(destination, {
        method: "POST",
        // headers: {
        //   Authorization: 'Bearer ' + context?.clientContext?.user
        // },
        // body: JSON.stringify({
        //   ids,
        //   req
        // }),
      })
    } catch (e) {
      console.log({ e });
      return {
        statusCode: 500,
        message: e
      }
    }

    // const destination = 'https://dm-data-sync.netlify.app/.netlify/functions/test'
    // const timeout = 15 // seconds
    // const sleep = (seconds) =>
    //   Promise.resolve(() => setTimeout(resolve, +seconds * 1000))

    // // Simulating fake long running sequence
    // console.log(
    //   `[INIT] Beginning to process data. This may take a while ~${timeout} seconds...`
    // )
    // await sleep(timeout) // seconds
    // console.log(`[SUCCESS] Done processing after ${timeout} seconds...`)
    // console.log(`Sending data to destination: ${destination}...`)

    // // Sending data to a destination
    // fetch(destination, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     message: `Successfully processed request with ID: ${Math.random() * 1000
    //       }`,
    //     date: new Date().toGMTString(),
    //   }),
    // })
  }
}
