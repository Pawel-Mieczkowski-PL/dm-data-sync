import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from './update/update'

export const handler: Handler = async (event, context) => {
  {

    // if (!context?.clientContext?.user) {
    //   return {
    //     statusCode: 401,
    //     body: JSON.stringify({ message: 'You must be logged' })
    //   }
    // }

    const _sanity = sanity // configured Sanity client
    const _sanityAlgolia = sanityAlgolia // configured sanity-algolia

    // Fetch the _id of all the documents we want to index
    const types = ['article', 'seller', 'product']
    const query = `* [_type in $types && !(_id in path("drafts.**"))][]._id`

    return _sanity
      .fetch(query, { types })
      .then((ids) => {
        ids = JSON.stringify(ids)
        const body = `{"projectId":"v2n4gj8r","dataset":"production","ids":{"created":${ids},"deleted":[],"updated":[]}}`
        _sanityAlgolia.webhookSync(_sanity, JSON.parse(body))
      })
      .then(() => {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Synchronization is running. This process can take up to 10 minutes, depending on the size of the data.' })
        }
      })
      .catch((err) => {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: err }),
        }
      })
  }
}
