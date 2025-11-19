export type LangCode = "ko" | "en" | "ja" | "zh" | "es" | "fr";

export const UI_STRINGS: Partial<Record<LangCode, Record<string, string>>> = {
  ko: {
    // 기존 home, common, artistList 등...

    "home.trending.title": "지금 핫한 방",
    "home.trending.viewerSuffix": "명 시청 중",
    "home.trending.swipeHint": "좌우로 스와이프해서 다른 방도 확인해보세요",
    "home.trending.emptyTitle": "아직 생성된 방이 없습니다.",
    "home.trending.emptyDesc": "가장 먼저 라이브를 시작해보세요!",

    "home.featuredArtists.title": "주목해야 할 아티스트!",
    "home.featuredArtists.allArtistsCircle": "전체 아티스트",

    "home.quickStart.title": "빠르게 시작하기",
    "home.quickStart.swipeHint": "좌우로 스와이프해서 가이드를 확인해보세요",

    "common.viewAll": "전체 보기 →",
    "common.more": "더보기 →",
    "common.viewDetail": "자세히 보기 →",
    "common.login": "로그인",
    "common.loadMore": "더보기",

    "artistList.title": "아티스트",
    "artistList.subtitle": "다양한 K-pop 아티스트를 만나보세요.",
    "artistList.searchLabel": "아티스트 검색",
    "artistList.searchPlaceholder": "아티스트를 검색하세요",
    "artistList.totalCount": "총 {count}명의 아티스트",

    "artistList.sort.followersDesc": "팔로워 많은순",
    "artistList.sort.nameAsc": "이름 오름차순",
    "artistList.sort.nameDesc": "이름 내림차순",
    "artistList.sort.debutAsc": "데뷔 빠른순",
    "artistList.sort.debutDesc": "데뷔 최신순",

    // 🔻 ArtistDetailPage
    "artistDetail.notFound": "아티스트를 찾을 수 없습니다.",
    "artistDetail.loginRequiredAlert": "로그인이 필요합니다.",
    "artistDetail.requestFailed": "요청 처리에 실패했습니다.",

    "artistDetail.debutLabelShort": "데뷔일 ",
    "artistDetail.debutLabelFull": "데뷔일:",

    "artistDetail.following": "팔로우 중",
    "artistDetail.follow": "+ 팔로우",
    "artistDetail.followVerb": "팔로우",

    "artistDetail.fantalk.title": "팬톡",
    "artistDetail.fantalk.subtitle": "실시간 채팅과 추천 팬을 한 곳에서",
    "artistDetail.fantalk.cta": "바로가기 >", // 앱 카드 하단

    "artistDetail.live.title": "라이브 방",
    "artistDetail.live.count": "{count}개의 방이 진행 중",
    "artistDetail.live.loadingShort": "방 목록을 불러오는 중입니다...",
    "artistDetail.live.loadingLong": "방송 목록을 불러오는 중...",
    "artistDetail.live.empty": "현재 진행 중인 라이브 방송이 없습니다.",

    "artistDetail.live.followRequiredPrefix": "이 아티스트를 ",
    "artistDetail.live.followRequiredSuffix": "해야 방을 생성할 수 있습니다.",
    "artistDetail.live.loginRequiredSuffix": " 후 방을 생성할 수 있습니다.",
    "artistDetail.live.createRoom": "새 방 만들기",

    "leftSidebar.title": "팔로우한 아티스트",
    "leftSidebar.empty": "팔로우한 아티스트가 없습니다.",
    "leftSidebar.more": "아티스트 더보기",
    "leftSidebar.goFollow": "아티스트 팔로우 하러가기",

    "rightSidebar.tab.chat": "실시간 채팅",
    "rightSidebar.tab.recommend": "추천",
    "rightSidebar.tab.recommendFans": "추천 팬",
    "rightSidebar.input.placeholder": "메시지를 입력하세요...",
    "rightSidebar.locked.title": "팔로우 전용 채팅",
    "rightSidebar.locked.desc": "아티스트를 팔로우하고 대화에 참여하세요.",

    "recommendTab.loading": "추천 사용자를 불러오는 중...",
    "recommendTab.errorTitle": "오류 발생",
    "recommendTab.errorDesc": "데이터를 불러오는 데 실패했습니다.",
    "recommendTab.emptyTitle": "추천할 사용자가 없어요",
    "recommendTab.emptyDesc.line1": "나와 비슷한 취향을 가진",
    "recommendTab.emptyDesc.line2": "다른 팬을 아직 찾지 못했어요!",
    "recommendTab.profileAlt": "{nickname}의 프로필",
    "recommendTab.following": "팔로잉",
    "recommendTab.follow": "팔로우",

    "artistChat.loading": "채팅을 불러오는 중...",
    "artistChat.empty": "아직 채팅 메시지가 없습니다.",

    "artistChat.blockSuccessTitle": "차단 완료",
    "artistChat.blockSuccessDesc": "{nickname}님을 차단했습니다.",
    "artistChat.blockErrorTitle": "오류",
    "artistChat.blockErrorDesc": "차단 요청에 실패했습니다. 다시 시도해주세요.",

    "artistChat.reportTitle": "{nickname} 님 신고하기",
    "artistChat.reportDesc": "부적절한 채팅이나 불쾌한 행동이 있었다면 신고 사유를 작성해주세요.",
    "artistChat.reportPlaceholder": "예) 욕설 및 비방, 불쾌한 채팅, 스팸 메시지 등",
    "artistChat.reportSuccessMessage": "신고되었습니다. 빠른 시일 내로 조치를 취하겠습니다.",
    "artistChat.reportClose": "닫기",
    "artistChat.reportSubmit": "신고하기",
    "artistChat.reportSubmitted": "신고 완료",

    "artistChat.menuReport": "신고하기",
    "artistChat.menuBlock": "차단하기",

    "common.confirm": "확인",

    "createRoom.title": "새 방 만들기",
    "createRoom.field.title.label": "방 제목",
    "createRoom.field.title.placeholder": "방 제목을 입력해주세요",

    "createRoom.youtube.search.label": "YouTube에서 검색",
    "createRoom.youtube.search.placeholder": "예: 블랙핑크",
    "createRoom.youtube.search.button": "검색",
    "createRoom.youtube.search.error": "유튜브 검색 중 오류가 발생했어요.",
    "createRoom.youtube.search.loading": "검색 중...",

    "createRoom.youtube.url.label": "YouTube URL",
    "createRoom.youtube.url.placeholder": "유튜브 링크를 입력해주세요",
    "createRoom.youtube.url.helper":
    "유튜브 링크를 직접 입력하거나 위의 검색창에서 검색 후 동영상을 선택하면 이 칸에 자동으로 채워집니다.",

    "createRoom.thumbnail.alt": "썸네일 미리보기",
    "createRoom.meta.title.loading": "제목 로딩 중...",
    "createRoom.meta.author.loading": "채널 로딩 중...",

    "createRoom.lock.label": "비밀번호 설정 여부",
    "createRoom.lock.yes": "예",
    "createRoom.lock.no": "아니요",

    "createRoom.entryQuestion.label": "입장 질문",
    "createRoom.entryQuestion.placeholder": "1+1=?",
    "createRoom.entryAnswer.label": "정답",
    "createRoom.entryAnswer.placeholder": "2",

    "createRoom.error.required": "모든 필수 항목을 입력해주세요.",
    "createRoom.error.roomLimit":
    "이미 생성한 방이 있어요. 한 사용자는 동시에 하나의 방만 만들 수 있습니다.",
    "createRoom.error.generic":
    "방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",

    "createRoom.cancel": "취소",
    "createRoom.submit.creating": "방 만드는 중...",
    "createRoom.submit.default": "방 만들기",

    "header.web.homeAria": "DuckOn 홈으로 이동",
    "header.web.ranking": "랭킹",
    "header.web.login": "로그인",
    "header.web.signup": "회원가입",
    "header.web.mypage": "마이페이지",
    "header.web.logout": "로그아웃",

    "leaderboard.loading": "로딩 중...",
    "leaderboard.title": "랭킹",
    "leaderboard.subtitle": "자신의 덕력을 증명하라 👑",
    "leaderboard.section.top3": "TOP 3",
    "leaderboard.section.rest": "4위 ~ 50위",
    "leaderboard.empty": "아직 리더보드 데이터가 없습니다",

    "common.follower": "팔로워",
    "common.following": "팔로잉",

    // 마이페이지 프로필
    "mypage.profile.title": "프로필 정보",
    "mypage.profile.edit": "프로필 수정",
    "mypage.profile.changePassword": "비밀번호 변경",

    "mypage.profile.menu.openAria": "프로필 옵션 열기",
    "mypage.profile.menu.ariaLabel": "프로필 옵션",
    "mypage.profile.menu.blockList": "차단 목록 관리",
    "mypage.profile.menu.deleteAccount": "회원탈퇴",

    "mypage.profile.followerListAria": "팔로워 목록 열기",
    "mypage.profile.followingListAria": "팔로잉 목록 열기",

    "mypage.profile.email": "이메일",
    "mypage.profile.userId": "아이디",
    "mypage.profile.nickname": "닉네임",
    "mypage.profile.language": "언어",

    // 언어 라벨
    "language.ko": "한국어",
    "language.en": "English",
    "language.ja": "日本語",
    "language.zh": "中文",
    "language.es": "Español",
    "language.fr": "Français",

        "common.save": "저장",
    "common.cancel": "취소",
    "common.ok": "확인",

    "mypage.profile.image.change": "변경하기",
    "mypage.profile.image.resetToDefault": "기본 이미지로 변경",
    "mypage.profile.image.alt": "프로필 이미지",

    "mypage.profile.error.fileTooLargeTitle": "파일 용량 초과",
    "mypage.profile.error.fileTooLarge.line1": "이미지 용량이 너무 큽니다.",
    "mypage.profile.error.fileTooLarge.currentSizeLabel": "파일 크기",
    "mypage.profile.error.fileTooLarge.maxSizeLabel": "최대 허용",
    "mypage.profile.error.fileTooLarge.lineLast": "더 작은 이미지를 선택해주세요.",

    "mypage.profile.error.updateFailTitle": "프로필 수정 실패",
    "mypage.profile.error.updateFail.line1": "프로필 수정 중 오류가 발생했습니다.",
    "mypage.profile.error.updateFail.line2": "다시 시도해주세요.",

        "mypage.myRooms.title": "내가 만든 방",

    "mypage.myRooms.filter.quick.all": "전체",
    "mypage.myRooms.filter.quick.7d": "최근 7일",
    "mypage.myRooms.filter.quick.30d": "최근 30일",
    "mypage.myRooms.filter.quick.thisYear": "올해",

    "mypage.myRooms.filter.period": "기간",
    "mypage.myRooms.filter.period.start": "시작일",
    "mypage.myRooms.filter.period.end": "종료일",
    "mypage.myRooms.filter.artist": "아티스트",

    "mypage.myRooms.empty.default": "아직 만든 방이 없습니다.",
    "mypage.myRooms.empty.filtered": "이 기간에는 방을 생성하지 않았습니다.",

    "mypage.myRooms.loading": "로딩 중...",
    "mypage.myRooms.loadMoreButton": "더 보기",

    "common.follow": "팔로우",

        "mypage.passwordConfirm.title": "현재 비밀번호 확인",
    "mypage.passwordConfirm.description": "프로필 수정을 위해 비밀번호를 입력해주세요.",
    "mypage.passwordConfirm.placeholder": "현재 비밀번호를 입력하세요",
    "mypage.passwordConfirm.error": "비밀번호가 일치하지 않습니다.",

        "rankProgress.subtitle.roomCountSuffix": "개 방 생성 · 참여도 등급",
    "rankProgress.subtitle.activity": "활동 등급",
    "rankProgress.modal.title": "덕온 랭킹 안내",
    "rankProgress.modal.close": "닫기",

    "live.entryQuiz.defaultPrompt": "비밀번호(정답)를 입력하세요.",
  "live.loading.playerConnecting": "플레이어 연결 중...",
  "live.tabs.chat": "실시간 채팅",
  "live.tabs.playlist": "플레이리스트",

  "live.modal.deleteRoom.title": "방 삭제",
  "live.modal.deleteRoom.description": "정말 방을 삭제하시겠습니까?",
  "live.modal.deleteRoom.confirm": "삭제",
  "live.modal.deleteRoom.cancel": "취소",

  "live.modal.kicked.title": "입장 불가",
  "live.modal.kicked.description": "해당 방에서 강퇴되어 입장이 불가합니다.",
  "live.modal.kicked.confirm": "확인",
  },

  en: {
    "home.trending.title": "Trending rooms",
    "home.trending.viewerSuffix": "watching",
    "home.trending.swipeHint": "Swipe left and right to see other rooms",
    "home.trending.emptyTitle": "No rooms have been created yet.",
    "home.trending.emptyDesc": "Be the first to start a live!",

    "home.featuredArtists.title": "Featured artists",
    "home.featuredArtists.allArtistsCircle": "All artists",

    "home.quickStart.title": "Get started quickly",
    "home.quickStart.swipeHint": "Swipe to check the guide",

    "common.viewAll": "View all →",
    "common.more": "More →",
    "common.viewDetail": "View details →",
    "common.login": "Login",
    "common.loadMore": "Load more",

    "artistList.title": "Artists",
    "artistList.subtitle": "Discover a variety of K-pop artists.",
    "artistList.searchLabel": "Search artists",
    "artistList.searchPlaceholder": "Search for artists",
    "artistList.totalCount": "Total {count} artists",

    "artistList.sort.followersDesc": "Most followed",
    "artistList.sort.nameAsc": "Name (A–Z)",
    "artistList.sort.nameDesc": "Name (Z–A)",
    "artistList.sort.debutAsc": "Debut (oldest first)",
    "artistList.sort.debutDesc": "Debut (newest first)",

    // ArtistDetailPage
    "artistDetail.notFound": "Artist not found.",
    "artistDetail.loginRequiredAlert": "Login is required.",
    "artistDetail.requestFailed": "Failed to process the request.",

    "artistDetail.debutLabelShort": "Debut ",
    "artistDetail.debutLabelFull": "Debut:",

    "artistDetail.following": "Following",
    "artistDetail.follow": "+ Follow",
    "artistDetail.followVerb": "follow",

    "artistDetail.fantalk.title": "Fan Talk",
    "artistDetail.fantalk.subtitle":
      "Real-time chat and recommended fans in one place",
    "artistDetail.fantalk.cta": "Go to Fan Talk >", // CTA

    "artistDetail.live.title": "Live rooms",
    "artistDetail.live.count": "{count} rooms live",
    "artistDetail.live.loadingShort": "Loading room list...",
    "artistDetail.live.loadingLong": "Loading live rooms...",
    "artistDetail.live.empty": "There are no live broadcasts at the moment.",

    "artistDetail.live.followRequiredPrefix": "You must ",
    "artistDetail.live.followRequiredSuffix":
      " this artist to create a room.",
    "artistDetail.live.loginRequiredSuffix": " to create a room.",
    "artistDetail.live.createRoom": "Create room",

    "leftSidebar.title": "Followed artists",
    "leftSidebar.empty": "You haven't followed any artists yet.",
    "leftSidebar.more": "View more artists",
    "leftSidebar.goFollow": "Go follow artists",

    "rightSidebar.tab.chat": "Live chat",
    "rightSidebar.tab.recommend": "Recommended",
    "rightSidebar.tab.recommendFans": "Recommended fans",
    "rightSidebar.input.placeholder": "Type a message...",
    "rightSidebar.locked.title": "Followers-only chat",
    "rightSidebar.locked.desc": "Follow this artist to join the conversation.",

    "recommendTab.loading": "Loading recommended users...",
    "recommendTab.errorTitle": "Error occurred",
    "recommendTab.errorDesc": "Failed to load data.",
    "recommendTab.emptyTitle": "No users to recommend yet",
    "recommendTab.emptyDesc.line1": "We haven't found",
    "recommendTab.emptyDesc.line2": "other fans who share your taste yet!",
    "recommendTab.profileAlt": "{nickname}'s profile",
    "recommendTab.following": "Following",
    "recommendTab.follow": "Follow",

    "artistChat.loading": "Loading chat messages...",
    "artistChat.empty": "There are no chat messages yet.",

    "artistChat.blockSuccessTitle": "Blocked",
    "artistChat.blockSuccessDesc": "You have blocked {nickname}.",
    "artistChat.blockErrorTitle": "Error",
    "artistChat.blockErrorDesc": "Failed to block this user. Please try again.",

    "artistChat.reportTitle": "Report {nickname}",
    "artistChat.reportDesc": "If there was inappropriate or unpleasant behavior, please describe it.",
    "artistChat.reportPlaceholder": "e.g. abusive language, harassment, spam messages, etc.",
    "artistChat.reportSuccessMessage": "Your report has been submitted. We will take action as soon as possible.",
    "artistChat.reportClose": "Close",
    "artistChat.reportSubmit": "Report",
    "artistChat.reportSubmitted": "Reported",

    "artistChat.menuReport": "Report",
    "artistChat.menuBlock": "Block",

    "common.confirm": "OK",

    "createRoom.title": "Create a new room",
    "createRoom.field.title.label": "Room title",
    "createRoom.field.title.placeholder": "Enter a room title",

    "createRoom.youtube.search.label": "Search on YouTube",
    "createRoom.youtube.search.placeholder": "e.g. BLACKPINK",
    "createRoom.youtube.search.button": "Search",
    "createRoom.youtube.search.error": "An error occurred while searching YouTube.",
    "createRoom.youtube.search.loading": "Searching...",

    "createRoom.youtube.url.label": "YouTube URL",
    "createRoom.youtube.url.placeholder": "Paste a YouTube link",
    "createRoom.youtube.url.helper":
    "You can paste a YouTube link directly, or search above and select a video to fill this field automatically.",

    "createRoom.thumbnail.alt": "Thumbnail preview",
    "createRoom.meta.title.loading": "Loading title...",
    "createRoom.meta.author.loading": "Loading channel...",

    "createRoom.lock.label": "Require entry password",
    "createRoom.lock.yes": "Yes",
    "createRoom.lock.no": "No",

    "createRoom.entryQuestion.label": "Entry question",
    "createRoom.entryQuestion.placeholder": "1+1=?",
    "createRoom.entryAnswer.label": "Answer",
    "createRoom.entryAnswer.placeholder": "2",

    "createRoom.error.required": "Please fill in all required fields.",
    "createRoom.error.roomLimit":
    "You already have a room. Each user can only create one room at a time.",
    "createRoom.error.generic":
    "Failed to create the room. Please try again in a moment.",

    "createRoom.cancel": "Cancel",
    "createRoom.submit.creating": "Creating room...",
    "createRoom.submit.default": "Create room",

    "header.web.homeAria": "Go to DuckOn home",
    "header.web.ranking": "Ranking",
    "header.web.login": "Log in",
    "header.web.signup": "Sign up",
    "header.web.mypage": "My page",
    "header.web.logout": "Log out",

    "leaderboard.loading": "Loading...",
    "leaderboard.title": "Ranking",
    "leaderboard.subtitle": "Prove your fandom power 👑",
    "leaderboard.section.top3": "TOP 3",
    "leaderboard.section.rest": "4th–50th",
    "leaderboard.empty": "There is no leaderboard data yet.",

    "common.follower": "Followers",
    "common.following": "Following",

    // 마이페이지 프로필
    "mypage.profile.title": "Profile info",
    "mypage.profile.edit": "Edit profile",
    "mypage.profile.changePassword": "Change password",

    "mypage.profile.menu.openAria": "Open profile options",
    "mypage.profile.menu.ariaLabel": "Profile options",
    "mypage.profile.menu.blockList": "Manage block list",
    "mypage.profile.menu.deleteAccount": "Delete account",

    "mypage.profile.followerListAria": "Open follower list",
    "mypage.profile.followingListAria": "Open following list",

    "mypage.profile.email": "Email",
    "mypage.profile.userId": "User ID",
    "mypage.profile.nickname": "Nickname",
    "mypage.profile.language": "Language",

    // 언어 라벨
    "language.ko": "한국어",
    "language.en": "English",
    "language.ja": "日本語",
    "language.zh": "中文",
    "language.es": "Español",
    "language.fr": "Français",

        "common.save": "Save",
    "common.cancel": "Cancel",
    "common.ok": "OK",

    "mypage.profile.image.change": "Change image",
    "mypage.profile.image.resetToDefault": "Reset to default image",
    "mypage.profile.image.alt": "Profile image",

    "mypage.profile.error.fileTooLargeTitle": "File size too large",
    "mypage.profile.error.fileTooLarge.line1": "The image file is too large.",
    "mypage.profile.error.fileTooLarge.currentSizeLabel": "File size",
    "mypage.profile.error.fileTooLarge.maxSizeLabel": "Maximum allowed",
    "mypage.profile.error.fileTooLarge.lineLast": "Please choose a smaller image.",

    "mypage.profile.error.updateFailTitle": "Failed to update profile",
    "mypage.profile.error.updateFail.line1": "An error occurred while updating your profile.",
    "mypage.profile.error.updateFail.line2": "Please try again.",

        "mypage.myRooms.title": "Rooms I created",

    "mypage.myRooms.filter.quick.all": "All",
    "mypage.myRooms.filter.quick.7d": "Last 7 days",
    "mypage.myRooms.filter.quick.30d": "Last 30 days",
    "mypage.myRooms.filter.quick.thisYear": "This year",

    "mypage.myRooms.filter.period": "Period",
    "mypage.myRooms.filter.period.start": "Start date",
    "mypage.myRooms.filter.period.end": "End date",
    "mypage.myRooms.filter.artist": "Artist",

    "mypage.myRooms.empty.default": "You haven't created any rooms yet.",
    "mypage.myRooms.empty.filtered": "No rooms were created during this period.",

    "mypage.myRooms.loading": "Loading...",
    "mypage.myRooms.loadMoreButton": "Load more",

    "common.follow": "Follow",

        "mypage.passwordConfirm.title": "Confirm current password",
    "mypage.passwordConfirm.description": "Please enter your password to edit your profile.",
    "mypage.passwordConfirm.placeholder": "Enter your current password",
    "mypage.passwordConfirm.error": "The password does not match.",

        "rankProgress.subtitle.roomCountSuffix": "rooms created · engagement tier",
    "rankProgress.subtitle.activity": "Activity tier",
    "rankProgress.modal.title": "DuckOn ranking guide",
    "rankProgress.modal.close": "Close",

    "live.entryQuiz.defaultPrompt": "Please enter the password (answer).",
  "live.loading.playerConnecting": "Connecting to player...",
  "live.tabs.chat": "Live chat",
  "live.tabs.playlist": "Playlist",

  "live.modal.deleteRoom.title": "Delete room",
  "live.modal.deleteRoom.description": "Are you sure you want to delete this room?",
  "live.modal.deleteRoom.confirm": "Delete",
  "live.modal.deleteRoom.cancel": "Cancel",

  "live.modal.kicked.title": "Cannot enter",
  "live.modal.kicked.description":
    "You have been kicked from this room and cannot enter.",
  "live.modal.kicked.confirm": "OK",
  },

  ja: {
    "home.trending.title": "今注目のルーム",
    "home.trending.viewerSuffix": "人が視聴中",
    "home.trending.swipeHint": "左右にスワイプして他のルームもチェックしてください",
    "home.trending.emptyTitle": "まだ作成されたルームはありません。",
    "home.trending.emptyDesc": "一番最初にライブを始めてみましょう！",

    "home.featuredArtists.title": "注目のアーティスト",
    "home.featuredArtists.allArtistsCircle": "すべてのアーティスト",

    "home.quickStart.title": "クイックスタート",
    "home.quickStart.swipeHint": "左右にスワイプしてガイドを確認してください",

    "common.viewAll": "すべて見る →",
    "common.more": "もっと見る →",
    "common.viewDetail": "詳細を見る →",
    "common.login": "ログイン",
    "common.loadMore": "もっと見る",

    "artistList.title": "アーティスト",
    "artistList.subtitle": "さまざまなK-POPアーティストに出会いましょう。",
    "artistList.searchLabel": "アーティスト検索",
    "artistList.searchPlaceholder": "アーティストを検索してください",
    "artistList.totalCount": "合計 {count} 人のアーティスト",

    "artistList.sort.followersDesc": "フォロワー数が多い順",
    "artistList.sort.nameAsc": "名前昇順",
    "artistList.sort.nameDesc": "名前降順",
    "artistList.sort.debutAsc": "デビューが早い順",
    "artistList.sort.debutDesc": "デビューが新しい順",

    "artistDetail.notFound": "アーティストが見つかりません。",
    "artistDetail.loginRequiredAlert": "ログインが必要です。",
    "artistDetail.requestFailed": "リクエストの処理に失敗しました。",

    "artistDetail.debutLabelShort": "デビュー日 ",
    "artistDetail.debutLabelFull": "デビュー日:",

    "artistDetail.following": "フォロー中",
    "artistDetail.follow": "+ フォロー",
    "artistDetail.followVerb": "フォロー",

    "artistDetail.fantalk.title": "ファントーク",
    "artistDetail.fantalk.subtitle":
      "リアルタイムチャットとおすすめファンをひとつの場所で",
    "artistDetail.fantalk.cta": "移動 >", 

    "artistDetail.live.title": "ライブルーム",
    "artistDetail.live.count": "進行中のルーム {count} 件",
    "artistDetail.live.loadingShort": "ルーム一覧を読み込み中です...",
    "artistDetail.live.loadingLong": "ライブルームを読み込み中です...",
    "artistDetail.live.empty": "現在、進行中のライブ配信はありません。",

    "artistDetail.live.followRequiredPrefix": "このアーティストを",
    "artistDetail.live.followRequiredSuffix":
      "フォローするとルームを作成できます。",
    "artistDetail.live.loginRequiredSuffix":
      "するとルームを作成できます。",
    "artistDetail.live.createRoom": "新しいルームを作成",

    "leftSidebar.title": "フォロー中のアーティスト",
    "leftSidebar.empty": "フォロー中のアーティストがいません。",
    "leftSidebar.more": "アーティストをもっと見る",
    "leftSidebar.goFollow": "アーティストをフォローしに行く",

    "rightSidebar.tab.chat": "リアルタイムチャット",
    "rightSidebar.tab.recommend": "おすすめ",
    "rightSidebar.tab.recommendFans": "おすすめファン",
    "rightSidebar.input.placeholder": "メッセージを入力してください...",
    "rightSidebar.locked.title": "フォロワー専用チャット",
    "rightSidebar.locked.desc": "アーティストをフォローして会話に参加しましょう。",

    "recommendTab.loading": "おすすめユーザーを読み込み中...",
    "recommendTab.errorTitle": "エラーが発生しました",
    "recommendTab.errorDesc": "データの取得に失敗しました。",
    "recommendTab.emptyTitle": "おすすめできるユーザーがいません",
    "recommendTab.emptyDesc.line1": "あなたと似た好みを持つ",
    "recommendTab.emptyDesc.line2": "ほかのファンはまだ見つかっていません。",
    "recommendTab.profileAlt": "{nickname}さんのプロフィール",
    "recommendTab.following": "フォロー中",
    "recommendTab.follow": "フォロー",

    "artistChat.loading": "チャットを読み込み中です...",
    "artistChat.empty": "まだチャットメッセージがありません。",

    "artistChat.blockSuccessTitle": "ブロック完了",
    "artistChat.blockSuccessDesc": "{nickname}さんをブロックしました。",
    "artistChat.blockErrorTitle": "エラー",
    "artistChat.blockErrorDesc": "ブロックのリクエストに失敗しました。もう一度お試しください。",

    "artistChat.reportTitle": "{nickname} さんを通報",
    "artistChat.reportDesc": "不適切なチャットや不快な行為があった場合は、通報理由を記入してください。",
    "artistChat.reportPlaceholder": "例）暴言・中傷、不快なメッセージ、スパムなど",
    "artistChat.reportSuccessMessage": "通報が送信されました。できるだけ早く対応いたします。",
    "artistChat.reportClose": "閉じる",
    "artistChat.reportSubmit": "通報する",
    "artistChat.reportSubmitted": "通報済み",

    "artistChat.menuReport": "通報する",
    "artistChat.menuBlock": "ブロックする",

    "common.confirm": "確認",

    "createRoom.title": "新しいルームを作成",
    "createRoom.field.title.label": "ルームタイトル",
    "createRoom.field.title.placeholder": "ルームのタイトルを入力してください",

    "createRoom.youtube.search.label": "YouTubeで検索",
    "createRoom.youtube.search.placeholder": "例：BLACKPINK",
    "createRoom.youtube.search.button": "検索",
    "createRoom.youtube.search.error": "YouTube検索中にエラーが発生しました。",
    "createRoom.youtube.search.loading": "検索中...",

    "createRoom.youtube.url.label": "YouTube URL",
    "createRoom.youtube.url.placeholder": "YouTubeリンクを入力してください",
    "createRoom.youtube.url.helper":
    "YouTubeリンクを直接入力するか、上の検索欄で検索して動画を選択すると、この欄に自動入力されます。",

    "createRoom.thumbnail.alt": "サムネイルプレビュー",
    "createRoom.meta.title.loading": "タイトルを読み込み中...",
    "createRoom.meta.author.loading": "チャンネルを読み込み中...",

    "createRoom.lock.label": "入室パスワードの設定",
    "createRoom.lock.yes": "はい",
    "createRoom.lock.no": "いいえ",

    "createRoom.entryQuestion.label": "入室質問",
    "createRoom.entryQuestion.placeholder": "1+1=?",
    "createRoom.entryAnswer.label": "正解",
    "createRoom.entryAnswer.placeholder": "2",

    "createRoom.error.required": "必須項目をすべて入力してください。",
    "createRoom.error.roomLimit":
    "すでに作成したルームがあります。1ユーザーにつき同時に1つのルームのみ作成できます。",
    "createRoom.error.generic":
    "ルームの作成に失敗しました。しばらくしてからもう一度お試しください。",

    "createRoom.cancel": "キャンセル",
    "createRoom.submit.creating": "ルームを作成中...",
    "createRoom.submit.default": "ルームを作成",

    "header.web.homeAria": "DuckOn ホームへ移動",
    "header.web.ranking": "ランキング",
    "header.web.login": "ログイン",
    "header.web.signup": "新規登録",
    "header.web.mypage": "マイページ",
    "header.web.logout": "ログアウト",

    "leaderboard.loading": "読み込み中...",
    "leaderboard.title": "ランキング",
    "leaderboard.subtitle": "あなたのオタク度を証明しよう 👑",
    "leaderboard.section.top3": "TOP 3",
    "leaderboard.section.rest": "4位〜50位",
    "leaderboard.empty": "まだランキングデータがありません。",

    "common.follower": "フォロワー",
    "common.following": "フォロー中",

    // マイページ プロフィール
    "mypage.profile.title": "プロフィール情報",
    "mypage.profile.edit": "プロフィールを編集",
    "mypage.profile.changePassword": "パスワードを変更",

    "mypage.profile.menu.openAria": "プロフィールオプションを開く",
    "mypage.profile.menu.ariaLabel": "プロフィールオプション",
    "mypage.profile.menu.blockList": "ブロックリスト管理",
    "mypage.profile.menu.deleteAccount": "アカウント削除",

    "mypage.profile.followerListAria": "フォロワー一覧を開く",
    "mypage.profile.followingListAria": "フォロー中一覧を開く",

    "mypage.profile.email": "メール",
    "mypage.profile.userId": "ユーザーID",
    "mypage.profile.nickname": "ニックネーム",
    "mypage.profile.language": "言語",

    // 言語ラベル
    "language.ko": "한국어",
    "language.en": "English",
    "language.ja": "日本語",
    "language.zh": "中文",
    "language.es": "Español",
    "language.fr": "Français",

        "common.save": "保存",
    "common.cancel": "キャンセル",
    "common.ok": "確認",

    "mypage.profile.image.change": "変更する",
    "mypage.profile.image.resetToDefault": "デフォルト画像に戻す",
    "mypage.profile.image.alt": "プロフィール画像",

    "mypage.profile.error.fileTooLargeTitle": "ファイルサイズ超過",
    "mypage.profile.error.fileTooLarge.line1": "画像ファイルのサイズが大きすぎます。",
    "mypage.profile.error.fileTooLarge.currentSizeLabel": "ファイルサイズ",
    "mypage.profile.error.fileTooLarge.maxSizeLabel": "最大許容",
    "mypage.profile.error.fileTooLarge.lineLast": "より小さい画像を選択してください。",

    "mypage.profile.error.updateFailTitle": "プロフィールの更新に失敗しました",
    "mypage.profile.error.updateFail.line1": "プロフィール更新中にエラーが発生しました。",
    "mypage.profile.error.updateFail.line2": "もう一度お試しください。",

        "mypage.myRooms.title": "自分が作ったルーム",

    "mypage.myRooms.filter.quick.all": "全体",
    "mypage.myRooms.filter.quick.7d": "直近7日",
    "mypage.myRooms.filter.quick.30d": "直近30日",
    "mypage.myRooms.filter.quick.thisYear": "今年",

    "mypage.myRooms.filter.period": "期間",
    "mypage.myRooms.filter.period.start": "開始日",
    "mypage.myRooms.filter.period.end": "終了日",
    "mypage.myRooms.filter.artist": "アーティスト",

    "mypage.myRooms.empty.default": "まだルームを作成していません。",
    "mypage.myRooms.empty.filtered": "この期間にはルームを作成していません。",

    "mypage.myRooms.loading": "読み込み中...",
    "mypage.myRooms.loadMoreButton": "もっと見る",

    "common.follow": "フォロー",

        "mypage.passwordConfirm.title": "現在のパスワード確認",
    "mypage.passwordConfirm.description": "プロフィールを編集するにはパスワードを入力してください。",
    "mypage.passwordConfirm.placeholder": "現在のパスワードを入力してください",
    "mypage.passwordConfirm.error": "パスワードが一致しません。",

        "rankProgress.subtitle.roomCountSuffix": "件のルーム作成 · 参加度ランク",
    "rankProgress.subtitle.activity": "活動ランク",
    "rankProgress.modal.title": "DuckOn ランキング案内",
    "rankProgress.modal.close": "閉じる",

    "live.entryQuiz.defaultPrompt": "パスワード（正解）を入力してください。",
  "live.loading.playerConnecting": "プレイヤーに接続しています...",
  "live.tabs.chat": "リアルタイムチャット",
  "live.tabs.playlist": "プレイリスト",

  "live.modal.deleteRoom.title": "ルーム削除",
  "live.modal.deleteRoom.description": "本当にこのルームを削除しますか？",
  "live.modal.deleteRoom.confirm": "削除",
  "live.modal.deleteRoom.cancel": "キャンセル",

  "live.modal.kicked.title": "入室できません",
  "live.modal.kicked.description":
    "このルームから追放されているため、入室できません。",
  "live.modal.kicked.confirm": "確認",
  },

  zh: {
    "home.trending.title": "热门房间",
    "home.trending.viewerSuffix": "人正在观看",
    "home.trending.swipeHint": "左右滑动查看更多房间",
    "home.trending.emptyTitle": "还没有创建任何房间。",
    "home.trending.emptyDesc": "快来成为第一个开直播的人吧！",

    "home.featuredArtists.title": "推荐艺人",
    "home.featuredArtists.allArtistsCircle": "全部艺人",

    "home.quickStart.title": "快速开始",
    "home.quickStart.swipeHint": "左右滑动查看指南",

    "common.viewAll": "查看全部 →",
    "common.more": "更多 →",
    "common.viewDetail": "查看详情 →",
    "common.login": "登录",
    "common.loadMore": "加载更多",

    "artistList.title": "艺人",
    "artistList.subtitle": "发现更多不同风格的 K-pop 艺人。",
    "artistList.searchLabel": "搜索艺人",
    "artistList.searchPlaceholder": "请输入艺人名称",
    "artistList.totalCount": "共 {count} 位艺人",

    "artistList.sort.followersDesc": "按粉丝数从高到低",
    "artistList.sort.nameAsc": "名称升序",
    "artistList.sort.nameDesc": "名称降序",
    "artistList.sort.debutAsc": "出道时间从早到晚",
    "artistList.sort.debutDesc": "出道时间从晚到早",

    "artistDetail.notFound": "未找到该艺人。",
    "artistDetail.loginRequiredAlert": "需要登录。",
    "artistDetail.requestFailed": "请求处理失败。",

    "artistDetail.debutLabelShort": "出道日期 ",
    "artistDetail.debutLabelFull": "出道日期:",

    "artistDetail.following": "已关注",
    "artistDetail.follow": "+ 关注",
    "artistDetail.followVerb": "关注",

    "artistDetail.fantalk.title": "粉丝聊天",
    "artistDetail.fantalk.subtitle": "实时聊天与推荐粉丝一站式体验",
    "artistDetail.fantalk.cta": "前往 >", 

    "artistDetail.live.title": "直播房间",
    "artistDetail.live.count": "正在直播的房间：{count} 个",
    "artistDetail.live.loadingShort": "正在加载房间列表...",
    "artistDetail.live.loadingLong": "正在加载直播房间...",
    "artistDetail.live.empty": "当前没有正在进行的直播。",

    "artistDetail.live.followRequiredPrefix": "需要先",
    "artistDetail.live.followRequiredSuffix":
      "该艺人才能创建房间。",
    "artistDetail.live.loginRequiredSuffix":
      "后才能创建房间。",
    "artistDetail.live.createRoom": "创建新房间",

    "leftSidebar.title": "已关注的艺人",
    "leftSidebar.empty": "你还没有关注任何艺人。",
    "leftSidebar.more": "查看更多艺人",
    "leftSidebar.goFollow": "前往关注艺人",

    "rightSidebar.tab.chat": "实时聊天",
    "rightSidebar.tab.recommend": "推荐",
    "rightSidebar.tab.recommendFans": "推荐粉丝",
    "rightSidebar.input.placeholder": "请输入消息...",
    "rightSidebar.locked.title": "仅限关注者的聊天",
    "rightSidebar.locked.desc": "关注该艺人后即可参与聊天。",

    "recommendTab.loading": "正在加载推荐用户...",
    "recommendTab.errorTitle": "发生错误",
    "recommendTab.errorDesc": "获取数据失败。",
    "recommendTab.emptyTitle": "暂时没有可推荐的用户",
    "recommendTab.emptyDesc.line1": "我们还没找到",
    "recommendTab.emptyDesc.line2": "和你有相似喜好的其他粉丝。",
    "recommendTab.profileAlt": "{nickname} 的个人资料",
    "recommendTab.following": "已关注",
    "recommendTab.follow": "关注",

    "artistChat.loading": "正在加载聊天消息...",
    "artistChat.empty": "暂时还没有聊天消息。",

    "artistChat.blockSuccessTitle": "已屏蔽",
    "artistChat.blockSuccessDesc": "你已屏蔽 {nickname}。",
    "artistChat.blockErrorTitle": "错误",
    "artistChat.blockErrorDesc": "屏蔽请求失败，请重试。",

    "artistChat.reportTitle": "举报 {nickname}",
    "artistChat.reportDesc": "如果对方有不当或令人不适的聊天行为，请填写举报原因。",
    "artistChat.reportPlaceholder": "例如：辱骂、中伤、令人不适的内容、垃圾信息等",
    "artistChat.reportSuccessMessage": "已提交举报，我们会尽快进行处理。",
    "artistChat.reportClose": "关闭",
    "artistChat.reportSubmit": "举报",
    "artistChat.reportSubmitted": "已举报",

    "artistChat.menuReport": "举报",
    "artistChat.menuBlock": "屏蔽",

    "common.confirm": "确定",

    "createRoom.title": "创建新房间",
    "createRoom.field.title.label": "房间标题",
    "createRoom.field.title.placeholder": "请输入房间标题",

    "createRoom.youtube.search.label": "在 YouTube 上搜索",
    "createRoom.youtube.search.placeholder": "例如：BLACKPINK",
    "createRoom.youtube.search.button": "搜索",
    "createRoom.youtube.search.error": "在搜索 YouTube 时发生错误。",
    "createRoom.youtube.search.loading": "搜索中...",

    "createRoom.youtube.url.label": "YouTube 链接",
    "createRoom.youtube.url.placeholder": "请输入 YouTube 链接",
    "createRoom.youtube.url.helper":
    "可以直接粘贴 YouTube 链接，或在上方搜索并选择视频后自动填写到此处。",

    "createRoom.thumbnail.alt": "缩略图预览",
    "createRoom.meta.title.loading": "正在加载标题...",
    "createRoom.meta.author.loading": "正在加载频道信息...",

    "createRoom.lock.label": "是否设置入场密码",
    "createRoom.lock.yes": "是",
    "createRoom.lock.no": "否",

    "createRoom.entryQuestion.label": "入场问题",
    "createRoom.entryQuestion.placeholder": "1+1=?",
    "createRoom.entryAnswer.label": "答案",
    "createRoom.entryAnswer.placeholder": "2",

    "createRoom.error.required": "请填写所有必填项。",
    "createRoom.error.roomLimit":
    "你已经创建了一个房间。每位用户同一时间只能创建一个房间。",
    "createRoom.error.generic":
    "创建房间失败，请稍后再试。",

    "createRoom.cancel": "取消",
    "createRoom.submit.creating": "正在创建房间...",
    "createRoom.submit.default": "创建房间",

    "header.web.homeAria": "前往 DuckOn 首页",
    "header.web.ranking": "排行榜",
    "header.web.login": "登录",
    "header.web.signup": "注册",
    "header.web.mypage": "我的页面",
    "header.web.logout": "退出登录",

    "leaderboard.loading": "加载中...",
    "leaderboard.title": "排行榜",
    "leaderboard.subtitle": "证明你的应援实力 👑",
    "leaderboard.section.top3": "TOP 3",
    "leaderboard.section.rest": "第4名至第50名",
    "leaderboard.empty": "目前还没有排行榜数据。",

    "common.follower": "粉丝",
    "common.following": "关注中",

    // 个人主页 - 资料
    "mypage.profile.title": "个人资料信息",
    "mypage.profile.edit": "编辑个人资料",
    "mypage.profile.changePassword": "修改密码",

    "mypage.profile.menu.openAria": "打开个人资料选项",
    "mypage.profile.menu.ariaLabel": "个人资料选项",
    "mypage.profile.menu.blockList": "管理屏蔽列表",
    "mypage.profile.menu.deleteAccount": "注销账户",

    "mypage.profile.followerListAria": "打开粉丝列表",
    "mypage.profile.followingListAria": "打开关注列表",

    "mypage.profile.email": "邮箱",
    "mypage.profile.userId": "用户ID",
    "mypage.profile.nickname": "昵称",
    "mypage.profile.language": "语言",

    // 语言标签
    "language.ko": "한국어",
    "language.en": "English",
    "language.ja": "日本語",
    "language.zh": "中文",
    "language.es": "Español",
    "language.fr": "Français",

        "common.save": "保存",
    "common.cancel": "取消",
    "common.ok": "确认",

    "mypage.profile.image.change": "更换图片",
    "mypage.profile.image.resetToDefault": "恢复默认头像",
    "mypage.profile.image.alt": "头像图片",

    "mypage.profile.error.fileTooLargeTitle": "文件大小超出限制",
    "mypage.profile.error.fileTooLarge.line1": "图片文件太大。",
    "mypage.profile.error.fileTooLarge.currentSizeLabel": "文件大小",
    "mypage.profile.error.fileTooLarge.maxSizeLabel": "最大允许",
    "mypage.profile.error.fileTooLarge.lineLast": "请选择更小的图片。",

    "mypage.profile.error.updateFailTitle": "修改个人资料失败",
    "mypage.profile.error.updateFail.line1": "修改个人资料时发生错误。",
    "mypage.profile.error.updateFail.line2": "请稍后重试。",

        "mypage.myRooms.title": "我创建的房间",

    "mypage.myRooms.filter.quick.all": "全部",
    "mypage.myRooms.filter.quick.7d": "最近7天",
    "mypage.myRooms.filter.quick.30d": "最近30天",
    "mypage.myRooms.filter.quick.thisYear": "今年",

    "mypage.myRooms.filter.period": "期间",
    "mypage.myRooms.filter.period.start": "开始日期",
    "mypage.myRooms.filter.period.end": "结束日期",
    "mypage.myRooms.filter.artist": "艺人",

    "mypage.myRooms.empty.default": "你还没有创建过房间。",
    "mypage.myRooms.empty.filtered": "该时间段内没有创建房间。",

    "mypage.myRooms.loading": "加载中...",
    "mypage.myRooms.loadMoreButton": "加载更多",

    "common.follow": "关注",

        "mypage.passwordConfirm.title": "确认当前密码",
    "mypage.passwordConfirm.description": "要修改个人资料，请输入密码。",
    "mypage.passwordConfirm.placeholder": "请输入当前密码",
    "mypage.passwordConfirm.error": "密码不匹配。",

        "rankProgress.subtitle.roomCountSuffix": "个房间已创建 · 活跃等级",
    "rankProgress.subtitle.activity": "活动等级",
    "rankProgress.modal.title": "DuckOn 排名说明",
    "rankProgress.modal.close": "关闭",

    "live.entryQuiz.defaultPrompt": "请输入密码（答案）。",
  "live.loading.playerConnecting": "正在连接播放器...",
  "live.tabs.chat": "实时聊天",
  "live.tabs.playlist": "播放列表",

  "live.modal.deleteRoom.title": "删除房间",
  "live.modal.deleteRoom.description": "确定要删除此房间吗？",
  "live.modal.deleteRoom.confirm": "删除",
  "live.modal.deleteRoom.cancel": "取消",

  "live.modal.kicked.title": "无法进入",
  "live.modal.kicked.description":
    "您已被此房间踢出，无法进入。",
  "live.modal.kicked.confirm": "确认",
  },

  es: {
    "home.trending.title": "Salas populares",
    "home.trending.viewerSuffix": "viendo",
    "home.trending.swipeHint":
      "Desliza hacia los lados para ver otras salas",
    "home.trending.emptyTitle": "Aún no se ha creado ninguna sala.",
    "home.trending.emptyDesc": "¡Sé la primera persona en iniciar un directo!",

    "home.featuredArtists.title": "Artistas destacados",
    "home.featuredArtists.allArtistsCircle": "Todos los artistas",

    "home.quickStart.title": "Comienza rápido",
    "home.quickStart.swipeHint": "Desliza para ver la guía",

    "common.viewAll": "Ver todo →",
    "common.more": "Más →",
    "common.viewDetail": "Ver detalles →",
    "common.login": "Iniciar sesión",
    "common.loadMore": "Ver más",

    "artistList.title": "Artistas",
    "artistList.subtitle":
      "Descubre una gran variedad de artistas de K-pop.",
    "artistList.searchLabel": "Buscar artistas",
    "artistList.searchPlaceholder": "Busca artistas por nombre",
    "artistList.totalCount": "Total: {count} artistas",

    "artistList.sort.followersDesc": "Más seguidores",
    "artistList.sort.nameAsc": "Nombre (A–Z)",
    "artistList.sort.nameDesc": "Nombre (Z–A)",
    "artistList.sort.debutAsc": "Debut (más antiguo primero)",
    "artistList.sort.debutDesc": "Debut (más reciente primero)",

    "artistDetail.notFound": "No se encontró el artista.",
    "artistDetail.loginRequiredAlert":
      "Es necesario iniciar sesión.",
    "artistDetail.requestFailed":
      "No se pudo procesar la solicitud.",

    "artistDetail.debutLabelShort": "Debut ",
    "artistDetail.debutLabelFull": "Debut:",

    "artistDetail.following": "Siguiendo",
    "artistDetail.follow": "+ Seguir",
    "artistDetail.followVerb": "seguir",

    "artistDetail.fantalk.title": "Fan Talk",
    "artistDetail.fantalk.subtitle":
      "Chat en tiempo real y fans recomendados en un solo lugar",
    "artistDetail.fantalk.cta": "Ir >", 

    "artistDetail.live.title": "Salas en directo",
    "artistDetail.live.count": "{count} salas en directo",
    "artistDetail.live.loadingShort":
      "Cargando lista de salas...",
    "artistDetail.live.loadingLong":
      "Cargando salas en directo...",
    "artistDetail.live.empty":
      "No hay transmisiones en directo por ahora.",

    "artistDetail.live.followRequiredPrefix": "Debes ",
    "artistDetail.live.followRequiredSuffix":
      " a este artista para crear una sala.",
    "artistDetail.live.loginRequiredSuffix":
      " para poder crear una sala.",
    "artistDetail.live.createRoom": "Crear sala",

    "leftSidebar.title": "Artistas seguidos",
    "leftSidebar.empty": "Aún no sigues a ningún artista.",
    "leftSidebar.more": "Ver más artistas",
    "leftSidebar.goFollow": "Ir a seguir artistas",

    "rightSidebar.tab.chat": "Chat en vivo",
    "rightSidebar.tab.recommend": "Recomendado",
    "rightSidebar.tab.recommendFans": "Fans recomendados",
    "rightSidebar.input.placeholder": "Escribe un mensaje...",
    "rightSidebar.locked.title": "Chat solo para seguidores",
    "rightSidebar.locked.desc": "Sigue a este artista para participar en la conversación.",

    "recommendTab.loading": "Cargando usuarios recomendados...",
    "recommendTab.errorTitle": "Se ha producido un error",
    "recommendTab.errorDesc": "No se pudieron cargar los datos.",
    "recommendTab.emptyTitle": "No hay usuarios que recomendar",
    "recommendTab.emptyDesc.line1": "Aún no hemos encontrado",
    "recommendTab.emptyDesc.line2": "otros fans con gustos similares a los tuyos.",
    "recommendTab.profileAlt": "Perfil de {nickname}",
    "recommendTab.following": "Siguiendo",
    "recommendTab.follow": "Seguir",

    "artistChat.loading": "Cargando mensajes del chat...",
    "artistChat.empty": "Todavía no hay mensajes en el chat.",

    "artistChat.blockSuccessTitle": "Bloqueado",
    "artistChat.blockSuccessDesc": "Has bloqueado a {nickname}.",
    "artistChat.blockErrorTitle": "Error",
    "artistChat.blockErrorDesc": "No se pudo bloquear al usuario. Inténtalo de nuevo.",

    "artistChat.reportTitle": "Reportar a {nickname}",
    "artistChat.reportDesc": "Si ha habido mensajes o comportamientos inapropiados, describe el motivo del reporte.",
    "artistChat.reportPlaceholder": "Ej.: insultos, acoso, mensajes ofensivos, spam, etc.",
    "artistChat.reportSuccessMessage": "Tu reporte se ha enviado. Tomaremos medidas lo antes posible.",
    "artistChat.reportClose": "Cerrar",
    "artistChat.reportSubmit": "Reportar",
    "artistChat.reportSubmitted": "Reportado",

    "artistChat.menuReport": "Reportar",
    "artistChat.menuBlock": "Bloquear",

    "common.confirm": "Aceptar",

    "createRoom.title": "Crear nueva sala",
    "createRoom.field.title.label": "Título de la sala",
    "createRoom.field.title.placeholder": "Introduce un título para la sala",

    "createRoom.youtube.search.label": "Buscar en YouTube",
    "createRoom.youtube.search.placeholder": "Ej.: BLACKPINK",
    "createRoom.youtube.search.button": "Buscar",
    "createRoom.youtube.search.error":
    "Se ha producido un error al buscar en YouTube.",
    "createRoom.youtube.search.loading": "Buscando...",

    "createRoom.youtube.url.label": "URL de YouTube",
    "createRoom.youtube.url.placeholder": "Pega un enlace de YouTube",
    "createRoom.youtube.url.helper":
    "Puedes pegar directamente un enlace de YouTube, o buscar arriba y seleccionar un vídeo para rellenar este campo automáticamente.",

    "createRoom.thumbnail.alt": "Vista previa de la miniatura",
    "createRoom.meta.title.loading": "Cargando título...",
    "createRoom.meta.author.loading": "Cargando canal...",

    "createRoom.lock.label": "¿Requerir contraseña de entrada?",
    "createRoom.lock.yes": "Sí",
    "createRoom.lock.no": "No",

    "createRoom.entryQuestion.label": "Pregunta de entrada",
    "createRoom.entryQuestion.placeholder": "1+1=?",
    "createRoom.entryAnswer.label": "Respuesta",
    "createRoom.entryAnswer.placeholder": "2",

    "createRoom.error.required":
    "Por favor, completa todos los campos obligatorios.",
    "createRoom.error.roomLimit":
    "Ya has creado una sala. Cada usuario solo puede crear una sala a la vez.",
    "createRoom.error.generic":
    "No se pudo crear la sala. Inténtalo de nuevo en unos momentos.",

    "createRoom.cancel": "Cancelar",
    "createRoom.submit.creating": "Creando sala...",
    "createRoom.submit.default": "Crear sala",

    "header.web.homeAria": "Ir a la página principal de DuckOn",
    "header.web.ranking": "Ranking",
    "header.web.login": "Iniciar sesión",
    "header.web.signup": "Registrarse",
    "header.web.mypage": "Mi página",
    "header.web.logout": "Cerrar sesión",

    "leaderboard.loading": "Cargando...",
    "leaderboard.title": "Ranking",
    "leaderboard.subtitle": "Demuestra tu poder de fandom 👑",
    "leaderboard.section.top3": "TOP 3",
    "leaderboard.section.rest": "Del 4.º al 50.º",
    "leaderboard.empty": "Todavía no hay datos en la clasificación.",

    "common.follower": "Seguidores",
    "common.following": "Siguiendo",

    // Perfil en Mi página
    "mypage.profile.title": "Información del perfil",
    "mypage.profile.edit": "Editar perfil",
    "mypage.profile.changePassword": "Cambiar contraseña",

    "mypage.profile.menu.openAria": "Abrir opciones de perfil",
    "mypage.profile.menu.ariaLabel": "Opciones de perfil",
    "mypage.profile.menu.blockList": "Gestionar lista de bloqueados",
    "mypage.profile.menu.deleteAccount": "Eliminar cuenta",

    "mypage.profile.followerListAria": "Abrir lista de seguidores",
    "mypage.profile.followingListAria": "Abrir lista de seguidos",

    "mypage.profile.email": "Correo electrónico",
    "mypage.profile.userId": "ID de usuario",
    "mypage.profile.nickname": "Apodo",
    "mypage.profile.language": "Idioma",

    // Etiquetas de idioma
    "language.ko": "한국어",
    "language.en": "English",
    "language.ja": "日本語",
    "language.zh": "中文",
    "language.es": "Español",
    "language.fr": "Français",

        "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.ok": "Aceptar",

    "mypage.profile.image.change": "Cambiar imagen",
    "mypage.profile.image.resetToDefault": "Volver a la imagen predeterminada",
    "mypage.profile.image.alt": "Imagen de perfil",

    "mypage.profile.error.fileTooLargeTitle": "Tamaño de archivo excedido",
    "mypage.profile.error.fileTooLarge.line1": "La imagen es demasiado grande.",
    "mypage.profile.error.fileTooLarge.currentSizeLabel": "Tamaño del archivo",
    "mypage.profile.error.fileTooLarge.maxSizeLabel": "Límite máximo",
    "mypage.profile.error.fileTooLarge.lineLast": "Por favor, elige una imagen más pequeña.",

    "mypage.profile.error.updateFailTitle": "Error al actualizar el perfil",
    "mypage.profile.error.updateFail.line1": "Se produjo un error al actualizar el perfil.",
    "mypage.profile.error.updateFail.line2": "Vuelve a intentarlo.",

        "mypage.myRooms.title": "Salas que he creado",

    "mypage.myRooms.filter.quick.all": "Todo",
    "mypage.myRooms.filter.quick.7d": "Últimos 7 días",
    "mypage.myRooms.filter.quick.30d": "Últimos 30 días",
    "mypage.myRooms.filter.quick.thisYear": "Este año",

    "mypage.myRooms.filter.period": "Periodo",
    "mypage.myRooms.filter.period.start": "Fecha de inicio",
    "mypage.myRooms.filter.period.end": "Fecha de fin",
    "mypage.myRooms.filter.artist": "Artista",

    "mypage.myRooms.empty.default": "Todavía no has creado ninguna sala.",
    "mypage.myRooms.empty.filtered": "No se crearon salas en este período.",

    "mypage.myRooms.loading": "Cargando...",
    "mypage.myRooms.loadMoreButton": "Cargar más",

    "common.follow": "Seguir",

        "mypage.passwordConfirm.title": "Confirmar contraseña actual",
    "mypage.passwordConfirm.description": "Introduce tu contraseña para editar el perfil.",
    "mypage.passwordConfirm.placeholder": "Introduce tu contraseña actual",
    "mypage.passwordConfirm.error": "La contraseña no coincide.",

        "rankProgress.subtitle.roomCountSuffix": "salas creadas · nivel de actividad",
    "rankProgress.subtitle.activity": "Nivel de actividad",
    "rankProgress.modal.title": "Guía de ranking de DuckOn",
    "rankProgress.modal.close": "Cerrar",

    "live.entryQuiz.defaultPrompt": "Introduce la contraseña (respuesta).",
  "live.loading.playerConnecting": "Conectando con el reproductor...",
  "live.tabs.chat": "Chat en vivo",
  "live.tabs.playlist": "Lista de reproducción",

  "live.modal.deleteRoom.title": "Eliminar sala",
  "live.modal.deleteRoom.description":
    "¿Seguro que quieres eliminar esta sala?",
  "live.modal.deleteRoom.confirm": "Eliminar",
  "live.modal.deleteRoom.cancel": "Cancelar",

  "live.modal.kicked.title": "No se puede entrar",
  "live.modal.kicked.description":
    "Has sido expulsado de esta sala y no puedes entrar.",
  "live.modal.kicked.confirm": "Aceptar",
  },

  fr: {
    "home.trending.title": "Salles populaires",
    "home.trending.viewerSuffix": "personnes regardent",
    "home.trending.swipeHint":
      "Faites glisser vers la gauche ou la droite pour voir d’autres salles",
    "home.trending.emptyTitle":
      "Aucune salle n’a encore été créée.",
    "home.trending.emptyDesc":
      "Soyez le premier à lancer un live !",

    "home.featuredArtists.title": "Artistes à l’honneur",
    "home.featuredArtists.allArtistsCircle": "Tous les artistes",

    "home.quickStart.title": "Commencer rapidement",
    "home.quickStart.swipeHint":
      "Faites glisser pour voir le guide",

    "common.viewAll": "Voir tout →",
    "common.more": "Plus →",
    "common.viewDetail": "Voir les détails →",
    "common.login": "Connexion",
    "common.loadMore": "Voir plus",

    "artistList.title": "Artistes",
    "artistList.subtitle":
      "Découvrez une grande diversité d’artistes K-pop.",
    "artistList.searchLabel": "Rechercher des artistes",
    "artistList.searchPlaceholder":
      "Recherchez un artiste",
    "artistList.totalCount": "Total : {count} artistes",

    "artistList.sort.followersDesc": "Les plus suivis",
    "artistList.sort.nameAsc": "Nom (A–Z)",
    "artistList.sort.nameDesc": "Nom (Z–A)",
    "artistList.sort.debutAsc": "Début (le plus ancien)",
    "artistList.sort.debutDesc": "Début (le plus récent)",

    "artistDetail.notFound":
      "Artiste introuvable.",
    "artistDetail.loginRequiredAlert":
      "La connexion est requise.",
    "artistDetail.requestFailed":
      "Échec du traitement de la demande.",

    "artistDetail.debutLabelShort": "Début ",
    "artistDetail.debutLabelFull": "Début :",

    "artistDetail.following": "Abonné",
    "artistDetail.follow": "+ S’abonner",
    "artistDetail.followVerb": "s’abonner",

    "artistDetail.fantalk.title": "Fan Talk",
    "artistDetail.fantalk.subtitle":
      "Chat en temps réel et fans recommandés au même endroit",
    "artistDetail.fantalk.cta": "Ouvrir >", 

    "artistDetail.live.title": "Salles en direct",
    "artistDetail.live.count":
      "{count} salles en direct",
    "artistDetail.live.loadingShort":
      "Chargement de la liste des salles...",
    "artistDetail.live.loadingLong":
      "Chargement des salles en direct...",
    "artistDetail.live.empty":
      "Aucune diffusion en direct pour le moment.",

    "artistDetail.live.followRequiredPrefix":
      "Vous devez ",
    "artistDetail.live.followRequiredSuffix":
      " cet artiste pour créer une salle.",
    "artistDetail.live.loginRequiredSuffix":
      " pour créer une salle.",
    "artistDetail.live.createRoom": "Créer une salle",

    "leftSidebar.title": "Artistes suivis",
    "leftSidebar.empty": "Vous ne suivez encore aucun artiste.",
    "leftSidebar.more": "Voir plus d’artistes",
    "leftSidebar.goFollow": "Aller suivre des artistes",

    "rightSidebar.tab.chat": "Chat en direct",
    "rightSidebar.tab.recommend": "Recommandé",
    "rightSidebar.tab.recommendFans": "Fans recommandés",
    "rightSidebar.input.placeholder": "Écrivez un message...",
    "rightSidebar.locked.title": "Chat réservé aux abonnés",
    "rightSidebar.locked.desc": "Abonnez-vous à cet artiste pour rejoindre la conversation.",

    "recommendTab.loading": "Chargement des utilisateurs recommandés...",
    "recommendTab.errorTitle": "Une erreur s'est produite",
    "recommendTab.errorDesc": "Échec du chargement des données.",
    "recommendTab.emptyTitle": "Aucun utilisateur à recommander",
    "recommendTab.emptyDesc.line1": "Nous n'avons pas encore trouvé",
    "recommendTab.emptyDesc.line2": "d'autres fans qui partagent vos goûts.",
    "recommendTab.profileAlt": "Profil de {nickname}",
    "recommendTab.following": "Abonné",
    "recommendTab.follow": "S’abonner",

    "artistChat.loading": "Chargement des messages du chat...",
    "artistChat.empty": "Il n’y a pas encore de messages dans le chat.",

    "artistChat.blockSuccessTitle": "Blocage effectué",
    "artistChat.blockSuccessDesc": "Vous avez bloqué {nickname}.",
    "artistChat.blockErrorTitle": "Erreur",
    "artistChat.blockErrorDesc": "Échec du blocage de cet utilisateur. Veuillez réessayer.",

    "artistChat.reportTitle": "Signaler {nickname}",
    "artistChat.reportDesc": "S’il y a eu des messages ou comportements inappropriés, veuillez décrire la raison du signalement.",
    "artistChat.reportPlaceholder": "Ex. : insultes, propos offensants, spam, etc.",
    "artistChat.reportSuccessMessage": "Votre signalement a été envoyé. Nous agirons dès que possible.",
    "artistChat.reportClose": "Fermer",
    "artistChat.reportSubmit": "Signaler",
    "artistChat.reportSubmitted": "Signalé",

    "artistChat.menuReport": "Signaler",
    "artistChat.menuBlock": "Bloquer",

    "common.confirm": "OK",

    "createRoom.title": "Créer une nouvelle salle",
    "createRoom.field.title.label": "Titre de la salle",
    "createRoom.field.title.placeholder": "Saisissez un titre pour la salle",

    "createRoom.youtube.search.label": "Rechercher sur YouTube",
    "createRoom.youtube.search.placeholder": "Ex. : BLACKPINK",
    "createRoom.youtube.search.button": "Rechercher",
    "createRoom.youtube.search.error":
    "Une erreur s’est produite lors de la recherche sur YouTube.",
    "createRoom.youtube.search.loading": "Recherche en cours...",

    "createRoom.youtube.url.label": "URL YouTube",
    "createRoom.youtube.url.placeholder": "Collez un lien YouTube",
    "createRoom.youtube.url.helper":
    "Vous pouvez coller directement un lien YouTube ou rechercher ci-dessus puis sélectionner une vidéo pour remplir ce champ automatiquement.",

    "createRoom.thumbnail.alt": "Aperçu de la vignette",
    "createRoom.meta.title.loading": "Chargement du titre...",
    "createRoom.meta.author.loading": "Chargement de la chaîne...",

    "createRoom.lock.label": "Activer un mot de passe d’entrée",
    "createRoom.lock.yes": "Oui",
    "createRoom.lock.no": "Non",

    "createRoom.entryQuestion.label": "Question d’entrée",
    "createRoom.entryQuestion.placeholder": "1+1=?",
    "createRoom.entryAnswer.label": "Réponse",
    "createRoom.entryAnswer.placeholder": "2",

    "createRoom.error.required":
    "Veuillez remplir tous les champs obligatoires.",
    "createRoom.error.roomLimit":
    "Vous avez déjà créé une salle. Chaque utilisateur ne peut créer qu’une seule salle à la fois.",
    "createRoom.error.generic":
    "Échec de la création de la salle. Veuillez réessayer plus tard.",

    "createRoom.cancel": "Annuler",
    "createRoom.submit.creating": "Création de la salle...",
    "createRoom.submit.default": "Créer la salle",

    "header.web.homeAria": "Aller à l’accueil de DuckOn",
    "header.web.ranking": "Classement",
    "header.web.login": "Connexion",
    "header.web.signup": "Inscription",
    "header.web.mypage": "Mon espace",
    "header.web.logout": "Se déconnecter",

    "leaderboard.loading": "Chargement...",
    "leaderboard.title": "Classement",
    "leaderboard.subtitle": "Prouve ta puissance de fan 👑",
    "leaderboard.section.top3": "TOP 3",
    "leaderboard.section.rest": "De la 4e à la 50e place",
    "leaderboard.empty": "Il n’y a pas encore de données de classement.",

    "common.follower": "Abonnés",
    "common.following": "Abonnements",

    // Profil dans Ma page
    "mypage.profile.title": "Informations du profil",
    "mypage.profile.edit": "Modifier le profil",
    "mypage.profile.changePassword": "Changer le mot de passe",

    "mypage.profile.menu.openAria": "Ouvrir les options du profil",
    "mypage.profile.menu.ariaLabel": "Options du profil",
    "mypage.profile.menu.blockList": "Gérer la liste des blocages",
    "mypage.profile.menu.deleteAccount": "Supprimer le compte",

    "mypage.profile.followerListAria": "Ouvrir la liste des abonnés",
    "mypage.profile.followingListAria": "Ouvrir la liste des abonnements",

    "mypage.profile.email": "E-mail",
    "mypage.profile.userId": "ID utilisateur",
    "mypage.profile.nickname": "Pseudo",
    "mypage.profile.language": "Langue",

    // Libellés de langue
    "language.ko": "한국어",
    "language.en": "English",
    "language.ja": "日本語",
    "language.zh": "中文",
    "language.es": "Español",
    "language.fr": "Français",

        "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.ok": "OK",

    "mypage.profile.image.change": "Changer l’image",
    "mypage.profile.image.resetToDefault": "Revenir à l’image par défaut",
    "mypage.profile.image.alt": "Image de profil",

    "mypage.profile.error.fileTooLargeTitle": "Taille de fichier dépassée",
    "mypage.profile.error.fileTooLarge.line1": "L’image est trop volumineuse.",
    "mypage.profile.error.fileTooLarge.currentSizeLabel": "Taille du fichier",
    "mypage.profile.error.fileTooLarge.maxSizeLabel": "Limite maximale",
    "mypage.profile.error.fileTooLarge.lineLast": "Veuillez choisir une image plus petite.",

    "mypage.profile.error.updateFailTitle": "Échec de la mise à jour du profil",
    "mypage.profile.error.updateFail.line1": "Une erreur s’est produite lors de la mise à jour du profil.",
    "mypage.profile.error.updateFail.line2": "Veuillez réessayer.",

        "mypage.myRooms.title": "Salles que j’ai créées",

    "mypage.myRooms.filter.quick.all": "Tout",
    "mypage.myRooms.filter.quick.7d": "7 derniers jours",
    "mypage.myRooms.filter.quick.30d": "30 derniers jours",
    "mypage.myRooms.filter.quick.thisYear": "Cette année",

    "mypage.myRooms.filter.period": "Période",
    "mypage.myRooms.filter.period.start": "Date de début",
    "mypage.myRooms.filter.period.end": "Date de fin",
    "mypage.myRooms.filter.artist": "Artiste",

    "mypage.myRooms.empty.default": "Vous n’avez pas encore créé de salle.",
    "mypage.myRooms.empty.filtered": "Aucune salle n’a été créée pendant cette période.",

    "mypage.myRooms.loading": "Chargement...",
    "mypage.myRooms.loadMoreButton": "Voir plus",

    "common.follow": "Suivre",

        "mypage.passwordConfirm.title": "Confirmer le mot de passe actuel",
    "mypage.passwordConfirm.description": "Veuillez saisir votre mot de passe pour modifier le profil.",
    "mypage.passwordConfirm.placeholder": "Saisissez votre mot de passe actuel",
    "mypage.passwordConfirm.error": "Le mot de passe ne correspond pas.",

        "rankProgress.subtitle.roomCountSuffix": "salles créées · niveau d’activité",
    "rankProgress.subtitle.activity": "Niveau d’activité",
    "rankProgress.modal.title": "Guide du classement DuckOn",
    "rankProgress.modal.close": "Fermer",

    "live.entryQuiz.defaultPrompt": "Saisissez le mot de passe (réponse).",
  "live.loading.playerConnecting": "Connexion au lecteur...",
  "live.tabs.chat": "Chat en direct",
  "live.tabs.playlist": "Liste de lecture",

  "live.modal.deleteRoom.title": "Supprimer la salle",
  "live.modal.deleteRoom.description":
    "Voulez-vous vraiment supprimer cette salle ?",
  "live.modal.deleteRoom.confirm": "Supprimer",
  "live.modal.deleteRoom.cancel": "Annuler",

  "live.modal.kicked.title": "Entrée impossible",
  "live.modal.kicked.description":
    "Vous avez été expulsé de cette salle et ne pouvez pas y entrer.",
  "live.modal.kicked.confirm": "OK",
  },
};
