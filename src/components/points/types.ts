export type PointEntry = {
    id: string;
    architect_id: string;
    point_type: string;
    amount: number;
    entry_date: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    architects: {
        id: string;
        name: string;
        photo_url: string | null;
    } | null;
};

export type PointEntryFormData = {
    architect_id: string;
    point_type: string;
    amount: number;
    entry_date: string;
};
