import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppErrorBoundary } from "./AppErrorBoundary";

function Bomb(): null {
  throw new Error("boom");
}

describe("AppErrorBoundary", () => {
  it("render fallback mac dinh khi con ben trong nem loi", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>,
    );

    expect(screen.getByText("Ứng dụng vừa gặp lỗi không mong muốn")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Thử render lại" })).not.toBeNull();

    errorSpy.mockRestore();
  });

  it("goi reset khi bam nut thu render lai", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    let shouldThrow = true;
    function ToggleBomb() {
      if (shouldThrow) throw new Error("boom");
      return <div>Noi dung da phuc hoi</div>;
    }

    render(
      <AppErrorBoundary>
        <ToggleBomb />
      </AppErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Thử render lại" }));

    expect(screen.getByText("Noi dung da phuc hoi")).not.toBeNull();
    errorSpy.mockRestore();
  });
});
