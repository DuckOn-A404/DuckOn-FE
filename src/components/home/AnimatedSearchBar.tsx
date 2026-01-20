import {useState, useEffect} from "react";
import {Search} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useNavigate} from "react-router-dom";

interface AnimatedSearchBarProps {
  onSearch?: (query: string) => void;
}

const AnimatedSearchBar = ({onSearch}: AnimatedSearchBarProps) => {
  const placeholders = [
    "제니 MMA",
    "지디 home sweet home",
    "알파드라이브원 레전드 모음",
  ];

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색 페이지로 이동
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);

      // 콜백이 있으면 실행
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 md:py-16 px-4">
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6, ease: "easeOut"}}
        className="text-center mb-6"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
          어떤 영상을 함께 보고 싶으신가요?
        </h1>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6, delay: 0.2, ease: "easeOut"}}
        className="relative"
      >
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 md:py-6 text-lg md:text-xl rounded-full bg-white/95 backdrop-blur-sm border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
              placeholder=""
            />
            <div className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
              <AnimatePresence mode="wait">
                {!searchQuery && (
                  <motion.span
                    key={currentPlaceholderIndex}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    transition={{duration: 0.5}}
                    className="text-lg md:text-xl text-gray-400"
                  >
                    {placeholders[currentPlaceholderIndex]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <button
            type="submit"
            className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Search className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default AnimatedSearchBar;
