import { render, screen } from "@testing-library/react";
import Error from '../pages/Error'

test("renders Error copy", () => {
  render(<Error />);
  expect(screen.getByText("Sorry, we couldn't load that page!")).toBeInTheDocument();
});
