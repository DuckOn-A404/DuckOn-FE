const ChatTab = () => {
  return (
    <>
      <div className="bg-white rounded-xl p-4 h-[500px] overflow-y-auto shadow-sm space-y-3 text-sm">
        <p>
          <strong>블링크사랑</strong>: 와 이 무대 진짜 레전드다 ㅠㅠ
        </p>
        <p>
          <strong>제니최고</strong>: 제니 랩 파트 너무 좋아요!!
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          className="flex-1 px-3 py-2 border rounded-full text-sm"
        />
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-xs">
          전송
        </button>
      </div>
    </>
  );
};

export default ChatTab;
