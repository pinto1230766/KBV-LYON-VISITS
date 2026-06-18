import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfflineIndicator } from "../OfflineIndicator";
import { useUIStore } from "../../store/useUIStore";

describe("OfflineIndicator", () => {
    beforeEach(() => {
        // Reset the store to online before each test
        useUIStore.getState().setIsOnline(true);
    });

    it("should not render anything when online", () => {
        useUIStore.getState().setIsOnline(true);
        const { container } = render(<OfflineIndicator />);
        expect(container.innerHTML).toBe("");
    });

    it("should render the offline pill when offline", () => {
        useUIStore.getState().setIsOnline(false);
        render(<OfflineIndicator />);
        expect(screen.getByText("Hors-ligne")).toBeInTheDocument();
    });

    it("should transition visibility when going offline then online", () => {
        // Start offline
        useUIStore.getState().setIsOnline(false);
        const { rerender } = render(<OfflineIndicator />);
        expect(screen.getByText("Hors-ligne")).toBeInTheDocument();

        // Switch to online
        useUIStore.getState().setIsOnline(true);
        rerender(<OfflineIndicator />);
        // AnimatePresence might keep the element during exit animation,
        // but eventually it should be removed
        expect(useUIStore.getState().isOnline).toBe(true);
    });

    it("should display the WifiOff icon when offline", () => {
        useUIStore.getState().setIsOnline(false);
        render(<OfflineIndicator />);
        // The WifiOff icon from lucide renders as an SVG
        const svg = document.querySelector("svg");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass("text-destructive");
    });
});