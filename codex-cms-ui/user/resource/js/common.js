// 템플릿 추가·삭제 관리: common.js에서 공통 기능과 함께 로드합니다.
(function createUILifecycle(global) {
    "use strict";

    const registries = new Set();
    const initializers = new Map();
    const preparedElements = new WeakSet();
    let idSequence = 0;
    let running = false;

    function elements(root, selector) {
        const matches = Array.from(root.querySelectorAll(selector));
        if (root.matches?.(selector)) matches.unshift(root);
        return matches;
    }

    // Accessibility references stay inside the inserted template when its IDs collide.
    function prepareIds(root) {
        const added = new Set(elements(root, "*").filter((element) => root !== document || !preparedElements.has(element)));
        const usedIds = new Set(
            Array.from(document.querySelectorAll("[id]"))
                .filter((element) => !added.has(element))
                .map((element) => element.id),
        );
        const roots = Array.from(added).filter((element) => !added.has(element.parentElement));
        roots.forEach((template) => {
            const remapped = new Map();
            elements(template, "[id]").forEach((element) => {
                const original = element.id;
                if (!original) return;
                if (usedIds.has(original)) {
                    let nextId;
                    do nextId = `${original}-cms-${++idSequence}`;
                    while (document.getElementById(nextId));
                    element.id = nextId;
                    remapped.set(original, nextId);
                }
                usedIds.add(element.id);
            });
            if (!remapped.size) return;
            elements(template, "[aria-controls], [aria-labelledby], [aria-describedby], [for], [list], a[href^='#']").forEach((element) => {
                ["aria-controls", "aria-labelledby", "aria-describedby", "for", "list"].forEach((attribute) => {
                    const value = element.getAttribute(attribute);
                    if (value)
                        element.setAttribute(
                            attribute,
                            value
                                .split(/\s+/)
                                .map((id) => remapped.get(id) || id)
                                .join(" "),
                        );
                });
                const href = element.getAttribute("href");
                if (href?.startsWith("#") && remapped.has(href.slice(1))) element.setAttribute("href", `#${remapped.get(href.slice(1))}`);
            });
        });
        added.forEach((element) => preparedElements.add(element));
    }

    function createRegistry() {
        const scopes = new Map();
        const registry = {
            has: (element) => scopes.has(element),
            create(element) {
                const controller = new AbortController();
                const cleanups = [];
                const timers = new Set();
                const frames = new Set();
                const scope = {
                    element,
                    get active() {
                        return !controller.signal.aborted;
                    },
                    listen(target, type, listener, options = {}) {
                        if (!target || !scope.active) return;
                        const settings = typeof options === "boolean" ? { capture: options } : options;
                        target.addEventListener(type, listener, { ...settings, signal: controller.signal });
                    },
                    cleanup(callback) {
                        cleanups.push(callback);
                    },
                    observe(observer, target, options) {
                        if (!target) return;
                        observer.observe(target, options);
                        scope.cleanup(() => observer.disconnect());
                    },
                    timeout(callback, delay) {
                        const timer = global.setTimeout(() => {
                            timers.delete(timer);
                            if (scope.active) callback();
                        }, delay);
                        timers.add(timer);
                        return timer;
                    },
                    frame(callback) {
                        const frame = global.requestAnimationFrame(() => {
                            frames.delete(frame);
                            if (scope.active) callback();
                        });
                        frames.add(frame);
                        return frame;
                    },
                    destroy() {
                        controller.abort();
                        timers.forEach((timer) => global.clearTimeout(timer));
                        frames.forEach((frame) => global.cancelAnimationFrame(frame));
                        scopes.delete(element);
                        cleanups.reverse().forEach((cleanup) => cleanup());
                    },
                };
                scopes.set(element, scope);
                return scope;
            },
            destroy(root, detachedOnly = false) {
                Array.from(scopes.values())
                    .reverse()
                    .forEach((scope) => {
                        if (detachedOnly ? !scope.element.isConnected : root === scope.element || root.contains(scope.element)) scope.destroy();
                    });
            },
        };
        registries.add(registry);
        return registry;
    }

    const observer = new MutationObserver((records) => {
        const added = records.flatMap((record) => Array.from(record.addedNodes)).filter((node) => node.nodeType === 1 && node.isConnected);
        const roots = added.filter((node) => !added.some((parent) => parent !== node && parent.contains(node)));
        transact(() => {
            roots.forEach(prepareIds);
            initializers.forEach((initialize) => initialize(document));
        });
    });

    // Ignore DOM work performed by initializers, including Swiper's generated markup.
    function transact(callback) {
        if (running) return callback();
        running = true;
        observer.disconnect();
        try {
            registries.forEach((registry) => registry.destroy(document, true));
            callback();
        } finally {
            running = false;
            if (document.body) observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    global.CMSUI = {
        createRegistry,
        register(name, initialize) {
            initializers.set(name, initialize);
            transact(() => {
                prepareIds(document);
                initialize(document);
            });
        },
        init(root = document) {
            transact(() => {
                prepareIds(root);
                initializers.forEach((initialize) => initialize(document));
            });
        },
        destroy(root = document) {
            transact(() => registries.forEach((registry) => registry.destroy(root)));
        },
        // Use after replacing contents within an existing template, before the next paint.
        refresh(root = document) {
            transact(() => {
                registries.forEach((registry) => registry.destroy(root));
                prepareIds(root);
                initializers.forEach((initialize) => initialize(document));
            });
        },
    };
    global.CMSTemplates?.registerLifecycle(global.CMSUI);
})(window);

(function createCommonUI(global) {
    "use strict";
    const initializedComponents = global.CMSUI.createRegistry();
    let accessibilityId = 0;

    function ensureId(element, prefix) {
        if (!element.id) {
            do element.id = `${prefix}-${++accessibilityId}`;
            while (document.getElementById(element.id) !== element);
        }
        return element.id;
    }

    /********************************************************************
    //Start: 아코디언*/
    //*******************************************************************/

    const accordionStates = new WeakMap();
    function getAccordionPanel(button) {
        return button.classList.contains("none") ? null : button.nextElementSibling;
    }

    function setAccordionState(button, expanded, { remember = true } = {}) {
        const panel = getAccordionPanel(button);
        if (!panel) return;
        button.classList.toggle("open", expanded);
        button.setAttribute("aria-expanded", String(expanded));
        panel.hidden = !expanded;
        if (remember) accordionStates.set(button, expanded);
    }

    // PC 메뉴처럼 펼친 내용만 표시할 때도 사용자가 선택한 상태는 보관합니다.
    function setAccordionEnabled(button, enabled) {
        const panel = getAccordionPanel(button);
        if (!panel) return;
        button.disabled = !enabled;
        if (enabled) setAccordionState(button, accordionStates.get(button), { remember: false });
        else {
            button.classList.remove("open");
            button.removeAttribute("aria-expanded");
            panel.hidden = false;
        }
    }

    // 버튼과 바로 다음 패널을 연결합니다. ID 없이도 open 클래스로 펼침 상태를 관리합니다.
    function initAccordion(root = document) {
        // PC 헤더의 GNB만 전용 내비게이션에서 관리합니다.
        const buttons = Array.from(root.querySelectorAll("button.accordion"));
        if (root.matches?.("button.accordion")) buttons.unshift(root);
        buttons.forEach((button) => {
            if (button.hasAttribute("data-menu-group")) return;
            if (button.classList.contains("depth1") && button.closest(".header .gnb")) return;
            if (initializedComponents.has(button)) return;
            const panel = getAccordionPanel(button);
            if (!panel || (button.classList.contains("depth1") && !panel.matches(".depth2-menus"))) {
                button.classList.add("none");
                button.removeAttribute("aria-expanded");
                button.removeAttribute("aria-controls");
                return;
            }
            const scope = initializedComponents.create(button);
            button.setAttribute("aria-controls", ensureId(panel, "accordion-panel"));
            setAccordionState(button, button.classList.contains("open") || button.getAttribute("aria-expanded") === "true");
            scope.listen(button, "click", () => {
                if (button.disabled) return;
                setAccordionState(button, !button.classList.contains("open"));
            });
        });
        root.querySelectorAll(".menupop .gnb, .lnb").forEach(initAccordionMenu);
    }

    // 팝업 종류와 관계없이 LNB와 같은 메뉴 구조의 상태를 공통 관리합니다.
    function initAccordionMenu(navigation) {
        if (initializedComponents.has(navigation)) return;
        const scope = initializedComponents.create(navigation);
        scope.listen(navigation, "click", (event) => {
            const item = event.target.closest(".accordion, a.depth1, a.depth2, a.submenu");
            if (!item || !navigation.contains(item) || item.matches(":disabled")) return;
            const href = item.getAttribute("href");
            if (item.matches("a") && (!href || href === "#")) event.preventDefault();

            const isAccordion = item.matches("button.accordion:not(.none)");
            const group = item.closest(".depth1-menu, .depth2-menu");
            // 말단 링크의 상위 아코디언은 유지하고 같은 단계의 다른 메뉴만 접습니다.
            if (group && item.parentElement === group && (!isAccordion || item.classList.contains("open"))) {
                Array.from(group.parentElement.children).forEach((sibling) => {
                    if (sibling === group) return;
                    const button = sibling.querySelector(":scope > button.accordion:not(.none)");
                    if (button && !button.disabled) setAccordionState(button, false);
                });
            }

            if (isAccordion) return;
            navigation.querySelectorAll(".is-active").forEach((other) => {
                other.classList.remove("is-active");
                other.removeAttribute("aria-current");
                other.removeAttribute("aria-pressed");
            });
            item.classList.add("is-active");
            item.setAttribute(item.matches("button") ? "aria-pressed" : "aria-current", item.matches("button") ? "true" : "page");
        });
    }

    /********************************************************************
     //End: 아코디언*/
    //*******************************************************************/

    /********************************************************************
    //Start: 스크롤 방향에 따라 노출하는 type2 헤더*/
    //*******************************************************************/
    function initScrollHeader(root = document) {
        root.querySelectorAll(".header.type2").forEach((header) => {
            if (header.closest(".wrap")?.querySelector(".breadcrumbs.type1")) return;
            if (initializedComponents.has(header)) return;
            const scope = initializedComponents.create(header);

            const upperArea = header.querySelector(":scope > .contents-wrap");
            const navigation = header.querySelector(":scope > .gnb");
            const scrollThreshold = 8;
            const focusArea = upperArea;
            let lastScrollY = Math.max(global.scrollY, 0);
            let scrollFrame = 0;

            // GNB 위쪽 영역만 숨겨 GNB는 상단에 유지합니다.
            function updateScrollOffset() {
                const offset = navigation?.offsetHeight ? navigation.offsetTop : header.offsetHeight;
                header.style.setProperty("--header-scroll-offset", `${offset}px`);
            }

            updateScrollOffset();
            const headerObserver = new ResizeObserver(updateScrollOffset);
            scope.observe(headerObserver, header);
            if (upperArea) headerObserver.observe(upperArea);
            if (navigation) headerObserver.observe(navigation);

            function updateHeader() {
                const currentScrollY = Math.max(global.scrollY, 0);
                const scrollDelta = currentScrollY - lastScrollY;

                if (currentScrollY === 0 || focusArea?.contains(document.activeElement)) {
                    header.classList.remove("is-scroll-collapsed");
                    lastScrollY = currentScrollY;
                    return;
                }
                if (scrollDelta === 0 || Math.abs(scrollDelta) < scrollThreshold) return;

                header.classList.toggle("is-scroll-collapsed", scrollDelta > 0);
                lastScrollY = currentScrollY;
            }

            scope.listen(
                global,
                "scroll",
                () => {
                    if (scrollFrame) return;
                    scrollFrame = scope.frame(() => {
                        scrollFrame = 0;
                        updateHeader();
                    });
                },
                { passive: true },
            );
            scope.listen(focusArea, "focusin", () => header.classList.remove("is-scroll-collapsed"));
        });
    }

    /********************************************************************
     //End: 스크롤 방향에 따라 노출하는 type2 헤더*/
    //*******************************************************************/

    /********************************************************************
    //Start: 공통 내비게이션*/
    //*******************************************************************/

    // div 팝업에서도 배경 조작과 키보드 포커스를 팝업 안으로 제한합니다.
    function lockPopupBackground(popup) {
        const elements = [];
        let current = popup;
        while (current.parentElement) {
            Array.from(current.parentElement.children).forEach((element) => {
                if (element === current || /^(SCRIPT|STYLE|LINK)$/.test(element.tagName)) return;
                elements.push({ element, wasInert: element.inert });
                element.inert = true;
            });
            if (current.parentElement === document.body) break;
            current = current.parentElement;
        }
        return () =>
            elements.forEach(({ element, wasInert }) => {
                element.inert = wasInert;
            });
    }

    function keepPopupFocus(event, panel) {
        if (event.key !== "Tab") return;
        const focusable = Array.from(panel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]')).filter(
            (element) => element.getClientRects().length && !element.closest("[inert]"),
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first) {
            event.preventDefault();
            panel.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function initNavigation(root) {
        root.querySelectorAll(".header .gnb").forEach((navigation) => {
            initNavigationMenu(root, navigation);
        });
        root.querySelectorAll(".menupop").forEach((popup) => initMenuPopup(root, popup));
    }

    function setMenuState(depthOne, isOpen) {
        depthOne.classList.toggle("active", isOpen && Boolean(depthOne.closest(".header")));
        depthOne.classList.toggle("open", isOpen);
        depthOne.setAttribute("aria-expanded", String(isOpen));
        depthOne.nextElementSibling.hidden = !isOpen;
        depthOne.nextElementSibling.style.display = isOpen ? "block" : "none";
    }

    function initNavigationMenu(root, navigation) {
        if (initializedComponents.has(navigation)) return;
        const scope = initializedComponents.create(navigation);

        const mobile = global.matchMedia("(max-width: 1280px)");
        // 하위 패널이 없는 .accordion.none은 일반 메뉴 버튼입니다.
        const depthOnes = Array.from(navigation.querySelectorAll("button.depth1")).filter((button) => !button.classList.contains("none") && button.nextElementSibling?.matches(".depth2-menus"));
        const hoverMenus = depthOnes.filter((button) => button.nextElementSibling.matches(".depth2-menus.type1"));
        function closeMenus() {
            depthOnes.forEach((button) => setMenuState(button, false));
        }

        depthOnes.forEach((depthOne) => {
            const submenu = depthOne.nextElementSibling;
            depthOne.setAttribute("aria-controls", ensureId(submenu, "navigation-panel"));
            scope.listen(depthOne, "click", (event) => {
                const isHoverClick = hoverMenus.includes(depthOne) && !mobile.matches && event.pointerType === "mouse";
                const shouldOpen = isHoverClick || !depthOne.classList.contains("open");
                depthOnes.forEach((other) => setMenuState(other, other === depthOne && shouldOpen));
            });
            if (hoverMenus.includes(depthOne)) {
                scope.listen(depthOne.parentElement, "pointerenter", (event) => {
                    if (mobile.matches || event.pointerType !== "mouse") return;
                    depthOnes.forEach((other) => setMenuState(other, other === depthOne));
                });
                // 키보드로 대메뉴를 이동할 때도 포커스한 메뉴의 하위 패널을 표시합니다.
                scope.listen(depthOne, "focus", () => {
                    if (mobile.matches) return;
                    depthOnes.forEach((other) => setMenuState(other, other === depthOne));
                });
            }
        });
        // 하위 패널도 내비게이션에 포함해 대메뉴에서 이동할 때 닫히지 않게 합니다.
        scope.listen(navigation, "pointerleave", (event) => {
            if (mobile.matches || event.pointerType !== "mouse") return;
            if (hoverMenus.some((button) => button.classList.contains("active"))) closeMenus();
        });
        scope.listen(navigation, "keydown", (event) => {
            if (event.key !== "Escape") return;
            const activeButton = Array.from(depthOnes).find((button) => button.classList.contains("active"));
            if (!activeButton) return;
            event.preventDefault();
            activeButton.focus();
            closeMenus();
        });
        scope.listen(navigation, "focusout", (event) => {
            if (!navigation.contains(event.relatedTarget)) closeMenus();
        });
        scope.listen(root, "click", (event) => {
            if (!navigation.contains(event.target)) closeMenus();
        });
        navigation.querySelectorAll("button.accordion:not(.none):not(.depth1)").forEach((button) => {
            setAccordionEnabled(button, false);
        });
        scope.listen(mobile, "change", closeMenus);
        closeMenus();
    }

    function initMenuPopup(root, popup) {
        if (initializedComponents.has(popup)) return;
        const navigation = popup.querySelector(".gnb");
        const openButton = Array.from(root.querySelectorAll(".btn-hamburger")).find((button) => button.getAttribute("aria-controls") === popup.id);
        const closeButton = popup.querySelector(".menu-close");
        const panel = popup.querySelector(".pop-contents");
        if (!navigation || !openButton || !closeButton || !panel) return;
        const scope = initializedComponents.create(popup);

        const mobile = global.matchMedia("(max-width: 1280px)");
        const header = openButton.closest(".header");
        const menuContent = popup.querySelector(".menu-content");
        const scrollRoot = menuContent || panel;
        const menuTabs = popup.querySelector(".menu-tabs");
        const searchForm = popup.querySelector(".search-group");
        const input = searchForm?.querySelector('input[type="search"]');
        const noResults = popup.querySelector(".search-no-results");
        const sections = Array.from(navigation.querySelectorAll(".depth1-menu"));
        const tabs = new Map();
        let scrollFrame = 0;
        let hadScrollLock = false;
        let restoreBackground = () => {};

        menuTabs?.querySelectorAll("a.menu-tab[href^='#']").forEach((tab) => {
            const section = document.getElementById(tab.hash.slice(1));
            if (sections.includes(section)) tabs.set(section, tab);
        });

        // 패널을 바꿔 숨기지 않고 한 스크롤 영역에 이어서 표시합니다.
        function updateMenuTabs() {
            if (!menuTabs || !popup.classList.contains("open")) return;
            const visibleSections = sections.filter((section) => !section.hidden);
            const lastSection = visibleSections.at(-1);
            // 짧은 마지막 메뉴도 스크롤 영역 상단까지 올라와 순서대로 선택되도록 공간을 둡니다.
            navigation.style.paddingBottom = lastSection ? `${Math.max(0, scrollRoot.clientHeight - lastSection.getBoundingClientRect().height)}px` : "";
            const threshold = scrollRoot.getBoundingClientRect().top + 24;
            let active = visibleSections[0];
            visibleSections.forEach((section) => {
                if (section.getBoundingClientRect().top <= threshold) active = section;
            });
            tabs.forEach((tab, section) => {
                tab.classList.toggle("active", section === active);
                if (section === active) tab.setAttribute("aria-current", "location");
                else tab.removeAttribute("aria-current");
            });
            const activeTab = tabs.get(active);
            if (!activeTab) return;
            const bounds = menuTabs.getBoundingClientRect();
            const tabBounds = activeTab.getBoundingClientRect();
            if (tabBounds.top < bounds.top) menuTabs.scrollTop += tabBounds.top - bounds.top;
            else if (tabBounds.bottom > bounds.bottom) menuTabs.scrollTop += tabBounds.bottom - bounds.bottom;
        }

        function scheduleMenuTabs() {
            if (!menuTabs || scrollFrame) return;
            scrollFrame = scope.frame(() => {
                scrollFrame = 0;
                updateMenuTabs();
            });
        }

        function scrollToMenu(target, smooth = false) {
            scrollRoot.scrollTo({
                top: scrollRoot.scrollTop + target.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top,
                behavior: smooth && !global.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto",
            });
            scheduleMenuTabs();
        }

        function filterMenus() {
            const keyword = (input?.value || "").trim().toLocaleLowerCase("ko-KR");
            const matches = (element) => Boolean(element?.textContent.toLocaleLowerCase("ko-KR").includes(keyword));
            sections.forEach((section) => {
                const sectionMatches = matches(section.querySelector(".depth1"));
                const sectionGroups = section.querySelectorAll(".depth2-menu");
                sectionGroups.forEach((group) => {
                    const heading = group.querySelector(":scope > .accordion, :scope > .tit, :scope > .submenu > .tit");
                    const groupMatches = sectionMatches || matches(heading);
                    const links = Array.from(group.querySelectorAll(".submenu, .depth2, .accordion.none"));
                    links.forEach((link) => {
                        link.hidden = !groupMatches && !matches(link.querySelector(".submenu-tit, .tit") || link);
                    });
                    group.querySelectorAll("button.accordion:not(.none)").forEach((button) => {
                        const panel = getAccordionPanel(button);
                        if (!panel) return;
                        const items = Array.from(panel.querySelectorAll(".submenu, .depth2, .accordion.none"));
                        if (matches(button))
                            items.forEach((item) => {
                                item.hidden = false;
                            });
                        const visible = groupMatches || matches(button) || items.some((item) => !item.hidden);
                        setAccordionState(button, keyword ? visible : accordionStates.get(button), { remember: false });
                    });
                    group.hidden = !groupMatches && !links.some((link) => !link.hidden);
                });
                section.hidden = !sectionMatches && !Array.from(sectionGroups).some((group) => !group.hidden);
                const depthOne = section.querySelector(":scope > .depth1.accordion:not(.none)");
                if (depthOne) {
                    setAccordionState(depthOne, keyword ? !section.hidden : accordionStates.get(depthOne), { remember: false });
                }
                const tab = tabs.get(section);
                if (tab) tab.hidden = section.hidden;
            });
            if (noResults) noResults.hidden = sections.some((section) => !section.hidden);
            scheduleMenuTabs();
        }

        function resetMenuPopup() {
            closeMenuPopup();
            if (input) input.value = "";
            filterMenus();
        }

        function openMenuPopup() {
            if (!mobile.matches || popup.classList.contains("open")) return;
            hadScrollLock = document.documentElement.classList.contains("layer-open");
            popup.classList.add("open");
            panel.scrollTop = 0;
            scrollRoot.scrollTop = 0;
            openButton.setAttribute("aria-expanded", "true");
            document.documentElement.classList.add("layer-open");
            restoreBackground = lockPopupBackground(popup);
            closeButton.focus();
            scheduleMenuTabs();
        }

        function closeMenuPopup() {
            if (!popup.classList.contains("open")) return;
            popup.classList.remove("open");
            restoreBackground();
            openButton.setAttribute("aria-expanded", "false");
            if (!hadScrollLock) document.documentElement.classList.remove("layer-open");
            if (mobile.matches) openButton.focus({ preventScroll: true });
        }

        scope.listen(openButton, "click", openMenuPopup);
        scope.listen(closeButton, "click", closeMenuPopup);
        scope.listen(popup.querySelector(".pop-bg"), "click", closeMenuPopup);
        scope.listen(popup, "keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeMenuPopup();
                return;
            }
            keepPopupFocus(event, panel);
        });
        scope.listen(input, "input", filterMenus);
        scope.listen(scrollRoot, "scroll", scheduleMenuTabs, { passive: true });
        if (menuTabs) {
            const menuObserver = new ResizeObserver(scheduleMenuTabs);
            menuObserver.observe(navigation);
            scope.observe(menuObserver, scrollRoot);
        }
        scope.listen(navigation, "click", scheduleMenuTabs);
        scope.listen(searchForm, "submit", (event) => {
            event.preventDefault();
            filterMenus();
        });
        scope.listen(popup, "click", (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (!link) return;
            const target = document.getElementById(link.hash.slice(1));
            if (!target || !navigation.contains(target)) return;
            event.preventDefault();
            if (input) input.value = "";
            filterMenus();
            const depthOne = target.closest(".depth1-menu")?.querySelector(":scope > .depth1.accordion:not(.none)");
            if (depthOne) {
                accordionStates.set(depthOne, true);
                setAccordionState(depthOne, true);
            }
            const button = target.closest(".depth2-menu")?.querySelector(".accordion:not(.none)");
            if (button) setAccordionState(button, true);
            target.tabIndex = -1;
            target.focus({ preventScroll: true });
            scrollToMenu(target, Boolean(menuTabs));
        });

        // 로그인·안내·지도는 기존 헤더 버튼의 동작을 그대로 연결합니다.
        const actions = { login: "로그인", guide: "가이드", map: "지도" };
        popup.querySelectorAll("button[name]").forEach((button) => {
            scope.listen(button, "click", () => {
                closeMenuPopup();
                header.querySelector(`button[aria-label="${actions[button.name]}"]`)?.click();
            });
        });
        const language = popup.querySelector('[name="language"]');
        // 선택 항목을 제거해도 전체메뉴 초기화가 중단되지 않도록 합니다.
        if (language) {
            const dropbox = header.querySelector(".dropbox");
            scope.listen(language, "change", () => {
                const option = Array.from(dropbox?.querySelectorAll(".dropbox-option li") || []).find((item) => item.textContent.trim() === language.value);
                option?.click();
            });
            scope.listen(openButton, "click", () => {
                language.value = dropbox?.querySelector(".selected-text")?.textContent.trim() || "한국어";
            });
        }
        scope.listen(mobile, "change", resetMenuPopup);
        scope.cleanup(() => {
            restoreBackground();
            if (!hadScrollLock && popup.classList.contains("open")) document.documentElement.classList.remove("layer-open");
            popup.classList.remove("open");
            openButton.setAttribute("aria-expanded", "false");
        });
        resetMenuPopup();
    }
    /********************************************************************
     //End: 공통 내비게이션*/
    //*******************************************************************/

    /********************************************************************
    //Start: 검색어 지우기*/
    //*******************************************************************/
    function initSearchGroups(root) {
        root.querySelectorAll(".search-group").forEach((group) => {
            if (initializedComponents.has(group)) return;
            const input = group.querySelector("input");
            const clearButton = group.querySelector(".search-clear");
            if (!input || !clearButton) return;
            const scope = initializedComponents.create(group);

            const updateClearButton = () => {
                clearButton.style.display = input.value.length > 0 ? "inline-flex" : "none";
            };
            scope.listen(input, "input", updateClearButton);
            scope.listen(input, "focus", updateClearButton);
            scope.listen(group, "reset", () => scope.timeout(updateClearButton, 0));
            updateClearButton();

            scope.listen(clearButton, "click", (event) => {
                event.preventDefault();
                input.value = "";
                // 메뉴 필터와 연관 검색어도 빈 입력값에 맞춰 갱신합니다.
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.focus();
            });
        });
    }
    /********************************************************************
     //End: 검색어 지우기*/
    //*******************************************************************/

    /********************************************************************
    //Start: 공통 검색 (검색 영역마다 독립적으로 초기화)*/
    //*******************************************************************/
    const searchControllers = new WeakMap();
    let searchListId = 0;

    function initSearchAreas(root) {
        root.querySelectorAll(".search-area").forEach((area) => {
            if (initializedComponents.has(area)) return;

            const form = area.querySelector(".search-group");
            const input = form?.querySelector("input");
            const relatedArea = area.querySelector(".related-searcharea");
            const relatedList = area.querySelector(".related-searchs");
            const noResults = area.querySelector(".search-no-results");
            let status = area.querySelector(".search-status") || area.closest(".searchpop")?.querySelector(".search-status");
            const recentList = area.querySelector(".chip-group");
            const recentClearButton = area.querySelector(".recent-titlearea .delete");
            const recentEmpty = area.querySelector(".chip-empty");
            // 초기 목록이 비어 있어도 기존 칩 원형으로 새 검색어를 추가할 수 있습니다.
            const recentChipTemplate = (area.querySelector('template[data-content-template="shared-recent-search"]')?.content.querySelector(".chip") || recentList?.querySelector(".chip"))?.cloneNode(true);
            if (!input) return;
            const scope = initializedComponents.create(area);
            scope.cleanup(() => searchControllers.delete(area));
            if (!status) {
                status = document.createElement("p");
                status.className = "sr-only search-status";
                status.setAttribute("role", "status");
                status.setAttribute("aria-live", "polite");
                area.append(status);
            }
            const hasSuggestions = Boolean(relatedArea && relatedList);
            if (hasSuggestions) {
                if (!relatedList.id) relatedList.id = `related-search-list-${++searchListId}`;
                input.setAttribute("role", "combobox");
                input.setAttribute("aria-autocomplete", "list");
                input.setAttribute("aria-controls", relatedList.id);
            }
            // 데이터로 출력된 항목과 강조 마크업을 유지하고, 검색어에 따라 표시 여부만 변경합니다.
            const suggestions = Array.from(hasSuggestions ? relatedList.children : [], (option, index) => {
                if (!option.id) option.id = `${relatedList.id}-${index}`;
                option.setAttribute("role", "option");
                option.setAttribute("aria-selected", "false");
                return { element: option, display: option.style.display };
            });
            let visibleSuggestions = [];
            let activeIndex = -1;
            let isComposing = false;

            const normalizeKeyword = (value) =>
                value
                    .trim()
                    .replace(/\s+/g, " ")
                    .slice(0, input.maxLength < 0 ? undefined : input.maxLength);
            const keywordKey = (value) => value.toLocaleLowerCase("ko-KR");
            const isDisplayed = (element) => Boolean(element && element.getClientRects().length && global.getComputedStyle(element).display !== "none");

            // 기본 표시 상태는 CSS에 두고, 동작할 때 display 값만 변경합니다.
            function setDisplay(element, shouldShow, display = "block") {
                if (element) element.style.display = shouldShow ? display : "none";
            }

            function updateRecentSearches() {
                if (!recentList) return;
                recentList.querySelectorAll(".chip").forEach((chip) => {
                    const keyword = chip.querySelector(".recent-keyword")?.textContent;
                    const deleteButton = chip.querySelector(".chip-delete");
                    if (keyword === undefined || !deleteButton) return;
                    const label = `${keyword} 검색어 삭제`;
                    if (deleteButton.getAttribute("aria-label") !== label) deleteButton.setAttribute("aria-label", label);
                });
                const hasKeywords = recentList.childElementCount > 0;
                setDisplay(recentList, hasKeywords, "flex");
                setDisplay(recentClearButton, hasKeywords, "inline-flex");
                setDisplay(recentEmpty, !hasKeywords);
            }

            function addRecentKeyword(keyword) {
                if (!recentList || !recentChipTemplate) return;
                const existingChip = Array.from(recentList.children).find((chip) => keywordKey(chip.querySelector(".recent-keyword").textContent) === keywordKey(keyword));
                const chip = existingChip || recentChipTemplate.cloneNode(true);
                chip.querySelector(".recent-keyword").textContent = keyword;
                chip.querySelector(".recent-keyword").title = keyword;
                recentList.prepend(chip);
                updateRecentSearches();
            }

            function updateSuggestionsHeight() {
                if (!hasSuggestions || !isDisplayed(relatedArea)) return;
                const viewport = global.visualViewport;
                const viewportBottom = viewport ? viewport.offsetTop + viewport.height : global.innerHeight;
                const bottomGap = parseFloat(global.getComputedStyle(relatedArea).getPropertyValue("--gap-5")) || 16;
                const availableHeight = Math.max(0, viewportBottom - relatedArea.getBoundingClientRect().top - bottomGap);
                relatedArea.style.setProperty("--related-search-available-height", `${availableHeight}px`);
            }

            function closeSuggestions() {
                setDisplay(relatedArea, false);
                form.classList.remove("active");
                if (hasSuggestions) input.setAttribute("aria-expanded", "false");
                input.removeAttribute("aria-activedescendant");
                visibleSuggestions.forEach((option) => option.setAttribute("aria-selected", "false"));
                activeIndex = -1;
            }

            function renderSuggestions() {
                const keyword = normalizeKeyword(input.value);
                closeSuggestions();
                const query = keywordKey(keyword);
                visibleSuggestions = [];
                suggestions.forEach(({ element, display }) => {
                    const isMatch = Boolean(keyword) && keywordKey(element.textContent.trim()).includes(query);
                    element.style.display = isMatch ? display : "none";
                    if (isMatch) visibleSuggestions.push(element);
                });
                if (!keyword || !hasSuggestions) return;

                setDisplay(relatedArea, true);
                form.classList.add("active");
                setDisplay(noResults, visibleSuggestions.length === 0);
                updateSuggestionsHeight();
                input.setAttribute("aria-expanded", String(visibleSuggestions.length > 0));
                status.textContent = visibleSuggestions.length ? `연관 검색어 ${visibleSuggestions.length}개가 있습니다.` : "일치하는 연관 검색어가 없습니다. Enter 키로 입력한 검색어를 검색할 수 있습니다.";
            }

            function selectSuggestion(index) {
                const options = visibleSuggestions;
                if (!options.length) return;
                activeIndex = (index + options.length) % options.length;
                options.forEach((option, optionIndex) => option.setAttribute("aria-selected", String(optionIndex === activeIndex)));
                input.setAttribute("aria-activedescendant", options[activeIndex].id);
                options[activeIndex].scrollIntoView({ block: "nearest" });
            }

            function submitKeyword(value) {
                const keyword = normalizeKeyword(value);
                if (!keyword) {
                    status.textContent = "검색어를 입력해 주세요.";
                    input.focus();
                    return;
                }
                input.value = keyword;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.focus();
                renderSuggestions();
                addRecentKeyword(keyword);
                closeSuggestions();
                status.textContent = `${keyword} 검색을 요청했습니다.`;

                // 결과 화면 연동: search:submit의 detail.keyword를 사용합니다.
                (area.closest(".searchpop") || area).dispatchEvent(
                    new CustomEvent("search:submit", {
                        bubbles: true,
                        cancelable: true,
                        detail: { keyword },
                    }),
                );
            }

            if (hasSuggestions) {
                scope.listen(global, "resize", updateSuggestionsHeight);
                scope.listen(document, "scroll", updateSuggestionsHeight, { passive: true, capture: true });
                scope.listen(global.visualViewport, "resize", updateSuggestionsHeight);
                scope.listen(global.visualViewport, "scroll", updateSuggestionsHeight, { passive: true });
            }
            scope.listen(area, "focusout", (event) => {
                if (!area.contains(event.relatedTarget)) closeSuggestions();
            });
            scope.listen(form, "reset", () =>
                scope.timeout(() => {
                    status.textContent = "";
                    closeSuggestions();
                }, 0),
            );
            scope.listen(input, "compositionstart", () => {
                isComposing = true;
            });
            scope.listen(input, "compositionend", () => {
                isComposing = false;
                renderSuggestions();
            });
            scope.listen(input, "input", () => {
                status.textContent = "";
                renderSuggestions();
            });
            scope.listen(input, "focus", renderSuggestions);
            scope.listen(input, "keydown", (event) => {
                if (isComposing || event.isComposing || event.keyCode === 229) return;
                if (hasSuggestions && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                    event.preventDefault();
                    if (!isDisplayed(relatedArea)) renderSuggestions();
                    selectSuggestion(activeIndex < 0 ? (event.key === "ArrowDown" ? 0 : visibleSuggestions.length - 1) : activeIndex + (event.key === "ArrowDown" ? 1 : -1));
                } else if (event.key === "Enter" && activeIndex >= 0 && isDisplayed(relatedArea)) {
                    event.preventDefault();
                    submitKeyword(visibleSuggestions[activeIndex].textContent);
                } else if (event.key === "Escape" && isDisplayed(relatedArea)) {
                    event.preventDefault();
                    event.stopPropagation();
                    closeSuggestions();
                } else if (event.key === "Tab") {
                    closeSuggestions();
                }
            });
            scope.listen(form, "submit", (event) => {
                event.preventDefault();
                if (!isComposing) submitKeyword(input.value);
            });
            scope.listen(relatedList, "mousedown", (event) => event.preventDefault());
            scope.listen(relatedList, "click", (event) => {
                const option = event.target.closest('[role="option"]');
                if (visibleSuggestions.includes(option)) submitKeyword(option.textContent);
            });
            scope.listen(recentList, "click", (event) => {
                const chip = event.target.closest(".chip");
                if (!chip || !recentList.contains(chip)) return;
                const keyword = chip.querySelector(".recent-keyword").textContent;
                if (event.target.closest(".chip-delete")) {
                    const nextChip = chip.nextElementSibling || chip.previousElementSibling;
                    chip.remove();
                    updateRecentSearches();
                    (nextChip?.querySelector(".chip-delete") || input).focus();
                    closeSuggestions();
                    status.textContent = `${keyword} 검색어를 삭제했습니다.`;
                } else if (event.target.closest(".recent-keyword")) {
                    submitKeyword(keyword);
                }
            });
            scope.listen(recentClearButton, "click", () => {
                recentList?.replaceChildren();
                updateRecentSearches();
                input.focus();
                closeSuggestions();
                status.textContent = "최근 검색어를 모두 삭제했습니다.";
            });
            searchControllers.set(area, {
                closeSuggestions,
                reset() {
                    input.value = "";
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                },
                get isComposing() {
                    return isComposing;
                },
            });
            updateRecentSearches();
            renderSuggestions();
        });
    }

    // 팝업에서는 열기·닫기와 포커스·배경 잠금만 관리합니다.
    function initSearchPopup(root) {
        root.querySelectorAll(".searchpop").forEach((popup) => {
            if (initializedComponents.has(popup)) return;
            const dialog = popup.querySelector('[role="dialog"]');
            if (!dialog) return;
            const scope = initializedComponents.create(popup);
            const openButtons = Array.from(root.querySelectorAll(".search-open")).filter((button) => button.getAttribute("aria-controls") === popup.id);
            const controllers = Array.from(popup.querySelectorAll(".search-area"), (area) => searchControllers.get(area)).filter(Boolean);
            let previousFocus = null;
            let restoreBackground = () => {};
            let hadScrollLock = false;
            let isOpen = false;

            function openPopup(button) {
                if (isOpen) return;
                isOpen = true;
                previousFocus = button;
                controllers.forEach((controller) => controller.reset());
                popup.style.display = "block";
                openButtons.forEach((item) => item.setAttribute("aria-expanded", "true"));
                hadScrollLock = document.documentElement.classList.contains("layer-open");
                document.documentElement.classList.add("layer-open");
                restoreBackground = lockPopupBackground(popup);
                dialog.focus();
            }

            function closePopup() {
                if (!isOpen) return;
                isOpen = false;
                popup.style.display = "none";
                controllers.forEach((controller) => controller.closeSuggestions());
                openButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
                restoreBackground();
                if (!hadScrollLock) document.documentElement.classList.remove("layer-open");
                previousFocus?.focus();
            }

            openButtons.forEach((button) => scope.listen(button, "click", () => openPopup(button)));
            popup.querySelectorAll(".search-close, .pop-bg").forEach((button) => scope.listen(button, "click", closePopup));
            scope.cleanup(() => {
                restoreBackground();
                if (isOpen && !hadScrollLock) document.documentElement.classList.remove("layer-open");
                isOpen = false;
                popup.style.display = "none";
                openButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
            });
            scope.listen(popup, "keydown", (event) => {
                if (event.isComposing || event.keyCode === 229 || controllers.some((controller) => controller.isComposing)) return;
                if (event.key === "Escape") {
                    event.preventDefault();
                    closePopup();
                    return;
                }
                keepPopupFocus(event, dialog);
            });
        });
    }
    /********************************************************************
     //End: 공통 검색 및 검색 팝업*/
    //*******************************************************************/

    /********************************************************************
    //Start: 드롭박스*/
    //*******************************************************************/
    function isDisabled(el) {
        return el.classList.contains("disabled") || el.classList.contains("readonly") || el.closest(".dropbox")?.classList.contains("disabled") || el.closest(".dropbox")?.classList.contains("readonly");
    }

    function initDropbox(root) {
        const dropboxes = root.querySelectorAll(".dropbox");
        if (!dropboxes.length) return;

        const setOpen = (box, open) => {
            box.classList.toggle("active", open);
            const list = box.querySelector(".dropbox-option");
            if (list) {
                list.classList.toggle("active", open);
                list.hidden = !open;
                if (!open) {
                    list.querySelectorAll("li").forEach((item) => {
                        item.tabIndex = -1;
                    });
                }
            }
            const trigger = box.querySelector(".selected-text");
            if (trigger?.matches("button")) trigger.setAttribute("aria-expanded", String(open));
        };

        const closeOthers = (current) => {
            document.querySelectorAll(".dropbox").forEach((box) => {
                if (box === current) return;
                setOpen(box, false);
            });
        };

        dropboxes.forEach((dropbox) => {
            // 중복 바인딩 방지
            if (initializedComponents.has(dropbox)) return;

            const option = dropbox.querySelector(".dropbox-option");
            const text = dropbox.querySelector(".selected-text");
            const items = Array.from(option?.querySelectorAll(":scope > li") || []);
            if (!option || !text || !items.length) return;
            const scope = initializedComponents.create(dropbox);

            const isMulti = dropbox.classList.contains("dropbox-multi");
            const placeholder = text.innerText.trim();
            const label = text.dataset.label || "항목 선택";
            let activeIndex = Math.max(0, items.findIndex((item) => item.classList.contains("selected") || item.textContent.trim() === placeholder));
            let typeahead = "";
            let lastTyped = 0;

            text.setAttribute("aria-haspopup", "listbox");
            text.setAttribute("aria-controls", ensureId(option, "dropdown-options"));
            option.setAttribute("role", "listbox");
            option.setAttribute("aria-label", label);
            if (isMulti) option.setAttribute("aria-multiselectable", "true");
            if (!items.some((item) => item.classList.contains("selected"))) items[activeIndex]?.classList.add("selected");

            function updateSelection() {
                items.forEach((item) => {
                    item.setAttribute("role", "option");
                    item.setAttribute("aria-selected", String(item.classList.contains("selected")));
                });
                text.setAttribute("aria-label", `${label}: ${text.textContent.trim()}`);
            }

            function focusOption(index) {
                activeIndex = (index + items.length) % items.length;
                items.forEach((item, itemIndex) => {
                    item.tabIndex = itemIndex === activeIndex ? 0 : -1;
                });
                items[activeIndex]?.focus();
                items[activeIndex]?.scrollIntoView({ block: "nearest" });
            }

            function openOptions(index = activeIndex) {
                closeOthers(dropbox);
                setOpen(dropbox, true);
                if (items.length) focusOption(index);
            }

            function selectOption(item) {
                if (!item || isDisabled(dropbox)) return;
                activeIndex = items.indexOf(item);
                if (isMulti) {
                    item.classList.toggle("selected");
                    text.textContent = items.filter((entry) => entry.classList.contains("selected")).map((entry) => entry.textContent.trim()).join(", ") || placeholder;
                } else {
                    items.forEach((entry) => entry.classList.toggle("selected", entry === item));
                    text.textContent = item.textContent.trim();
                    setOpen(dropbox, false);
                    text.focus();
                }
                updateSelection();
                if (item.dataset.value !== undefined) dropbox.dataset.value = item.dataset.value;
                dropbox.dispatchEvent(new CustomEvent("dropdown:change", { bubbles: true, detail: { value: text.textContent.trim(), id: item.dataset.value } }));
            }

            updateSelection();
            setOpen(dropbox, false);
            scope.cleanup(() => setOpen(dropbox, false));

            // 열기/닫기
            scope.listen(dropbox, "click", (e) => {
                if (isDisabled(dropbox)) return;
                e.stopPropagation();

                if (e.target.closest(".dropbox-option")) return;
                if (option.classList.contains("active")) {
                    setOpen(dropbox, false);
                    text.focus();
                } else openOptions();
            });

            scope.listen(dropbox, "keydown", (e) => {
                if (isDisabled(dropbox) || e.isComposing) return;
                const open = option.classList.contains("active");
                if (e.key === "Escape" && open) {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(dropbox, false);
                    text.focus();
                } else if (e.key === "Tab" && open) {
                    setOpen(dropbox, false);
                    // Continue the browser's normal Tab order from the trigger.
                    text.focus();
                } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
                    e.preventDefault();
                    const index = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : activeIndex + (open ? (e.key === "ArrowDown" ? 1 : -1) : 0);
                    openOptions(index);
                } else if (open && ["Enter", " "].includes(e.key) && e.target !== text) {
                    e.preventDefault();
                    selectOption(items[activeIndex]);
                } else if (open && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    const now = Date.now();
                    typeahead = (now - lastTyped < 700 ? typeahead : "") + e.key.toLocaleLowerCase();
                    lastTyped = now;
                    const match = items.findIndex((item) => item.textContent.trim().toLocaleLowerCase().startsWith(typeahead));
                    if (match >= 0) focusOption(match);
                }
            });
            scope.listen(dropbox, "focusout", (e) => {
                if (!dropbox.contains(e.relatedTarget)) setOpen(dropbox, false);
            });

            // 옵션 클릭
            items.forEach((li) => {
                scope.listen(li, "click", (e) => {
                    if (isDisabled(dropbox)) return;
                    e.stopPropagation();

                    selectOption(li);
                });
            });
            // Each template owns its document subscription as well.
            scope.listen(document, "click", (e) => {
                if (!e.target.closest(".dropbox")) setOpen(dropbox, false);
            });
        });
    }

    /********************************************************************
    //Start: 탭 (콘텐츠 종류와 무관)*/
    //*******************************************************************/
    function initTabs(root) {
        root.querySelectorAll(".tabs, .quicktabs").forEach((tabList) => {
            const group = tabList.closest("[data-tabs]") || tabList.parentElement;
            if (initializedComponents.has(group)) return;
            const tabs = Array.from(tabList?.children || []).filter((child) => child.classList.contains("tab"));
            const panels = Array.from(group.children).filter((child) => child.classList.contains("tabcontents"));
            if (!tabs.length || tabs.length !== panels.length) return;
            const scope = initializedComponents.create(group);
            const moreLink = group.querySelector(":scope > .card-heading > [data-tab-more]");
            tabs.forEach((tab, index) => {
                tab.setAttribute("aria-controls", ensureId(panels[index], "tab-panel"));
                panels[index].setAttribute("aria-labelledby", ensureId(tab, "tab"));
                panels[index].removeAttribute("aria-label");
            });

            function activate(index) {
                tabs.forEach((tab, tabIndex) => {
                    const selected = tabIndex === index;
                    tab.classList.toggle("active", selected);
                    tab.setAttribute("aria-selected", String(selected));
                    tab.tabIndex = selected ? 0 : -1;
                    panels[tabIndex].hidden = !selected;
                });
                if (moreLink) {
                    const activeTab = tabs[index];
                    if (activeTab.dataset.moreHref) moreLink.setAttribute("href", activeTab.dataset.moreHref);
                    moreLink.setAttribute("aria-label", `${activeTab.textContent.trim()} 더보기`);
                }
            }

            tabs.forEach((tab, index) => {
                scope.listen(tab, "click", () => activate(index));
                scope.listen(tab, "keydown", (event) => {
                    const targetIndex = {
                        ArrowRight: (index + 1) % tabs.length,
                        ArrowLeft: (index - 1 + tabs.length) % tabs.length,
                        Home: 0,
                        End: tabs.length - 1,
                    }[event.key];
                    if (targetIndex === undefined) return;
                    event.preventDefault();
                    tabs[targetIndex].focus();
                    activate(targetIndex);
                });
            });

            activate(
                Math.max(
                    0,
                    tabs.findIndex((tab) => tab.classList.contains("active")),
                ),
            );
        });
    }
    /********************************************************************
     //End: 탭
    //*******************************************************************/

    /********************************************************************
    //Start: 퀵 메뉴 드래그 스크롤*/
    //*******************************************************************/
    function initQuickMenuScroll(root) {
        root.querySelectorAll(".quick-menus.x-auto").forEach((scroller) => {
            if (initializedComponents.has(scroller)) return;
            const scope = initializedComponents.create(scroller);

            let activePointerId = null;
            let startX = 0;
            let startScrollLeft = 0;
            let suppressClick = false;

            function finishDrag(event) {
                if (activePointerId !== event.pointerId) return;
                if (scroller.hasPointerCapture(activePointerId)) {
                    scroller.releasePointerCapture(activePointerId);
                }
                activePointerId = null;
                scroller.classList.remove("is-dragging");
            }

            scope.listen(scroller, "pointerdown", (event) => {
                // 터치·펜은 브라우저의 관성 스크롤을 그대로 사용합니다.
                if (event.pointerType !== "mouse" || event.button !== 0 || scroller.scrollWidth <= scroller.clientWidth) return;
                activePointerId = event.pointerId;
                startX = event.clientX;
                startScrollLeft = scroller.scrollLeft;
                suppressClick = false;
                scroller.setPointerCapture(activePointerId);
                scroller.classList.add("is-dragging");
            });

            scope.listen(scroller, "pointermove", (event) => {
                if (activePointerId !== event.pointerId) return;
                const distance = event.clientX - startX;
                if (Math.abs(distance) > 5) {
                    suppressClick = true;
                    event.preventDefault();
                }
                scroller.scrollLeft = startScrollLeft - distance;
            });

            scope.listen(scroller, "pointerup", finishDrag);
            scope.listen(scroller, "pointercancel", (event) => {
                suppressClick = false;
                finishDrag(event);
            });
            scope.listen(scroller, "dragstart", (event) => event.preventDefault());
            scope.listen(scroller, "lostpointercapture", (event) => {
                if (activePointerId !== event.pointerId) return;
                activePointerId = null;
                scroller.classList.remove("is-dragging");
            });

            scope.listen(
                scroller,
                "click",
                (event) => {
                    if (!suppressClick) return;
                    event.preventDefault();
                    event.stopPropagation();
                    suppressClick = false;
                },
                true,
            );
        });
    }

    /********************************************************************
     //End: 퀵 메뉴 드래그 스크롤
    //*******************************************************************/

    // 푸터에 배치한 버튼을 스크롤 시 표시하고 페이지 상단으로 이동합니다.
    function initScrollTop(root) {
        root.querySelectorAll(".scroll-top").forEach((button) => {
            if (initializedComponents.has(button)) return;
            const scope = initializedComponents.create(button);
            let scrollFrame = 0;

            function updateVisibility() {
                scrollFrame = 0;
                button.hidden = global.scrollY <= 0;
            }

            scope.listen(
                global,
                "scroll",
                () => {
                    if (!scrollFrame) scrollFrame = scope.frame(updateVisibility);
                },
                { passive: true },
            );
            scope.listen(button, "click", () => {
                global.scrollTo({
                    top: 0,
                    behavior: global.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                });
            });
            updateVisibility();
        });
    }

    global.CMSUI.register("common", (root) => {
        initScrollTop(root);
        initAccordion(root);
        initScrollHeader(root);
        initNavigation(root);
        initSearchGroups(root);
        initSearchAreas(root);
        initSearchPopup(root);
        initDropbox(root);
        initTabs(root);
        initQuickMenuScroll(root);
    });
})(window);
