'use client'
import dynamic from 'next/dynamic';

import {Skeleton} from "@/components/ui/skeleton";
import {BookingWrapperProps} from "@/components/booking/BookingWrapper";

const DynamicBookingWrapper = dynamic(
    () => import('@/components/booking/BookingWrapper'),
    {
        ssr: false,
        loading: () => <Skeleton className='h-[200px] w-full' />,
    }
);
function LazyBookingWrapper({propertyId,price,bookings}: BookingWrapperProps) {
    return <DynamicBookingWrapper propertyId={propertyId} price={price} bookings={bookings}/>
}

export default LazyBookingWrapper
