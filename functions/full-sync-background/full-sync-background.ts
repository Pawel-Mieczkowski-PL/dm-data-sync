import { Handler } from '@netlify/functions'
import { sanity } from '../update/update'

export const handler: Handler = async (event, context) => {
  {

    if (!context?.clientContext?.user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'You must be logged' })
      }
    }


    const destination = '/.netlify/functions/set-data'

    // Fetch the _id of all the documents we want to index
    const types: any = ['article', 'seller', 'product']
    const query: string = `* [_type in $types && !(_id in path("drafts.**"))][]._id`

    const request = await sanity.fetch(query, { types });
    const ids = await request.json()

    fetch(destination, {
      method: "POST",
      headers: {
        Authorization: 'Bearer ' + context?.clientContext?.user
      },
      body: JSON.stringify({
        ids: ids,
      }),
    })

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
