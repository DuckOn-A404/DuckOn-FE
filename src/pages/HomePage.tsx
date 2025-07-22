type AppProps = {
  message: string;
};

const App = ({ message }: AppProps) => {
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default App;
