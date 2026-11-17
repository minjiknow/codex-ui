(function createSubUI(global) {
    "use strict";

    const breadcrumbsRegistry = global.CMSUI.createRegistry();
    const breadcrumbMenusRegistry = global.CMSUI.createRegistry();

    /********************************************************************
    //Start: 서브 breadcrumbs 메뉴 연동 및 페이지 이동*/
    //*******************************************************************/

    function initBreadcrumbMenus(root) {
        const menus = global.CMSData?.menus;
        if (!Array.isArray(menus)) return;

        root.querySelectorAll(".breadcrumbs .breadcrumb-wrap").forEach((breadcrumb) => {
            if (breadcrumbMenusRegistry.has(breadcrumb)) return;
            const [parentBox, childBox] = breadcrumb.querySelectorAll(".dropbox");
            if (!parentBox || !childBox) return;

            const scope = breadcrumbMenusRegistry.create(breadcrumb);

            function navigate(entry) {
                const href = entry?.href?.trim();
                if (href && href !== "#" && global.CMSTemplates.validHref(href)) global.location.assign(href);
            }

            function renderOptions(box, entries, preferredId) {
                const trigger = box.querySelector(".selected-text");
                const list = box.querySelector(".dropbox-option");
                if (!trigger || !list) return;

                // 공통 드롭다운이 보관한 이전 옵션과 이벤트를 정리한 후 다시 초기화합니다.
                global.CMSUI.destroy(box);
                const selected = entries.find((entry) => entry.id === preferredId) || entries[0];
                box.dataset.value = selected?.id || "";
                trigger.textContent = selected?.label || (box === parentBox ? "메뉴 없음" : "하위 메뉴 없음");
                trigger.disabled = !entries.length;
                box.classList.toggle("disabled", !entries.length);
                trigger.setAttribute("aria-expanded", "false");
                trigger.setAttribute("aria-label", `${trigger.dataset.label}: ${trigger.textContent}`);
                list.replaceChildren(
                    ...entries.map((entry) => {
                        const item = document.createElement("li");
                        const text = document.createElement("p");
                        text.className = "option-text";
                        text.textContent = entry.label;
                        item.dataset.value = entry.id;
                        item.classList.toggle("selected", entry === selected);
                        item.append(text);
                        return item;
                    }),
                );
                list.hidden = true;
                global.CMSUI.init(box);
            }

            function updateChildren(parentId, preferredId) {
                const menu = menus.find((entry) => entry.id === parentId);
                const children = menu ? global.CMSTemplates.menuItems(menu) : [];
                childBox.closest(".breadcrumb").hidden = !children.length;
                breadcrumb.classList.toggle("has-no-submenu", !children.length);
                renderOptions(childBox, children, preferredId);
            }

            // 초기 선택은 HTML의 명시적인 메뉴 ID로 지정합니다. 표시 문구와 연결을 분리합니다.
            renderOptions(parentBox, menus, breadcrumb.dataset.currentMenu);
            updateChildren(parentBox.dataset.value, breadcrumb.dataset.currentSubmenu);

            // 현재 문서의 제목은 초기 페이지 ID 기준입니다. 이동하지 않은 메뉴 선택에는 바뀌지 않습니다.
            const currentMenu = menus.find((entry) => entry.id === breadcrumb.dataset.currentMenu);
            const currentPage = currentMenu && global.CMSTemplates.menuItems(currentMenu).find((entry) => entry.id === breadcrumb.dataset.currentSubmenu);
            const pageRoot = breadcrumb.closest("main");
            pageRoot?.querySelectorAll("[data-current-menu-title]").forEach((title) => {
                title.textContent = currentMenu?.label || "";
            });
            pageRoot?.querySelectorAll("[data-current-page-title]").forEach((title) => {
                title.textContent = currentPage?.label || currentMenu?.label || "";
            });

            // 상위 래퍼에서 구독하여 드롭다운 재초기화 이후에도 연동을 유지합니다.
            scope.listen(breadcrumb, "dropdown:change", (event) => {
                const menu = menus.find((entry) => entry.id === parentBox.dataset.value);
                if (event.target === parentBox) {
                    updateChildren(parentBox.dataset.value);
                    if (menu && !global.CMSTemplates.menuItems(menu).length) navigate(menu);
                } else if (event.target === childBox) {
                    const child = menu && global.CMSTemplates.menuItems(menu).find((entry) => entry.id === event.detail.id);
                    navigate(child);
                }
            });
        });
    }

    /********************************************************************
    //End: 서브 breadcrumbs 메뉴 연동 및 페이지 이동*/
    //*******************************************************************/

    /********************************************************************
    //Start: 서브 breadcrumbs 고정 상태 및 헤더 스타일 연동*/
    //*******************************************************************/

    function initStickyBreadcrumbs(root) {
        const header = document.querySelector(".header");
        if (!header) return;

        root.querySelectorAll(" .breadcrumbs.type1").forEach((breadcrumbs) => {
            // 템플릿 재초기화 시 이벤트와 크기 감시 중복 등록 방지
            if (breadcrumbsRegistry.has(breadcrumbs)) return;

            const scope = breadcrumbsRegistry.create(breadcrumbs);
            const handoff = header.matches(".header.type2") && header.parentElement === breadcrumbs.closest(".wrap");
            const navigation = header.querySelector(":scope > .gnb");
            // sticky 요소 자신의 좌표 대신 원래 문서 위치를 측정합니다.
            const anchor = handoff ? document.createElement("div") : null;
            if (anchor) {
                anchor.setAttribute("aria-hidden", "true");
                anchor.style.cssText = "height:0; margin:0; padding:0; border:0; overflow-anchor:none;";
                breadcrumbs.before(anchor);
            }
            let frame = 0;
            let headerTransitioning = false;
            let headerCollapsed = header.classList.contains("is-scroll-collapsed");
            let lastScrollY = Math.max(global.scrollY, 0);
            let revealHeader = false;

            // 고정된 breadcrumbs가 있으면 헤더 그림자를 경계선 전환
            function syncHeaderState() {
                header.classList.toggle("has-fixed", Boolean(document.querySelector(".breadcrumbs.type1.is-fixed")));
            }

            function updateState() {
                frame = 0;
                if (handoff) {
                    const navigationHeight = navigation?.offsetHeight || 0;
                    const upperHeight = header.offsetHeight - navigationHeight;
                    const anchorTop = anchor.getBoundingClientRect().top;
                    const currentScrollY = Math.max(global.scrollY, 0);
                    const delta = currentScrollY - lastScrollY;
                    if (currentScrollY === 0) {
                        revealHeader = false;
                        lastScrollY = currentScrollY;
                    } else if (Math.abs(delta) >= 8) {
                        revealHeader = delta < 0;
                        lastScrollY = currentScrollY;
                    }
                    // breadcrumb가 헤더 아래에 닿는 구간에서만 상단 영역을 다시 노출합니다.
                    const upperArea = header.querySelector(":scope > .contents-wrap");
                    const inStickyRegion = currentScrollY > 0 && anchorTop <= upperHeight;
                    const revealed = inStickyRegion && (revealHeader || upperArea?.contains(document.activeElement));
                    const push = Math.min(navigationHeight, Math.max(0, navigationHeight - anchorTop));
                    // 퇴장 중에도 GNB를 숨겨 로고 영역과 breadcrumb만 함께 이동합니다.
                    if (inStickyRegion && !revealed && header.classList.contains("is-breadcrumb-revealed")) {
                        header.classList.add("is-breadcrumb-hiding");
                    }
                    if (revealed || !inStickyRegion) header.classList.remove("is-breadcrumb-hiding");
                    header.classList.toggle("is-breadcrumb-revealed", revealed);
                    header.style.setProperty("--header-hidden-navigation-height", `${navigationHeight}px`);
                    header.style.setProperty("--header-breadcrumb-top", `${revealed ? 0 : -upperHeight - push}px`);
                }
                const headerBounds = header.getBoundingClientRect();
                const navigationHeight = navigation?.offsetHeight || 0;
                if (handoff && headerBounds.bottom <= 0.5) {
                    header.classList.remove("is-breadcrumb-hiding");
                }
                const clipped = header.matches(".is-breadcrumb-revealed, .is-breadcrumb-hiding");
                const top = handoff
                    ? Math.max(0, headerBounds.bottom - (clipped ? navigationHeight : 0))
                    : Math.max(0, headerBounds.bottom);
                const offset = `${top}px`;
                if (breadcrumbs.style.getPropertyValue("--breadcrumbs-auto-top") !== offset) {
                    breadcrumbs.style.setProperty("--breadcrumbs-auto-top", offset);
                }

                const bounds = breadcrumbs.getBoundingClientRect();
                const appliedTop = parseFloat(global.getComputedStyle(breadcrumbs).top) || 0;
                const isStuck = bounds.height > 0 && Math.abs(bounds.top - appliedTop) < 1;
                breadcrumbs.classList.toggle("is-fixed", isStuck);
                syncHeaderState();
                if (headerTransitioning) scheduleUpdate();
            }

            function scheduleUpdate() {
                if (!frame) frame = scope.frame(updateState);
            }

            scope.listen(global, "scroll", scheduleUpdate, { passive: true });
            scope.listen(global, "resize", scheduleUpdate);
            scope.listen(global, "pageshow", scheduleUpdate);
            scope.listen(global, "load", scheduleUpdate);
            if (handoff) {
                scope.listen(header, "focusin", scheduleUpdate);
                scope.listen(header, "focusout", scheduleUpdate);
            }

            // 위치 전환은 ResizeObserver로 감지되지 않으므로 전환 중에만 위치를 계속 측정합니다.
            function trackHeaderTransition(event) {
                if (event.target !== header || event.propertyName !== (handoff ? "top" : "transform")) return;
                headerTransitioning = event.type === "transitionrun";
                scheduleUpdate();
            }
            scope.listen(header, "transitionrun", trackHeaderTransition);
            scope.listen(header, "transitionend", trackHeaderTransition);
            scope.listen(header, "transitioncancel", trackHeaderTransition);

            // 키보드 포커스나 모션 감소 설정으로 전환 없이 표시 상태가 바뀌는 경우도 반영합니다.
            const headerStateObserver = new MutationObserver(() => {
                const collapsed = header.classList.contains("is-scroll-collapsed");
                if (collapsed === headerCollapsed) return;
                headerCollapsed = collapsed;
                scheduleUpdate();
            });
            scope.observe(headerStateObserver, header, { attributes: true, attributeFilter: ["class"] });

            const observer = new ResizeObserver(scheduleUpdate);
            scope.observe(observer, header);
            observer.observe(breadcrumbs.parentElement);
            observer.observe(breadcrumbs);

            scope.cleanup(() => {
                anchor?.remove();
                if (handoff) {
                    header.classList.remove("is-breadcrumb-revealed", "is-breadcrumb-hiding");
                    header.style.removeProperty("--header-breadcrumb-top");
                    header.style.removeProperty("--header-hidden-navigation-height");
                }
                breadcrumbs.classList.remove("is-fixed");
                breadcrumbs.style.removeProperty("--breadcrumbs-auto-top");
                syncHeaderState();
            });

            updateState();
        });
    }

    /********************************************************************
    //End: 서브 breadcrumbs 고정 상태 및 헤더 스타일 연동*/
    //*******************************************************************/

    // 공통 생명주기에 등록하여 동적으로 추가되는 서브 템플릿에도 적용합니다.
    global.CMSUI.register("sub", (root) => {
        initStickyBreadcrumbs(root);
        initBreadcrumbMenus(root);
    });
})(window);
