/**
 * VideoCard 로딩 시 보여줄 스켈레톤 UI 컴포넌트
 */
const VideoCardSkeleton = () => {
  return (
    <div className="w-full max-w-sm animate-pulse">
      {/* 썸네일 스켈레톤 */}
      <div className="w-full aspect-[16/9] rounded-2xl bg-gray-200" />

      {/* 정보 영역 스켈레톤 */}
      <div className="w-full pt-3 flex items-start gap-3">
        {/* 프로필 이미지 스켈레톤 */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

        {/* 텍스트 스켈레톤 */}
        <div className="flex-1 space-y-2 mt-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
