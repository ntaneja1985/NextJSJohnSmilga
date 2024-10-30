'use server'
import { readFile, writeFile } from 'fs/promises';
import {revalidatePath} from "next/cache";
//import {redirect} from "next/navigation";

type User = {
    id: string;
    firstName: string;
    lastName: string;
};


export const createUserAction = async(prevState:string | null,formData:FormData)=>{
    'use server'
    console.log(prevState);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const newUser: User = { firstName, lastName, id: Date.now().toString() };
    try {
        await saveUser(newUser);
        revalidatePath('/actions');
        return 'user created successfully...';
    }catch(err){
        console.error(err);
        return 'failed to create user...';
    }
    //redirect('/');
};

export const fetchUsers = async (): Promise<User[]> => {
    const result = await readFile('users.json', { encoding: 'utf8' });
    const users = result ? JSON.parse(result) : [];
    return users;
};
export const saveUser = async (user: User) => {
    const users = await fetchUsers();
    users.push(user);
    await writeFile('users.json', JSON.stringify(users));
};

export const deleteUser = async (formData:FormData) => {
    const id = formData.get('id') as string;
    const users = await fetchUsers();
    const newUsers = users.filter(u => u.id !== id);
    await writeFile('users.json', JSON.stringify(newUsers));
    revalidatePath('/actions');
    //return 'user deleted successfully...';
}

export const removeUser = async (id: string, formData: FormData) => {
    const name = formData.get('name') as string;
    console.log(name);

    const users = await fetchUsers();
    const updatedUsers = users.filter((user) => user.id !== id);
    await writeFile('users.json', JSON.stringify(updatedUsers));
    revalidatePath('/actions');
};