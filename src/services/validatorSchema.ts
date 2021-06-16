import * as yup from "yup";

export const CreateUserSchema = yup.object({
    user_id: yup
        .number()
        .typeError("user_id must be an integer.")
        .min(0)
        .defined("The user_id (positive integer) must be provided."),
})

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
        .min(0)
        .defined("The item_id (positive integer) must be provided.")
});

export const InventorySchema = yup.object({
    inventory_item_id: yup
        .string()
        .strict()
        .typeError("inventory_item_id must be a string.")
        .defined("The inventory_item_id (string) must be provided.")
});

export const DataUpdateSchema = yup.object({
    data: yup.lazy((value) => {
        if (value === undefined || value === null)
            return yup
                .object()
                .optional();
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
})

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
        .min(0)
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
        .min(0)
        .defined("The start (positive integer) must be provided."),
    limit: yup
        .number()
        .typeError("limit must be an integer.")
        .min(0)
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
        .min(0)
        .defined("The total quantity (positive integer) must be provided."),
    available_quantity: yup
        .number()
        .typeError("available_quantity must be an integer.")
        .min(0)
        .defined("The available quantity (positive integer) must be provided.")
});

export const WarehouseItemUpdateSchema = yup.object().shape({
    name: yup.string().strict().typeError("name must be a string.").optional(),
    data: yup.lazy((value) => {
        if (value === undefined || value === null)
            return yup
                .object()
                .optional();
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
        .min(0)
        .optional(),
    available_quantity: yup
        .number()
        .typeError("available_quantity must be an integer.")
        .min(0)
        .optional()
});
