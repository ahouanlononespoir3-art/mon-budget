// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { BudgetProvider } from "../../context/BudgetContext";
import { Calendar } from "./Calendar";

beforeEach(() => localStorage.clear());

describe("Calendar", () => {
  it("affiche le calendrier financier et les opérations du jour", () => {
    render(<BrowserRouter><BudgetProvider><Calendar /></BudgetProvider></BrowserRouter>);
    expect(screen.getByRole("heading", { name: "Calendrier financier" })).toBeInTheDocument();
    expect(screen.getByText(/Opérations du/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ajouter/i })).toBeInTheDocument();
  });
});
