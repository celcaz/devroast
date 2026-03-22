import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRoastActionMock } = vi.hoisted(() => ({
  createRoastActionMock: vi.fn(),
}));

vi.mock("@/features/roast/actions/create-roast", () => ({
  createRoastAction: createRoastActionMock,
}));

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("./code-editor", () => ({
  CodeEditor: ({
    value,
    onChange,
    language,
    onLanguageChange,
  }: {
    value: string;
    onChange: (value: string) => void;
    language: string;
    onLanguageChange?: (lang: string) => void;
  }) => (
    <div>
      <label htmlFor="code">code</label>
      <textarea
        id="code"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <label htmlFor="language">language</label>
      <select
        id="language"
        value={language}
        onChange={(event) => onLanguageChange?.(event.target.value)}
      >
        <option value="auto">auto</option>
        <option value="javascript">javascript</option>
        <option value="typescript">typescript</option>
        <option value="python">python</option>
      </select>
    </div>
  ),
}));

import { CodeInputSection } from "./code-input-section";

describe("CodeInputSection", () => {
  beforeEach(() => {
    createRoastActionMock.mockReset();
  });

  it("disables button during submission", async () => {
    const user = userEvent.setup();
    createRoastActionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: false,
                error: {
                  code: "AI_ERROR",
                  message: "erro",
                },
              }),
            10,
          );
        }),
    );

    render(<CodeInputSection metricsSlot={null} />);

    await user.type(
      screen.getByRole("textbox", { name: /code/i }),
      "const x = 1;",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /language/i }),
      "javascript",
    );
    await user.click(screen.getByRole("button", { name: /\$ roast_my_code/i }));

    expect(
      screen.getByRole("button", { name: /\$ roasting\.\.\./i }),
    ).toBeDisabled();
  });

  it("shows rate-limit message from action error", async () => {
    const user = userEvent.setup();
    createRoastActionMock.mockResolvedValue({
      ok: false,
      error: {
        code: "RATE_LIMIT",
        message: "limite de roasts por hora atingido",
        retryAfterSeconds: 1200,
      },
    });

    render(<CodeInputSection metricsSlot={null} />);

    await user.type(
      screen.getByRole("textbox", { name: /code/i }),
      "const x = 1;",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /language/i }),
      "javascript",
    );
    await user.click(screen.getByRole("button", { name: /\$ roast_my_code/i }));

    expect(
      await screen.findByText(
        /limite de roasts por hora atingido\. tente novamente em ~20 min/i,
      ),
    ).toBeInTheDocument();
  });
});
