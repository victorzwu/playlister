import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Profile";

let mockIsAuthenticated = false;

jest.mock("@auth0/auth0-react", () => ({
  ...jest.requireActual("@auth0/auth0-react"),
  Auth0Provider: ({ children }) => children,
  useAuth0: () => {
    return {
      isLoading: false,
      user: {
        sub: "subId",
        name: "Victor Wu",
        email: "wu.victo@northeastern.edu",
        email_verified: true,
      },
      isAuthenticated: mockIsAuthenticated,
      loginWithRedirect: jest.fn(),
    };
  },
}));

test("renders Profile", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Profile />
    </MemoryRouter>
  );

  expect(screen.getByText("Nickname:")).toBeInTheDocument();
  expect(screen.getByText("Email: wu.victo@northeastern.edu")).toBeInTheDocument();
  expect(screen.getByText("Auth0Id: subId")).toBeInTheDocument();
  expect(screen.getByText("Email verified: true")).toBeInTheDocument();
});
