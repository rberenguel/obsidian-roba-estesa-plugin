export class RedactionSliderComponent {
    private containerEl: HTMLElement;
    private contentEl: HTMLElement;
    private overlayEl: HTMLElement;
    private isRevealed: boolean = false;
    private isDragging: boolean = false;
    private startX: number = 0;
    private currentX: number = 0;
    private revealThreshold: number = 50; // Pixels to slide to reveal

    constructor(containerEl: HTMLElement, redactionStyle: "Solid Block" | "Blur") {
        this.containerEl = containerEl;
        this.containerEl.classList.add("privacy-plugin-redaction-container");

        this.overlayEl = this.containerEl.createDiv({ cls: "privacy-plugin-redaction-overlay" });
        this.contentEl = this.containerEl.createDiv({ cls: "privacy-plugin-redaction-content" });

        if (redactionStyle === "Blur") {
            this.containerEl.classList.add("privacy-plugin-blur-style");
        }

        // Move existing content into the contentEl
        const childrenToMove = Array.from(this.containerEl.childNodes).filter(node =>
            node !== this.overlayEl && node !== this.contentEl
        );
        childrenToMove.forEach(node => this.contentEl.appendChild(node));


        this.overlayEl.setText("Slide to reveal");

        this.overlayEl.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.overlayEl.addEventListener("touchstart", this.onMouseDown.bind(this));

        this.updateVisibility();
    }

    private onMouseDown(e: MouseEvent | TouchEvent) {
        if (this.isRevealed) return;

        this.isDragging = true;
        this.overlayEl.classList.add("is-dragging");

        this.startX = (e instanceof MouseEvent) ? e.clientX : e.touches[0].clientX;
        this.currentX = this.startX;

        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("touchmove", this.onMouseMove.bind(this));
        document.addEventListener("touchend", this.onMouseUp.bind(this));
    }

    private onMouseMove(e: MouseEvent | TouchEvent) {
        if (!this.isDragging || this.isRevealed) return;

        this.currentX = (e instanceof MouseEvent) ? e.clientX : e.touches[0].clientX;
        const deltaX = this.currentX - this.startX;

        if (deltaX > 0) {
            this.overlayEl.style.transform = `translateX(${deltaX}px)`;
            this.overlayEl.style.opacity = `${1 - (deltaX / this.overlayEl.offsetWidth)}`;
        }
    }

    private onMouseUp(e: MouseEvent | TouchEvent) {
        if (!this.isDragging || this.isRevealed) return;

        this.isDragging = false;
        this.overlayEl.classList.remove("is-dragging");

        const deltaX = this.currentX - this.startX;

        if (deltaX > this.revealThreshold) {
            this.isRevealed = true;
            this.overlayEl.style.transform = `translateX(100%)`;
            this.overlayEl.style.opacity = "0";
            this.overlayEl.ontransitionend = () => {
                this.updateVisibility();
                this.overlayEl.ontransitionend = null;
            };
        } else {
            this.overlayEl.style.transform = `translateX(0)`;
            this.overlayEl.style.opacity = "1";
        }

        document.removeEventListener("mousemove", this.onMouseMove.bind(this));
        document.removeEventListener("mouseup", this.onMouseUp.bind(this));
        document.removeEventListener("touchmove", this.onMouseMove.bind(this));
        document.removeEventListener("touchend", this.onMouseUp.bind(this));
    }

    private updateVisibility() {
        if (this.isRevealed) {
            this.overlayEl.style.display = "none";
            this.contentEl.style.display = "block";
            this.overlayEl.style.transform = `translateX(0)`;
            this.overlayEl.style.opacity = "1";
        } else {
            this.overlayEl.style.display = "flex";
            this.contentEl.style.display = "none";
        }
    }
}
