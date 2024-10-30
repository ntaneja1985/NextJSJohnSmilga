import {NextRequest,NextResponse} from "next/server";
import {redirect} from "next/navigation";

export function middleware(request: Request) {
    //console.log(request);
    console.log('hello there')
    //return Response.json({ msg: 'hello there' });
    //return NextResponse.redirect(new URL('/',request.url))
}

export const config = {
    matcher: '/about',
};
// export const config = {
//     matcher: ['/about/:path*', '/tours/:path*'],
// }