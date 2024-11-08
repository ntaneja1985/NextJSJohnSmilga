


import {fetchChartsData} from "@/utils/actions";
import Chart from "@/components/admin/Chart";
async function ChartContainer() {
    const bookings = await fetchChartsData();
    if(bookings.length === 0) {
        return null;
    }
    return (
        <Chart data={bookings} />
    )
}

export default ChartContainer
