import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("hien thong diep 404 va cac loi dieu huong chinh", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Không tìm thấy màn hình bạn đang mở")).not.toBeNull();
    expect(screen.getByRole("link", { name: /Về dashboard/i }).getAttribute("href")).toBe("/dashboard");
    expect(screen.getByRole("link", { name: /Mở bản đồ GIS/i }).getAttribute("href")).toBe("/map");
  });
});
