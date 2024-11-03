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

# Fetch Properties based on Search Params
- We will create a properties list and within it display a property card component
- The property card will have other things inside it like an image of the property, price of the property and an ability to favorite the property
- So first we need to fetch the properties
- Properties will be fetched on the basis of category and search term so provided in the NavSearch component
- Code to fetch the properties will be the following:
```js
export const fetchProperties = async ({
  search = '',
  category,
}: {
  search?: string;
  category?: string;
}) => {
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
  });
  return properties;
};
```
# Integrating the Properties List in the Home page
- So in the homepage we will setup the following
1. List of categories (like caravan, cabin, cottage, warehouse etc.)
2. Empty List component
3. Properties List component
4. Container for the Properties List

- We will also setup search params in the homepage like this:
```js
import CategoriesList from '@/components/home/CategoriesList';
import PropertiesContainer from '@/components/home/PropertiesContainer';

function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  // console.log(searchParams);

  return (
    <section>
      <CategoriesList
        category={searchParams?.category}
        search={searchParams?.search}
      />
      <PropertiesContainer
        category={searchParams?.category}
        search={searchParams?.search}
      />
    </section>
  );
}
export default HomePage;
```
- The categories list is fixed and is retrieved from utils\categories.ts file
- We will set up the CSS of the categories to display the category as active when it is selected
- The Empty list is simple, if there are no properties found, we will display a message that No properties found
- Properties container is also simple, it will first fetch the properties
- If no properties are found, it will display the empty list or if there are properties, then it will pass them along to Properties List component
- Properties List will just iterate over and display a list of Property Card components.

# Property Card Component
- The Property card component will display a Property Card Props which are defined as follows:

```js
export type PropertyCardProps = {
    image: string;
    id: string;
    name: string;
    tagline: string;
    country: string;
    price: number;
};
```
- The property card component will have several components inside it
1. Property Rating component
2. Favorite Toggle Form component
3. Country and Flag Name component

- Property rating component will have 2 props: propertyId and inPage
- The inPage property means whether it is displayed in the property details page or list of properties.
- Based on this prop, we will toggle the display of this component accordingly.

## Usage of React Suspense in Homepage
- The properties list is rather long and may take time to fetch so we need to display fallback UI while the page is loading
- For this we need to use React Suspense on Homepage like this
```js
import CategoriesList from '@/components/home/CategoriesList';
import PropertiesContainer from '@/components/home/PropertiesContainer';
import LoadingCards from '@/components/card/LoadingCards';
import { Suspense } from 'react';
function HomePage({
                      searchParams,
                  }: {
    searchParams: { category?: string; search?: string };
}) {
    return (
        <section>
            <CategoriesList
                category={searchParams?.category}
                search={searchParams?.search}
            />
            <Suspense fallback={<LoadingCards />}>
                <PropertiesContainer
                    category={searchParams?.category}
                    search={searchParams?.search}
                />
            </Suspense>
        </section>
    );
}
export default HomePage;
```

# use Debounce in NavSearch Component
 - useDebounce is a custom hook in React that delays the updating of a value until a specified time has passed since it was last changed. 
 - This is especially useful for scenarios where you want to limit the rate of certain operations, such as API calls during search input typing, to improve performance and reduce unnecessary load.
 - Helps reduce the frequency of heavy operations like API requests, leading to better performance.
 - Improves user experience by preventing immediate reactions to fast, successive inputs.
```js
'use client';
import { Input } from '../ui/input';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';

function NavSearch() {
  const searchParams = useSearchParams();

  const pathname = usePathname();
  const { replace } = useRouter();
  const [search, setSearch] = useState(
    searchParams.get('search')?.toString() || ''
  );
  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  useEffect(() => {
    if (!searchParams.get('search')) {
      setSearch('');
    }
  }, [searchParams.get('search')]);
  return (
    <Input
      type='search'
      placeholder='find a property...'
      className='max-w-xs dark:bg-muted '
      onChange={(e) => {
        setSearch(e.target.value);
        handleSearch(e.target.value);
      }}
      value={search}
    />
  );
}
export default NavSearch;
```
- Above you can see we install useDebounce library
- Then we use the useDebouncedCallback to execute the search based on the search term using a delay
- We also make use of useEffect to trigger a search state change and re-render the component if the search term has changed.
- But notice in the DebouncedCallback we are introducing a delay of 300 milliseconds.

# Setting up Favorites
- A user can have many favorites and a property can also be a favorite of many people.
- So we need to set up a favorite table, where we will keep track of this
- We will add a link to profile table and property table.
- This link will be through profileId(which is clerkId) to the Profile table
- Link will also be with Property Table(through propertyId) in the property table.

```prisma

model Profile {
favorites    Favorite[]
}

model Property {
favorites    Favorite[]
}

model Favorite {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile   Profile  @relation(fields: [profileId], references: [clerkId], onDelete: Cascade)
  profileId String

  property   Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  propertyId String

}
```
- If the user is not logged and goes to the homepage and clicks on the Favorite button, he is shown a modal popup
- This SignIn modal popup comes from clerk component
```js
import { SignInButton } from '@clerk/nextjs';
import { FaRegHeart, FaHeart } from 'react-icons/fa';

export const CardSignInButton = () => {
  return (
    <SignInButton mode='modal'>
      <Button
        type='button'
        size='icon'
        variant='outline'
        className='p-2 cursor-pointer'
        asChild
      >
        <FaRegHeart />
      </Button>
    </SignInButton>
  );
};
```
- We also need to know if the particular property has already been favorited by the user or not
```js
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
export const toggleFavoriteAction = async () => {
  return { message: 'toggle favorite' };
};
```
- So the code for Favorite Toggle button is as follows:
```js
import { auth } from '@clerk/nextjs/server';
import { CardSignInButton } from '../form/Buttons';
import { fetchFavoriteId } from '@/utils/actions';
import FavoriteToggleForm from './FavoriteToggleForm';
async function FavoriteToggleButton({ propertyId }: { propertyId: string }) {
  const { userId } = auth();
  if (!userId) return <CardSignInButton />;
  const favoriteId = await fetchFavoriteId({ propertyId });

  return <FavoriteToggleForm favoriteId={favoriteId} propertyId={propertyId} />;
}
export default FavoriteToggleButton;
```

- When the user clicks on Favorite button, we need to go and check if the property has been favorited or not, 
- If yes, we remove it from list of favorites and if not, we add it to the favorite table.
- So we need to have a Card Submit Button
```js
export const CardSubmitButton = ({ isFavorite }: { isFavorite: boolean }) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type='submit'
      size='icon'
      variant='outline'
      className=' p-2 cursor-pointer'
    >
      {pending ? (
        <ReloadIcon className=' animate-spin' />
      ) : isFavorite ? (
        <FaHeart />
      ) : (
        <FaRegHeart />
      )}
    </Button>
  );
};
```

- Finally, we need to put all this logic together in a FavoriteToggleForm like this

```js
'use client';

import { usePathname } from 'next/navigation';
import FormContainer from '../form/FormContainer';
import { toggleFavoriteAction } from '@/utils/actions';
import { CardSubmitButton } from '../form/Buttons';

type FavoriteToggleFormProps = {
  propertyId: string;
  favoriteId: string | null;
};

function FavoriteToggleForm({
  propertyId,
  favoriteId,
}: FavoriteToggleFormProps) {
  const pathname = usePathname();
  const toggleAction = toggleFavoriteAction.bind(null, {
    propertyId,
    favoriteId,
    pathname,
  });
  return (
    <FormContainer action={toggleAction}>
      <CardSubmitButton isFavorite={favoriteId ? true : false} />
    </FormContainer>
  );
}
export default FavoriteToggleForm;
```

- The code for toggleFavoriteAction will be:
```js
export const toggleFavoriteAction = async (prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;
  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
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
  } catch (error) {
    return renderError(error);
  }
};
```

# Favorites Page
- So in a favorites page, we need to fetch the list of favorites for a user
- We need to go to the favorite table, get the propertyIds for the logged in user and then use them to fetch the property details
- In prisma we can do a projection over the related entity like this
```prisma
const favorites = await db.favorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      **property: {**
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
```
- So the fetch favorites function will look like this
```js
export const fetchFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
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
```
# Favorites page
- Inside the app folder, go to favorites folder and create a loading.tsx file.
- This loading UI will display when the page is loading
- Favorites page code is simple:
```js
import EmptyList from '@/components/home/EmptyList';
import PropertiesList from '@/components/home/PropertiesList';
import { fetchFavorites } from '@/utils/actions';

async function FavoritesPage() {
  const favorites = await fetchFavorites();

  if (favorites.length === 0) {
    return <EmptyList />;
  }

  return <PropertiesList properties={favorites} />;
}
export default FavoritesPage;
```


# Property Details Page
- First step is to fetch the property details when the user navigates to a particular property
- This is done using prisma in actions.ts like this:
```js
export const fetchPropertyDetails = (id: string) => {
  return db.property.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
    },
  });
};
```

- Next step is to identify the components on the page
- We have the following components on the Property Details Page
1. Breadcrumb component
2. Share button with Share to Twitter, LinkedIn etc.
3. Image Container
4. Calendar
5. Property Details like beds,baths,guests etc.
6. UserInfo like who is hosting this property
7. Description of the Property
8. Amenities Available
9. Map of the Property

- For Breadcrumbs component we have the following code:
```js
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function BreadCrumbs({ name }: { name: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/'>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
export default BreadCrumbs;
```

- For the Share button we use React Share Library which already has built in components to integrate LinkedIn, Twitter etc.
```shell
npm i react-share
```

```js
'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '../ui/button';
import { LuShare2 } from 'react-icons/lu';

import {
  TwitterShareButton,
  EmailShareButton,
  LinkedinShareButton,
  TwitterIcon,
  EmailIcon,
  LinkedinIcon,
} from 'react-share';

function ShareButton({
  propertyId,
  name,
}: {
  propertyId: string;
  name: string;
}) {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL;
  const shareLink = `${url}/properties/${propertyId}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='p-2'>
          <LuShare2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='end'
        sideOffset={10}
        className='flex items-center gap-x-2 justify-center w-full'
      >
        <TwitterShareButton url={shareLink} title={name}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LinkedinShareButton url={shareLink} title={name}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <EmailShareButton url={shareLink} subject={name}>
          <EmailIcon size={32} round />
        </EmailShareButton>
      </PopoverContent>
    </Popover>
  );
}
export default ShareButton;
```
- Next we have the Image Container which is just a NextJS Image component
- Next we have the Calendar component
- We use the Calendar Shadcn component here
```js
'use client';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

export default function App() {
  const currentDate = new Date();
  const defaultSelected: DateRange = {
    from: undefined,
    to: undefined,
  };
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);

  return (
    <Calendar
      id='test'
      mode='range'
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
    />
  );
}
```

- Next we have the Property Details component
````js
import { formatQuantity } from '@/utils/format';

type PropertyDetailsProps = {
  details: {
    bedrooms: number;
    baths: number;
    guests: number;
    beds: number;
  };
};

function PropertyDetails({
  details: { bedrooms, baths, guests, beds },
}: PropertyDetailsProps) {
  return (
    <p className='text-md font-light '>
      <span>{formatQuantity(bedrooms, 'bedroom')} &middot; </span>
      <span>{formatQuantity(baths, 'bath')} &middot; </span>
      <span>{formatQuantity(guests, 'guest')} &middot; </span>
      <span>{formatQuantity(beds, 'bed')}</span>
    </p>
  );
}
export default PropertyDetails;
````
- Next we have the User Info component
```js
import Image from 'next/image';

type UserInfoProps = {
  profile: {
    profileImage: string;
    firstName: string;
  };
};

function UserInfo({ profile: { profileImage, firstName } }: UserInfoProps) {
  return (
    <article className='grid grid-cols-[auto,1fr] gap-4 mt-4'>
      <Image
        src={profileImage}
        alt={firstName}
        width={50}
        height={50}
        className='rounded-md w-12 h-12 object-cover'
      />
      <div>
        <p>
          Hosted by
          <span className='font-bold'> {firstName}</span>
        </p>
        <p className='text-muted-foreground font-light'>
          Superhost &middot; 2 years hosting
        </p>
      </div>
    </article>
  );
}
export default UserInfo;
```

- Next we have the description component
```js
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Title from './Title';
const Description = ({ description }: { description: string }) => {
  const [isFullDescriptionShown, setIsFullDescriptionShown] = useState(false);
  const words = description.split(' ');
  const isLongDescription = words.length > 100;

  const toggleDescription = () => {
    setIsFullDescriptionShown(!isFullDescriptionShown);
  };

  const displayedDescription =
    isLongDescription && !isFullDescriptionShown
      ? words.slice(0, 100).join(' ') + '...'
      : description;

  return (
    <article className='mt-4'>
      <Title text='Description' />
      <p className='text-muted-foreground font-light leading-loose'>
        {displayedDescription}
      </p>
      {isLongDescription && (
        <Button variant='link' className='pl-0' onClick={toggleDescription}>
          {isFullDescriptionShown ? 'Show less' : 'Show more'}
        </Button>
      )}
    </article>
  );
};

export default Description;
```

- Then we have Amenities component
```js
import { Amenity } from '@/utils/amenities';
import { LuFolderCheck } from 'react-icons/lu';
import Title from './Title';

function Amenities({ amenities }: { amenities: string }) {
  const amenitiesList: Amenity[] = JSON.parse(amenities as string);
  const noAmenities = amenitiesList.every((amenity) => !amenity.selected);

  if (noAmenities) {
    return null;
  }
  return (
    <div className='mt-4'>
      <Title text='What this place offers' />
      <div className='grid md:grid-cols-2 gap-x-4'>
        {amenitiesList.map((amenity) => {
          if (!amenity.selected) {
            return null;
          }
          return (
            <div key={amenity.name} className='flex items-center gap-x-4 mb-2 '>
              <LuFolderCheck className='h-6 w-6 text-primary' />
              <span className='font-light text-sm capitalize'>
                {amenity.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Amenities;
```
- Next we have the Property Map component

## Property Map component utilizes the React Leaflet library
 - React Leaflet is a library that provides React components for Leaflet, a popular open-source JavaScript library for interactive maps
 - Integration with React: React Leaflet leverages Leaflet to abstract its layers as React components, making it easy to integrate maps into your React app
 - Customizable Components: You can use various React components to add different map features, such as markers, popups, and tile layers
 - OpenStreetMap Integration: React Leaflet works well with OpenStreetMap, providing a great base map for your applications

```js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const position = [51.505, -0.09];

function Map() {
  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;

```
### Lazy Loading of component especially in context of Property Map

- Lazy Loading: Components wrapped with dynamic are lazy loaded. This means that the component code is not loaded until it is needed. 
- For example, if you have a component that is only visible when a user clicks a button, you could use dynamic to ensure that the code for that component is not loaded until the button is clicked.
- Server Side Rendering (SSR) Control: By default, Next.js pre-renders every page.
- This means that it generates HTML for each page in advance, instead of doing it all on the client-side.
- However, with dynamic, you can control this behavior. You can choose to disable SSR for specific modules, which can be useful for modules that have client-side dependencies.
```js
import dynamic from 'next/dynamic';
import {Skeleton} from "@/components/ui/skeleton";
    const DynamicMap = dynamic(
    () => import('@/components/properties/PropertyMap'),
    {
        ssr: false,
        loading: () => <Skeleton className='h-[400px] w-full' />,
    }
);
    //use it directly like this
<DynamicMap countryCode={property.country}/>
    
```

# Deploying Projects on Vercel

- Since we are using Prisma, we need to apply the following code to our build command:

```shell
"scripts": {
    "dev": "next dev --turbopack",
    "build": "npx prisma generate && next build",
    "start": "next start",
    "lint": "next lint"
  },
```
- Provide link to Git Repository
- Provide environment variables inside vercel
- That's it, we can deploy the app on vercel











