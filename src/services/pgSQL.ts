import { Knex, knex } from 'knex';
import { JSONWarehouseItem } from "../item";

let pg: Knex;

export async function initPgSQL(): Promise<void> {
    const config: Knex.Config = {
        client: 'pg',
        debug: true,
        connection: {
            host: 'localhost',
            user: 'jwa',
            password: 'jwalab',
            database: 'item',
        },
    };

    pg = knex(config);

    //console.log(pg);

    await pg.raw("CREATE OR REPLACE FUNCTION flatten_item_data(data jsonb, name text) RETURNS TEXT AS $$ SELECT CONCAT(string_agg(value, ' '), ' ', name) FROM (SELECT value FROM JSONB_EACH_TEXT(data)) AS foo $$ LANGUAGE SQL IMMUTABLE;")

    await pg.schema.dropTableIfExists('instances');
    await pg.schema.dropTableIfExists("items").createTable("items", function(table) {
        table.increments("item_id");
        table.string('name', 100).notNullable();
        table.integer('total_quantity').notNullable();
        table.integer('available_quantity').notNullable();
        table.timestamp('no_update_after');
        table.jsonb('data').notNullable().defaultTo('{}');
        table.specificType('fulltext', "TEXT GENERATED ALWAYS AS (flatten_item_data(data, name)) STORED");

        //table.index('data', 'data_idx', 'gin');
        //table.index('fulltext', 'fulltext_idx', 'gin');
    });


    //
    // try {
    //     await pg.raw("CREATE EXTENSION pg_trgm");
    // } catch (err) {
    //     console.log(err);
    // }

    //await pg.raw("ALTER TABLE items ADD COLUMN fulltext TEXT GENERATED ALWAYS AS (flatten_item_data(data, name)) STORED");

    //await pg.raw("CREATE INDEX fulltext_idx ON items USING GIN(fulltext gin_trgm_ops)");
    // await pg.raw("CREATE INDEX data_en_fulltext_idx ON items USING GIN(to_tsvector('english', name || ' ' || data))");
    //
    // await pg.raw("ALTER TABLE items ADD COLUMN fulltext text[] GENERATED ALWAYS AS (tsvector_to_array(to_tsvector('english', data) || to_tsvector('english', name))) STORED")
    //
    // await pg.raw("ALTER TABLE items ADD COLUMN fulltext2 tsvector GENERATED ALWAYS AS (to_tsvector('english', data) || to_tsvector('english', name)) STORED");
    // await pg.raw("CREATE INDEX fulltext2_idx ON items USING GIN(fulltext2)");



    await pg.schema.dropTableIfExists('instances').createTable('instances', function(table) {
        table.increments('instance_id');
        table.integer('item_id').notNullable();
        table.integer('user_id').notNullable();
        table.jsonb('data').defaultTo('{}');

        table.foreign('item_id').references('item_id').inTable('items');
    });


    const result = await pg('items').insert([{
        "name": "Ronaldo",
        "total_quantity": 5,
        "available_quantity": 5,
        "data": '{"level":"legendary", "xp":"10", "club":"Manchester"}'
    }, {
        "name": "Messi",
        "total_quantity": 5,
        "available_quantity": 5,
        "data": '{"level":"legendary", "xp":"10", "club":"Paris"}'
    }, {
        "name": "Mbappe",
        "total_quantity": 10,
        "available_quantity": 10,
        "data": '{"level":"rare", "xp":"5", "club":"Paris"}'
    }, {
        "name": "Weird",
        "total_quantity": 50,
        "available_quantity": 50,
        "data": '{"level":"Paris", "xp":"10", "club":"legendary"}'
    }, {
        "name": "Ronaldhino",
        "total_quantity": 20,
        "available_quantity": 20,
        "data": '{"level": "rare", "xp": "15", "club": "Barcelona"}'
    }]);

    //console.log(result);
}

export async function pgAddWarehouseItem(item: JSONWarehouseItem): Promise<number> {
    //console.log(item);
    const result = await pg('items').insert(item, ['item_id']);
    //console.log(result);
    return result[0].item_id;
}

export async function pgGetWarehouseItems(from: number, size: number)
{
    const result = await pg('items').select().offset(from).limit(size);
    console.log(result);
    return result;
}

export async function pgGetWarehouseItem(item_id: number)
{
    const result = await pg('items').select().where('item_id', item_id);
    console.log(result);
    return result;
}
