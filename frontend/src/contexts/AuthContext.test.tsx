import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AuthProvider, useAuth } from "./AuthContext";

function AuthProbe() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? "authenticated" : "guest"}</span>
      <span data-testid="user-name">{user?.fullName ?? "anonymous"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  it("khong crash khi localStorage co user json bi hong", () => {
    localStorage.setItem("user", "{invalid-json");
    localStorage.setItem("accessToken", "token-demo");
    localStorage.setItem("refreshToken", "refresh-demo");

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("auth-state").textContent).toBe("guest");
    expect(screen.getByTestId("user-name").textContent).toBe("anonymous");
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});
