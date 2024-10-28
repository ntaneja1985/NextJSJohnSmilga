# NextJS Course by John Smilga

- Most popular React Framework for building full stack react applications
- We have server components and server actions in Next.js
- To create nextJS app we have this command:
```shell
npx create-next-app@latest appName
```
# Homepage
- page.tsx in the root of app folder
- represents root of our application '/' local domain or production domain
- react component (server component)

# Create Pages in Next.js
- in the app folder create a folder with the page.js file
  1. about/page.js
  2. contact/page.js
- can have .js .jsx .tsx extension
- Now we can directly navigate to localhost:3000/about or localhost:3000/contact
- No need to set up React Router

# Link Component
- navigate around the project
- import Link from 'next/link' home page

```js
import Link from 'next/link';
const HomePage = () => {
  return (
    <div>
      <h1 className='text-7xl'>HomePage</h1>
      <Link href='/about' className='text-xl text-blue-500 inline-block mt-8'>
        about page
      </Link>
    </div>
  );
};
export default HomePage;
```

# Nested Routes
- app/info/contact/page.tsx
- if no page.tsx in a segment will result in 404
- go to app folder, create info folder, create contact folder and then create page.tsx

# CSS and Tailwind
- If we want to use vanilla css, then we can use it in globals.css
- For rest of it use Tailwind

# Tailwind CSS
- Apply utility classes directly in html
- mx-auto places element in the center
- bg-green-500(for background color)
- px-6, py-6,mt-4,p-4(1rem)
- p-1-->padding:0.25rem
- pr-4 (padding-right:1rem)
- px-4(padding to top and bottom of 1rem)
- w-4(width:1rem)
- 1 rem = 16px
- w-1/2(width:50%)
- w-full(width:100%)
- hover:bg-sky-500
- w-16 md:w-32 lg:w-48 (medium screen(768px) width of 32 and large screen(1024px) width of 48rem)
- w-[100px] means a width of 100px [] brackets can help to define custom width.
# Layouts and Templates
## layout.tsx
- This page wraps other pages and layouts and helps us to share a layout
- This is similar to master-pages we have in ASP.NET MVC Applications
- This is a kind of component which is used in all the page
- pages changes but layout doesnt
- It wraps our entire application
- Layout is a component which wraps other pages and layouts. 
- Allow to share UI. 
- Even when the route changes, layout DOES NOT re-render.
- Can fetch data but can't pass it down to children.
- layout.tsx also has the children prop
- Inside the children prop we will have all of our pages
- the top-most layout is called the Root Layout. 
- This required layout is shared across all pages in an application. 
- Root layouts must contain html and body tags.
- any route segment can optionally define its own Layout. These layouts will be shared across all pages in that segment.
- layouts in a route are nested by default. Each parent layout wraps child layouts below it using the React children prop.
```js
import './globals.css'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
      <html lang="en">
      <body>
      <nav>hello there</nav>
      {children}
      </body>
      </html>
  )
}
```
## template.tsx
- Difference between layout.tsx and template.tsx is that layout.tsx never re-renders but template.tsx re-renders

# Fonts - Google Fonts
- Automatically self-host any Google Font. Fonts are included in the deployment and served from the same domain as your deployment. No requests are sent to Google by the browser.
- Below we can change the fonts easily by just importing them and providing them with their properties and use them
```js
import './globals.css';
import { Inter,Inconsolata,Roboto } from 'next/font/google';


const inter = Inter({ subsets: ['latin'] });
const inconsolata  = Inconsolata({subsets:['latin']});
const roboto = Roboto({subsets:['latin'],weight:['400']})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <nav>hello there</nav>
        {children}
      </body>
    </html>
  );
}

```

# Metadata
- Next.js has a Metadata API that can be used to define your application metadata (e.g. meta and link tags inside your HTML head element) for improved SEO and web shareability.
- To define static metadata, export a Metadata object from a layout.tsx or page.tsx file.

```js
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Project',
  description: 'A Next.js project with TypeScript and TailwindCSS.',
  keywords: 'Next.js, Typescript, TailwindCSS',
};
```

# Server Components VS Client Components
- BY DEFAULT, NEXT.JS USES SERVER COMPONENTS !!!!
- To use Client Components, you can add the React "use client" directive

## Benefits of server components :
- data fetching: Server Components allow you to move data fetching to the server, closer to your data source. This can improve performance by reducing time it takes to fetch data needed for rendering, and the amount of requests the client needs to make.
- security: Server Components allow you to keep sensitive data and logic on the server, such as tokens and API keys, without the risk of exposing them to the client.
- caching: By rendering on the server, the result can be cached and reused on subsequent requests and across users. This can improve performance and reduce cost by reducing the amount of rendering and data fetching done on each request.
- bundle size: Server Components allow you to keep large dependencies that previously would impact the client JavaScript bundle size on the server. This is beneficial for users with slower internet or less powerful devices, as the client does not have to download, parse and execute any JavaScript for Server Components.

## Initial Page Load and First Contentful Paint (FCP):
- On the server, we can generate HTML to allow users to view the page immediately, without waiting for the client to download, parse and execute the JavaScript needed to render the page. 
## Search Engine Optimization and Social Network Shareability
- The rendered HTML can be used by search engine bots to index your pages and social network bots to generate social card previews for your pages.
## Streaming
- Server Components allow you to split the rendering work into chunks and stream them to the client as they become ready. This allows the user to see parts of the page earlier without having to wait for the entire page to be rendered on the server.

# Benefits Client Components
- They can hold state
- Interactivity: Client Components can use state, effects, and event listeners, meaning they can provide immediate feedback to the user and update the UI.
- Browser APIs: Client Components have access to browser APIs, like geolocation or localStorage, allowing you to build UI for specific use cases.

### We may come across a scenario where we need both client and server components
- Consider a scenario where we have a page that display details about a product, and we have 'Add to Cart' Button and Quantity button
- Product Details are static in nature and can be fetched via Server component
- Add to Cart requires us to hold state about the number of items in state and also interactivity with the users
- So we need to use Client components and server components
- Solution is to create a server component and then load the static data about the product and then add the AddToCart component inside it.


# Data Fetching in Server components
- How did we use to do fetching of data in React?
- Create state, create useEffect and call the fetch API from useEffect and populate the state
- just add async and start using await 🚀🚀🚀
- the same for db
- Next.js extends the native Web fetch() API to allow each request on the server to set its own persistent caching semantics.
- Fetch is faster on server and since we return HTML it is better with SEO
```ts
import axios from "axios";

const url = 'https://www.course-api.com/react-tours-project';
type Tour = {
    id: string;
    name: string;
    info:string;
    image: string;
    price: string;
}

async function ToursPage() {
    const response = await axios(url);
    const data: Tour[] = await response.data;
    console.log(data);
    return (
        <section>
            <h1 className='text-3xl mb-4'>Tours</h1>

            {data.map((tour) => {
                return <h2 key={tour.id}>{tour.name}</h2>;
            })}
        </section>
    )
}

export default ToursPage

```
**Next.js is pretty big on caching stuff**

# Loading Component
- The special file loading.js helps you create meaningful Loading UI with React Suspense.
- With this convention, you can show an instant loading state from the server while the content of a route segment loads.
- The new content is automatically swapped in once rendering is complete.
- Create a file tours/loading.tsx
- It will work automatically and while we are fetching tours above, it will show loading.tsx
- Internally makes use of React Suspense feature.

```ts
'use client';
const loading = () => {
  return <span className='text-xl capitalize'>loading tours...</span>;
};
export default loading;
```

# Error Component
- The error.tsx file convention allows you to gracefully handle unexpected runtime errors in nested routes.

```ts
'use client';
const error = ({error}:{error:Error}) => {
  return <div>there was an error...</div>;
};
export default error;
```

# Nested Layouts
- create app/tours/layout.tsx
- UI will be applied to app/tours - segment
- don't forget about the "children"
- we can fetch data in the layout but... at the moment can't pass data down to children (pages) 

```ts
function ToursLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className='py-2 w-1/2 bg-slate-500 rounded mb-4'>
        <h1 className='text-3xl text-white text-center'>Nested Layout</h1>
      </header>
      {children}
    </div>
  );
}
export default ToursLayout;
```
- Once we add above code in tours folder, then list of tours will display within this layout as children prop

# Dynamic Routes
- app/tours/[id]/page.tsx
```ts
const page = ({ params }: { params: { id: string } }) => {
  console.log(params);

  return (
          <div>
                  <h1 className='text-4xl'>ID : {params.id}</h1>
  </div>
);
};
export default page;

//Usage
import Link from "next/link";
function HomePage() {
  return (
          <div>
                  <h1 className='text-7xl'>Home Page</h1>
  <Link href='/about' className='text-xl text-blue-500 inline-block mt-8'>
          about page
  </Link>
  </div>
)
}

export default HomePage

```

# Next.js Image Component
- The Next.js Image component extends the HTML  element with features for automatic image optimization
- Size Optimization: Automatically serve correctly sized images for each device, using modern image formats like WebP and AVIF.
- Visual Stability: Prevent layout shift automatically when images are loading.
- Faster Page Loads: Images are only loaded when they enter the viewport using native browser lazy loading, with optional blur-up placeholders.
- Asset Flexibility: On-demand image resizing, even for images stored on remote servers
- disable cache
- width and height
- priority property to prioritize the image for loading When true, the image will be considered high priority and preload.
- **prority property ensure the image is pre-loaded**
**We can do custom import in next.js using this code:**
```ts
import mapsImg from '@/images/maps.jpg'
```
# Remote Images
- To use a remote image, the src property should be a URL string.
- Since Next.js does not have access to remote files during the build process, you'll need to provide the width, height and optional blurDataURL props manually.
- The width and height attributes are used to infer the correct aspect ratio of image and avoid layout shift from the image loading in. The width and height do not determine the rendered size of the image file.

```ts
import Image from "next/image";
import mapsImg from '@/images/maps.jpg'
const url = 'https://www.course-api.com/images/tours/tour-1.jpeg';

const page = async ({ params }:{params:string}) => {
    const {id} = await params;

    return (
        <div>
            <h1 className='text-4xl'>ID : {id}</h1>
            <section className='flex gap-x-4 mt-4'>
                {/* local image */}
                <div>
                    <Image
                        src={mapsImg}
                        alt='maps'
                        width={192}
                        height={192}
                        className='w-48 h-48 object-cover rounded'
                    />
                    <h2>local image</h2>
                </div>
                <div>
                    <Image
                        src={url}
                        alt='tour'
                        width={192}
                        height={192}
                        priority
                        className='w-48 h-48 object-cover rounded'
                    />
                    <h2>remote image</h2>
                </div>
            </section>
        </div>
    );
};
export default page;

```

- However, remote images will not work by default. We need to add some configuration in next.config
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.course-api.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
```
- Everytime we add remote images, we need to add it to a list of supported URL Patterns
- To safely allow optimizing images, define a list of supported URL patterns in next.config.mjs. Be as specific as possible to prevent malicious usage.
- restart dev server
