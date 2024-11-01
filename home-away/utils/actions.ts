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
        console.log(user.id)
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
    console.log(profile);

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
        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(propertySchema, rawData);
    } catch (error) {
        return renderError(error);
    }
    redirect('/');
};