const ArtistCardSkeleton = () => (
  <div className="w-full max-w-[220px] bg-white rounded-2xl shadow-md p-6 animate-pulse">
    <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4" />
    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
  </div>
);

export default ArtistCardSkeleton;
