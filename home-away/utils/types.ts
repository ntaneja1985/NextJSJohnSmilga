export type actionFunction = (
    prevState: { message: string | null },
    formData: FormData
) => Promise<{ message: string }>;