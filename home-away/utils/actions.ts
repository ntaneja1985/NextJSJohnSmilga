'use server'
import {imageSchema, profileSchema,propertySchema, validateWithZodSchema} from "@/utils/schemas";
import db from './db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {uploadImage} from "@/utils/supabase";

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
    console.log("Found number of properties = "+properties.length);
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
        }
    })
}