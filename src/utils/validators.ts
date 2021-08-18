import * as yup from "yup";
import { ObjectShape } from "yup/lib/object";

export const dataValidator = yup.lazy((value) => {
    if (value === undefined || value === null) {
        return yup
            .object()
            .required("The data (object of string(s)) must be provided.");
    } else {
        const schema = Object.keys(value).reduce(
            (acc: ObjectShape, curr: string) => {
                acc[curr] = yup
                    .string()
                    .strict()
                    .typeError("data's fields must be a string.")
                    .required("The data's field (string) must be provided.");
                return acc;
            },
            {}
        );

        return yup
            .object()
            .shape(schema)
            .required("The data (object of string(s)) must be provided.");
    }
});

export const warehouseItemHeadersValidator = yup.object().shape({
    "Authorization": yup.date().strict()
});

export const warehouseItemValidator = yup.object().shape({
    no_update_after: yup
        .date()
        .typeError("no_update_after must be an ISO date"),
    name: yup
        .string()
        .strict()
        .typeError("name must be a string.")
        .defined("The name (string) must be provided."),
    data: dataValidator,
    total_quantity: yup
        .number()
        .strict()
        .typeError("total_quantity must be an integer.")
        .min(0)
        .defined("The total quantity (positive integer) must be provided."),
    available_quantity: yup
        .number()
        .strict()
        .typeError("available_quantity must be an integer.")
        .min(0)
        .defined("The available quantity (positive integer) must be provided.")
});

export const itemIdValidator = yup
    .number()
    .strict()
    .typeError("item_id must be an integer.")
    .min(0)
    .defined("The item_id (positive integer) must be provided.");

export const userIdValidator = yup
    .number()
    .strict()
    .typeError("user_id must be an integer.")
    .min(0)
    .defined("The user_id (positive integer) must be provided.");

export const userDocumentIdValidator = yup
    .string()
    .strict()
    .typeError("user id must be a string")
    .defined("The user_id (string) must be provided");

export const inventoryItemIdValidator = yup
    .string()
    .strict()
    .typeError("inventory item id must be a string")
    .defined("inventory_item_id (string) must be provided");