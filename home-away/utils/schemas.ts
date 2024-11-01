import * as z from 'zod'
import {ZodSchema} from "zod";

export const profileSchema = z.object({
    // firstName: z.string().max(5, { message: 'max length is 5' }),
    firstName: z.string().min(2,{ message: 'first Name min length should be 2' }),
    lastName: z.string().min(2,{ message: 'last Name min length should be 2' }),
    username: z.string().min(2,{ message: 'user Name min length should be 2' }),
});

export function validateWithZodSchema<T>(schema: ZodSchema<T>,data:unknown):T{
    {
        const result = schema.safeParse(data);
        if(!result.success)
        {
            const errors = result.error.errors.map((err)=>err.message);
            throw new Error(errors.join(','));
        }
        return result.data;
    }
}