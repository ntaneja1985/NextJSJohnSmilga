const SignInPage = async ({ params }: { params: { 'sign-in': string[] } }) => {
    debugger;
    const test = await params;
    console.log(test)

    return <div>SignIn1Page</div>;
};
export default SignInPage;