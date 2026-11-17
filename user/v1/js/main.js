(() => {
    "use strict";
    const { dummyCategories, dummySuggestions, dummyResources } = window.resourceDemoData;

    // 같은 UI가 추가되어도 각 인스턴스의 검색/저장 상태는 독립적으로 관리합니다.
    document.querySelectorAll(".search-page").forEach((root) => {
        const searchForm = root.querySelector(".search-form");
        const searchInput = root.querySelector(".search-input");
        const filters = root.querySelector(".filters");
        const results = root.querySelector(".results");
        const status = root.querySelector(".result-status");
        const empty = root.querySelector(".empty-state");
        const savedToggle = root.querySelector(".saved-toggle");
        const dialog = root.querySelector(".detail-dialog");
        const savedIds = new Set();
        const state = { query: "", category: "전체", savedOnly: false };

        function normalize(value) {
            return value.normalize("NFKC").toLocaleLowerCase("ko").trim().replace(/\s+/g, " ");
        }

        function createTextElement(tag, className, text) {
            const element = document.createElement(tag);
            element.className = className;
            element.textContent = text;
            return element;
        }

        function openResource(resource) {
            dialog.querySelector(".detail-meta").textContent = `${resource.category} · ${resource.type}`;
            dialog.querySelector(".detail-title").textContent = resource.title;
            dialog.querySelector(".detail-summary").textContent = resource.description;
            const content = dialog.querySelector(".detail-content");
            content.replaceChildren(...resource.content.map((paragraph) => createTextElement("p", "detail-paragraph", paragraph)));
            dialog.showModal();
        }

        function renderResults(focusId) {
            const terms = normalize(state.query).split(" ").filter(Boolean);
            const matches = dummyResources.filter((resource) => {
                const categoryMatches = state.category === "전체" || state.category === resource.category;
                const savedMatches = !state.savedOnly || savedIds.has(resource.id);
                const text = normalize([resource.title, resource.description, resource.category, ...resource.tags].join(" "));
                return categoryMatches && savedMatches && terms.every((term) => text.includes(term));
            });

            status.textContent = `${state.savedOnly ? "저장한 자료 · " : ""}${state.query ? `“${state.query}” · ` : ""}${state.category} ${matches.length}개`;
            filters.querySelectorAll(".filter").forEach((button) => {
                button.setAttribute("aria-pressed", String(button.dataset.category === state.category));
            });
            savedToggle.setAttribute("aria-pressed", String(state.savedOnly));
            root.querySelector(".saved-count").textContent = savedIds.size;
            results.replaceChildren();

            matches.forEach((resource) => {
                const article = createTextElement("article", "result-row", "");
                const category = createTextElement("span", "result-category text-green", resource.category);
                const body = createTextElement("div", "result-body", "");
                const heading = createTextElement("h3", "result-title", "");
                const openButton = createTextElement("button", "result-open", resource.title);
                openButton.type = "button";
                openButton.addEventListener("click", () => openResource(resource));
                heading.append(openButton);
                const description = createTextElement("p", "result-description", resource.description);
                const meta = createTextElement("span", "result-meta", `${resource.type} · 샘플 콘텐츠`);
                body.append(heading, description, meta);
                const isSaved = savedIds.has(resource.id);
                const saveButton = createTextElement("button", "save-button", isSaved ? "저장됨" : "저장");
                saveButton.type = "button";
                saveButton.dataset.resourceId = resource.id;
                saveButton.setAttribute("aria-label", `${resource.title} ${isSaved ? "저장 취소" : "저장"}`);
                saveButton.setAttribute("aria-pressed", String(isSaved));
                saveButton.addEventListener("click", () => {
                    savedIds.has(resource.id) ? savedIds.delete(resource.id) : savedIds.add(resource.id);
                    renderResults(resource.id);
                });
                article.append(category, body, saveButton);
                results.append(article);
            });

            empty.hidden = matches.length !== 0;
            const noSavedItems = state.savedOnly && savedIds.size === 0;
            empty.querySelector(".empty-title").textContent = noSavedItems ? "아직 저장한 자료가 없어요." : "조건에 맞는 자료가 없어요.";
            empty.querySelector(".empty-description").textContent = noSavedItems ? "관심 있는 자료의 저장 버튼을 눌러 나만의 목록을 만들어 보세요." : "검색어를 바꾸거나 카테고리를 ‘전체’로 선택해 보세요.";

            if (focusId) {
                const nextButton = [...results.querySelectorAll(".save-button")].find((button) => button.dataset.resourceId === focusId);
                (nextButton || savedToggle).focus({ preventScroll: true });
            }
        }

        function applySearch(value) {
            state.query = value.trim();
            searchInput.value = state.query;
            renderResults();
        }

        dummyCategories.forEach((category) => {
            const button = createTextElement("button", "filter", category);
            button.type = "button";
            button.dataset.category = category;
            button.addEventListener("click", () => {
                state.category = category;
                renderResults();
            });
            filters.append(button);
        });

        const suggestions = root.querySelector(".suggestion-list");
        dummySuggestions.forEach((term) => {
            const item = document.createElement("li");
            const button = createTextElement("button", "suggestion-button text-green", term);
            button.type = "button";
            button.addEventListener("click", () => applySearch(term));
            item.append(button);
            suggestions.append(item);
        });

        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            applySearch(searchInput.value);
        });
        searchInput.addEventListener("input", () => {
            if (searchInput.value === "" && state.query !== "") applySearch("");
        });
        function reset() {
            state.query = "";
            state.category = "전체";
            state.savedOnly = false;
            searchInput.value = "";
            renderResults();
        }
        root.querySelector(".reset-button").addEventListener("click", reset);
        root.querySelector(".show-all").addEventListener("click", () => {
            reset();
            filters.querySelector(".filter").focus({ preventScroll: true });
        });
        savedToggle.addEventListener("click", () => {
            state.savedOnly = !state.savedOnly;
            state.query = "";
            state.category = "전체";
            searchInput.value = "";
            renderResults();
            const library = root.querySelector(".library");
            window.scrollTo({ top: library.getBoundingClientRect().top + window.scrollY - 24, behavior: "auto" });
        });
        dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
        renderResults();
    });
})();
