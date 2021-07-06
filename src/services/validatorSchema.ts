import * as yup from "yup";

export const UserSchema = yup.object({
    user_id: yup
        .string()
        .strict()
        .typeError("user_id must be a string.")
        .defined("The user_id (string) must be provided.")
});

export const SearchByUserIdRequest = yup.object({
    item_id: yup
        .number()
        .strict()
        .typeError("item_id must be an integer.")
        .min(0)
        .defined("The item_id (positive integer) must be provided.")
});

export const SearchParamsRequest = yup.object({
    start: yup
        .number()
        .strict()
        .typeError("start must be an integer.")
        .min(0)
        .defined("The start (positive integer) must be provided."),
    limit: yup
        .number()
        .strict()
        .typeError("limit must be an integer.")
        .min(0)
        .defined("The limit (positive integer) must be provided.")
});
