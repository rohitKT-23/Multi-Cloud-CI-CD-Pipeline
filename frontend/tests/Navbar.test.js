import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../src/components/Navbar";

test("renders Navbar component", () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

  const linkElement = screen.getByText(/home/i);
  expect(linkElement).toBeInTheDocument(); // 🛠 Now it will work!
});
