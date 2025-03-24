import React from "react"; // ✅ Fix: React import required
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../src/pages/Register";
import axios from "../src/services/api"; // ✅ API mock ke liye import
import { jest } from "@jest/globals";

// ✅ Mock axios API call
jest.mock("../src/services/api");

test("renders register form and submits data", async () => {
  // Mock API response
  axios.post.mockResolvedValue({ data: { message: "Registration successful!" } });

  render(<Register />);

  // Select inputs
  const nameInput = screen.getByPlaceholderText(/name/i);
  const emailInput = screen.getByPlaceholderText(/email/i);
  const passwordInput = screen.getByPlaceholderText(/password/i);
  const submitButton = screen.getByRole("button", { name: /register/i });

  // Fill inputs
  fireEvent.change(nameInput, { target: { value: "Test User" } });
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "password123" } });

  // Click submit
  fireEvent.click(submitButton);

  // ✅ Wait for API response
  await waitFor(() => {
    expect(screen.getByText(/registration successful!/i)).toBeInTheDocument();
  });

  // ✅ Ensure API was called with correct data
  expect(axios.post).toHaveBeenCalledWith("/users/register", {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
});
