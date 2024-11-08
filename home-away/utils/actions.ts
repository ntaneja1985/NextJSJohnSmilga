'use server'
import {createReviewSchema, imageSchema, profileSchema, propertySchema, validateWithZodSchema} from "@/utils/schemas";
import db from './db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {uploadImage} from "@/utils/supabase";
import {calculateTotals} from "@/utils/calculateTotals";
import {formatDate} from "@/utils/format";

const getAuthUser = async() =>{
    const user = await currentUser();
    if(!user){
        throw new Error('You are not logged in');
    }
    if(!user.privateMetadata.hasProfile) redirect('/profile/create')
    return user;
}

const renderError = (error:unknown):{message:string} =>{
    console.log(error);
    return { message: error instanceof Error ? error.message : 'An error occured' };
}

export const createProfileAction = async(prevState: { message:string | null },
                                         formData:FormData) =>{
    try {
        const user = await currentUser();
        if(!user) throw new Error('Please login to create a profile');

        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(profileSchema,rawData);
        await db.profile.create({
            data:{
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                profileImage: user.imageUrl ?? '',
                ...validatedFields,
            },
        });
        // await clerkClient.users.updateUserMetadata(user.id, {
        //     privateMetadata: {
        //         hasProfile: true,
        //     },
        // });
        await (await clerkClient()).users.updateUserMetadata(user.id, {
            privateMetadata: {
                hasProfile: true,
            },
        })
        //return {message: 'Profile Created'};
    }
    catch(err){
        return renderError(err);
    }
    redirect('/');
}

export const fetchProfileImage = async () =>{
    const user = await currentUser();
    if(!user) return null;
    const profile = await db.profile.findUnique({
        where:{
            clerkId: user.id,
        },
        select:{
            profileImage: true
        },
    })

    return profile?.profileImage;
}

export const fetchProfile = async() =>{
    const user = await getAuthUser();
    const profile = await db.profile.findUnique({
        where:{
            clerkId: user.id,
        }
    })
    if(!profile) redirect('/profile/create');
    return profile;
}

export const updateProfileAction
    = async(prevState:{ message:string | null },formData:FormData):Promise<{message:string}> =>{

    const user = await getAuthUser();
    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(profileSchema,rawData);
        await db.profile.update({
            where: {
                clerkId: user.id,
            },
            data: validatedFields,
        });
        revalidatePath('/profile');
        return { message: 'Profile updated successfully' };
    }
    catch(err){
        return renderError(err);
    }

    //return {message:'update Profile Action'};
}

export const updateProfileImageAction = async (
    prevState: { message:string | null },
    formData: FormData
): Promise<{ message: string }> => {
    const user = await getAuthUser();
    try {
        const image = formData.get('image') as File;
        const validatedFields = validateWithZodSchema(imageSchema, {image});
        const fullPath = await uploadImage(validatedFields.image);
        await db.profile.update({
            where:{
                clerkId: user.id
            },
            data: {
              profileImage: fullPath,
            }
            })
        revalidatePath('/profile');
        return {message: 'Profile image updated successfully'};
    }
    catch (error){
        return renderError(error);
    }
};

export const createPropertyAction = async (
    prevState: { message:string | null },
    formData: FormData
): Promise<{ message: string }> => {
    const user = await getAuthUser();
    try {
        //Get the data
        const rawData = Object.fromEntries(formData);
        const file = formData.get('image') as File;

        //validate the fields
        const validatedFields = validateWithZodSchema(propertySchema, rawData);
        const validatedFile = validateWithZodSchema(imageSchema, { image: file });
        //upload image to supabase
        const fullPath = await uploadImage(validatedFile.image);

        //save the property to the database along with image path
        await db.property.create({
            data: {
                ...validatedFields,
                image: fullPath,
                profileId: user.id,
            },
        });
    } catch (error) {
        return renderError(error);
    }
    redirect('/');
};

export const fetchProperties = async ({
                                          search = '',
                                          category,
                                      }: {
    search?: string;
    category?: string;
}) => {
    console.log("category from fetch= "+category)
    console.log("search from fetch= "+search);

    const properties = await db.property.findMany({
        where: {
            category,
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { tagline: { contains: search, mode: 'insensitive' } },
            ],
        },
        select: {
            id: true,
            name: true,
            tagline: true,
            country: true,
            image: true,
            price: true,
        },
        orderBy:{
          createdAt:'desc'
        },
    });
    //console.log("Found number of properties = "+properties.length);
    return properties;
};

export const fetchFavoriteId = async ({
                                          propertyId,
                                      }: {
    propertyId: string;
}) => {
    const user = await getAuthUser();
    const favorite = await db.favorite.findFirst({
        where: {
            propertyId,
            profileId: user.id,
        },
        select: {
            id: true,
        },
    });
    return favorite?.id || null;
};

export const toggleFavoriteAction = async (prevState:{propertyId:string;
favoriteId:string | null;
    pathname:string;}) => {
    const user = await getAuthUser();
    const {propertyId,favoriteId,pathname} = prevState;
    try {
        if(favoriteId){
            await db.favorite.delete({
                where:{
                    id:favoriteId,
                }
            })
        } else {
            await db.favorite.create({
                data: {
                    propertyId,
                    profileId: user.id,
                },
            });
        }
        revalidatePath(pathname);
        return { message: favoriteId ? 'Removed from Faves' : 'Added to Faves' };
    }
    catch (error)
    {
        return renderError(error);
    }
};

export const fetchFavorites = async () => {
    const user = await getAuthUser();
    const favorites = await db.favorite.findMany({
        where: {
            profileId: user.id,
        },
        select: {
            //Notice this is not the data from favorite table, it is from property table which is connected to favorite table
            property: {
                select: {
                    id: true,
                    name: true,
                    tagline: true,
                    price: true,
                    country: true,
                    image: true,
                },
            },
        },
    });
    return favorites.map((favorite) => favorite.property);
};

export const fetchPropertyDetails = async (id:string) =>{
    return db.property.findUnique({
        where:{
            id: id
        },
        include: {
            profile:true,
            bookings: {
                select: {
                    checkIn: true,
                    checkOut: true,
                },
            },
        }
    })
}

export const createReviewAction = async (prevState:{ message:string | null }, formData: FormData) => {
    const user = await getAuthUser();
    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(createReviewSchema, rawData);
        await db.review.create({
            data: {
                ...validatedFields,
                profileId: user.id,
            },
        });
        revalidatePath(`/properties/${validatedFields.propertyId}`);
        return { message: 'Review submitted successfully' };
    }
    catch (error){
        return renderError(error);
    }
};

export const fetchPropertyReviews = async (propertyId: string) => {
    const reviews = await db.review.findMany({
        where: {
            propertyId,
        },
        select: {
            id: true,
            rating: true,
            comment: true,
            profile: {
                select: {
                    firstName: true,
                    profileImage: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return reviews;
};

export const fetchPropertyReviewsByUser = async () => {
    const user = await getAuthUser();
    const reviews = await db.review.findMany({
        where: {
            profileId: user.id,
        },
        select: {
            id: true,
            rating: true,
            comment: true,
            property: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });
    return reviews;
};

export const deleteReviewAction = async (prevState: { reviewId: string }) => {
    const { reviewId } = prevState;
    const user = await getAuthUser();
    try {
        await db.review.delete({
            where: {
                id: reviewId,
                profileId: user.id,
            },
        });

        revalidatePath('/reviews');
        return { message: 'Review deleted successfully' };
    } catch (error) {
        return renderError(error);
    }

};

export const findExistingReview = async (
    userId: string,
    propertyId: string
) => {
    return db.review.findFirst({
        where: {
            profileId: userId,
            propertyId: propertyId,
        },
    });
};

export async function fetchPropertyRating(propertyId:string)
{
    const result  = await db.review.groupBy({
        by:['propertyId'],
        _avg:{
            rating:true
        },
        _count:{
            rating:true
        },
        where: {
            propertyId,
        },
    });
    // empty array if no reviews
    return {
        rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
        count: result[0]?._count.rating ?? 0,
    };
}

export const createBookingAction = async (prevState: {
    propertyId: string;
    checkIn: Date;
    checkOut: Date;
}) => {
    const user = await getAuthUser();
    // create variable
    let bookingId: null | string = null;
    const { propertyId, checkIn, checkOut } = prevState;
    const property = await db.property.findUnique({
        where: { id: propertyId },
        select: { price: true },
    });
    if (!property) {
        return { message: 'Property not found' };
    }
    const { orderTotal, totalNights } = calculateTotals({
        checkIn,
        checkOut,
        price: property.price,
    });
    try {
        const booking = await db.booking.create({
            data: {
                checkIn,
                checkOut,
                orderTotal,
                totalNights,
                profileId: user.id,
                propertyId,
            },
        });
        bookingId = booking.id
    }
    catch (error)
    {
        return renderError(error);
    }

    //redirect('/bookings');
    //redirect to check out
    redirect(`/checkout?bookingId=${bookingId}`);
};

export const fetchBookings = async() =>{
    const user = await getAuthUser();
    const bookings = await db.booking.findMany({
        where :{
            profileId:user.id,
            paymentStatus:true,
        },
        include: {
            property:{
                select:{
                    id:true,
                    name:true,
                    country:true,
                }
            }
        },
        orderBy:{
            checkIn:'desc'
        },
    });
    console.log("Bookings Count = "+bookings.length)
    return bookings;
}

export const deleteBookingAction = async (prevState: {bookingId:string}) =>{
    const {bookingId} = prevState;
    const user = await getAuthUser();
    try {
       const result = await db.booking.delete({
           where:{
               id: bookingId,
               profileId: user.id,
           },
       }) ;
       revalidatePath('/bookings');
       return {message:'Booking deleted successfully'};
    }
    catch (error){
        return renderError(error);
    }
}
export async function deleteRentalAction(prevState: { propertyId: string }) {
    const { propertyId } = prevState;
    const user = await getAuthUser();

    try {
        await db.property.delete({
            where: {
                id: propertyId,
                profileId: user.id,
            },
        });

        revalidatePath('/rentals');
        return { message: 'Rental deleted successfully' };
    } catch (error) {
        return renderError(error);
    }
}

export const fetchRentals = async () => {
    const user = await getAuthUser();
    const rentals = await db.property.findMany({
        where: {
            profileId: user.id,
        },
        select: {
            id: true,
            name: true,
            price: true,
        },
    });

    const rentalsWithBookingSums = await Promise.all(
        rentals.map(async (rental) => {
            const totalNightsSum = await db.booking.aggregate({
                where: {
                    propertyId: rental.id,
                    paymentStatus:true
                },
                _sum: {
                    totalNights: true,
                },
            });

            const orderTotalSum = await db.booking.aggregate({
                where: {
                    propertyId: rental.id,
                },
                _sum: {
                    orderTotal: true,
                },
            });

            return {
                ...rental,
                totalNightsSum: totalNightsSum._sum.totalNights,
                orderTotalSum: orderTotalSum._sum.orderTotal,
            };
        })
    );
    return rentalsWithBookingSums;
}

export const fetchRentalDetails = async (propertyId: string) => {
    const user = await getAuthUser();

    return db.property.findUnique({
        where: {
            id: propertyId,
            profileId: user.id,
        },
    });
};

export const updatePropertyAction = async (prevState: { message:string | null },formData:FormData):Promise<{message:string}> => {
    const user = await getAuthUser();
    const propertyId = formData.get('id') as string;
    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(propertySchema, rawData);
        await db.property.update({
            where: {
                id: propertyId,
                profileId: user.id,
            },
            data: {
                ...validatedFields,
            },
        });

        revalidatePath(`/rentals/${propertyId}/edit`);
        return { message: 'Update Successful' };
    }
    catch (error){
        return renderError(error);
    }

    return { message: 'update property action' };
};

export const updatePropertyImageAction = async (prevState: { message:string | null },formData:FormData): Promise<{ message: string }> => {
    const user = await getAuthUser();
    const propertyId = formData.get('id') as string;
    try {
        const image = formData.get('image') as File;
        const validatedFields = validateWithZodSchema(imageSchema, { image });
        const fullPath = await uploadImage(validatedFields.image);
        await db.property.update({
            where: {
                id: propertyId,
                profileId: user.id,
            },
            data: {
                image: fullPath,
            },
        });
        revalidatePath(`/rentals/${propertyId}/edit`);
        return { message: 'Property Image Updated Successful' };
    }
    catch (error){
        return renderError(error);
    }
};

export const fetchReservations = async () => {
    const user = await getAuthUser();

    const reservations = await db.booking.findMany({
        // where: {
        //     property: {
        //         profileId: user.id,
        //     },
        // },
        where:{
            paymentStatus:true
        },

        orderBy: {
            createdAt: 'desc', // or 'asc' for ascending order
        },

        include: {
            property: {
                select: {
                    id: true,
                    profileId:true,
                    name: true,
                    price: true,
                    country: true,
                },
            }, // include property details in the result
        },
    });
    console.log("Reservations Found = "+ reservations.length + " UserId= "+user.id);

    const finalReservationList = reservations.filter(x=>x.property.profileId === user.id)
    console.log("Final Reservations Found = "+ finalReservationList.length + " UserId= "+user.id);
    //console.log(finalReservationList);
    return finalReservationList;

};

const getAdminUser = async () => {
    const user = await getAuthUser();
    if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
    return user;
};
export const fetchStats = async () => {
    await getAdminUser();

    const usersCount = await db.profile.count();
    const propertiesCount = await db.property.count();
    const bookingsCount = await db.booking.count({
        where:{
            paymentStatus:true,
        },
    });

    return {
        usersCount,
        propertiesCount,
        bookingsCount,
    };
};
export const fetchChartsData = async() =>{
    await getAdminUser();
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    const sixMonthsAgo = date;
    const bookings = await db.booking.findMany({
        where: {
            createdAt: {
                gte: sixMonthsAgo,
            },
            paymentStatus:true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
    const bookingsPerMonth = bookings.reduce((total, current) => {
        const date = formatDate(current.createdAt, true);

        const existingEntry = total
            .find((entry) => entry.date === date);
        if (existingEntry) {
            existingEntry.count += 1;
        } else {
            total.push({ date, count: 1 });
        }
        return total;
    }, [] as Array<{ date: string; count: number }>);
    console.log(bookingsPerMonth);
    return bookingsPerMonth;
}

export const fetchReservationStats = async () =>{
    const user = await getAuthUser();
    const properties = await db.property.count({
        where:{
            profileId:user.id,
        },
    });
    const totals = await db.booking.aggregate({
        _sum:{
            orderTotal:true,
            totalNights:true
        },
        where:{
            property:{
                profileId:user.id
            },
            paymentStatus:true,
        },
    });
    return {
        properties,
        nights: totals._sum.totalNights || 0,
        amount: totals._sum.orderTotal || 0,
    };

}
