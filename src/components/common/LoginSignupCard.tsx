type LoginSignupCardProps = {
  message: string;
};

const LoginSignupCard = ({ message }: LoginSignupCardProps) => {
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default LoginSignupCard;