'use client'

const error = ({error}:{error:Error}) => {
    return (
        <div>there was an error...{error.message}</div>
    )
}
export default error

