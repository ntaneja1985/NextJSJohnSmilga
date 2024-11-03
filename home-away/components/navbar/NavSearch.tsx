'use client';
import { Input } from '../ui/input';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';

function NavSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();

    const [search,setSearch] = useState(searchParams.get('search')?.toString() || '');
    const handleSearch = useDebouncedCallback((value:string) => {
        //here if there is a category set in the query string we are not removing it we are just setting the search parameters
        debugger;
        const params = new URLSearchParams(searchParams);
        if(value){
            params.set('search',value);
        } else {
            params.delete('search');
        }
        //const newPath = `${pathname}?${params.toString()}`;
        const newPath = `/?${params.toString()}`
        console.log("New Path = " + newPath)
        replace(newPath);
    },500)

    useEffect(() => {
        if(!searchParams.get('search')){
            setSearch('');
        }
    }, [searchParams.get('search')]);
    return (
        <Input
            type='search'
            placeholder='find a property...'
            className='max-w-xs dark:bg-muted '
            value={search}
            onChange={(e) => {
                setSearch(e.target.value)
                handleSearch(e.target.value)
            }}
        />
    )
}

export default NavSearch
