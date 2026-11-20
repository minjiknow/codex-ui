window.CMSBoardList = {
    bind(root, onPageChange) {
        const pager = root.querySelector(".page-tools");
        const jump = pager.querySelector(".page-jump");
        const input = jump.querySelector(".current-page");
        const total = jump.querySelector(".total-pages");
        const list = root.querySelector("[data-layout]");
        let current = 1;
        let pages = 0;

        function update(page, pageCount) {
            current = page;
            pages = pageCount;
            pager.hidden = pages === 0;
            input.max = Math.max(1, pages);
            input.value = current;
            total.textContent = pages;
            for (const button of pager.querySelectorAll("[data-page]")) {
                const backward = ["first", "prev"].includes(button.dataset.page);
                button.disabled = backward ? current <= 1 : current >= pages;
            }
        }

        function navigate(page) {
            if (!Number.isInteger(page) || page < 1 || page > pages) return;
            onPageChange(page);
            list.querySelector("a")?.focus();
        }

        pager.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-page]");
            if (!button || button.disabled) return;
            const destinations = { first: 1, prev: current - 1, next: current + 1, last: pages };
            navigate(destinations[button.dataset.page]);
        });
        jump.addEventListener("submit", (event) => {
            event.preventDefault();
            navigate(input.valueAsNumber);
        });

        const buttons = root.querySelectorAll("[data-view]");
        for (const button of buttons) {
            button.addEventListener("click", () => {
                list.dataset.layout = button.dataset.view;
                for (const item of buttons) item.setAttribute("aria-pressed", String(item === button));
            });
        }
        return { update };
    }
};
