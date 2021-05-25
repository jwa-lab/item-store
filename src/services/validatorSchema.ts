import * as yup from 'yup';

export const inventoryItemSchema = yup.object({
    user_id: yup.string().typeError("user_id must be a string").defined("The user_id must be provided, don't forget it ! "),
    item_id: yup.number().typeError("item_id must be a number").positive("The item_id must be a positive number.").defined("The item_id must be provided, don't forget it ! "),
});

export const userSchema = yup.object({
    user_id: yup.number().typeError("user_id must be a number").positive("The user_id must be a positive number.").defined("The user_id must be provided, don't forget it ! ")
});

export const warehouseItemSchema = yup.object().shape({
    name: yup.string().typeError("name must be a string").defined("The name must be provided, don't forget it ! "),
    data: yup.object().typeError("data must be an object").defined("Some data must be provided, don't forget it ! "),
    total_quantity: yup.number().typeError("total_quantity must be a number").integer().positive("The total quantity must be a positive number.").defined("The total quantity must be provided, don't forget it ! "),
    available_quantity: yup.number().typeError("available_quantity must be a number").positive("The available quantity must be a positive number.").defined("The available quantity must be provided, don't forget it ! "),
});
