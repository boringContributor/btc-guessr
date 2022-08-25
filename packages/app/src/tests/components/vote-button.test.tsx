import { describe, test } from "vitest";
import { screen } from "@testing-library/react";
import VoteButton from "../../components/vote-button";
import { renderWithClient } from "../utils";

const LABEL = "up";

describe("Vote Button", () => {
  test("render vote button", async () => {
    renderWithClient(<VoteButton label={LABEL} disabled={false} />);
    const button = screen.getByRole("button", {
      name: LABEL,
    });
    expect(button).toBeDefined();
    expect(button).toHaveProperty("disabled", false);
  });

  test("disable render button", async () => {
    const LABEL = "up";
    renderWithClient(<VoteButton label={LABEL} disabled={true} />);
    const button = screen.getByRole("button", {
      name: LABEL,
    });
    expect(button).toBeDefined();
    expect(button).toHaveProperty("disabled", true);
  });
});
