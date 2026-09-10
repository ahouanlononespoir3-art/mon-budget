// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { BudgetProvider } from "../../context/BudgetContext";
import { Statistics } from "./Statistics";

beforeEach(() => localStorage.clear());

describe("Statistics", () => {
  it("affiche les indicateurs et les vues analytiques", () => {
    render(<BrowserRouter><BudgetProvider><Statistics /></BudgetProvider></BrowserRouter>);
    expect(screen.getByRole("heading", { name: "Statistiques" })).toBeInTheDocument();
    expect(screen.getByText("Dépenses par catégorie")).toBeInTheDocument();
    expect(screen.getByText("Évolution du solde")).toBeInTheDocument();
  });
});
