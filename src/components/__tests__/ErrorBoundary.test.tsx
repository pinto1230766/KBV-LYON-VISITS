import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary";

const ExplodingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error("Test crash");
    }
    return <div>Hello world</div>;
};

describe("ErrorBoundary", () => {
    // Suppress console.error for the crash test
    const originalError = console.error;
    beforeAll(() => {
        console.error = () => { };
    });
    afterAll(() => {
        console.error = originalError;
    });

    it("should render children when there is no error", () => {
        render(
            <ErrorBoundary>
                <div>Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should catch rendering errors and show a fallback UI", () => {
        render(
            <ErrorBoundary>
                <ExplodingComponent shouldThrow={true} />
            </ErrorBoundary>
        );
        // Should show an error message to the user
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
    });

    it("should show a retry button after an error", () => {
        render(
            <ErrorBoundary>
                <ExplodingComponent shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByRole("button", { name: /réessayer|retry/i })).toBeInTheDocument();
    });
});