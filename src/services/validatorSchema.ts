import * as yup from 'yup';

export const inventoryItemSchema = yup.object({
    user_id: yup.string().defined("All fields must be completed"),
    item_id: yup.number().positive().defined("All fields must be completed"),
});

export const userSchema = yup.object({
    user_id: yup.number().positive().defined("All fields must be completed")
});

export const warehouseItemSchema = yup.object().shape({
    name: yup.string().matches(/[A-Za-z]/, "Only alphabet words").defined("All fields must be completed"),
    data: yup.object().defined("All fields must be completed"),
    total_quantity: yup.number().integer().positive().defined("All fields must be completed"),
    available_quantity: yup.number().positive().defined("All fields must be completed"),
});
