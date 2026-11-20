(() => {
    "use strict";
    window.CMSData = {
        menus: window.museumMenus,
        suggestions: window.museumEvents.map(({ title }) => {
            const firstWord = title.split(" ")[0];
            return { template: "shared-suggestion", highlight: firstWord, suffix: title.slice(firstWord.length) };
        }),
        shared: { recentSearches: [] }
    };
    document.querySelector(".searchpop").addEventListener("search:submit", event => {
        const url = new URL("https://www.science.go.kr/mps/1145/totalSearch.do");
        url.searchParams.set("searchWord", event.detail.keyword);
        location.assign(url);
    });
    const boardUrl = "https://www.science.go.kr/mps/1070/bbs/431/";
    document.querySelectorAll(".event-board").forEach(board => {
        const form = board.querySelector("form");
        const filter = form.querySelector(".search-filter");
        const grid = board.querySelector(".event-grid");
        const count = board.querySelector(".result-count");
        const card = board.querySelector(".card-template");
        const detail = board.querySelector(".detail-template");

        function updateLocation(field, query) {
            const params = new URLSearchParams();
            if (query) {
                params.set("field", field);
                params.set("query", query);
            }
            location.hash = params.toString();
        }

        function render() {
            const params = new URLSearchParams(location.hash.slice(1));
            const query = (params.get("query") || "").trim();
            const field = params.get("field") === "info" ? "info" : "title";
            form.elements.query.value = query;
            form.elements.query.dispatchEvent(new Event("input", { bubbles: true }));
            const selected = query ? field : "";
            if (filter.dataset.value !== selected) {
                const option = filter.querySelector('[data-value="' + selected + '"]');
                if (filter.querySelector('[role="listbox"]')) {
                    option.click();
                } else {
                    filter.dataset.value = selected;
                    filter.querySelector(".selected").classList.remove("selected");
                    option.classList.add("selected");
                    filter.querySelector(".selected-text").textContent = option.textContent.trim();
                }
            }
            board.querySelector(".clear").hidden = !query;
            const matches = window.museumEvents.filter(event => {
                const text = field === "title" ? event.title : Object.values(event.info).join(" ");
                return text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
            });
            count.textContent = "전체 " + matches.length + "건";
            grid.replaceChildren();
            for (const event of matches) {
                const item = card.content.cloneNode(true);
                item.querySelector("a").href = boardUrl + "moveBbsNttDetail.do?nttSn=" + event.id;
                item.querySelector("img").src = event.image;
                item.querySelector("h2").textContent = event.title;
                const badge = item.querySelector(".badge");
                badge.textContent = event.status;
                badge.classList.add(event.status === "행사중" ? "primarybg" : event.status === "행사예정" ? "greenbg" : "secondarybg");
                Object.entries(event.info).forEach(([label, value]) => {
                    const row = detail.content.cloneNode(true);
                    row.querySelector("strong").textContent = label;
                    row.querySelector("span").textContent = value;
                    item.querySelector(".details").append(row);
                });
                grid.append(item);
            }
            board.querySelector(".empty").hidden = matches.length > 0;
        }
        form.addEventListener("submit", event => {
            event.preventDefault();
            const value = form.elements.query.value.trim();
            if (!filter.dataset.value) {
                filter.querySelector(".selected-text").click();
                return;
            }
            if (value) updateLocation(filter.dataset.value, value);
            else form.elements.query.focus();
        });
        form.addEventListener("reset", () => updateLocation("", ""));
        window.addEventListener("hashchange", () => {
            render();
            if (location.hash !== "#top" && location.hash !== "#main-content") count.focus();
        });
        render();
    });

    document.querySelectorAll('button[aria-controls="share-links"]').forEach(button => {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        function toggle(open) {
            button.setAttribute("aria-expanded", String(open));
            panel.hidden = !open;
        }
        button.addEventListener("click", () => {
            toggle(panel.hidden);
            if (!panel.hidden) panel.querySelector("input, a")?.focus();
        });
        panel.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                toggle(false);
                button.focus();
            }
        });
    });
    document.querySelector(".zoom").addEventListener("dropdown:change", event => {
        document.body.style.zoom = event.detail.id;
    });
    document.querySelector(".print").addEventListener("click", () => window.print());
    document.querySelector(".copy").addEventListener("click", async () => {
        const url = boardUrl + "moveBbsNttList.do";
        const status = document.querySelector(".copy-result");
        try {
            await navigator.clipboard.writeText(url);
            status.textContent = "원본 주소를 복사했습니다.";
        } catch {
            status.textContent = url;
        }
    });
})();

