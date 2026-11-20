(() => {
    const source = "https://www.nl.go.kr/NL/contents/N40800000000.do";

    document.querySelectorAll(".searchpop").forEach((popup) => {
        popup.addEventListener("search:submit", (event) => {
            const results = new URL("https://www.nl.go.kr/NL/contents/search.do");
            results.searchParams.set("kwd", event.detail.keyword);
            window.location.assign(results.href);
        });
    });

    document.querySelectorAll(".exhibitions").forEach((root) => {
        const list = root.querySelector(".cards[data-layout]");
        const template = root.querySelector(".exhibition-card");
        const form = root.querySelector(".exhibition-filters");
        const pager = window.CMSBoardList.bind(root, (number) => {
            page = number;
            render();
        });
        let agency = root.querySelector('[data-agency][aria-pressed="true"]').dataset.agency;
        let results = [];
        let page = 1;
        let size = 12;

        function render() {
            const pages = Math.ceil(results.length / size);
            const cards = document.createDocumentFragment();
            for (const record of results.slice((page - 1) * size, page * size)) {
                const card = template.content.cloneNode(true);
                card.querySelector("a").href = source + "?schM=view&schId=" + encodeURIComponent(record.id);
                const image = card.querySelector("img");
                if (record.image) image.src = record.image;
                else image.remove();
                card.querySelector(".card-title").textContent = record.title;
                const badge = card.querySelector(".badge");
                badge.textContent = record.status;
                if (record.status === "전시중") badge.classList.add("bluebg");
                for (const field of ["agency", "period", "place", "department"]) {
                    card.querySelector("." + field).textContent = record[field] || "—";
                }
                cards.append(card);
            }
            list.replaceChildren(cards);
            root.querySelector(".result-count").textContent = results.length;
            root.querySelector(".empty").hidden = results.length > 0;
            pager.update(page, pages);
        }

        function applyFilters() {
            const filters = Object.fromEntries(Array.from(form.querySelectorAll("[data-filter]"),
                (control) => [control.dataset.filter, control.dataset.value]));
            const keyword = form.elements.query.value.trim().toLocaleLowerCase();
            results = window.exhibitionPreview.filter((record) => {
                if (agency !== "전체" && record.agency !== agency) return false;
                if (filters.status !== "전체" && record.status !== filters.status) return false;
                const info = [record.place, record.department, record.period, record.agency].join(" ");
                const fields = { title: record.title, info, all: record.title + " " + info };
                return fields[filters.field].toLocaleLowerCase().includes(keyword);
            });
            if (filters.order === "asc") results.reverse();
            size = Number(filters.size);
            page = 1;
            render();
        }

        form.addEventListener("dropdown:change", applyFilters);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            applyFilters();
        });
        const agencySelect = root.querySelector(".agency-select");
        agencySelect.addEventListener("dropdown:change", (event) => {
            agency = event.detail.id;
            root.querySelectorAll("[data-agency]").forEach((item) => {
                item.setAttribute("aria-pressed", String(item.dataset.agency === agency));
            });
            applyFilters();
        });
        root.querySelectorAll("[data-agency]").forEach((button) => {
            button.addEventListener("click", () => {
                const option = Array.from(agencySelect.querySelectorAll("li")).find(
                    (item) => item.dataset.value === button.dataset.agency
                );
                option.click();
                button.focus();
            });
        });
        applyFilters();
    });
})();

