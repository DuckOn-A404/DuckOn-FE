type SignupPageProps = {
  message: string;
};

const SignupPage = ({ message }: SignupPageProps) => {
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default SignupPage;