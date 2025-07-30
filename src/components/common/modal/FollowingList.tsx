type FollowingListProps = {
  message: string;
};

const FollowingList = ({ message }: FollowingListProps) => {
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default FollowingList;