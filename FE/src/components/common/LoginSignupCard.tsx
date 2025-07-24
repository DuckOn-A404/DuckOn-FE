type LoginSignupCardProps = {
  children: React.ReactNode
};

const LoginSignupCard = ({ children }: LoginSignupCardProps) => {
  return (
    <div className="w-[500px] min-h-[700px] bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-start">
        {children}
    </div>
  );
};

export default LoginSignupCard;