import {fetchUsers} from "@/app/utils/actions";
import DeleteButton from "@/components/DeleteButton";

async function UsersList() {
    const users = await fetchUsers();
    return (
        <div className='max-w-lg'>
            {
                users.length ? (
                    <div>
                        {users.map((user) => (
                            <h4 key={user.id} className='capitalize text-lg flex justify-between items-center mb-2'>
                                {user.firstName} {user.lastName}
                                <DeleteButton id={user.id} />
                            </h4>
                        ))}
                    </div>
                ):(
                    <p>No users found...</p>
                )
            }
        </div>
    )
}

export default UsersList
