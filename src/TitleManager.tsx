// src/TitleManager.tsx
import {useEffect} from "react";
import {useLocation, matchPath} from "react-router-dom";

type TitleEntry =
    | {pattern: string; title: string}
    | {pattern: string; title: (params: Record<string, string>, search: string) => string};

const TITLE_DEFAULT = "DuckOn 홈";

const ROUTE_TITLES: TitleEntry[] = [
    {pattern: "/", title: "DuckOn 홈"},
    {pattern: "/artist-list", title: "아티스트 목록"},
    {pattern: "/room-list", title: "라이브 방 목록"},
    {pattern: "/signup", title: "회원가입"},
    {pattern: "/login", title: "로그인"},
    {pattern: "/mypage", title: "마이페이지"},
    {
        pattern: "/user/:userId",
        title: (p) => `사용자 ${p.userId} 프로필`,
    },
    {
        pattern: "/artist/:nameEn",
        title: (p) => `${decodeURIComponent(p.nameEn)} 홈`,
    },
    {
        pattern: "/live/:roomId",
        title: (p) => `라이브방 ${p.roomId}`,
    },
];

export default function TitleManager() {
    const loc = useLocation();

    useEffect(() => {
        let newTitle = TITLE_DEFAULT;

        for (const entry of ROUTE_TITLES) {
            const match = matchPath({path: entry.pattern, end: true}, loc.pathname);
            if (match) {
                newTitle =
                    typeof entry.title === "function"
                        ? entry.title((match.params as Record<string, string>) || {}, loc.search)
                        : entry.title;
                break;
            }
        }

        document.title = newTitle;
    }, [loc.pathname, loc.search]);

    return null;
}
