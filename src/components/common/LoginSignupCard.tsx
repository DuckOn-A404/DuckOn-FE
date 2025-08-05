type LoginSignupCardProps = {
  children: React.ReactNode;
};

const LoginSignupCard = ({ children }: LoginSignupCardProps) => {
  return (
    <div className="w-full max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-start">
      {children}
    </div>
  );
};

export default LoginSignupCard;
