# Home Away Project using Next.js

1. Create the pages in the app folder
2. Shadcn UI makes us write less CSS
3. Every Shadcn UI component has baked in accessibility

 - Create the Next.js app for the project
 - Set up the pages in app router
 - Install the shadcn components that are needed
 - Set up the Navbar and define the various components of Navbar like Logo, NavSearch, DarkMode, LinksDropdown,UserIcon and SignOutLink
 - Import the shadcn components inside the Navbar including Logo and NavSearch
 - Install the React icons library
 - Import the icons inside the Navbar
 - Copy the CSS for the custom theme we will use and set it up in globals.css
 - Set up the Navbar in layout.tsx

# asChild property in Radix UI
- in some component libraries like Radix UI, 
the asChild prop is used to pass the rendered component as a child of another component,
essentially allowing you to wrap an element with another component while retaining its original semantics and properties.

```js
import { Button } from '@radix-ui/react-button';

function App() {
  return (
    <Button asChild>
      <a href="https://example.com">Click me</a>
    </Button>
  );
}

export default App;

```

- In this example, the Button component from Radix UI will render an <a> (anchor) element with all the button styles and behaviors. 
- The asChild property allows you to wrap any element with the Button component, so you can use the anchor tag as a button and apply button-specific styles and behaviors to it.

### Dropdown Menu in Radix UI
- It has the following basic structure
```js
//Here the trigger is usually some button or Link
//Dropdown menu content is actually the list of items in the dropdown
<DropdownMenu>
    <DropdownMenuTrigger></DropdownMenuTrigger>
    <DropdownMenuContent></DropdownMenuContent>
</DropdownMenu>
```
- In Tailwind if we want to add custom values of pixels we can do it like this: max-w-[100px]

# Clerk Authentication
 - Clerk is a user authentication and management service that integrates seamlessly with various front-end frameworks, including Next.js.
 - It offers a set of tools and components to manage user sign-ups, log-ins, profile management, and access control. 
 - Handles user sign-ups, log-ins, and multifactor authentication (MFA).
 - Offers user profile management, including updating user information and managing passwords.
 -  Implements **role-based access control (RBAC)** to manage user permissions and access levels.
 - Clerk provides customizable components like SignIn, SignUp, UserButton, and UserProfile to make it easier to integrate authentication into your application. 
 - To integrate Clerk with Next.js use the following steps:
 1. Set up an account with Clerk
 2. Get the api keys from clerk
 3. Setup up .env.local file and paste the api keys inside it
 4. Anything starting with NEXT_PUBLIC is accessible to the browser, while rest of it is not.
 5. Setup middleware.ts file to set up protected routes with clerk
```js
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
    '/bookings(.*)',
    '/checkout(.*)',
    '/favorites(.*)',
    '/profile(.*)',
    '/rentals(.*)',
    '/reviews(.*)'
]);

export default clerkMiddleware(async(auth, req) => {
    if (isProtectedRoute(req))  await auth.protect();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```
- In the above, note that it has a route matcher and a list of protected routes.
- If the user is not logged in and he tries to go to a protected page, he is redirected to a clerk sign-in page
- In Layout.tsx we need to wrap everything inside Clerk Provider
- We need to use Clerk control components to manage authenticated and unauthenticated content.
- Add components like SignIn, SignUp, UserButton, and UserProfile to handle user authentication and management.

# Creating Custom Form Components
- Rather than having one form with multiple inputs and submit buttons, we can separate out the form component into reusable form control components
- We can have a FormInput,SubmitButton and FormContainer components
- Reusable Form Input component
```jsx
import { Label } from '../ui/label';
import { Input } from '../ui/input';

type FormInputProps = {
  name: string;
  type: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
};

function FormInput({
  label,
  name,
  type,
  defaultValue,
  placeholder,
}: FormInputProps) {
  return (
    <div className='mb-2'>
      <Label htmlFor={name} className='capitalize'>
        {label || name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export default FormInput;
```
- Reusable submit button (here we make use of useFormStatus hook to know if the form is submitting or it has already submitted)
```js
'use client';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

type SubmitButtonProps = {
  className?: string;
  text?: string;
};

export function SubmitButton({
  className = '',
  text = 'submit',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type='submit'
      disabled={pending}
      className={`capitalize ${className}`}
      size='lg'
    >
      {pending ? (
        <>
          <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
          Please wait...
        </>
      ) : (
        text
      )}
    </Button>
  );
}
```
- Reusable Form Container component(Here we use useActionState hook to determine if the form was submitted successfully or not or there was some error.)
````js
'use client';

import { useActionState } from 'react';
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { actionFunction } from '@/utils/types';

const initialState = {
    message: '',
};

function FormContainer({action, children}: {action: actionFunction,children: React.ReactNode }) {
    const [state, formAction] = useActionState(action,initialState);
    const { toast } = useToast();
    useEffect(() => {
        if (state.message) {
            toast({ description: state.message, duration:2000  });
        }
    }, [state]);
    return <form action={formAction}>{children}</form>;
}
export default FormContainer;
````

# Zod Library
- Zod is a JavaScript library for building schemas and validating data, providing type safety and error handling.
- We can define a zod schema like this
```js
import * as z from 'zod';
import { ZodSchema } from 'zod';

export const profileSchema = z.object({
  // firstName: z.string().max(5, { message: 'max length is 5' }),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
});
```
- Then, we can use Zod validation like this:
````js
'use server';

import { profileSchema } from './schemas';

export const createProfileAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = profileSchema.parse(rawData);
    console.log(validatedFields);
    return { message: 'Profile Created' };
  } catch (error) {
    console.log(error);
    return { message: 'there was an error...' };
  }
};
````
# Prisma setup
- Prisma is an open-source, next-generation Object-Relational Mapping (ORM) tool designed to simplify database interactions in Node.js and TypeScript applications
- Prisma consists of:
1. Prisma Client: An auto-generated, type-safe query builder that allows you to interact with your database using JavaScript or TypeScript.
2. Prisma Migrate: A migration system that helps you manage and version-control your database schema.
3. Prisma Studio: A graphical user interface (GUI) for viewing and editing data in your database
4. Data Modeling: Prisma uses a Schema Definition Language (SDL) to define your data models, making it easy to work with relational databases and MongoDB

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[]
}

```
- In the above, the datasource block defines the db connection
- generator block generates the prisma client
- model block defines the application's data models.

# Fetch Profile using Prisma ORM 
```js
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
```
## Projection using Prisma

```js
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
```

## Using Zod Schema Safe Parse Method

```js
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
```
- In the above code, we use generics to pass in a schema and safe Parse it, get the errors back and display it back to the user

## Generic Image Input

```js
import React from 'react'
import {Label} from "../ui/label";
import {Input} from "../ui/input";

function ImageInput() {
    const name = 'image';
    return (
        <div className='mb-2'>
            <Label htmlFor={name} className='capitalize'>Image</Label>
            <Input id={name} name={name} type='file' required accept='image/*' className='max-w-xs' />
        </div>
    )
}

export default ImageInput

```
- To upload a file we need to create a Image Input Container like this:
```js
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import FormContainer from './FormContainer';
import ImageInput from './ImageInput';
import { SubmitButton } from './Buttons';
import { type actionFunction } from '@/utils/types';
import { LuUser2 } from 'react-icons/lu';

type ImageInputContainerProps = {
    image: string;
    name: string;
    action: actionFunction;
    text: string;
    children?: React.ReactNode;
};


function ImageInputContainer(props: ImageInputContainerProps) {
    const {image,name, action,text} = props;
    const [isUpdateFormVisible,setUpdateFormVisible] = useState<boolean>(false);
    const userIcon = (
        <LuUser2 className='w-24 h-24 bg-primary rounded-md text-white mb-4' />
    );
    return (
        <div>
            {image ? (
                <Image src={image}
                       alt={name}
                       className='rounded-md object-cover mb-4 w-24 h-24'
                       width={100}
                       height={100}
                />
            ):(
                userIcon
            )}
            <Button
                variant='outline'
                size='sm'
                onClick={() => setUpdateFormVisible((prev) => !prev)}
            >
                {text}
            </Button>
            {isUpdateFormVisible && (
                <div className='max-w-lg mt-4'>
                    <FormContainer action={action}>
                        {props.children}
                        <ImageInput />
                        <SubmitButton size='sm' />
                    </FormContainer>
                </div>
            )}
        </div>
    )
}

export default ImageInputContainer

```
- How to validate an image input
- We need to do checks like check the file size, check if the file types are supported like this

```js
function  validateFile(){
    const maxUploadSize = 1024 * 1024;
    const acceptedFileTypes = ['image/'];
    return z.instanceof(File).refine((file)=>{
        return !file || file.size <= maxUploadSize;
    },'File size must be less than 1 MB').refine((file)=>{
        return !file || acceptedFileTypes.some((type)=> file.type.startsWith(type));
    },'File must be an image')
}
```
- In the above **refine** is a cool zod feature which takes 2 arguments one a function to validate and second one the error message to be shown if the function returns false
-  As you can see the first refine function checks for file size and returns true or false on the basis of it.

# Supabase Buckets to upload the file
- We make use of supabase buckets to upload the file
```js
//Code to upload the image to supabase bucket
const bucket = 'temp-home-away'

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_KEY as string;
const supabase = createClient(url,key);

export const uploadImage = async (image: File) => {
    const timestamp  = Date.now();
    const newName = `${timestamp}-${image.name}`;
    const {data} = await supabase.storage
        .from(bucket)
        .upload(newName, image,{cacheControl:'3600'});
    if(!data) throw new Error('Image upload failed');
    return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
}

//Code to update the profile image which calls the upload image and also updates prisma with the image public URL
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
```
# Create a Property
- First we need to update the schema in prisma and run npx prisma db push to create the collection in MongoDB
- Then we need to create a form to add the property
- We also need to add a schema in Zod to validate the above create property form
