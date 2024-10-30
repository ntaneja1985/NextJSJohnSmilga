
//import {deleteUser} from "@/app/utils/actions";
import {removeUser} from "@/app/utils/actions";


function DeleteButton({id}:{id:string}  ) {
    const removeUserWithId = removeUser.bind(null, id);
    return (
        <form action={removeUserWithId}>
            <input type="hidden" name="name" value='test' />
            <button type="submit" className="bg-red-500 text-white text-xs rounded p-2">
                Delete
            </button>
        </form>
    )
}

export default DeleteButton
