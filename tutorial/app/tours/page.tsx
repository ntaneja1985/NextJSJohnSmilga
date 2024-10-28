import axios from "axios";
import Link from "next/link";

const url = 'https://www.course-api.com/react-tours-project';
type Tour = {
    id: string;
    name: string;
    info:string;
    image: string;
    price: string;
}

const fetchTours = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await axios.get(url);
    const tours: Tour[] = response.data;
    return tours;
}

async function ToursPage() {
    // const response = await axios(url);
    // const data: Tour[] = await response.data;
    // console.log(data);
    const data = await fetchTours();
    return (
        <section>
            <h1 className='text-3xl mb-4'>Tours</h1>

            {data.map((tour) => {
            return   ( <Link className='hover"text-blue-500' key={tour.id} href={`/tours/${tour.id}`}>
                 <h2 >{tour.name}</h2>
                </Link>)
            })}
        </section>
    )
}

export default ToursPage
