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
        .min(0)
        .defined("The item_id (positive integer) must be provided.")
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
