import { INDEXES } from "../config";
import { JSONUser } from "../user";
import { getClient } from "./elasticSearch";

export async function addUser(data: JSONUser): Promise<string> {
    const client = getClient();

    const response = await client.index({
        index: INDEXES.USER,
        body: data,
        refresh: true
    });

    return response.body._id;
}

export async function getUser(id: string): Promise<JSONUser> {
    const client = getClient();

    const response = await client.get({
        index: INDEXES.USER,
        id
    });

    return response.body._source;
}

export async function updateUser(id: string, data: JSONUser): Promise<void> {
    const client = getClient();

    await client.update({
        index: INDEXES.USER,
        id,
        body: {
            doc: data
        },
        refresh: true
    });
}
