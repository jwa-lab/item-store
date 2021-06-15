import * as yup from "yup";

export const UserSchema = yup.object({
    user_id: yup
        .string()
        .strict()
        .typeError("user_id must be a string.")
        .defined("The user_id (string) must be provided.")
});

export const ItemSchema = yup.object({
    item_id: yup
        .number()
        .typeError("item_id must be an integer.")
        .positive("item_id must be a positive integer.")
        .defined("The item_id (positive integer) must be provided.")
});

export const InventorySchema = yup.object({
    inventory_item_id: yup
        .string()
        .strict()
        .typeError("inventory_item_id must be a string.")
        .defined("The inventory_item_id (string) must be provided.")
});

export const DataSchema = yup.object({
    data: yup.lazy((value) => {
        if (value === undefined || value === null)
            return yup
                .object()
                .required("The data (object of string(s)) must be provided.");
        else {
            const schema = Object.keys(value).reduce(
                (acc: any, curr: string) => {
                    acc[curr] = yup
                        .string()
                        .strict()
                        .typeError("data's field must be a string.")
                        .required(
                            "The data's field (string) must be provided."
                        );
                    return acc;
                },
                {}
            );
            return yup
                .object()
                .shape(schema)
                .required("The data (object of string(s)) must be provided.");
        }
    })
});

export const JsonUserSchema = yup.object({
    user_id: yup
        .number()
        .typeError("user_id must be an integer.")
        .positive("user_id must be a positive integer.")
        .defined("The user_id (positive integer) must be provided."),
    inventory_address: yup
        .string()
        .strict()
        .typeError("inventory_address must be a string.")
        .defined("The inventory_address (string) must be provided.")
});

export const ItemSpecsSchema = yup.object({
    start: yup
        .number()
        .typeError("start must be an integer.")
        .positive("start must be a positive integer.")
        .defined("The start (positive integer) must be provided."),
    limit: yup
        .number()
        .typeError("limit must be an integer.")
        .positive("limit must be a positive integer.")
        .defined("The limit (positive integer) must be provided.")
});

export const WarehouseItemSchema = yup.object().shape({
    name: yup
        .string()
        .strict()
        .typeError("name must be a string.")
        .defined("The name (string) must be provided."),
    data: yup.lazy((value) => {
        if (value === undefined || value === null)
            return yup
                .object()
                .required("The data (object of string(s)) must be provided.");
        else {
            const schema = Object.keys(value).reduce(
                (acc: any, curr: string) => {
                    acc[curr] = yup
                        .string()
                        .strict()
                        .typeError("data's field must be a string.")
                        .required(
                            "The data's field (string) must be provided."
                        );
                    return acc;
                },
                {}
            );
            return yup
                .object()
                .shape(schema)
                .required("The data (object of string(s)) must be provided.");
        }
    }),
    total_quantity: yup
        .number()
        .typeError("total_quantity must be an integer.")
        .integer()
        .positive("total quantity must be a positive integer.")
        .defined("The total quantity (positive integer) must be provided."),
    available_quantity: yup
        .number()
        .typeError("available_quantity must be an integer.")
        .positive("available quantity must be a positive integer.")
        .defined("The available quantity (positive integer) must be provided.")
});

export const WarehouseItemUpdateSchema = yup.object().shape({
    name: yup.string().strict().typeError("name must be a string.").optional(),
    data: yup.lazy((value) => {
        if (value === undefined || value === null)
            return yup
                .object()
                .required("The data (object of string(s)) must be provided.");
        else {
            const schema = Object.keys(value).reduce(
                (acc: any, curr: string) => {
                    acc[curr] = yup
                        .string()
                        .strict()
                        .typeError("data's field must be a string.")
                        .required(
                            "The data's field (string) must be provided."
                        );
                    return acc;
                },
                {}
            );
            return yup.object().shape(schema).optional();
        }
    }),
    total_quantity: yup
        .number()
        .typeError("total_quantity must be an integer.")
        .integer()
        .positive("total quantity must be a positive integer.")
        .optional(),
    available_quantity: yup
        .number()
        .typeError("available_quantity must be an integer.")
        .positive("available quantity must be a positive integer.")
        .optional()
});
