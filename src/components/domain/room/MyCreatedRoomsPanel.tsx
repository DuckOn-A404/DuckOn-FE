import { useMemo, useState, useRef, useEffect } from "react";
import type { RoomHistory } from "../../../types/room";
import MyCreatedRooms from "./MyCreatedRooms";
import RangeCalendar from "../../common/RangeCalendar";
import UIText from "../../common/UIText";
import { useUiTranslate } from "../../../hooks/useUiTranslate";

type QuickRange = "all" | "7d" | "30d" | "thisYear";

type Props = {
  rooms: RoomHistory[];
  pageSize?: number;
  total?: number;
  loading?: boolean;
  onLoadMore?: () => void;
};

function startOfThisYear() {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1);
}
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const MyCreatedRoomsPanel = ({
  rooms,
  pageSize = 12,
  total,
  loading,
  onLoadMore,
}: Props) => {
  // 필터 상태
  const [quick, setQuick] = useState<QuickRange>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [artistId, setArtistId] = useState<number | "all">("all");
  const [, setVisible] = useState(pageSize);
  const [openCalendar, setOpenCalendar] = useState(false);

  const { t } = useUiTranslate();

  // 무한스크롤을 위한 ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // 아티스트 옵션
  const artistOptions = useMemo(() => {
    const map = new Map<number, string>();
    (rooms ?? []).forEach((r) => {
      const label = r.artistNameKr ?? r.artistNameEn ?? `#${r.artistId}`;
      if (!map.has(r.artistId)) map.set(r.artistId, label);
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "ko"),
    );
  }, [rooms]);

  const applyQuick = (q: QuickRange) => {
    setQuick(q);
    setVisible(pageSize);
    const now = new Date();
    if (q === "all") {
      setFrom("");
      setTo("");
      return;
    }
    if (q === "7d") {
      setFrom(addDays(now, -7).toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
      return;
    }
    if (q === "30d") {
      setFrom(addDays(now, -30).toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
      return;
    }
    if (q === "thisYear") {
      const s = startOfThisYear();
      setFrom(s.toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
    }
  };

  // 필터 적용
  const filtered = useMemo(() => {
    const fromDate = from ? new Date(from + "T00:00:00") : null;
    const toDate = to ? new Date(to + "T23:59:59.999") : null;
    return (rooms ?? [])
      .filter((r) => {
        if (!r?.createdAt) return false;
        const tDate = new Date(r.createdAt);
        if (Number.isNaN(tDate.getTime())) return false;
        if (fromDate && tDate < fromDate) return false;
        if (toDate && tDate > toDate) return false;
        if (artistId !== "all" && r.artistId !== artistId) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [rooms, from, to, artistId]);

  // 무한스크롤 모드(onLoadMore가 있을 때)는 서버에서 받은 rooms 전체 표시
  // 로컬 필터링 모드는 filtered를 visible만큼만 표시

  const shown = filtered;

  // 무한스크롤 모드일 때는 total 기준으로, 아닐 때는 filtered 기준으로
  const hasMore =
    total !== undefined
      ? rooms.length < total
      : false;

  // IntersectionObserver로 무한스크롤 구현
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [onLoadMore, hasMore, loading]);

  // 필터 여부 / 미래 여부
  const isDateFiltered = quick !== "all" || !!from || !!to;
  const now = new Date();
  const fromDateObj = from ? new Date(from + "T00:00:00") : null;
  const isFromInFuture =
    fromDateObj !== null && fromDateObj.getTime() > now.getTime();

  // 필터 UI
  const Filters = (
    <div className="mb-4">
      <div className="flex flex-wrap md:flex-nowrap md:whitespace-nowrap items-center gap-3">
        {/* 빠른 범위 버튼 */}
        <div className="flex items-center gap-2 flex-wrap basis-full md:basis-auto shrink-0">
          {[
            {
              k: "all",
              labelKey: "mypage.myRooms.filter.quick.all",
              fallback: "전체",
            },
            {
              k: "7d",
              labelKey: "mypage.myRooms.filter.quick.7d",
              fallback: "최근 7일",
            },
            {
              k: "30d",
              labelKey: "mypage.myRooms.filter.quick.30d",
              fallback: "최근 30일",
            },
            {
              k: "thisYear",
              labelKey: "mypage.myRooms.filter.quick.thisYear",
              fallback: "올해",
            },
          ].map(({ k, labelKey, fallback }) => (
            <button
              key={k}
              onClick={() => {
                applyQuick(k as QuickRange);
                setOpenCalendar(false);
              }}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                quick === k
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t(labelKey, fallback)}
            </button>
          ))}
        </div>

        {/* 구분선 */}
        <div className="h-5 w-px bg-gray-200 hidden md:block shrink-0" />

        {/* 기간 선택 */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpenCalendar((o) => !o)}
            className="border rounded-md px-3 py-2 text-sm bg-white flex items-center gap-2 min-w-[190px]"
          >
            <span className="text-gray-500 text-xs">
              {t("mypage.myRooms.filter.period", "기간")}
            </span>
            <span className="text-gray-800">
              {from
                ? from
                : t(
                    "mypage.myRooms.filter.period.start",
                    "시작일",
                  )}{" "}
              <span className="text-gray-400 mx-1">~</span>{" "}
              {to
                ? to
                : t(
                    "mypage.myRooms.filter.period.end",
                    "종료일",
                  )}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-400 ml-auto"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {openCalendar && (
            <div className="absolute z-50 mt-3">
              <RangeCalendar
                start={from}
                end={to}
                onChange={(s, e) => {
                  setFrom(s);
                  setTo(e);
                  setQuick("all");
                  setVisible(pageSize);
                }}
                onClose={() => setOpenCalendar(false)}
              />
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="h-5 w-px bg-gray-200 hidden md:block shrink-0" />

        {/* 아티스트 선택 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs text-gray-500 shrink-0">
            <UIText id="mypage.myRooms.filter.artist">
              아티스트
            </UIText>
          </div>
          <select
            value={artistId}
            onChange={(e) => {
              const v = e.target.value;
              setArtistId(v === "all" ? "all" : Number(v));
              setVisible(pageSize);
            }}
            className="border rounded-md px-2 py-2 text-sm w-[160px] sm:w-auto shrink-0 bg-white"
          >
            <option value="all">
              {t(
                "mypage.myRooms.filter.quick.all",
                "전체",
              )}
            </option>
            {artistOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[880px] mx-auto">
      {shown.length > 0 ? (
        <MyCreatedRooms
          rooms={shown}
          title={t(
            "mypage.myRooms.title",
            "내가 만든 방",
          )}
          filters={Filters}
        />
      ) : (
        // 🔴 여기서도 제목을 찍어줘야 한다
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <UIText
            id="mypage.myRooms.title"
            as="h2"
            className="text-lg font-bold mb-4"
          >
            내가 만든 방
          </UIText>
          {Filters}
          <div className="py-10 text-center text-gray-400 text-sm">
            {isFromInFuture || !isDateFiltered
              ? t(
                  "mypage.myRooms.empty.default",
                  "아직 만든 방이 없습니다.",
                )
              : t(
                  "mypage.myRooms.empty.filtered",
                  "이 기간에는 방을 생성하지 않았습니다.",
                )}
          </div>
        </div>
      )}

      {/* 무한스크롤 트리거 */}
      {onLoadMore && hasMore && shown.length > 0 && (
        <div
          ref={observerTarget}
          className="flex justify-center mt-4 py-4"
        >
          {loading && (
            <div className="text-sm text-gray-500">
              {t(
                "mypage.myRooms.loading",
                "로딩 중...",
              )}
            </div>
          )}
        </div>
      )}

      {/* 로컬 필터링 모드일 때만 더보기 버튼 표시 */}
      {!onLoadMore && hasMore && shown.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setVisible((v) => v + pageSize)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
          >
            {t(
              "mypage.myRooms.loadMoreButton",
              "더 보기",
            )}{" "}
            ({shown.length}/{filtered.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCreatedRoomsPanel;
