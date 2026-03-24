import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders application heading", () => {
  render(<App />);
  const headingElement = screen.getByText(/Welcome Back/i);
  expect(headingElement).toBeInTheDocument();
});
