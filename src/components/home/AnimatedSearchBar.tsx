import {useState, useEffect, useRef} from "react";
import {Search, User} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useNavigate} from "react-router-dom";
import {useDebounce} from "../../hooks/useDebounce";
import {searchArtists} from "../../api/artistService";
import type {Artist} from "../../types/artist";

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
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 모바일 감지 (화면 크기 기반)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px 미만이면 모바일
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 연관 검색어 가져오기
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim().length < 1) {
        setSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }

      try {
        const results = await searchArtists(debouncedSearchQuery);
        setSuggestions(results.slice(0, 5));
        setIsDropdownOpen(results.length > 0);
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent, query?: string) => {
    if (e) e.preventDefault();
    const finalQuery = query || searchQuery;
    if (finalQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      if (onSearch) onSearch(finalQuery.trim());
      setIsDropdownOpen(false);
    }
  };

  const handleSuggestionClick = (artistName: string) => {
    setSearchQuery(artistName);
    handleSubmit(undefined, artistName);
  };

  return (
    <div className={`w-full mx-auto px-4 ${isMobile ? 'max-w-full py-6' : 'max-w-4xl py-12 md:py-16'}`}>
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6, ease: "easeOut"}}
        className="text-center mb-4 md:mb-6"
      >
        <h1 className={`font-bold text-gray-900 mb-2 ${
          isMobile 
            ? 'text-xl' 
            : 'text-3xl md:text-4xl lg:text-5xl'
        }`}>
          어떤 영상을 함께 보고 싶으신가요?
        </h1>
      </motion.div>

      <div className="relative" ref={dropdownRef}>
        <motion.form
          onSubmit={handleSubmit}
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: 0.2, ease: "easeOut"}}
          className="relative"
        >
          <div className="relative flex items-center gap-2 md:gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10 ${
                isMobile ? 'h-5 w-5' : 'h-6 w-6'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && suggestions.length > 0 && setIsDropdownOpen(true)}
                className={`w-full pr-4 md:pr-6 rounded-full bg-white/95 backdrop-blur-sm border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${
                  isMobile 
                    ? 'pl-12 py-3.5 text-base' 
                    : 'pl-16 py-5 md:py-6 text-lg md:text-xl'
                }`}
                placeholder=""
              />
              <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden ${
                isMobile ? 'left-12' : 'left-16'
              }`}>
                <AnimatePresence mode="wait">
                  {!searchQuery && (
                    <motion.span
                      key={currentPlaceholderIndex}
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -10}}
                      transition={{duration: 0.5}}
                      className={`text-gray-400 ${
                        isMobile ? 'text-base' : 'text-lg md:text-xl'
                      }`}
                    >
                      {placeholders[currentPlaceholderIndex]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <button
              type="submit"
              className={`flex-shrink-0 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center shadow-lg hover:shadow-xl ${
                isMobile 
                  ? 'w-12 h-12' 
                  : 'w-14 h-14 md:w-16 md:h-16'
              }`}
            >
              <Search className={`text-white ${
                isMobile ? 'h-5 w-5' : 'h-6 w-6 md:h-7 md:w-7'
              }`} />
            </button>
          </div>
        </motion.form>

        {/* 연관 검색어 드롭다운 */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -10}}
              className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
            >
              <ul className="py-2">
                {suggestions.map((artist) => (
                  <li
                    key={artist.artistId}
                    onClick={() => handleSuggestionClick(artist.nameKr || artist.nameEn)}
                    className={`hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors ${
                      isMobile ? 'px-4 py-2.5' : 'px-6 py-3'
                    }`}
                  >
                    <div className={`rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 ${
                      isMobile ? 'w-7 h-7' : 'w-8 h-8'
                    }`}>
                      {artist.imgUrl ? (
                        <img
                          src={artist.imgUrl}
                          alt={artist.nameKr}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className={`text-purple-600 ${
                          isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'
                        }`} />
                      )}
                    </div>
                    <span className={`text-gray-700 font-medium ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {artist.nameKr} <span className="text-gray-400 text-sm ml-1">({artist.nameEn})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedSearchBar;