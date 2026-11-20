// main2 UI 재구성용 샘플. 공통 메뉴·검색과 게시판 데이터는 현재 프로젝트에서 재사용. 운영 API 미연동.
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
            "href": "./main2.html",
            "groups": [],
            "items": []
        },
        {
            "id": "rental",
            "label": "시설대관",
            "href": "./main1-other.html",
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
        },
        "main2": {
            "search": {
                "suggestions": [
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": ""
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "시설"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "예술회관"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "센터"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "행사"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": " 강좌"
                    }
                ],
                "mainSuggestions": [
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": ""
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "시설"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "예술회관"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "센터"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "행사"
                    },
                    {
                        "template": "shared-suggestion",
                        "highlight": "문화",
                        "suffix": "강좌"
                    }
                ]
            },
            "news-1": [
                {
                    "id": "news-1-1",
                    "template": "main2-news-1",
                    "href": "#",
                    "title": "가까운 공연·전시 공간 살펴보기",
                    "date": "2026-09-28",
                    "description": "공연장과 전시장의 위치 및 이용 정보를 확인하고 원하는 문화공간을 찾아보세요."
                },
                {
                    "id": "news-1-2",
                    "template": "main2-news-1",
                    "href": "#",
                    "title": "도서관과 문화센터에서 즐기는 문화생활",
                    "date": "2026-09-28",
                    "description": "독서와 문화강좌 등 일상에서 참여할 수 있는 프로그램을 살펴보세요."
                },
                {
                    "id": "news-1-3",
                    "template": "main2-news-1",
                    "href": "#",
                    "title": "생활체육 프로그램 시작하기",
                    "date": "2026-09-28",
                    "description": "수영과 배드민턴 등 관심 있는 종목의 참여 방법과 이용 시설을 확인해 보세요."
                },
                {
                    "id": "news-1-4",
                    "template": "main2-news-1",
                    "href": "#",
                    "title": "문화·체육시설 대관 방법 알아보기",
                    "date": "2026-09-28",
                    "description": "행사나 모임에 필요한 공간의 이용 조건과 신청 절차를 살펴보세요."
                }
            ],
            "notice-1": [
                {
                    "href": "#",
                    "title": "문화시설 운영시간 확인 안내",
                    "date": "2026-09-14",
                    "id": "notice-1-1",
                    "template": "main2-notice-1"
                },
                {
                    "href": "#",
                    "title": "체육시설 이용 전 준비사항 안내",
                    "date": "2026-09-23",
                    "id": "notice-1-2",
                    "template": "main2-notice-1"
                },
                {
                    "href": "#",
                    "title": "문화·체육 프로그램 참여 방법 안내",
                    "date": "2026-09-23",
                    "id": "notice-1-3",
                    "template": "main2-notice-1"
                },
                {
                    "href": "#",
                    "title": "시설대관 신청 절차 안내",
                    "date": "2026-09-23",
                    "id": "notice-1-4",
                    "template": "main2-notice-1"
                }
            ],
            "quick-0": [
                {
                    "template": "main2-quick-1",
                    "title": "문화시설 찾기",
                    "href": "#"
                },
                {
                    "template": "main2-quick-2",
                    "title": "체육시설 찾기",
                    "href": "#"
                },
                {
                    "template": "main2-quick-3",
                    "title": "공연·전시 정보",
                    "href": "#"
                },
                {
                    "template": "main2-quick-4",
                    "title": "생활체육 프로그램",
                    "href": "#"
                },
                {
                    "template": "main2-quick-5",
                    "title": "문화강좌",
                    "href": "#"
                },
                {
                    "template": "main2-quick-6",
                    "title": "문화·체육 행사 일정",
                    "href": "#"
                },
                {
                    "template": "main2-quick-7",
                    "title": "시설대관 안내",
                    "href": "#"
                },
                {
                    "template": "main2-quick-8",
                    "title": "시설 이용안내",
                    "href": "#"
                }
            ],
            "quick-1": [
                {
                    "template": "main2-quick-1",
                    "title": "문화시설 찾기",
                    "href": "#"
                },
                {
                    "template": "main2-quick-2",
                    "title": "체육시설 찾기",
                    "href": "#"
                }
            ],
            "quick-2": [
                {
                    "template": "main2-quick-3",
                    "title": "공연·전시 정보",
                    "href": "#"
                },
                {
                    "template": "main2-quick-5",
                    "title": "문화강좌",
                    "href": "#"
                },
                {
                    "template": "main2-quick-6",
                    "title": "문화·체육 행사 일정",
                    "href": "#"
                }
            ],
            "quick-3": [
                {
                    "template": "main2-quick-4",
                    "title": "생활체육 프로그램",
                    "href": "#"
                },
                {
                    "template": "main2-quick-7",
                    "title": "시설대관 안내",
                    "href": "#"
                },
                {
                    "template": "main2-quick-9",
                    "title": "대관 신청",
                    "href": "#"
                }
            ],
            "services": [
                {
                    "template": "main2-service",
                    "title": "공연·전시",
                    "description": "가까운 공연장과 전시 공간을 찾아 문화생활을 즐겨보세요.",
                    "image": "../assets/images/quick-menu-3-icon.png",
                    "href": "#"
                },
                {
                    "template": "main2-service",
                    "title": "도서·문화공간",
                    "description": "도서관과 문화센터의 공간 및 프로그램을 확인해 보세요.",
                    "image": "../assets/images/quick-menu-1-icon.png",
                    "href": "#"
                },
                {
                    "template": "main2-service",
                    "title": "생활체육",
                    "description": "일상에서 참여할 수 있는 운동 프로그램을 살펴보세요.",
                    "image": "../assets/images/quick-menu-4-icon.png",
                    "href": "#"
                },
                {
                    "template": "main2-service",
                    "title": "체육시설",
                    "description": "체육센터와 종합운동장 이용 정보를 확인해 보세요.",
                    "image": "../assets/images/quick-menu-2-icon.png",
                    "href": "#"
                },
                {
                    "template": "main2-service",
                    "title": "시설대관",
                    "description": "문화·체육시설 대관 절차와 이용 방법을 알아보세요.",
                    "image": "../assets/images/quick-menu-7-icon.png",
                    "href": "#"
                }
            ],
            "guides": [
                {
                    "template": "main2-guide-lightredbg",
                    "title": "문화시설 찾기",
                    "href": "#",
                    "line1": "가까운 공연장과 도서관 등",
                    "line2": "문화시설을 찾아보세요."
                },
                {
                    "template": "main2-guide-lightgreenbg",
                    "title": "체육시설 이용",
                    "href": "#",
                    "line1": "체육센터와 종합운동장의",
                    "line2": "이용 정보를 확인하세요."
                },
                {
                    "template": "main2-guide-lightprimarybg",
                    "title": "시설대관 안내",
                    "href": "#",
                    "line1": "문화·체육시설의 대관 절차와",
                    "line2": "신청 방법을 살펴보세요."
                }
            ]
        }
    }
};
