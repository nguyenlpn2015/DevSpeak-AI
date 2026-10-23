import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthModal } from "@/components/auth/AuthModal";

// Mock API functions
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    loginCandidate: vi.fn().mockResolvedValue({
      access_token: "mock-test-jwt",
      token_type: "bearer",
      user: {
        id: "usr-123",
        email: "test@example.com",
        full_name: "Test Engineer",
        target_role: "devops",
        target_level: "B2",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    }),
    registerCandidate: vi.fn().mockResolvedValue({
      access_token: "mock-test-jwt",
      token_type: "bearer",
      user: {
        id: "usr-456",
        email: "newuser@example.com",
        full_name: "New Engineer",
        target_role: "cloud",
        target_level: "C1",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    }),
    logoutCandidate: vi.fn().mockResolvedValue(undefined),
    getAuthToken: vi.fn().mockReturnValue(null),
    setAuthToken: vi.fn(),
  };
});

function TestAuthConsumer() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? "authenticated" : "guest"}</span>
      <span data-testid="user-email">{user ? user.email : "none"}</span>
      <button onClick={() => openAuthModal("login")}>Open Login</button>
      <button onClick={() => openAuthModal("register")}>Open Register</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe("AuthContext & AuthModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("initializes in guest mode when no token is present", () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status").textContent).toBe("guest");
    expect(screen.getByTestId("user-email").textContent).toBe("none");
  });

  it("opens modal and performs candidate login successfully", async () => {
    const { container } = render(
      <LanguageProvider>
        <AuthProvider>
          <TestAuthConsumer />
          <AuthModal />
        </AuthProvider>
      </LanguageProvider>
    );

    // Open login modal
    fireEvent.click(screen.getByText("Open Login"));
    expect(screen.getByText("Welcome Back, Engineer")).toBeDefined();

    // Fill credentials
    const emailInput = screen.getByPlaceholderText("engineer@company.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });

    // Submit form via submit button
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe("authenticated");
      expect(screen.getByTestId("user-email").textContent).toBe("test@example.com");
    });
  });

  it("validates password minimum length on registration", async () => {
    const { container } = render(
      <LanguageProvider>
        <AuthProvider>
          <TestAuthConsumer />
          <AuthModal />
        </AuthProvider>
      </LanguageProvider>
    );

    // Open register modal
    fireEvent.click(screen.getByText("Open Register"));

    const emailInput = screen.getByPlaceholderText("engineer@company.com");
    const passwordInput = screen.getByPlaceholderText("At least 8 characters");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "short" } });

    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters long.")).toBeDefined();
    });
  });
});
