import axios from "axios";
import Link from "next/link";
import Image from "next/image";

const url = 'https://www.course-api.com/react-tours-project';
type Tour = {
    id: string;
    name: string;
    info:string;
    image: string;
    price: string;
}

const fetchTours = async () => {
    console.log('########')
    console.log('Fetching Tours!!!!!!')
    console.log('########')


    await new Promise((resolve) => setTimeout(resolve, 3000));
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
            <div className='grid md:grid-cols-2 gap-8'>
            {data.map((tour) => {
            return   ( <Link className='hover"text-blue-500' key={tour.id} href={`/tours/${tour.id}`}>
                <div className='relative h-48 mb-2'>
                <Image src={tour.image} alt={tour.name}  fill  sizes='(max-width:768px) 100vw' priority className='object-cover rounded' />
                </div>
                    <h2 >{tour.name}</h2>
                </Link>)
            })}
            </div>

        </section>
    )
}

export default ToursPage
