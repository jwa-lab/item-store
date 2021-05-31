import * as yup from "yup";

export const inventoryItemSchema = yup.object({
    user_id: yup
        .string()
        .strict()
        .typeError("user_id must be a string")
        .defined("The user_id (string) must be provided."),
    item_id: yup
        .number()
        .typeError("item_id must be a number")
        .positive("The item_id must be a positive number.")
        .defined("The item_id (positive integer) must be provided.")
});

export const userSchema = yup.object({
    user_id: yup
        .number()
        .typeError("user_id must be a number")
        .positive("The user_id must be a positive number.")
        .defined("The user_id (string) must be provided.")
});

export const warehouseItemSchema = yup.object().shape({
    name: yup
        .string()
        .strict()
        .typeError("name must be a string")
        .defined("The name (string) must be provided."),
    data: yup
        .object()
        .shape({
            dataKey: yup.object().shape({
                dataElement: yup.string().required(),
            }),
        })
        .typeError("data must be an object")
        .defined(
            "Some data (object with a string element and a string key) must be provided."
        ),
    total_quantity: yup
        .number()
        .typeError("total_quantity must be a number")
        .integer()
        .positive("The total quantity must be a positive number.")
        .defined("The total quantity (positive integer) must be provided."),
    available_quantity: yup
        .number()
        .typeError("available_quantity must be a number")
        .positive("The available quantity must be a positive number.")
        .defined("The available quantity (positive integer) must be provided.")
});
