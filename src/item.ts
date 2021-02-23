export interface JSONItem {
    no_update_after: string | undefined;
    item_id: number;
    name: string;
    data: { [k: string]: string };
    quantity: number;
    [key: string]: unknown;
}
