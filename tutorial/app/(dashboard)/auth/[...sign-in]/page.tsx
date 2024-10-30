type tParams = Promise<{ test: string[] }>
const SignInPage = async ({ params }:{params:tParams}) => {
    debugger;
    const { test } = await params;
    console.log(test)

    return <div>SignIn1Page</div>;
};
export default SignInPage;