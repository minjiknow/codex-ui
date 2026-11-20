// 공통 UI 미리보기 데이터. 실제 검색·로그인·번역 API는 연결하지 않았습니다.
// 미구현 서브 페이지 링크는 #으로 유지합니다.
window.CMSData = {
    "shared": {
        "languages": [
            {
                "template": "shared-language",
                "label": "한국어"
            },
            {
                "template": "shared-language",
                "label": "English"
            },
            {
                "template": "shared-language",
                "label": "日本語"
            },
            {
                "template": "shared-language",
                "label": "中文 ( 简体 )"
            },
            {
                "template": "shared-language",
                "label": "中文 ( 繁體 )"
            },
            {
                "template": "shared-language",
                "label": "Español"
            },
            {
                "template": "shared-language",
                "label": "Pусский"
            }
        ],
        "recentSearches": [
            {
                "template": "shared-recent-search",
                "keyword": "공연장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "전시장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "문화예술회관"
            },
            {
                "template": "shared-recent-search",
                "keyword": "미술관"
            },
            {
                "template": "shared-recent-search",
                "keyword": "박물관"
            },
            {
                "template": "shared-recent-search",
                "keyword": "도서관"
            },
            {
                "template": "shared-recent-search",
                "keyword": "문화센터"
            },
            {
                "template": "shared-recent-search",
                "keyword": "주민문화공간"
            },
            {
                "template": "shared-recent-search",
                "keyword": "체육센터"
            },
            {
                "template": "shared-recent-search",
                "keyword": "종합운동장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "생활체육"
            },
            {
                "template": "shared-recent-search",
                "keyword": "문화행사"
            },
            {
                "template": "shared-recent-search",
                "keyword": "시설대관"
            },
            {
                "template": "shared-recent-search",
                "keyword": "수영장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "축구장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "테니스장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "배드민턴장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "헬스장"
            },
            {
                "template": "shared-recent-search",
                "keyword": "공연 예매"
            },
            {
                "template": "shared-recent-search",
                "keyword": "전시 관람"
            },
            {
                "template": "shared-recent-search",
                "keyword": "체육 프로그램"
            },
            {
                "template": "shared-recent-search",
                "keyword": "문화 강좌"
            },
            {
                "template": "shared-recent-search",
                "keyword": "대관 신청"
            },
            {
                "template": "shared-recent-search",
                "keyword": "행사 일정"
            }
        ]
    },
    "menus": [
        {
            "id": "culture",
            "label": "문화시설",
            "href": "",
            "groups": [
                {
                    "id": "culture-1",
                    "label": "공연·전시시설",
                    "items": [
                        {
                            "id": "theater",
                            "label": "공연장",
                            "href": "#",
                            "description": "다양한 공연과 문화행사가 펼쳐지는 공간으로, 시민들에게 풍성한 문화예술 경험을 제공합니다.",
                            "icon": "sub1"
                        },
                        {
                            "id": "exhibition",
                            "label": "전시장",
                            "href": "#",
                            "description": "다양한 주제의 전시와 작품을 만나볼 수 있는 공간으로, 일상 속에서 문화를 가까이 즐길 수 있습니다.",
                            "icon": "sub2"
                        },
                        {
                            "id": "arts-center",
                            "label": "문화예술회관",
                            "href": "#",
                            "description": "공연, 전시, 교육 등 다양한 문화예술 프로그램을 운영하여 시민들의 문화생활을 지원합니다.",
                            "icon": "sub3"
                        },
                        {
                            "id": "gallery",
                            "label": "미술관",
                            "href": "#",
                            "description": "다양한 미술 작품과 기획전시를 통해 예술을 감상하고 새로운 문화적 영감을 경험할 수 있습니다.",
                            "icon": "sub4"
                        },
                        {
                            "id": "museum",
                            "label": "박물관",
                            "href": "#",
                            "description": "지역의 역사와 문화, 다양한 유물을 전시하여 과거와 현재를 이어주는 문화공간입니다.",
                            "icon": "sub5"
                        }
                    ]
                },
                {
                    "id": "culture-2",
                    "label": "도서·문화공간",
                    "items": [
                        {
                            "id": "library",
                            "label": "도서관",
                            "href": "",
                            "description": "도서 열람과 자료 이용은 물론, 다양한 독서·문화 프로그램을 통해 배움과 휴식을 제공합니다.",
                            "icon": "sub6"
                        },
                        {
                            "id": "culture-center",
                            "label": "문화센터",
                            "href": "#",
                            "description": "교육, 취미, 체험 등 다양한 문화 프로그램을 운영하여 시민들의 여가와 문화활동을 지원합니다.",
                            "icon": "sub7"
                        },
                        {
                            "id": "community",
                            "label": "주민문화공간",
                            "href": "#",
                            "description": "주민들이 자유롭게 소통하고 다양한 문화활동에 참여할 수 있는 열린 생활문화 공간입니다.",
                            "icon": "sub8"
                        },
                        {
                            "id": "other-culture",
                            "label": "기타 문화시설",
                            "href": "#",
                            "description": "다양한 문화활동과 시민 참여를 지원하는 문화시설 정보를 확인하고 편리하게 이용할 수 있습니다.",
                            "icon": "sub9"
                        }
                    ]
                }
            ],
            "items": [],
            "description": "공연·전시시설과 도서·문화공간을 안내합니다."
        },
        {
            "id": "sports",
            "label": "체육시설",
            "href": "",
            "groups": [],
            "items": [
                {
                    "id": "sports-center",
                    "label": "체육센터",
                    "href": "",
                    "description": "다양한 운동과 생활체육을 즐길 수 있는 시설로, 시민들의 건강하고 활기찬 일상을 지원합니다.",
                    "icon": "type1"
                },
                {
                    "id": "stadium",
                    "label": "종합운동장",
                    "href": "",
                    "description": "각종 체육활동과 경기를 즐길 수 있는 공간으로, 다양한 생활체육 및 체육행사를 지원합니다.",
                    "icon": "type1"
                }
            ],
            "description": "체육센터와 종합운동장 이용 정보를 안내합니다."
        },
        {
            "id": "activities",
            "label": "생활체육",
            "href": "./main1.html",
            "groups": [],
            "items": []
        },
        {
            "id": "events",
            "label": "문화행사",
            "href": "#",
            "groups": [],
            "items": []
        },
        {
            "id": "rental",
            "label": "시설대관",
            "href": "#",
            "groups": [],
            "items": []
        }
    ],
    "pages": {
        "main1": {
            "search": {
                "suggestions": [
                    {
                        "template": "shared-suggestion",
                        "highlight": "공주",
                        "suffix": ""
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "공주",
                        "suffix": "시"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "공주",
                        "suffix": " 갑사 철당간"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "공주",
                        "suffix": " 경비행기"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "공주",
                        "suffix": " 계룡산 중악단"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "공주",
                        "suffix": " 고마나루"
                    }
                ]
            }
        }
    }
};

// Static museum event listings for main3-test.html.
window.museumEvents = [
  {
    "id": "50331",
    "title": "2026 아티언스 캠프 예술과 과학 사이 : 다원대화",
    "status": "행사중",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 미래기술관 3층",
      "행사기간": "2026. 11. 17.(화) ~ 11. 28.(토)"
    },
    "image": "../assets/images/2026-아티언스-캠프-예술과-과학-사이-다원대화-50331.jpg"
  },
  {
    "id": "50307",
    "title": "2026 첨단기술 원정대 겨울 시즌 참여 기관 신청 안내",
    "status": "행사예정",
    "info": {
      "행사유형": "체험행사",
      "행사위치": "국립중앙과학관 미래기술관 3층 특별전시실",
      "행사기간": "2026. 12. 5.(토)"
    },
    "image": "../assets/images/2026-첨단기술-원정대-겨울-시즌-참여-기관-신청-안내-50307.jpg"
  },
  {
    "id": "50300",
    "title": "「2026 대한민국 월드리그 조류」 리얼 애니멀매직쇼 & 바다야 날라 특별한 만남",
    "status": "행사예정",
    "info": {
      "행사유형": "강연",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 11. 28.(토)"
    },
    "image": "../assets/images/2026-대한민국-월드리그-조류-리얼-애니멀매직쇼-바다야-날라-50300.png"
  },
  {
    "id": "50297",
    "title": "별의별 과학특강 11월 안내",
    "status": "행사예정",
    "info": {
      "행사유형": "특강",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 11. 21.(토)"
    },
    "image": "../assets/images/별의별-과학특강-11월-안내-50297.jpg"
  },
  {
    "id": "50304",
    "title": "과학 원리를 체험하고 깨우치는 「ORIGINAL 과학마술콘서트 시즌2」 개최",
    "status": "행사종료",
    "info": {
      "행사유형": "공연",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 11. 14.(토)~11. 15.(일)"
    },
    "image": "../assets/images/과학-원리를-체험하고-깨우치는-original-과학마술콘서트-시-50304.png"
  },
  {
    "id": "49812",
    "title": "2026년 11월 시민자연과학 탐사 프로그램",
    "status": "행사종료",
    "info": {
      "행사유형": "강연",
      "행사위치": "국립중앙과학관 창의나래관 2층 나래홀",
      "행사기간": "2026. 11. 14.(토) 14시"
    },
    "image": "../assets/images/2026년-11월-시민자연과학-탐사-프로그램-49812.jpg"
  },
  {
    "id": "49788",
    "title": "「2026 메이커 PLAY」 개최",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 일대, 사이언스홀 등",
      "행사기간": "2026. 10. 31.(토)"
    },
    "image": "../assets/images/2026-메이커-play-개최-49788.jpg"
  },
  {
    "id": "49773",
    "title": "메이커플레이 초청공연 <마리오네트인형극 낭만유랑극단>",
    "status": "행사종료",
    "info": {
      "행사유형": "공연",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 10. 31.(토)"
    },
    "image": "../assets/images/메이커플레이-초청공연-마리오네트인형극-낭만유랑극단-49773.jpg"
  },
  {
    "id": "49766",
    "title": "별의별 과학특강 10월",
    "status": "행사종료",
    "info": {
      "행사유형": "특강",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 10. 24.(토)"
    },
    "image": "../assets/images/별의별-과학특강-10월-49766.png"
  },
  {
    "id": "49765",
    "title": "지구정복, 선을 넘는 메가엔지니어링 제3회 특강",
    "status": "행사종료",
    "info": {
      "행사유형": "특강",
      "행사위치": "국립중앙과학관 창의나래관 2층 나래홀",
      "행사기간": "2026. 10. 18.(일)"
    },
    "image": "../assets/images/지구정복-선을-넘는-메가엔지니어링-제3회-특강-49765.gif"
  },
  {
    "id": "49761",
    "title": "2026년 10월 시민자연과학 탐사",
    "status": "행사종료",
    "info": {
      "행사유형": "강연",
      "행사위치": "국립중앙과학관 창의나래관 나래홀",
      "행사기간": "2026. 10. 17.(토)"
    },
    "image": "../assets/images/2026년-10월-시민자연과학-탐사-49761.jpg"
  },
  {
    "id": "49762",
    "title": "AI 과거시험 주요 프로그램",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "한국과학기술사관, 꿈이 광장, 역사의 광장 등",
      "행사기간": "2026. 10. 9.(금) ~ 10. 10.(토)"
    },
    "image": "../assets/images/ai-과거시험-주요-프로그램-49762.gif"
  },
  {
    "id": "49757",
    "title": "권선징악의 교훈과 함께 떠나는 「해와 달이 된 오누이」 개최 안내",
    "status": "행사종료",
    "info": {
      "행사유형": "공연",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 10. 10.(토)~10. 11.(일)"
    },
    "image": "../assets/images/권선징악의-교훈과-함께-떠나는-해와-달이-된-오누이-개최-안내-49757.jpg"
  },
  {
    "id": "49259",
    "title": "상상이 현실 되는 국방 미래! 보고! 듣고! 체험하는 국방과학 축제 ‘2026 테크콘E’",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 사이언스홀, 꿈이 광장",
      "행사기간": "2026. 10. 15.(목)~10. 17.(토) / 3일간"
    },
    "image": "../assets/images/상상이-현실-되는-국방-미래-보고-듣고-체험하는-국방과학-축제-49259.jpg"
  },
  {
    "id": "49250",
    "title": "AI 과거시험: 무과 훈련생 모집",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 꿈이광장",
      "행사기간": "2026. 10. 9.(금) ~ 10. 10.(토)"
    },
    "image": "../assets/images/ai-과거시험-무과-훈련생-모집-49250.jpg"
  },
  {
    "id": "49244",
    "title": "로보스테이지9: Speed Up!",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 사이언스터널",
      "행사기간": "2026. 9. 19.(토) 14시"
    },
    "image": "../assets/images/로보스테이지9-speed-up-49244.jpg"
  },
  {
    "id": "49243",
    "title": "AI 과거시험: 한국 전통 과학기술 인재를 구하노라",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "한국과학기술사관, 꿈이 광장, 역사의 광장 등",
      "행사기간": "2026. 10. 9.(금) ~ 10. 10.(토)"
    },
    "image": "../assets/images/ai-과거시험-한국-전통-과학기술-인재를-구하노라-49243.gif"
  },
  {
    "id": "49238",
    "title": "2026년 2차 희귀동식물 탐사원정대",
    "status": "행사종료",
    "info": {
      "행사유형": "탐사",
      "행사위치": "대전시 용촌동 갑천 일대",
      "행사기간": "2026. 9. 15.(화) 19:30 ~ 20:30"
    },
    "image": "../assets/images/2026년-2차-희귀동식물-탐사원정대-49238.jpg"
  },
  {
    "id": "49235",
    "title": "\"밀덕들, 전부 모여라\" '2026 TechConE 밀덕 긴급 소집'",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 사이언스홀 및 세미나실",
      "행사기간": "2026. 10. 16.(금) 13:00 ~ 16:00"
    },
    "image": "../assets/images/밀덕들-전부-모여라-2026-techcone-밀덕-긴급-소집-49235.png"
  },
  {
    "id": "49224",
    "title": "추석맞이 연간 브랜드 행사 한가위 과학상회",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 세미나실(공방체험), 꿈이광장(과학시장)",
      "행사기간": "2026. 9. 24.(목)~9. 27.(일) ※ 9. 25.(금) 추성당일 휴관"
    },
    "image": "../assets/images/추석맞이-연간-브랜드-행사-한가위-과학상회-49224.jpg"
  },
  {
    "id": "49223",
    "title": "별의별 과학특강 9월",
    "status": "행사종료",
    "info": {
      "행사유형": "특강",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 9. 19.(토)"
    },
    "image": "../assets/images/별의별-과학특강-9월-49223.jpg"
  },
  {
    "id": "49214",
    "title": "'수(數)상한 과학치료 센터'",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "어린이과학관",
      "행사기간": "2026. 9. 19.(토)~9. 20.(일) 10시~17시"
    },
    "image": "../assets/images/수-상한-과학치료-센터-49214.jpg"
  },
  {
    "id": "49201",
    "title": "마술사와 떠나는 하나의 우주여행 「우주 매직쇼」 개최 안내",
    "status": "행사종료",
    "info": {
      "행사유형": "공연",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 8. 29.(토)~8. 30.(일)"
    },
    "image": "../assets/images/마술사와-떠나는-하나의-우주여행-우주-매직쇼-개최-안내-49201.jpg"
  },
  {
    "id": "49187",
    "title": "「미래과학자 타임머신」 : 과거-현재-미래를 잇는 출연(연) 과학 여행",
    "status": "행사종료",
    "info": {
      "행사유형": "특강 및 체험",
      "행사위치": "국립중앙과학관 행정동 1층 세미나실",
      "행사기간": "2026. 8. 22.(토), 8. 29.(토), 9. 5.(토), 9. 12.(토)"
    },
    "image": "../assets/images/미래과학자-타임머신-과거-현재-미래를-잇는-출연-연-과학-여행-49187.jpg"
  },
  {
    "id": "49175",
    "title": "특별전 연계 KAIST 명상과학연구소 토크콘서트 <명상 중>",
    "status": "행사종료",
    "info": {
      "행사유형": "연계해설",
      "행사위치": "국립중앙과학관 창의나래관 특별전시실",
      "행사기간": "2026. 8. 13.(목)"
    },
    "image": "../assets/images/특별전-연계-kaist-명상과학연구소-토크콘서트-명상-중-49175.jpg"
  },
  {
    "id": "49174",
    "title": "특별전 「생각 중 Thinking or Calculating」연계 휴머노이드 로봇 전시 도슨트",
    "status": "행사종료",
    "info": {
      "행사유형": "연계해설",
      "행사위치": "국립중앙과학관 창의나래관 특별전시실",
      "행사기간": "2026. 8. 14.(토)~8. 16.(일)"
    },
    "image": "../assets/images/특별전-생각-중-thinking-or-calculating-연계-49174.jpg"
  },
  {
    "id": "49169",
    "title": "별의별 과학특강 8월",
    "status": "행사종료",
    "info": {
      "행사유형": "특강",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 8. 15.(토)"
    },
    "image": "../assets/images/별의별-과학특강-8월-49169.jpg"
  },
  {
    "id": "49155",
    "title": "2026 대한민국 월드리그(파충류) 아웃사이더 & TV 생물도감 특별한 만남",
    "status": "행사종료",
    "info": {
      "행사유형": "행사",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 8. 8.(토)"
    },
    "image": "../assets/images/2026-대한민국-월드리그-파충류-아웃사이더-tv-생물도감-특별-49155.jpg"
  },
  {
    "id": "49150",
    "title": "2026년 8월 시민자연과학탐사",
    "status": "행사종료",
    "info": {
      "행사유형": "강연",
      "행사위치": "국립중앙과학관 창의나래관 나래홀",
      "행사기간": "2026. 8. 8.(토)"
    },
    "image": "../assets/images/2026년-8월-시민자연과학탐사-49150.jpg"
  },
  {
    "id": "49148",
    "title": "여름방학 맞이 「제30회 행복나눔 음악회」 공연 안내",
    "status": "행사종료",
    "info": {
      "행사유형": "공연",
      "행사위치": "국립중앙과학관 사이언스홀",
      "행사기간": "2026. 7. 28.(화)"
    },
    "image": "../assets/images/여름방학-맞이-제30회-행복나눔-음악회-공연-안내-49148.jpg"
  }
];

// 행사 안내 페이지의 PC·모바일 공통 메뉴.
window.museumMenus = [
    {
        "id": "visit",
        "label": "관람 안내",
        "href": "https://www.science.go.kr/mps/cntnts/1021/moveCntnts.do",
        "items": [
            {
                "id": "0-0",
                "label": "관람 안내",
                "href": "https://www.science.go.kr/mps/cntnts/1021/moveCntnts.do"
            },
            {
                "id": "0-1",
                "label": "이달의 종합일정",
                "href": "https://www.science.go.kr/mps/schdulMain.do"
            },
            {
                "id": "0-2",
                "label": "편의·식음시설",
                "href": "https://www.science.go.kr/mps/cntnts/1023/moveCntnts.do"
            },
            {
                "id": "0-3",
                "label": "시설 안내",
                "href": "https://www.science.go.kr/mps/cntnts/1026/moveCntnts.do"
            },
            {
                "id": "0-4",
                "label": "위치·주차 안내",
                "href": "https://www.science.go.kr/mps/cntnts/1029/moveCntnts.do"
            }
        ]
    },
    {
        "id": "exhibit",
        "label": "전시 안내",
        "href": "https://www.science.go.kr/mps/cntnts/1168/moveCntnts.do",
        "items": [
            {
                "id": "1-0",
                "label": "전시관 안내",
                "href": "https://www.science.go.kr/mps/cntnts/1168/moveCntnts.do"
            },
            {
                "id": "1-1",
                "label": "전시관 해설/체험",
                "href": "https://www.science.go.kr/mps/cntnts/1042/moveCntnts.do"
            },
            {
                "id": "1-2",
                "label": "특별기획전시",
                "href": "https://www.science.go.kr/mps/1044/bbs/321/moveBbsNttList.do"
            },
            {
                "id": "1-3",
                "label": "과학기술관",
                "href": "https://www.science.go.kr/mps/cntnts/1049/moveCntnts.do"
            },
            {
                "id": "1-4",
                "label": "꿈아띠체험관",
                "href": "https://www.science.go.kr/mps/cntnts/1050/moveCntnts.do"
            },
            {
                "id": "1-5",
                "label": "미래기술관",
                "href": "https://www.science.go.kr/mps/cntnts/1053/moveCntnts.do"
            },
            {
                "id": "1-6",
                "label": "자연사관",
                "href": "https://www.science.go.kr/mps/cntnts/1054/moveCntnts.do"
            },
            {
                "id": "1-7",
                "label": "인류관",
                "href": "https://www.science.go.kr/mps/cntnts/1144/moveCntnts.do"
            },
            {
                "id": "1-8",
                "label": "천체관",
                "href": "https://www.science.go.kr/mps/cntnts/1055/moveCntnts.do"
            },
            {
                "id": "1-9",
                "label": "천체관측소",
                "href": "https://www.science.go.kr/mps/cntnts/1056/moveCntnts.do"
            },
            {
                "id": "1-10",
                "label": "창의나래관",
                "href": "https://www.science.go.kr/mps/cntnts/1060/moveCntnts.do"
            },
            {
                "id": "1-11",
                "label": "어린이과학관",
                "href": "https://www.science.go.kr/mps/cntnts/1063/moveCntnts.do"
            },
            {
                "id": "1-12",
                "label": "생물탐구관",
                "href": "https://www.science.go.kr/mps/cntnts/1064/moveCntnts.do"
            },
            {
                "id": "1-13",
                "label": "야외전시",
                "href": "https://www.science.go.kr/mps/cntnts/1066/moveCntnts.do"
            }
        ]
    },
    {
        "id": "events",
        "label": "행사",
        "href": "main3-test.html",
        "items": [
            {
                "id": "2-0",
                "label": "행사 안내",
                "href": "main3-test.html"
            },
            {
                "id": "2-1",
                "label": "사이언스데이",
                "href": "https://www.science.go.kr/mps/cntnts/1071/moveCntnts.do"
            },
            {
                "id": "2-2",
                "label": "전국학생과학발명품경진대회",
                "href": "https://www.science.go.kr/mps/1074/bbs/154/moveBbsNttList.do"
            },
            {
                "id": "2-3",
                "label": "전국과학전람회",
                "href": "https://www.science.go.kr/mps/1078/bbs/157/moveBbsNttList.do"
            },
            {
                "id": "2-4",
                "label": "국제과학관심포지엄",
                "href": "https://www.science.go.kr/mps/cntnts/1085/moveCntnts.do"
            }
        ]
    },
    {
        "id": "education",
        "label": "교육",
        "href": "https://www.science.go.kr/mps/cntnts/1171/moveCntnts.do",
        "items": [
            {
                "id": "3-0",
                "label": "교육 안내",
                "href": "https://www.science.go.kr/mps/cntnts/1171/moveCntnts.do"
            },
            {
                "id": "3-1",
                "label": "교육프로그램",
                "href": "https://www.science.go.kr/mps/1092/allEduPrograms.do"
            },
            {
                "id": "3-2",
                "label": "교육자료실",
                "href": "https://www.science.go.kr/mps/1099/bbs/428/moveBbsNttList.do"
            }
        ]
    },
    {
        "id": "news",
        "label": "알림ㆍ소통",
        "href": "https://www.science.go.kr/mps/1111/bbs/208/moveBbsNttList.do",
        "items": [
            {
                "id": "4-0",
                "label": "공지사항",
                "href": "https://www.science.go.kr/mps/1111/bbs/208/moveBbsNttList.do"
            },
            {
                "id": "4-1",
                "label": "보도자료",
                "href": "https://www.science.go.kr/mps/1112/bbs/215/moveBbsNttList.do"
            },
            {
                "id": "4-2",
                "label": "채용공고",
                "href": "https://www.science.go.kr/mps/1114/bbs/209/moveBbsNttList.do"
            },
            {
                "id": "4-3",
                "label": "유실물알림",
                "href": "https://www.science.go.kr/mps/1115/bbs/422/moveBbsNttList.do"
            },
            {
                "id": "4-4",
                "label": "국민생각함",
                "href": "https://rsvn.science.go.kr/nsm/rsvguidcntr/think/list?_gl=1*znsqyz*_ga*MjEzNTM2ODY2MC4xNzIyOTIxMzk0*_ga_TCB87CXZZK*MTcyODYwODY2Mi43LjEuMTcyODYxMDAwMi4wLjAuMA.."
            },
            {
                "id": "4-5",
                "label": "전자민원",
                "href": "https://www.epeople.go.kr/index.jsp"
            },
            {
                "id": "4-6",
                "label": "안전점검결과",
                "href": "https://www.science.go.kr/mps/1116/bbs/211/moveBbsNttList.do"
            },
            {
                "id": "4-7",
                "label": "법령자료실",
                "href": "https://www.law.go.kr/"
            },
            {
                "id": "4-8",
                "label": "정보공개",
                "href": "https://www.science.go.kr/mps/cntnts/1121/moveCntnts.do"
            },
            {
                "id": "4-9",
                "label": "110수어/채팅상담",
                "href": "https://www.110.go.kr/consult/cam.do"
            },
            {
                "id": "4-10",
                "label": "기관자료실",
                "href": "https://www.science.go.kr/mps/1126/bbs/222/moveBbsNttList.do"
            }
        ]
    },
    {
        "id": "about",
        "label": "과학관 소개",
        "href": "https://www.science.go.kr/mps/cntnts/1131/moveCntnts.do",
        "items": [
            {
                "id": "5-0",
                "label": "인사말",
                "href": "https://www.science.go.kr/mps/cntnts/1131/moveCntnts.do"
            },
            {
                "id": "5-1",
                "label": "연혁",
                "href": "https://www.science.go.kr/mps/cntnts/1132/moveCntnts.do"
            },
            {
                "id": "5-2",
                "label": "비전 및 추진전략",
                "href": "https://www.science.go.kr/mps/cntnts/1133/moveCntnts.do"
            },
            {
                "id": "5-3",
                "label": "조직 및 업무",
                "href": "https://www.science.go.kr/mps/1134/orgnAndWork.do"
            },
            {
                "id": "5-4",
                "label": "MI 소개",
                "href": "https://www.science.go.kr/mps/cntnts/1135/moveCntnts.do"
            },
            {
                "id": "5-5",
                "label": "VI 소개 및 전용서체",
                "href": "https://www.science.go.kr/mps/cntnts/1137/moveCntnts.do"
            },
            {
                "id": "5-6",
                "label": "캐릭터 소개",
                "href": "https://www.science.go.kr/mps/cntnts/1259/moveCntnts.do"
            },
            {
                "id": "5-7",
                "label": "기증·기탁 안내",
                "href": "https://col.science.go.kr/web/page.do?menuIdx=754"
            },
            {
                "id": "5-8",
                "label": "소장품 대여·열람안내",
                "href": "https://col.science.go.kr/web/page.do?menuIdx=764"
            }
        ]
    },
    {
        "id": "reserve",
        "label": "통합예약",
        "href": "https://rsvn.science.go.kr/nsm/main",
        "items": []
    }
];
