import * as yup from 'yup';

export const inventoryItemSchema = yup.object({
    user_id: yup.string().defined(),
    item_id: yup.number().defined(),
});

export const userSchema = yup.object({
    user_id: yup.number().defined(),
    inventory_address: yup.string().defined()
});

export const warehouseItemSchema = yup.object({
    name: yup.string().defined(),
    data: yup.array().defined(),
    total_quantity: yup.number().defined(),
    available_quantity: yup.number().defined(),
});
