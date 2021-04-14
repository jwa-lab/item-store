# item-store

Store and retrieve items in a fast storage

## What is it?

It's a Nats client that subscribed to subjects to execute CRUD operations on an ElasticSearch database to quickly add, update, get items.

## How to setup the Dev environment:

1. Start a minilab locally: https://github.como/jwa-lab/minilab
2. Start ElasticSearch and Kibana

```
docker-compose up
```

3. Start the service in dev mode which includes hot relads:

```
./run dev
```

## Test

To test this service, follow the steps listed in `How to setup the Dev environment:`

Then

```
npm run test
```
