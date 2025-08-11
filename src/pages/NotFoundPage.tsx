import React from "react";

const NotFoundPage = () => {
  return (
    <div style={styles.container}>
      <img
        src="https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/image/ChatGPT+Image+2025%EB%85%84+8%EC%9B%94+11%EC%9D%BC+%EC%98%A4%EC%A0%84+10_17_05.png"
        alt="404 Not Found"
        style={styles.image}
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#000", // 이미지 여백 방지
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // 화면 비율 유지하며 꽉 채우기
  },
};

export default NotFoundPage;
