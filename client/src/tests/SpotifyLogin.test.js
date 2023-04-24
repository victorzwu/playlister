import { render, screen } from "@testing-library/react";
import SpotifyLogin from "../pages/SpotifyLogin";

test("renders Artist copy", () => {
  render(<SpotifyLogin />);
  expect(screen.getByText("Connect with Spotify")).toBeInTheDocument();
});
