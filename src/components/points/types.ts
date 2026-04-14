export type PointEntry = {
    id: string;
    architect_id: string;
    architect_name: string;
    architect_photo_url?: string;
    point_type_name: string;
    amount: number;
    entry_date: string;
    created_at: string;
    updated_at: string;
};

export type PointEntryFormData = {
    architect_id: string;
    point_type_name: string;
    amount: number;
    entry_date: string;
};
