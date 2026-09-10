// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { AppRoutes } from "./AppRoutes";
import { BudgetProvider } from "../context/BudgetContext";
import { AuthProvider } from "../context/AuthContext";
import { setOnboardingCompleted } from "../services/storage";

describe("AppRoutes integration", () => {
  beforeEach(() => {
    localStorage.clear();
    setOnboardingCompleted(true);
  });

  it("protège la page Achats futurs pour un utilisateur non connecté", async () => {
    render(<MemoryRouter initialEntries={["/future-purchases"]}><AuthProvider><BudgetProvider><AppRoutes /></BudgetProvider></AuthProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Bon retour" })).toBeInTheDocument());
  });
});
