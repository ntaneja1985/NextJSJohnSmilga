import {saveUser} from "@/app/utils/actions";
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req:NextRequest) => {
    const {searchParams} = new URL(req.url);
    //console.log(req);
    //console.log(searchParams)
    console.log('Search Params = '+ searchParams.get('id'));
    console.log('Search Params using Next Request = '+ req.nextUrl.searchParams.get('id'))


    //const users = await fetchUsers();
    return NextResponse.redirect(new URL('/',req.url));
};

export const POST = async (req:NextRequest) => {
    const user = await req.json();
    console.log(user);
    const newUser = { ...user, id: Date.now().toString() };
    await saveUser(newUser);
    return NextResponse.redirect(new URL('/actions',req.url));
}