import * as yup from 'yup';

export const itemSchema = yup.object({
    user_id: yup.string().defined(),
    item_id: yup.number().defined(),
});
