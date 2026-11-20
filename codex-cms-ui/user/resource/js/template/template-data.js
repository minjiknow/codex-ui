(function createTemplateRenderer(global) {
    "use strict";

    /********************************************************************
    //Start: 공통 데이터 및 DOM 생성*/
    //*******************************************************************/
    const menuItems = (menu) => [...(menu.groups || []).flatMap((group) => group.items || []), ...(menu.items || [])];
    const elements = (root, selector) => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
    const getValue = (data, path) => path.split(".").reduce((value, key) => value?.[key], data);
    let navigationSequence = 0;
    const renderedLists = new WeakSet();
    const renderedNavigations = new WeakSet();
    const renderedTexts = new WeakSet();
    const renderedRecords = new WeakSet();
    let menuGroupsRegistry;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function validHref(href) {
        return typeof href === "string" && !/^\s*(?:javascript|data|vbscript):/i.test(href);
    }

    function menuControl(menu, className, expandable = false) {
        const link = !expandable && menu.href && menu.href !== "#" && validHref(menu.href);
        const control = element(link ? "a" : "button", className);
        if (link) control.setAttribute("href", menu.href);
        else control.type = "button";
        if (expandable) control.setAttribute("aria-expanded", "false");
        control.dataset.menuId = menu.id;
        return control;
    }

    function submenu(item, descriptions, flat = false) {
        const control = flat ? menuControl(item, "accordion none") : menuLink(item, "submenu");
        control.append(element(flat ? "span" : "p", `submenu-tit ${item.icon || ""}`.trim(), item.label));
        if (descriptions && item.description) control.append(element(flat ? "span" : "p", "desc", item.description));
        return control;
    }

    function menuLink(menu, className) {
        const link = element("a", className);
        link.setAttribute("href", menu.href && validHref(menu.href) ? menu.href : "#");
        link.dataset.menuId = menu.id;
        return link;
    }
    /********************************************************************
    //End: 공통 데이터 및 DOM 생성*/
    //*******************************************************************/

    /********************************************************************
    //Start: 동일 메뉴 데이터로 PC 및 모바일 GNB 출력*/
    //*******************************************************************/
    function renderNavigation(list, menus) {
        const layout = list.dataset.navigation;
        const prefix = `navigation-${++navigationSequence}`;
        const fragment = document.createDocumentFragment();

        menus.forEach((menu, index) => {
            const children = menuItems(menu);
            const item = element("li", "depth1-menu");
            item.dataset.menuId = menu.id;
            const trigger = menuControl(menu, `depth1 accordion${children.length ? "" : " none"}`, Boolean(children.length));
            trigger.textContent = menu.label;
            item.append(trigger);
            if (!children.length) {
                fragment.append(item);
                return;
            }

            const panel = element("ul", `depth2-menus${layout === "standard" ? "" : " type1"}`);
            const contents = element("li", "contents-wrap");
            trigger.id = `${prefix}-${index}-trigger`;
            panel.id = `${prefix}-${index}-panel`;
            trigger.setAttribute("aria-controls", panel.id);
            panel.setAttribute("aria-labelledby", trigger.id);
            panel.append(contents);
            item.append(panel);

            if (layout === "mega") {
                const intro = element("div", "depth2-menu submenu-intro");
                intro.append(element("p", "tit", menu.label), element("p", "desc", menu.description || ""));
                const body = element("div", "depth2-menu submenu-body");
                const groups = menu.groups?.length ? menu.groups : [{ id: menu.id, label: menu.label, items: children }];
                const submenus = element("div", "submenus type1");
                const tabs = element("div", "submenu-tabs");
                tabs.setAttribute("role", "tablist");
                tabs.setAttribute("aria-label", `${menu.label} 분류`);
                groups.forEach((group, groupIndex) => {
                    const button = element("button", `accordion none${groupIndex === 0 ? " active" : ""}`, group.label);
                    button.type = "button";
                    // GNB 분류는 아래 별도 이벤트에서 처리합니다. 일반 아코디언 대상에서 제외합니다.
                    button.dataset.menuGroup = group.id;
                    button.setAttribute("role", "tab");
                    button.setAttribute("aria-selected", String(groupIndex === 0));
                    button.tabIndex = groupIndex === 0 ? 0 : -1;
                    button.id = `${prefix}-${index}-group-${groupIndex}`;
                    const content = element("div", "submenu-content");
                    content.dataset.menuPanel = group.id;
                    content.id = `${button.id}-panel`;
                    button.setAttribute("aria-controls", content.id);
                    content.setAttribute("role", "tabpanel");
                    content.setAttribute("aria-labelledby", button.id);
                    content.hidden = groupIndex !== 0;
                    const links = element("div", "submenu-links");
                    links.append(...group.items.map((entry) => submenu(entry, false)));
                    content.append(links);
                    const direct = menuLink(menu, "submenu direct");
                    direct.append(element("span", "submenu-tit", `${menu.label} 바로가기`), element("span", "desc", `${menu.label} 정보를 확인해 보세요.`));
                    content.append(direct);
                    tabs.append(button);
                    submenus.append(content);
                });
                if (groups.length > 1) submenus.prepend(tabs);
                else submenus.querySelector("[role=tabpanel]").removeAttribute("aria-labelledby");
                body.append(submenus);
                contents.append(intro, body);
            } else {
                let destination = contents;
                if (layout === "mobile") {
                    const column = element("div", "depth2-menu");
                    destination = element("div", "submenus");
                    column.append(destination);
                    contents.append(column);
                }
                (menu.groups || []).forEach((group, groupIndex) => {
                    const column = element("div", "depth2-menu");
                    const heading = element("button", `accordion${groupIndex === 0 ? (layout === "standard" ? " primary" : " txt-secondary") : ""}`, group.label);
                    heading.type = "button";
                    const links = element("div", "submenus");
                    links.append(...group.items.map((entry) => submenu(entry, layout === "standard")));
                    column.append(heading, links);
                    destination.append(column);
                });
                (menu.items || []).forEach((entry) => {
                    const column = element("div", "depth2-menu");
                    column.append(submenu(entry, layout === "standard", true));
                    destination.append(column);
                });
            }
            fragment.append(item);
        });
        list.replaceChildren(fragment);
        renderedNavigations.add(list);
    }

    function initNavigationEvents(root) {
        elements(root, "[data-navigation]").forEach((list) => {
            if (menuGroupsRegistry.has(list)) return;
            const scope = menuGroupsRegistry.create(list);
            function activate(button, focus = false) {
                const body = button.closest(".submenus");
                body.querySelectorAll("[data-menu-group]").forEach((tab) => {
                    const selected = tab === button;
                    tab.classList.toggle("active", selected);
                    tab.setAttribute("aria-selected", String(selected));
                    tab.tabIndex = selected ? 0 : -1;
                });
                body.querySelectorAll("[data-menu-panel]").forEach((panel) => {
                    panel.hidden = panel.dataset.menuPanel !== button.dataset.menuGroup;
                });
                if (focus) button.focus();
            }
            scope.listen(list, "click", (event) => {
                const link = event.target.closest("a[href]");
                if (link && (!link.getAttribute("href") || link.getAttribute("href") === "#")) event.preventDefault();
                const button = event.target.closest("[data-menu-group]");
                if (button) activate(button);
            });
            scope.listen(list, "keydown", (event) => {
                const button = event.target.closest("[data-menu-group]");
                if (!button || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const buttons = Array.from(button.parentElement.children);
                const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (buttons.indexOf(button) + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
                activate(buttons[index], true);
            });
        });
    }
    /********************************************************************
    //End: 동일 메뉴 데이터로 PC 및 모바일 GNB 출력*/
    //*******************************************************************/

    /********************************************************************
    //Start: 기존 메인 HTML template에 데이터 바인딩*/
    //*******************************************************************/
    function bindFields(root, record, selfOnly = false) {
        const attributes = ["href", "src", "alt", "aria-label", "datetime", "data-selection-description", "data-more-href"];
        for (const node of selfOnly ? [root] : elements(root, "*")) {
            if (node.dataset.fieldText) node.textContent = record[node.dataset.fieldText] ?? "";
            if (node.dataset.fieldLines) {
                const lines = record[node.dataset.fieldLines] || [];
                node.replaceChildren();
                lines.forEach((line, index) => {
                    if (index) node.append(document.createElement("br"));
                    node.append(document.createTextNode(line));
                });
            }
            for (const attribute of attributes) {
                const key = node.getAttribute(`data-field-${attribute}`);
                if (!key || record[key] == null) continue;
                if (["href", "src", "data-more-href"].includes(attribute) && !validHref(record[key])) continue;
                const value = attribute === "aria-label" ? `${record[key]}${node.dataset.ariaLabelSuffix || ""}` : record[key];
                node.setAttribute(attribute, value);
            }
            if (node.dataset.fieldBackground) node.style.setProperty("--card-banner-bg", record[node.dataset.fieldBackground] || "none");
            if (node.dataset.fieldHeroImage) {
                const source = record[node.dataset.fieldHeroImage];
                // CSS 변수의 URL은 사용한 스타일시트 기준으로 해석될 수 있어 문서 기준 절대 URL로 고정합니다.
                if (source && validHref(source)) node.style.setProperty("--hero-slide-image", `url(${JSON.stringify(new URL(source, document.baseURI).href)})`);
            }
        }
    }

    function renderLists(root, data, force = false) {
        const templates = new Map(elements(root, "template[data-content-template]").map((template) => [template.dataset.contentTemplate, template]));
        elements(root, "[data-content-list]").forEach((list) => {
            if (!force && renderedLists.has(list)) return;
            const records = getValue(data, list.dataset.contentList);
            if (!Array.isArray(records)) throw new Error(`목록 데이터가 없습니다: ${list.dataset.contentList}`);
            const fragment = document.createDocumentFragment();
            records.forEach((record) => {
                const template = templates.get(record.template);
                if (!template) throw new Error(`HTML template이 없습니다: ${record.template}`);
                const content = template.content.cloneNode(true);
                bindFields(content, record);
                fragment.append(content);
            });
            list.replaceChildren(fragment);
            renderedLists.add(list);
        });
        elements(root, "[data-content-text]").forEach((node) => {
            if (!force && renderedTexts.has(node)) return;
            const value = String(getValue(data, node.dataset.contentText) ?? "");
            if (node.textContent !== value) node.textContent = value;
            renderedTexts.add(node);
        });
        elements(root, "[data-content-record]").forEach((node) => {
            if (!force && renderedRecords.has(node)) return;
            const record = getValue(data, node.dataset.contentRecord);
            if (!record) throw new Error(`콘텐츠 데이터가 없습니다: ${node.dataset.contentRecord}`);
            bindFields(node, record, true);
            renderedRecords.add(node);
        });
    }

    function render(root = document, data = global.CMSData) {
        if (!data || !Array.isArray(data.menus)) throw new Error("CMSData를 공급한 후 CMSTemplates.render()를 호출하세요.");
        global.CMSUI?.destroy(root);
        global.CMSData = data;
        elements(root, "[data-navigation]").forEach((list) => renderNavigation(list, data.menus));
        renderLists(root, data, true);
        global.CMSUI?.init(root);
    }

    function registerLifecycle(ui) {
        menuGroupsRegistry = ui.createRegistry();
        // 동적으로 삽입된 HTML도 데이터 출력 후 공통 UI가 초기화되도록 먼저 등록합니다.
        ui.register("templates", (root) => {
            if (!global.CMSData?.menus) return;
            elements(root, "[data-navigation]").forEach((list) => {
                if (!renderedNavigations.has(list)) renderNavigation(list, global.CMSData.menus);
            });
            renderLists(root, global.CMSData);
            initNavigationEvents(root);
        });
    }

    global.CMSTemplates = { render, menuItems, validHref, registerLifecycle };
    if (global.CMSData) render();
    /********************************************************************
    //End: 기존 메인 HTML template에 데이터 바인딩*/
    //*******************************************************************/
})(window);
