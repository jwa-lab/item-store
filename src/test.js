const { Client } = require("@elastic/elasticsearch");
const uri = "http://localhost:9200";

const client = new Client({ node: uri });

const indexName = "test-index-7";

async function test() {
  try {
    await createIndexIfNotExists(indexName);

    for (let i = 0; i < 10; i++) {
      setTimeout(async () => {
        console.log('checking if it has docs');
      let hasDocs = await hasDocuments(indexName);

      let lastId = 0;
  
      if (hasDocs) {
        console.log('getting last doc id');
        lastId = await getLastDocumentId(indexName);
        console.log(`last document ID is ${ lastId }`)
      }

      console.log('creating document with id ' + lastId + 1);

      await client.index({
          index: indexName,
          id: lastId + 1,
          body: {
              id: lastId + 1,
              testData: 'yes',
              boolean: true,
              number: 10.2
          }
      });
      }, 0)
    }
  } catch (err) {
    console.error(err);
  }
}

async function createIndexIfNotExists(indexName) {
    const exists = await client.indices.exists({
      index: indexName
    });

    if (!exists.body) {
        await client.indices.create({
            index: indexName
        });
    }
}

async function hasDocuments(indexName) {
  const count = await client.cat.count({
    index: indexName,
    format: 'json'
  });

  return count.body[0].count > 0;
}

async function getLastDocumentId(indexName) {
  const response = await client.search({
      index: indexName,
      body: {
          sort: [
              {
                  id: {
                      order: "desc"
                  }
              }
          ],
          size: 1
      }
  });

  return Number(response.body.hits.hits[0]._id);
}

test();
