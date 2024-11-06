'use client';

import { useProperty } from '@/utils/store';
import { Booking } from '@/utils/types';
import BookingCalendar from './BookingCalendar';
import BookingContainer from './BookingContainer';
import { useEffect } from 'react';

export type BookingWrapperProps = {
    propertyId: string;
    price: number;
    bookings: Booking[];
};

function BookingWrapper({propertyId,price,bookings}: BookingWrapperProps) {
    useEffect(() => {
        useProperty.setState({
            propertyId: propertyId,
            price: price,
            bookings: bookings
        });
    }, []);

    return (
        <>
        <BookingCalendar/>
            <BookingContainer/>
        </>
    )
}

export default BookingWrapper
