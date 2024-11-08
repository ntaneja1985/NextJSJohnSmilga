import ChartContainer from '@/components/admin/ChartContainer';
import StatsContainer from '@/components/admin/StatsContainer';
import {
    ChartsLoadingContainer,
    StatsLoadingContainer,
} from '@/components/admin/Loading';
import { Suspense } from 'react';
async function AdminPage() {
    return (
        <>
            <Suspense fallback={<StatsLoadingContainer/>}>
                <StatsContainer/>
            </Suspense>
            <Suspense fallback={<ChartsLoadingContainer/>}>
                <ChartContainer/>
            </Suspense>
        </>

    )
}

export default AdminPage
