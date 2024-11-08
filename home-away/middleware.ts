import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {redirect} from "next/navigation";
import {NextResponse} from "next/server";

// const isProtectedRoute = createRouteMatcher([
//     '/bookings(.*)',
//     '/checkout(.*)',
//     '/favorites(.*)',
//     '/profile(.*)',
//     '/rentals(.*)',
//     '/reviews(.*)'
// ]);
const isPublicRoute = createRouteMatcher([
    '/',
    '/properties(.*)'
])

const isAdminRoute = createRouteMatcher([
    '/admin(.*)'
])

export default clerkMiddleware(async(auth, req) => {
    const userId = (await auth()).userId;
    const isAdminUser = userId === process.env.ADMIN_USER_ID;
    if(isAdminRoute(req) && !isAdminUser) {
        return NextResponse.redirect(new URL('/',req.url))
    }
    if (!isPublicRoute(req))  await auth.protect();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};