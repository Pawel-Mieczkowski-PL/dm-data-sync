import algoliasearch from 'algoliasearch'
import { createClient, SanityDocumentStub } from '@sanity/client'
import 'dotenv/config'
import { stripHtml } from 'string-strip-html'
import { Handler } from '@netlify/functions'
import indexer from 'sanity-algolia'

export const algolia = algoliasearch(
  process.env['ALGOLIA_APPLICATION_ID'],
  process.env['ALGOLIA_ADMIN_KEY']
)

export const sanity = createClient({
  projectId: process.env['SANITY_PROJECT_ID'],
  dataset: 'production',
  // If your dataset is private you need to add a read token.
  // You can mint one at https://manage.sanity.io,
  token: process.env['SANITY_TOKEN'],
  apiVersion: '2021-03-25',
  useCdn: false,
})

export const sanityAlgolia = indexer(
  // The first parameter maps a Sanity document type to its respective Algolia
  // search index. In this example both `post` and `article` Sanity types live
  // in the same Algolia index. Optionally you can also customize how the
  // document is fetched from Sanity by specifying a GROQ projection.
  //
  // In this example we fetch the plain text from Portable Text rich text
  // content via the pt::text function.
  //
  // _id and other system fields are handled automatically.
  {
    product: {
      index: algolia.initIndex('product'),
      projection: `{
        "title": store.title,
        "path": store.slug.current,
        "thumbnail": store.previewImageUrl,
        "status": store.status,
        "hidden":store.metafields[key=='hideFromShop'][0].value,
        "transactionTitle":store.metafields[key=='transactionTitle'][0].value,
        "transactionType":store.metafields[key=='transactionType'][0].value,
        "transactionURL":store.metafields[key=='transactionURL'][0].value,
        "body": store.descriptionHtml,
        "price": store.priceRange,
        "color":store.variants[0]->store.color,
        "store":store,
        "collections":*[_type=='featuredCollection' && references(^._id)]{
          "title":title,
          "subtitle":subtitle,
          "thumbnail":thumbnail[0].asset->url
        },
        "category": category[]->{
          "lvl0":{
            "title":parent->parent->title,
            "thumbnail":parent->parent->media[0].asset->url,
            "id":parent->parent->_id,
            "hidden":parent->parent->hidden,
          },
          "lvl1":{
            "title":parent->title,
            "thumbnail":parent->media[0].asset->url,
            "id":parent->_id,
            "hidden":parent->hidden,
          },
          "lvl2":{
            "title":title,
            "thumbnail":media[0].asset->url,
            "id":_id,
            "hidden":hidden
          },
        },
        "event":program->event[0]->{
          "city":city,
          "date":endDate,
          "id":_id
        },
        "seller": {
          "title": gallery->title,
          "thumbnail": gallery->thumbnail[0].asset->url,
          "description": gallery->description,
          "id": gallery->_id,
        },
        "designer": designer-> name,
        "heritage": store.heritage,
        "material": materials[]->{
          "title":title,
          "hidden":hidden,
        },
        "style": store.style,
      }`,
    },
    article: {
      index: algolia.initIndex('article'),
      projection: `{
        "title":title,
        "path":slug.current,
        "date":date,
        "author":author->name,
        "column":columnName->title,
        "description":subtitle,
        "thumbnail":mediaArticle[0].media[0].asset->url,
        "body": pt::text(bodycontent),
      }`,
    },
    seller: {
      index: algolia.initIndex('seller'),
      projection: `{
        "title":title,
        "path":slug.current,
        "sellerType":type,
        "description":description,
        "thumbnail":thumbnail[0].asset->url,
        "designers":array::unique(*[_type=='product' && references(^._id)].designer->name),
      }`,
    },
  },

  // The second parameter is a function that maps from a fetched Sanity document
  // to an Algolia Record. Here you can do further mutations to the data before
  // it is sent to Algolia.
  (document: SanityDocumentStub) => {
    switch (document._type) {
      case 'product':
        console.log('product', document)
        //iterate over the category tree to build category tree with images
        //define categories
        let categories = {
          lvl0: new Array<string>(),
          lvl1: new Array<string>(),
          lvl2: new Array<string>(),
        }

        document.category?.map((category) => {
          let categoryTreeElem: String = ''
          let categoryLevel = 0
          for (let i = 0; i < 3; i++) {
            let key = 'lvl' + i
            if (category[key].hidden) {
              return
            }
            let categoryOutputElem: String = ''
            if (category[key].title) {
              if (categoryTreeElem != '') {
                categoryTreeElem += ' > '
              }
              categoryTreeElem += category[key].title
              /*categoryOutputElem =
                category[key].id + '||' + categoryOutputElem + categoryTreeElem
                */
              if (category[key].thumbnail) {
                categoryOutputElem =
                  category[key].thumbnail + '||' + categoryTreeElem
              }
              if (
                !categories['lvl' + categoryLevel].includes(categoryTreeElem)
              ) {
                categories['lvl' + categoryLevel].push(categoryOutputElem)
              }
              categoryLevel++
            }
          }
        })
        let seller = document.seller?.title

        if (document.seller?.description) {
          seller = document.seller?.description + '||' + seller
        }

        if (document.seller?.thumbnail) {
          seller = document.seller?.thumbnail + '||' + seller
        }

        let collections = document.collections?.map((collection) => {
          let collectionOutput = collection.title

          if (collection.subtitle) {
            collectionOutput =
              stripHtml(collection.subtitle).result + '||' + collectionOutput
          }

          if (collection.thumbnail) {
            collectionOutput = collection.thumbnail + '||' + collectionOutput
          }
          return collectionOutput
        })

        let event
        if (
          document.event?.city &&
          document.event?.date &&
          document.seller?.title
        ) {
          let lvl1 = document.event?.city
          let lvl2 = lvl1 + ' > ' + document.event?.date?.slice(0, 4)
          let lvl3 = lvl2 + ' > ' + document.seller?.title

          event = {
            lvl0: lvl1,
            lvl1: lvl2,
            lvl2: lvl3,
          }
        }
        let material = new Array<string>()
        document.material?.map((materialObj) => {
          if (!materialObj.hidden) {
            material.push(materialObj.title)
          }
        })
        let hidden = document.hidden
        if (Object.is(hidden, null) || Object.is(hidden, undefined)) {
          hidden = false
        }
        if (
          hidden == true ||
          document.status === 'draft' ||
          document.status === 'archived'
        ) {
          hidden = true
        }

        return {
          objectID: document._id,
          title: document.title,
          handle: document.path,
          thumbnail: document.thumbnail,
          status: document.status,
          price: document.price,
          categories: categories,
          body: document.body,
          designer: document.designer,
          seller: seller,
          event: event,
          heritage: document.heritage,
          material: material,
          collections: collections,
          color: document.color,
          style: document.style,
          hidden: hidden,
          transactionTitle: document.transactionTitle,
          transactionType: document.transactionType,
          transactionURL: document.transactionURL,
        }
      case 'article':
        console.log('article', document)
        return {
          objectID: document._id,
          title: document.title,
          path: document.path,
          date: document.date,
          author: document.author,
          column: document.column,
          description: document.description,
          thumbnail: document.thumbnail,
          body: document.body,
        }
      case 'seller':
        console.log('seller', document)
        return {
          objectID: document._id,
          title: document.title,
          path: document.path,
          sellerType: document.sellerType,
          description: document.description,
          thumbnail: document.thumbnail,
        }
      default:
        return document
    }
  },
  // Visibility function (optional).
  //
  // The third parameter is an optional visibility function. Returning `true`
  // for a given document here specifies that it should be indexed for search
  // in Algolia. This is handy if for instance a field value on the document
  // decides if it should be indexed or not. This would also be the place to
  // implement any `publishedAt` datetime visibility rules or other custom
  // visibility scheme you may be using.
  (document: SanityDocumentStub) => {
    ConstantSourceNode.log('document', document)
    if (document.hasOwnProperty('isHidden')) {
      console.log('hidden')
      return false
    }
    return true
  }
)

export const handler: Handler = async (event, context) => {
  // Tip: Add webhook secrets to verify that the request is coming from Sanity.
  // See more at: https://www.sanity.io/docs/webhooks#bfa1758643b3

  if (
    event.headers['content-type'] !== 'application/json' ||
    !event.body ||
    !event.body.length
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad request' }),
    }
  }
  // Finally connect the Sanity webhook payload to Algolia indices via the
  // configured serializers and optional visibility function. `webhookSync` will
  // inspect the webhook payload, make queries back to Sanity with the `sanity`
  // client and make sure the algolia indices are synced to match.
  const body = JSON.parse(event.body)
  const ids = body.ids.all
  const testID = '7a3f65d9-322e-49fa-bd4f-653f102e7351'
  if (!ids.includes(testID)) {
    return false;
  }
console.log('event.body X', JSON.parse(event.body))

  return sanityAlgolia
    .webhookSync(sanity, JSON.parse(event.body))
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.parse(event.body),
      }
    })
    .catch((err) => {
      console.error('err', err)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err }),
      }
    })
}
