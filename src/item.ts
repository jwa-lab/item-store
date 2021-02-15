export interface JSONItem {
    no_update_after: string | undefined;
    item_id: number;
    data: { [k: string]: string };
    quantity: number;
    [key: string]: unknown;
}
