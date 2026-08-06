import { describe, it, expect } from "vitest";
import { toWindowsCopyPath } from "./path";

describe("toWindowsCopyPath", () => {
  it("removes leading data/ and converts slashes", () => {
    expect(
      toWindowsCopyPath("data/kalaios-imports/google-drive/a/b.png")
    ).toBe("\\kalaios-imports\\google-drive\\a\\b.png");
  });

  it("handles backslashes with leading data segment", () => {
    expect(
      toWindowsCopyPath("data\\kalaios-imports\\google-drive\\a\\b.png")
    ).toBe("\\kalaios-imports\\google-drive\\a\\b.png");
  });

  it("handles leading /data segment", () => {
    expect(
      toWindowsCopyPath("/data/kalaios-imports/google-drive/a.png")
    ).toBe("\\kalaios-imports\\google-drive\\a.png");
  });

  it("adds leading backslash when data segment is absent", () => {
    expect(
      toWindowsCopyPath("kalaios-imports/google-drive/a.png")
    ).toBe("\\kalaios-imports\\google-drive\\a.png");
  });

  it("is idempotent for already-correct paths", () => {
    expect(
      toWindowsCopyPath("\\kalaios-imports\\google-drive\\a.png")
    ).toBe("\\kalaios-imports\\google-drive\\a.png");
  });
});
