type LoginPageProps = {
  message: string;
};

const LoginPage = ({ message }: LoginPageProps) => {
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default LoginPage;