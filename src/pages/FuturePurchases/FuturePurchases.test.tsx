// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it } from "vitest";
import { BrowserRouter } from "react-router-dom";

import { BudgetProvider } from "../../context/BudgetContext";
import { FuturePurchases } from "./FuturePurchases";

beforeEach(() => localStorage.clear());

describe("FuturePurchases", () => {
  it("affiche l'état vide et le bouton d'ajout", () => {
    render(<BrowserRouter><BudgetProvider><FuturePurchases /></BudgetProvider></BrowserRouter>);
    expect(screen.getByRole("heading", { name: "Achats futurs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ajouter un achat/i })).toBeInTheDocument();
  });
});
