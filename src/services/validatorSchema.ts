import * as yup from "yup";
import { array } from "yup";

export const inventoryItemSchema = yup.object({
    user_id: yup
        .string()
        .strict()
        .typeError("user_id must be a string")
        .defined("The user_id (string) must be provided."),
    item_id: yup
        .number()
        .typeError("item_id must be a number")
        .positive("item_id must be a positive number.")
        .defined("The item_id (positive integer) must be provided.")
});

export const userSchema = yup.object({
    user_id: yup
        .number()
        .typeError("user_id must be a number")
        .positive("user_id must be a positive number.")
        .defined("The user_id (string) must be provided.")
});

export const warehouseItemSchema = yup.object().shape({
    name: yup
        .string()
        .strict()
        .typeError("name must be a string")
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
        .typeError("total_quantity must be a number")
        .integer()
        .positive("total quantity must be a positive number.")
        .defined("The total quantity (positive integer) must be provided."),
    available_quantity: yup
        .number()
        .typeError("available_quantity must be a number")
        .positive("available quantity must be a positive number.")
        .defined("The available quantity (positive integer) must be provided.")
});
