import { describe, expect, it } from "vitest";
import { getBlogPost } from "./getBlogPosts";

describe("getBlogPost", () => {
  it("returns the post for a valid slug", () => {
    const post = getBlogPost("gcp-budget-billing-stop");
    expect(post).not.toBeNull();
    expect(post?.slug).toBe("gcp-budget-billing-stop");
    expect(typeof post?.content).toBe("string");
  });

  it("returns null for a path traversal slug (../../../etc/passwd)", () => {
    expect(getBlogPost("../../../etc/passwd")).toBeNull();
  });

  it("returns null for a relative parent slug (../config)", () => {
    expect(getBlogPost("../config")).toBeNull();
  });

  it("returns null for slugs containing slashes (foo/bar)", () => {
    expect(getBlogPost("foo/bar")).toBeNull();
  });

  it("returns null for slugs with uppercase characters (Foo)", () => {
    expect(getBlogPost("Foo")).toBeNull();
  });

  it("returns null for an empty slug", () => {
    expect(getBlogPost("")).toBeNull();
  });

  it("returns null for a syntactically valid but nonexistent slug", () => {
    expect(getBlogPost("nonexistent-post")).toBeNull();
  });
});
