import * as yup from 'yup';

export const inventoryItemSchema = yup.object({
    user_id: yup.string().defined("The user_id must be provided, don't forget it ! "),
    item_id: yup.number().positive().defined("The item_id must be provided, don't forget it ! "),
});

export const userSchema = yup.object({
    user_id: yup.number().positive().defined("The user_id must be provided, don't forget it ! ")
});

export const warehouseItemSchema = yup.object().shape({
    name: yup.string().defined("The name must be provided, don't forget it ! "),
    data: yup.object().defined("Some data must be provided, don't forget it ! "),
    total_quantity: yup.number().integer().positive().defined("The total quantity must be provided, don't forget it ! "),
    available_quantity: yup.number().positive().defined("The available quantity must be provided, don't forget it ! "),
});
