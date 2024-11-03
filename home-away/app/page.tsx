import {Button} from "@/components/ui/button";
import CategoriesList from '@/components/home/CategoriesList';
import PropertiesContainer from '@/components/home/PropertiesContainer';
import {Suspense} from "react";
import LoadingCards from "@/components/card/LoadingCards";

 async function HomePage({
                      searchParams,
                  }: {
    searchParams: { category?: string; search?: string };
}) {
    //const searchValue = (await searchParams)?.search;
    //const categoryValue = (await searchParams)?.search;
    //const searchParamsValue = await searchParams;
    //console.log("SearchParams =  "+ JSON.stringify(searchParamsValue));
     const searchParamValue = await searchParams;

    return (
        <section>
            <CategoriesList category = {searchParamValue.category} search={searchParamValue.search} />
            <Suspense fallback={<LoadingCards/>}>
                <PropertiesContainer category = {searchParamValue.category} search={searchParamValue.search}/>
            </Suspense>

        </section>
    )
}

export default HomePage
