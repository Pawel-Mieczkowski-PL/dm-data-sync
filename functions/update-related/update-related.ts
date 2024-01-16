import { Handler } from '@netlify/functions'
import { sanity, sanityAlgolia } from '../update/update'

export const handler: Handler = async (event, context) => {
  {

    const _sanity = sanity // configured Sanity client
    const _sanityAlgolia = sanityAlgolia // configured sanity-algolia

    // Fetch the _id of all the documents we want to index
    const relatedTypes = ['seller', 'designer', 'category']
    const types = ['product']
    const relatedIds = JSON.stringify(JSON.parse(event.body).ids?.updated)
    // console.log('relatedIds', relatedIds)
    //const query = `* [_type in $types && references("${relatedIds}") &&!(_id in path("drafts.**"))][]._id`
    const query = `* [_id in ${relatedIds}][]{
      _type in ["designer","seller","materials"] => {
        "ids":*[_type=='product' && references(^._id) &&!(_id in path("drafts.**"))]._id
      },
      _type == "featuredCollection" => {
        "ids":products[] -> _id
      },
      _type == "event" => {
        "programs":*[_type=='program' && references(^._id)]{
          "ids":*[_type=='product' && references(^._id) &&!(^._id in path("drafts.**"))][]._id
        }
      }
    }`
    return _sanity
      .fetch(query, { types })
      .then((ids) => {
        console.log(ids)
        let outputIds = ids
          .map((id) => {
            if (id.programs != null) {
              let programs = id.programs
                .map((program) => {
                  return program.ids.map((i) => `"${i}"`).join(',')
                })
                .filter(function (element) {
                  return element !== undefined
                })
                .join(',')
              return programs
            }
            if (!Object.is(id.ids, null) && !Object.is(id.ids, undefined)) {
              return id.ids.map((i) => `"${i}"`).join(',')
            }
          })
          .filter(function (element) {
            return element !== undefined
          })
          .join(',')

        const body = `{"projectId":"v2n4gj8r","dataset":"production","ids":{"created":[],"deleted":[],"updated":[${outputIds}]}}`
        console.log('body', body)
        _sanityAlgolia.webhookSync(_sanity, JSON.parse(body))
      })
      .then(() => {
        return {
          statusCode: 200,
          body: 'ok',
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
