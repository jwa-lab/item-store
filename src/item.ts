export interface JSONWarehouseItem {
    no_update_after: string | undefined;
    item_id: number;
    name: string;
    data: { [k: string]: string };
    total_quantity: number;
    available_quantity: number;
    [key: string]: unknown;
}

export interface JSONInventoryItem {
    item_id: number;
    user_id: string;
    instance_number: number;
    data: { [k: string]: string };
    [key: string]: unknown;
}
