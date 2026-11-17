(function createMainUI(global) {
    "use strict";
    const initializedComponents = global.CMSUI.createRegistry();

    /********************************************************************
    //Start: 공통*/
    //*******************************************************************/
    // Restore authored attributes after Swiper removes its styles and generated state.
    function preserveSwiperMarkup(scope, element) {
        const attributes = ["class", "style", "id", "role", "aria-label", "aria-hidden", "inert", "data-swiper-slide-index", "data-card-index"];
        const nodes = [element, ...element.querySelectorAll(".swiper, .swiper-wrapper, .swiper-slide, .card-banner")];
        const snapshots = nodes.map((node) => ({ node, values: attributes.map((attribute) => node.getAttribute(attribute)) }));
        scope.cleanup(() => {
            element.querySelectorAll("[data-card-copy]").forEach((copy) => copy.remove());
            snapshots.forEach(({ node, values }) => {
                attributes.forEach((attribute, index) => {
                    if (values[index] === null) node.removeAttribute(attribute);
                    else node.setAttribute(attribute, values[index]);
                });
            });
        });
    }

    function getSwiperControlWrap(swiperElement) {
        return (
            swiperElement.querySelector(".swiper-control-wrap") || swiperElement.parentElement?.querySelector(":scope > .swiper-control-wrap") || swiperElement.parentElement?.querySelector(":scope > .card-contents > .swiper-control-wrap")
        );
    }

    // Keep keyboard focus on its slide until the user explicitly resumes rotation.
    function initAccessibleAutoplay(scope, element, swiper) {
        const motionQuery = global.matchMedia("(prefers-reduced-motion: reduce)");
        const originalSpeed = swiper.params.speed;
        const controls = getSwiperControlWrap(element);
        const controller = new AbortController();
        const listen = (target, type, listener) => target?.addEventListener(type, listener, { signal: controller.signal });
        scope.cleanup(() => controller.abort());
        swiper.once("destroy", () => controller.abort());
        let userPaused = motionQuery.matches || !swiper.autoplay?.running;
        let hovered = false;

        const isPaused = () => userPaused || motionQuery.matches;
        function syncPlayback() {
            if (!swiper.autoplay || swiper.destroyed) return;
            const paused = isPaused() || hovered || document.hidden;
            if (paused) swiper.autoplay.stop();
            else if (!swiper.autoplay.running) swiper.autoplay.start();
            swiper.params.speed = motionQuery.matches ? 0 : originalSpeed;
        }
        function pauseOnFocus(event) {
            if (event.target.closest(".slide-toggle")) return;
            userPaused = true;
            syncPlayback();
        }
        listen(element, "focusin", pauseOnFocus);
        if (controls && !element.contains(controls)) listen(controls, "focusin", pauseOnFocus);
        listen(element, "pointerenter", (event) => {
            if (event.pointerType !== "mouse") return;
            hovered = true;
            syncPlayback();
        });
        listen(element, "pointerleave", (event) => {
            if (event.pointerType !== "mouse") return;
            hovered = false;
            syncPlayback();
        });
        listen(document, "visibilitychange", syncPlayback);
        listen(motionQuery, "change", syncPlayback);
        syncPlayback();
        return {
            getIsPaused: isPaused,
            onToggleAutoplay() {
                userPaused = !userPaused;
                syncPlayback();
            },
        };
    }

    function syncSingleSlideAccess(swiper) {
        swiper.slides.forEach((slide, index) => {
            const hidden = index !== swiper.activeIndex;
            slide.inert = hidden;
            slide.setAttribute("aria-hidden", String(hidden));
        });
    }

    /********************************************************************
    //Start: 메인 공통 스와이퍼 컨트롤*/
    //*******************************************************************/
    function initSwiperControls(swiperElement, swiper, { slideCount, getActiveIndex, controlLabel, onToggleAutoplay, getIsPaused }) {
        const controlWrap = getSwiperControlWrap(swiperElement);

        if (!controlWrap) {
            return;
        }

        const paginationElement = controlWrap.querySelector(".fraction-pagination");
        const progressBar = controlWrap.querySelector(".swiper-progress-bar");
        const rollingButtons = controlWrap.querySelectorAll(".slide-toggle");
        let currentElement;

        if (paginationElement) {
            currentElement = document.createElement("span");
            currentElement.className = "swiper-pagination-current";

            const divider = document.createTextNode(" / ");
            const totalElement = document.createElement("span");
            totalElement.className = "swiper-pagination-total";
            totalElement.textContent = String(slideCount);
            paginationElement.replaceChildren(currentElement, divider, totalElement);
        }

        function updateControlState() {
            const activeIndex = Math.min(Math.max(getActiveIndex(swiper), 0), slideCount - 1);

            if (currentElement) {
                currentElement.textContent = String(activeIndex + 1);
            }

            if (progressBar) {
                progressBar.style.width = `${((activeIndex + 1) / slideCount) * 100}%`;
            }
        }

        function updateRollingButton(isPaused) {
            if (getIsPaused) isPaused = getIsPaused();
            rollingButtons.forEach((button) => {
                button.classList.toggle("is-paused", isPaused);
                button.setAttribute("aria-pressed", String(isPaused));
                button.setAttribute("aria-label", `${controlLabel} ${isPaused ? "재생" : "정지"}`);
            });
            paginationElement?.setAttribute("aria-live", isPaused ? "polite" : "off");
        }

        function toggleAutoplay() {
            if (onToggleAutoplay) {
                onToggleAutoplay();
                updateRollingButton(!swiper.autoplay?.running);
                return;
            }
            if (!swiper.autoplay) {
                return;
            }

            if (swiper.autoplay.running) {
                swiper.autoplay.stop();
                updateRollingButton(true);
                return;
            }

            swiper.autoplay.start();
            updateRollingButton(false);
        }

        rollingButtons.forEach((button) => button.addEventListener("click", toggleAutoplay));
        swiper.once("destroy", () => {
            rollingButtons.forEach((button) => button.removeEventListener("click", toggleAutoplay));
        });

        swiper.on("slideChange", updateControlState);
        swiper.on("loopFix", updateControlState);
        swiper.on("autoplayStart", () => updateRollingButton(false));
        swiper.on("autoplayStop", () => updateRollingButton(true));

        updateControlState();
        updateRollingButton(!swiper.autoplay?.running);
    }

    /********************************************************************
    //End: 메인 공통 스와이퍼 컨트롤*/
    //*******************************************************************/

    /********************************************************************
    //Start: 전체 배너 스와이퍼 (메인2·메인3)*/
    //*******************************************************************/
    function initWholeBannerSwipers(root) {
        root.querySelectorAll(".wholeBannerSwiper").forEach((wholeSwiperElement) => {
            if (initializedComponents.has(wholeSwiperElement)) return;
            const swiperViewport = wholeSwiperElement.querySelector(":scope > .swiper") || wholeSwiperElement;
            const slideCount = wholeSwiperElement.querySelectorAll(".swiper-wrapper > .swiper-slide").length;
            if (!slideCount) return;
            const scope = initializedComponents.create(wholeSwiperElement);
            preserveSwiperMarkup(scope, wholeSwiperElement);
            const controlWrap = getSwiperControlWrap(wholeSwiperElement);
            const usesBullets = Boolean(controlWrap?.querySelector(".page-btn.type1"));
            const swiper = new global.Swiper(swiperViewport, {
                slideActiveClass: "active",
                slidesPerView: 1,
                spaceBetween: 30,
                pagination: {
                    el: controlWrap?.querySelector(".swiper-pagination"),
                    type: usesBullets ? "bullets" : "fraction",
                    clickable: usesBullets,
                    renderBullet: usesBullets ? (index, className) => `<button type="button" class="${className}" aria-label="메인 배너 ${index + 1}페이지로 이동"></button>` : undefined,
                },
                navigation: {
                    nextEl: wholeSwiperElement.querySelector(".swiper-button-next"),
                    prevEl: wholeSwiperElement.querySelector(".swiper-button-prev"),
                },
                a11y: {
                    prevSlideMessage: "이전 메인 배너 페이지",
                    nextSlideMessage: "다음 메인 배너 페이지",
                },
                on: {
                    init: syncSingleSlideAccess,
                    slideChange: syncSingleSlideAccess,
                    loopFix: syncSingleSlideAccess,
                    transitionEnd: syncSingleSlideAccess,
                },
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                loop: true,
            });

            scope.cleanup(() => swiper.destroy(true, true));
            initSwiperControls(wholeSwiperElement, swiper, {
                slideCount,
                getActiveIndex: (swiperInstance) => swiperInstance.realIndex,
                controlLabel: `${wholeSwiperElement.getAttribute("aria-label") || "전체 배너"} 롤링`,
                ...initAccessibleAutoplay(scope, wholeSwiperElement, swiper),
            });
        });
    }
    /********************************************************************
    //End: 전체 배너 스와이퍼 (메인2·메인3)*/
    //*******************************************************************/

    /********************************************************************
    //Start: 배너 스와이퍼 초기화*/
    //*******************************************************************/
    function initBannerSwipers(root) {
        if (typeof global.Swiper !== "function") return;
        initCenterBannerSwipers(root);
        initWholeBannerSwipers(root);
    }
    /********************************************************************
    //End: 배너 스와이퍼 초기화*/
    //*******************************************************************/

    /********************************************************************
    //Start: 메인 콘텐츠 바로가기*/
    //*******************************************************************/
    function initSectionLinks(root) {
        root.querySelectorAll(".wholeBannerSwiper .card-banner-link, .quick-menus.type2 .quick-link").forEach((link) => {
            if (initializedComponents.has(link)) return;
            const target = root.querySelector(link.querySelector(".quick8") ? ".board-section" : ".card-section");
            if (!target) return;
            const scope = initializedComponents.create(link);
            scope.listen(link, "click", (event) => {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                target.scrollIntoView({ block: "start" });
                target.focus({ preventScroll: true });
            });
        });
    }
    /********************************************************************
    //End: 메인 콘텐츠 바로가기*/
    //*******************************************************************/
    /********************************************************************
    //End: 공통*/
    //*******************************************************************/

    /********************************************************************
    //Start: 메인1*/
    //*******************************************************************/
    /********************************************************************
    //Start: 중심 배너 스와이퍼*/
    //*******************************************************************/
    function initCenterBannerSwipers(root) {
        root.querySelectorAll(".centerBannerSwiper").forEach((heroSwiperElement) => {
            if (initializedComponents.has(heroSwiperElement)) return;
            const slideCount = heroSwiperElement.querySelectorAll(".swiper-wrapper > .swiper-slide").length;
            if (!slideCount) return;
            const scope = initializedComponents.create(heroSwiperElement);
            preserveSwiperMarkup(scope, heroSwiperElement);
            const swiper = new global.Swiper(heroSwiperElement, {
                slideActiveClass: "active",
                slidesPerView: "auto",
                centeredSlides: true,
                spaceBetween: 30,
                pagination: {
                    el: heroSwiperElement.querySelector(".swiper-pagination"),
                    type: "fraction",
                },
                navigation: {
                    nextEl: heroSwiperElement.querySelector(".swiper-button-next"),
                    prevEl: heroSwiperElement.querySelector(".swiper-button-prev"),
                },
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                loop: true,
                breakpoints: {
                    1280: {
                        slidesPerView: "auto",
                        spaceBetween: 16,
                    },
                },
            });

            scope.cleanup(() => swiper.destroy(true, true));
            initSwiperControls(heroSwiperElement, swiper, {
                slideCount,
                getActiveIndex: (swiperInstance) => swiperInstance.realIndex,
                controlLabel: "메인 배너 롤링",
                ...initAccessibleAutoplay(scope, heroSwiperElement, swiper),
            });
        });
    }
    /********************************************************************
    //End: 중심 배너 스와이퍼*/
    //*******************************************************************/

    /********************************************************************
    //Start: 메인 시안 1 카드 스와이퍼*/
    //*******************************************************************/
    function initCardSwiper(root) {
        root.querySelectorAll(".cardSwiper:not(.type1)").forEach(initCardBanner);
    }

    function initCardBanner(cardSwiperElement) {
        if (!cardSwiperElement || typeof global.Swiper !== "function" || initializedComponents.has(cardSwiperElement)) {
            return;
        }

        const wrapperElement = cardSwiperElement.querySelector(".swiper-wrapper");
        const nextButton = cardSwiperElement.querySelector(".swiper-button-next");
        const prevButton = cardSwiperElement.querySelector(".swiper-button-prev");
        const originalSlides = wrapperElement ? Array.from(wrapperElement.children) : [];

        if (!wrapperElement || !originalSlides.length) {
            return;
        }

        const scope = initializedComponents.create(cardSwiperElement);
        preserveSwiperMarkup(scope, cardSwiperElement);

        const originalSlideCount = originalSlides.length;
        const spaceBetween = 16;
        const slideWidth = originalSlides[0].getBoundingClientRect().width || 410;
        const availableScreenWidth = global.screen?.availWidth || cardSwiperElement.clientWidth;
        const layoutWidth = Math.max(cardSwiperElement.clientWidth, availableScreenWidth);
        const visibleSlideCount = Math.ceil((layoutWidth + spaceBetween) / (slideWidth + spaceBetween));
        const minimumLoopSlideCount = visibleSlideCount + 2;
        const repeatCount = Math.max(1, Math.ceil(minimumLoopSlideCount / originalSlideCount));

        originalSlides.forEach((slide, index) => {
            slide.dataset.cardIndex = String(index);
        });

        for (let repeatIndex = 1; repeatIndex < repeatCount; repeatIndex += 1) {
            originalSlides.forEach((slide, cardIndex) => {
                const copy = slide.cloneNode(true);
                copy.dataset.cardIndex = String(cardIndex);
                copy.dataset.cardCopy = "true";
                copy.removeAttribute("id");
                copy.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
                wrapperElement.append(copy);
            });
        }

        function syncCardSwiperState(swiperInstance) {
            const activeSlide = swiperInstance.slides[swiperInstance.activeIndex];
            const visibleSlides = new Set(swiperInstance.visibleSlides);

            swiperInstance.slides.forEach((slide) => {
                const cardIndex = Number(slide.dataset.cardIndex || 0);
                const isVisible = visibleSlides.has(slide) || slide === activeSlide;
                slide.setAttribute("role", "group");
                slide.setAttribute("aria-label", `${cardIndex + 1} / ${originalSlideCount}`);
                slide.toggleAttribute("inert", !isVisible);
                slide.setAttribute("aria-hidden", String(!isVisible));
            });
        }

        const cardSwiper = new global.Swiper(cardSwiperElement, {
            slideActiveClass: "active",
            slidesPerView: "auto",
            centeredSlides: true,
            spaceBetween,
            watchSlidesProgress: true,
            slideToClickedSlide: true,
            loop: true,
            navigation: {
                nextEl: nextButton,
                prevEl: prevButton,
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            a11y: false,
            on: {
                init: syncCardSwiperState,
                slideChange: syncCardSwiperState,
                loopFix: syncCardSwiperState,
                resize: syncCardSwiperState,
                transitionEnd: syncCardSwiperState,
            },
        });

        scope.cleanup(() => {
            cardSwiper.destroy(true, true);
        });
        initSwiperControls(cardSwiperElement, cardSwiper, {
            slideCount: originalSlideCount,
            getActiveIndex: (swiperInstance) => Number(swiperInstance.slides[swiperInstance.activeIndex]?.dataset.cardIndex || 0),
            controlLabel: "AI 요약 카드 롤링",
            ...initAccessibleAutoplay(scope, cardSwiperElement, cardSwiper),
        });
    }

    /********************************************************************
    //End: 메인 시안 1 카드 스와이퍼*/
    //*******************************************************************/

    /********************************************************************
    //Start: 메인 시안 1 행사 스와이퍼*/
    //*******************************************************************/
    function initEventSwiper(root) {
        root.querySelectorAll(".eventSwiper").forEach(initEventBanner);
    }

    function initEventBanner(swiperElement) {
        if (!swiperElement || typeof global.Swiper !== "function" || initializedComponents.has(swiperElement)) {
            return;
        }

        const wrapper = swiperElement.querySelector(".swiper-wrapper");
        const cards = wrapper ? Array.from(wrapper.children).filter((child) => child.matches(".card-banner")) : [];
        const cardsPerPage = 4;
        const mobileQuery = global.matchMedia("(max-width: 1280px)");
        const cardIndexes = new WeakMap(cards.map((card, index) => [card, index]));
        const pages = [];
        let swiper;
        let isGrid;
        let isPaused = false;

        if (!cards.length) return;
        const scope = initializedComponents.create(swiperElement);
        preserveSwiperMarkup(scope, swiperElement);

        function syncVisibleSlides(instance) {
            const visibleSlides = new Set(instance.visibleSlides);
            instance.slides.forEach((slide) => {
                const isVisible = visibleSlides.has(slide);
                slide.toggleAttribute("inert", !isVisible);
                slide.setAttribute("aria-hidden", String(!isVisible));
                const slideCards = isGrid ? slide.querySelectorAll(".card-banner") : [slide];
                slideCards.forEach((card) => {
                    card.setAttribute("aria-label", `${cardIndexes.get(card) + 1} / ${cards.length}`);
                });
            });
        }

        function createSwiper() {
            let cardIndex = 0;
            if (swiper) {
                cardIndex = isGrid ? swiper.realIndex * cardsPerPage : swiper.realIndex % cards.length;
                if (swiper.params.autoplay.enabled) isPaused = !swiper.autoplay.running;
                swiper.destroy(true, true);
            }

            const isMobile = mobileQuery.matches;
            const isType1 = wrapper.classList.contains("type1");
            isGrid = isMobile && isType1;
            const slidesPerView = isGrid ? 1 : isMobile ? 2 : cardsPerPage;
            const slideCount = isGrid ? Math.ceil(cards.length / cardsPerPage) : cards.length;
            const canSlide = slideCount > slidesPerView;

            // Move original cards back before removing the mobile page containers.
            wrapper.append(...cards);
            pages.splice(0).forEach((page) => page.remove());
            cards.forEach((card) => {
                card.classList.toggle("swiper-slide", !isGrid);
                card.removeAttribute("inert");
                card.removeAttribute("aria-hidden");
                card.removeAttribute("data-swiper-slide-index");
            });

            if (isGrid) {
                // Each page owns up to four existing cards; no cards or blank items are copied.
                for (let index = 0; index < cards.length; index += cardsPerPage) {
                    const page = document.createElement("li");
                    page.className = "event-banner-page swiper-slide";
                    const grid = document.createElement("ul");
                    grid.className = "event-banner-grid";
                    grid.append(...cards.slice(index, index + cardsPerPage));
                    page.append(grid);
                    pages.push(page);
                    wrapper.append(page);
                }
            }

            swiperElement.querySelectorAll(".swiper-button-prev, .swiper-button-next").forEach((button) => {
                button.removeAttribute("aria-disabled");
            });

            swiper = new global.Swiper(swiperElement, {
                slidesPerView,
                slidesPerGroup: 1,
                spaceBetween: parseFloat(global.getComputedStyle(wrapper).getPropertyValue("--event-column-gap")) || 0,
                initialSlide: isGrid ? Math.floor(cardIndex / cardsPerPage) : cardIndex,
                loop: canSlide,
                loopAddBlankSlides: false,
                allowTouchMove: canSlide,
                watchSlidesProgress: true,
                autoplay: canSlide
                    ? {
                          delay: 5000,
                          disableOnInteraction: false,
                      }
                    : false,
                navigation: {
                    prevEl: swiperElement.querySelector(".swiper-button-prev"),
                    nextEl: swiperElement.querySelector(".swiper-button-next"),
                },
                a11y: {
                    prevSlideMessage: "이전 행사",
                    nextSlideMessage: "다음 행사",
                    slideRole: "listitem",
                },
                on: {
                    afterInit: syncVisibleSlides,
                    slideChange: syncVisibleSlides,
                    loopFix: syncVisibleSlides,
                    resize: syncVisibleSlides,
                    transitionEnd: syncVisibleSlides,
                },
            });

            if (isPaused && canSlide) swiper.autoplay.stop();
            initSwiperControls(swiperElement, swiper, {
                slideCount,
                getActiveIndex: (instance) => instance.realIndex % slideCount,
                controlLabel: "문화·체육 행사 롤링",
                ...initAccessibleAutoplay(scope, swiperElement, swiper),
            });

            const rollingButton = swiperElement.querySelector(".slide-toggle");
            if (rollingButton) rollingButton.disabled = !canSlide;
        }

        scope.cleanup(() => {
            swiper?.destroy(true, true);
            const remainingCards = Array.from(wrapper.querySelectorAll(".card-banner"));
            wrapper.append(...remainingCards);
            pages.forEach((page) => page.remove());
        });
        createSwiper();
        scope.listen(mobileQuery, "change", createSwiper);
    }
    /********************************************************************
    //End: 메인 시안 1 행사 스와이퍼*/
    //*******************************************************************/

    /********************************************************************
    //End: 메인1*/
    //*******************************************************************/

    /********************************************************************
    //Start: 메인2*/
    //*******************************************************************/
    /********************************************************************
    //Start: 퀵 메뉴·배너 페이지 스와이퍼*/
    //*******************************************************************/
    function initQuickMenuSwipers(root) {
        root.querySelectorAll(".quickMenuSwiper").forEach((element) => {
            if (initializedComponents.has(element)) return;
            const wrapper = element.querySelector(":scope > .swiper-wrapper");
            const list = wrapper?.querySelector(":scope > .quick-menus");
            if (!wrapper || !list) return;
            const scope = initializedComponents.create(element);
            preserveSwiperMarkup(scope, element);

            const controlLabel = element.getAttribute("aria-label") || "퀵 메뉴";
            const controls = element.querySelector(":scope > .quick-menu-controls");
            const prevButtons = element.querySelectorAll(":scope > .swiper-button-prev");
            const nextButtons = element.querySelectorAll(":scope > .swiper-button-next");
            const pagination = controls?.querySelector(".swiper-pagination");
            const toggleButton = controls?.querySelector(".slide-toggle");
            const fraction = controls && document.createElement("div");
            if (fraction) {
                fraction.className = "quick-menu-fraction";
                fraction.setAttribute("role", "status");
                fraction.setAttribute("aria-live", "polite");
                controls.append(fraction);
            }
            const desktopQuery = global.matchMedia("(min-width: 1281px)");
            const motionQuery = global.matchMedia("(prefers-reduced-motion: reduce)");
            const pages = [];

            const items = Array.from(list.children);
            for (let index = 0; index < items.length; index += 6) {
                const page = document.createElement("div");
                const pageList = document.createElement("ul");
                page.className = "swiper-slide quick-menu-page";
                pageList.className = list.className;
                pageList.append(...items.slice(index, index + 6));
                page.append(pageList);
                pages.push(page);
            }
            wrapper.replaceChildren(...pages);

            let swiper = null;
            let paused = false;
            let hovered = false;
            let lastWidth = element.getBoundingClientRect().width;

            function syncControls() {
                if (!controls) return;
                const pageCount = swiper?.slides.length || 0;
                const canSlide = pageCount > 1;
                controls.hidden = !canSlide;
                [...prevButtons, ...nextButtons].forEach((button) => {
                    button.hidden = !canSlide;
                });
                if (fraction) {
                    const currentPage = (swiper?.activeIndex || 0) + 1;
                    const pageText = `${currentPage} / ${pageCount}`;
                    if (fraction.textContent !== pageText) {
                        fraction.textContent = pageText;
                        fraction.setAttribute("aria-label", `${controlLabel} ${pageText} 페이지`);
                    }
                }
                [...prevButtons, ...nextButtons, toggleButton].filter(Boolean).forEach((button) => {
                    button.disabled = !canSlide;
                    if (element.id) button.setAttribute("aria-controls", element.id);
                    else button.removeAttribute("aria-controls");
                });
                if (toggleButton) {
                    const isPaused = paused || motionQuery.matches;
                    toggleButton.classList.toggle("is-paused", isPaused);
                    toggleButton.setAttribute("aria-pressed", String(isPaused));
                    toggleButton.setAttribute("aria-label", controlLabel + " 자동 넘김 " + (isPaused ? "재생" : "정지"));
                    toggleButton.disabled = !canSlide || motionQuery.matches;
                }
                if (!pagination) return;
                if (pagination.children.length !== pageCount) {
                    const bullets = Array.from({ length: pageCount }, (_, index) => {
                        const button = document.createElement("button");
                        button.type = "button";
                        button.className = "swiper-pagination-bullet";
                        button.setAttribute("aria-label", controlLabel + " " + (index + 1) + "페이지로 이동");
                        return button;
                    });
                    pagination.replaceChildren(...bullets);
                }
                Array.from(pagination.children).forEach((button, index) => {
                    const selected = index === swiper.activeIndex;
                    button.classList.toggle("swiper-pagination-bullet-active", selected);
                    if (element.id) button.setAttribute("aria-controls", element.id);
                    else button.removeAttribute("aria-controls");
                    if (selected) button.setAttribute("aria-current", "page");
                    else button.removeAttribute("aria-current");
                });
            }

            function syncPlayback() {
                if (!swiper) return;
                const canPlay =
                    Boolean(toggleButton) && desktopQuery.matches && !motionQuery.matches && swiper.slides.length > 1 && !paused && !hovered && !document.hidden && element.getClientRects().length > 0 && !wrapper.matches(":focus-within");
                if (canPlay && !swiper.autoplay.running) swiper.autoplay.start();
                else if (!canPlay && swiper.autoplay.running) swiper.autoplay.stop();
                syncControls();
            }

            function syncPageAccess(instance) {
                instance.slides.forEach((slide, index) => {
                    const hidden = index !== instance.activeIndex;
                    slide.toggleAttribute("inert", hidden);
                    slide.setAttribute("aria-hidden", String(hidden));
                });
                if (instance === swiper) syncControls();
            }

            function refresh() {
                if (!element.getClientRects().length || !pages.length) {
                    swiper?.autoplay.stop();
                    return;
                }
                if (!swiper) {
                    if (typeof global.Swiper !== "function") return;
                    swiper = new global.Swiper(element, {
                        slidesPerView: 1,
                        slidesPerGroup: 1,
                        spaceBetween: 24,
                        speed: motionQuery.matches ? 0 : 300,
                        rewind: true,
                        watchOverflow: true,
                        allowTouchMove: pages.length > 1,
                        resizeObserver: false,
                        updateOnWindowResize: false,
                        autoplay: {
                            delay: 5000,
                            disableOnInteraction: false,
                            waitForTransition: false,
                        },
                        a11y: {
                            slideLabelMessage: controlLabel + " {{index}} / {{slidesLength}} 페이지",
                        },
                        on: {
                            afterInit: syncPageAccess,
                            slideChange: syncPageAccess,
                        },
                    });
                }
                const pageIndex = swiper.activeIndex;
                swiper.autoplay.stop();
                swiper.params.speed = motionQuery.matches ? 0 : 300;
                swiper.update();
                swiper.slideTo(pageIndex, 0, false);
                syncPageAccess(swiper);
                syncPlayback();
            }

            prevButtons.forEach((button) => scope.listen(button, "click", () => swiper?.slidePrev()));
            nextButtons.forEach((button) => scope.listen(button, "click", () => swiper?.slideNext()));
            scope.listen(pagination, "click", (event) => {
                const button = event.target.closest(".swiper-pagination-bullet");
                const pageIndex = Array.from(pagination.children).indexOf(button);
                if (pageIndex >= 0) swiper?.slideTo(pageIndex);
            });
            scope.listen(toggleButton, "click", () => {
                if (!swiper) return;
                paused = !paused;
                syncPlayback();
            });
            scope.listen(element, "focusin", (event) => {
                if (!event.target.closest(".slide-toggle")) paused = true;
                syncPlayback();
            });
            scope.listen(element, "focusout", () => queueMicrotask(syncPlayback));
            scope.listen(element, "pointerenter", (event) => {
                if (event.pointerType !== "mouse") return;
                hovered = true;
                syncPlayback();
            });
            scope.listen(element, "pointerleave", (event) => {
                if (event.pointerType !== "mouse") return;
                hovered = false;
                syncPlayback();
            });
            const resizeObserver = new ResizeObserver(() => {
                const width = element.getBoundingClientRect().width;
                if (width === lastWidth) return;
                lastWidth = width;
                refresh();
            });
            scope.observe(resizeObserver, element);
            scope.cleanup(() => {
                swiper?.destroy(true, true);
                swiper = null;
                list.replaceChildren(...Array.from(wrapper.querySelectorAll(".quick-menu")));
                wrapper.replaceChildren(list);
                fraction?.remove();
            });
            scope.listen(desktopQuery, "change", refresh);
            scope.listen(motionQuery, "change", refresh);
            scope.listen(document, "visibilitychange", syncPlayback);
            refresh();
        });
    }
    /********************************************************************
    //End: 퀵 메뉴·배너 페이지 스와이퍼*/
    //*******************************************************************/

    /********************************************************************
    //End: 메인2*/
    //*******************************************************************/

    /********************************************************************
    //Start: 메인3*/
    //*******************************************************************/

    /********************************************************************
    //Start: 카드 스와이퍼 type1*/
    //*******************************************************************/
    function initCardType1Swipers(root) {
        if (typeof global.Swiper !== "function") return;
        const motionQuery = global.matchMedia("(prefers-reduced-motion: reduce)");

        root.querySelectorAll(".cardSwiper.type1").forEach((element) => {
            const isSelection = Boolean(element.closest(".today-section"));
            if (initializedComponents.has(element)) return;
            const panel = element.closest('[role="tabpanel"]');
            const selectionContent = element.parentElement.querySelector(":scope > .card-contents");
            const selectionTitle = selectionContent?.querySelector(".card-heading .tit");
            const selectionDescription = selectionContent?.querySelector(".desc");
            const selectionMore = selectionContent?.querySelector(":scope > .more");
            const defaultTitle = selectionTitle?.textContent;
            const defaultDescription = selectionDescription?.textContent;
            const controls = element.parentElement;
            const controlWrap = getSwiperControlWrap(element);
            const controlLabel = element.getAttribute("aria-label");
            const wrapper = element.querySelector(":scope > .swiper-wrapper");
            const originalSlides = wrapper ? Array.from(wrapper.children).filter((slide) => slide.matches(".swiper-slide")) : [];
            const count = originalSlides.length;
            if (!count) return;
            const scope = initializedComponents.create(element);
            preserveSwiperMarkup(scope, element);

            // 모바일에서 초기화해도 데스크톱의 최대 노출 수에 필요한 반복 카드를 확보합니다.
            const maxVisibleCount = parseFloat(global.getComputedStyle(element).getPropertyValue("--card-swiper-max-count")) || 3;
            const minimumSlideCount = Math.ceil(maxVisibleCount) * (isSelection ? 2 : 1) + 1;
            const repeatCount = count > 1 ? Math.max(1, Math.ceil(minimumSlideCount / count)) : 1;
            originalSlides.forEach((slide, index) => {
                slide.dataset.cardIndex = String(index);
            });
            for (let repeatIndex = 1; repeatIndex < repeatCount; repeatIndex += 1) {
                originalSlides.forEach((slide) => {
                    const copy = slide.cloneNode(true);
                    copy.dataset.cardCopy = "true";
                    copy.removeAttribute("id");
                    copy.querySelectorAll("[id]").forEach((child) => child.removeAttribute("id"));
                    wrapper.append(copy);
                });
            }

            let swiper;
            let userPaused = isSelection ? false : motionQuery.matches;
            let hovered = false;
            let selectionIndex = -1;
            let resizePlaybackPending = false;
            let resizeFramePending = false;
            let resizeDelay = null;

            function syncSelection(instance) {
                instance.slides.forEach((slide) => {
                    const visible = slide.classList.contains("swiper-slide-visible");
                    slide.setAttribute("aria-label", `${Number(slide.dataset.cardIndex) + 1} / ${count}`);
                    slide.inert = !visible;
                    slide.setAttribute("aria-hidden", String(!visible));
                });
                if (!panel) return;
                const activeSlide = instance.slides[instance.activeIndex];
                if (isSelection) {
                    const activeIndex = Number(activeSlide?.dataset.cardIndex || 0);
                    if (activeIndex === selectionIndex) return;
                    const activeLink = activeSlide?.querySelector(".card-banner-link");
                    if (selectionTitle) selectionTitle.textContent = activeLink?.getAttribute("aria-label") ?? defaultTitle;
                    if (selectionDescription) selectionDescription.textContent = activeSlide?.dataset.selectionDescription ?? defaultDescription;
                    if (selectionMore && activeLink) selectionMore.setAttribute("href", activeLink.getAttribute("href"));
                    if (selectionIndex >= 0 && !motionQuery.matches) {
                        [selectionTitle, selectionDescription, selectionMore].filter(Boolean).forEach((item) => {
                            item.getAnimations().forEach((animation) => animation.cancel());
                            item.animate(
                                [
                                    { opacity: 0, transform: "translateY(6px)" },
                                    { opacity: 1, transform: "translateY(0)" },
                                ],
                                { duration: 300, easing: "ease-out" },
                            );
                        });
                    }
                    selectionIndex = activeIndex;
                    return;
                }
                if (selectionTitle) selectionTitle.textContent = activeSlide?.querySelector(".tit")?.textContent ?? defaultTitle;
                if (selectionDescription) selectionDescription.textContent = activeSlide?.querySelector(".desc")?.textContent ?? defaultDescription;
            }

            function syncPlayback(delayOverride = null) {
                if (!swiper || !controlWrap) return;
                const focused = controls.contains(document.activeElement);
                const pauseForInteraction = isSelection ? focused && document.activeElement.matches("a") : hovered || focused;
                const paused = userPaused || motionQuery.matches || document.hidden || panel?.hidden || pauseForInteraction || resizePlaybackPending;
                if (paused) swiper.autoplay.stop();
                else if (!swiper.autoplay.running) {
                    const autoplay = swiper.params.autoplay;
                    const delay = autoplay.delay;
                    // start() accepts its delay through params; restore the normal interval immediately.
                    if (Number.isFinite(delayOverride)) autoplay.delay = Math.max(0, delayOverride);
                    try {
                        swiper.autoplay.start();
                        if (swiper.autoplay.paused) swiper.autoplay.resume();
                    } finally {
                        autoplay.delay = delay;
                    }
                }
                else if (swiper.autoplay.paused && !swiper.animating) swiper.autoplay.resume();
                // 포커스·호버에 의한 임시 정지와 사용자가 선택한 정지 상태를 구분합니다.
                const button = controlWrap.querySelector(".slide-toggle");
                if (!button) return;
                button.classList.toggle("is-paused", userPaused || motionQuery.matches);
                button.setAttribute("aria-pressed", String(userPaused || motionQuery.matches));
                button.setAttribute("aria-label", `${controlLabel} ${userPaused || motionQuery.matches ? "재생" : "정지"}`);
            }

            function syncPlaybackAfterResize() {
                if (resizeFramePending) return;
                resizeFramePending = true;
                // 리사이즈의 다음 프레임에서 loop 위치가 바뀐 뒤, 전환 대기로 남은 자동 재생을 이어갑니다.
                scope.frame(() => {
                    scope.frame(() => {
                        resizeFramePending = false;
                        resizePlaybackPending = false;
                        // Avoid Swiper's delayed resize resume interrupting the next transition.
                        global.clearTimeout(swiper?.autoplay.resizeTimeout);
                        // A zero-duration resize can cancel the CSS transition without its end event.
                        if (swiper?.animating) swiper.transitionEnd(false);
                        const remaining = resizeDelay;
                        resizeDelay = null;
                        syncPlayback(remaining);
                    });
                });
            }

            function refresh() {
                if (panel?.hidden) {
                    syncPlayback();
                    return;
                }
                if (!swiper) {
                    swiper = new global.Swiper(element, {
                        slideActiveClass: "swiper-slide-active",
                        slidesPerView: 1.5,
                        centeredSlides: false,
                        resizeObserver: !isSelection,
                        spaceBetween: parseFloat(global.getComputedStyle(element).getPropertyValue("--card-swiper-gap")) || 0,
                        loop: count > 1,
                        watchSlidesProgress: true,
                        speed: motionQuery.matches ? 0 : 450,
                        navigation: {
                            prevEl: controlWrap?.querySelector(".swiper-button-prev"),
                            nextEl: controlWrap?.querySelector(".swiper-button-next"),
                        },
                        autoplay: controlWrap ? { delay: isSelection ? 3000 : 5000, disableOnInteraction: false } : false,
                        a11y: {
                            prevSlideMessage: `${controlLabel} 이전`,
                            nextSlideMessage: `${controlLabel} 다음`,
                            slideRole: element.querySelector(":scope > ul.swiper-wrapper") ? "listitem" : "group",
                            slideLabelMessage: "{{index}} / {{slidesLength}}",
                        },
                        breakpoints: {
                            640: { slidesPerView: "auto" },
                        },
                        on: {
                            init: syncSelection,
                            slideChange: syncSelection,
                            loopFix: syncSelection,
                            transitionEnd: syncSelection,
                            beforeResize: (instance) => {
                                // Preserve the remaining delay instead of restarting it on every resize.
                                if (!resizePlaybackPending) {
                                    resizePlaybackPending = true;
                                    // breakpoint 전환이 autoplay를 잠시 pause해도 남은 시간을 유지합니다.
                                    // 이미 타이머가 끝난 슬라이드 전환만 다음 전체 주기로 시작합니다.
                                    const remaining = instance.autoplay.timeLeft;
                                    resizeDelay = instance.autoplay.running
                                        ? (Number.isFinite(remaining) && remaining > 0 ? remaining : instance.params.autoplay.delay)
                                        : null;
                                }
                                instance.autoplay.stop();
                            },
                            resize: (instance) => {
                                syncSelection(instance);
                                syncPlaybackAfterResize();
                            },
                        },
                    });
                    initSwiperControls(element, swiper, {
                        slideCount: count,
                        getActiveIndex: (instance) => Number(instance.slides[instance.activeIndex]?.dataset.cardIndex || 0),
                        controlLabel,
                        getIsPaused: () => userPaused || motionQuery.matches,
                        onToggleAutoplay: () => {
                            userPaused = !userPaused;
                            syncPlayback();
                        },
                    });
                } else {
                    swiper.update();
                    syncSelection(swiper);
                }
                syncPlayback();
            }

            scope.listen(controls, "focusin", (event) => {
                if (!event.target.closest(".slide-toggle")) userPaused = true;
                syncPlayback();
            });
            scope.listen(controls, "focusout", () => queueMicrotask(syncPlayback));
            scope.listen(element, "pointerenter", (event) => {
                if (event.pointerType !== "mouse") return;
                hovered = true;
                syncPlayback();
            });
            scope.listen(element, "pointerleave", () => {
                hovered = false;
                syncPlayback();
            });
            if (panel) scope.observe(new MutationObserver(refresh), panel, { attributes: true, attributeFilter: ["hidden"] });
            scope.cleanup(() => {
                swiper?.destroy(true, true);
                swiper = null;
            });
            scope.listen(document, "visibilitychange", syncPlayback);
            scope.listen(motionQuery, "change", () => {
                if (swiper) swiper.params.speed = motionQuery.matches ? 0 : 450;
                syncPlayback();
            });
            refresh();
        });
    }
    /********************************************************************
    //End: 카드 스와이퍼 type1*/
    //*******************************************************************/

    /********************************************************************
    //End: 메인3*/
    //*******************************************************************/

    /********************************************************************
    //Start: 공통 초기화*/
    //*******************************************************************/
    global.CMSUI.register("main", (root) => {
        initSectionLinks(root);
        initCardType1Swipers(root);
        initBannerSwipers(root);
        initCardSwiper(root);
        initQuickMenuSwipers(root);
        initEventSwiper(root);
    });
    /********************************************************************
    //End: 공통 초기화*/
    //*******************************************************************/
})(window);
