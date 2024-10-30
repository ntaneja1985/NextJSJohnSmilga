'use client'
import {useActionState} from 'react'

import {createUserAction as createUser} from "@/app/utils/actions";
import {useFormStatus} from 'react-dom'

const SubmitBtn = () =>{
    const {pending} = useFormStatus();
    return (
        <button className={btnStyle} name='submit' type='submit' disabled={pending}>
            {pending ? 'submitting...' : 'submit'}
        </button>
    )
}

function Form() {
    const [message,formAction]= useActionState(createUser,null);
    return (
        <form action={formAction} className={formStyle}>
            {message}
            <h2 className='text-2xl capitalize mb-4'>create User</h2>
            <input className={inputStyle} name='firstName' type="text" defaultValue='peter' required />
            <input className={inputStyle} name='lastName' type="text" defaultValue='willy' required />
            <SubmitBtn/>
        </form>
    )
}

const formStyle = 'max-w-lg flex flex-col gap-y-4  shadow rounded p-8';
const inputStyle = 'border shadow rounded py-2 px-3 text-gray-700';
const btnStyle =
    'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded capitalize';


export default Form
