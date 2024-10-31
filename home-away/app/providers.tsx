'use client'


import React from "react";
import {ThemeProvider} from './theme-provider'
import theme from "tailwindcss/defaultTheme";
import {Toaster} from "@/components/ui/toaster";

function Providers({children}:{children:React.ReactNode} )
{
    return (
        <>
            <Toaster/>
            <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
            {children}
            </ThemeProvider>
        </>
    )
}

export default Providers
