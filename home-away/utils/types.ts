export type actionFunction = (
    prevState: { message: string | null },
    formData: FormData
) => Promise<{ message: string }>;

export type PropertyCardProps = {
    image: string;
    id: string;
    name: string;
    tagline: string;
    country: string;
    price: number;
};

export type DateRangeSelect = {
    startDate: Date;
    endDate: Date;
    key: string;
};

export type Booking = {
    checkIn: Date;
    checkOut: Date;
};