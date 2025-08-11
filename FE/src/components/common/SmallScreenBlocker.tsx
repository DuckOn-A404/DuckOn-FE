import React from "react";

const SmallScreenBlocker: React.FC = () => {
  return (
    <div className="hidden max-[500px]:fixed max-[500px]:inset-0 max-[500px]:z-[9999] max-[500px]:flex max-[500px]:items-center max-[500px]:justify-center max-[500px]:bg-black">
      <img
        src="https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/image/D16B148A-75B7-4191-A5FE-4E2E28925729.jpg"
        alt="Small screen not supported"
        className="max-w-[90%] h-auto"
      />
    </div>
  );
};

export default SmallScreenBlocker;
