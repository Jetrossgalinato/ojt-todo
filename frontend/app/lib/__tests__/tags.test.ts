import { describe, it, expect } from "vitest"
import {
  parseTags,
  tagsToApiPayload,
  tagsDisplayString,
  tagsToFormInput,
} from "../tags"
import type { TaskTag } from "~/types/tasks.type"

describe("parseTags", () => {
  it("converts comma-separated string into a clean array", () => {
    expect(parseTags("urgent, home")).toEqual(["urgent", "home"])
  })

  it("trims whitespace from each tag", () => {
    expect(parseTags("  urgent  ,  home  ")).toEqual(["urgent", "home"])
  })

  it("lowercases all tags", () => {
    expect(parseTags("Urgent, HOME, School")).toEqual(["urgent", "home", "school"])
  })

  it("removes duplicate tags (case-insensitive)", () => {
    expect(parseTags("Urgent, urgent, URGENT")).toEqual(["urgent"])
  })

  it("filters out empty and blank tags", () => {
    expect(parseTags("urgent, , , home,   ")).toEqual(["urgent", "home"])
  })

  it("returns empty array for empty string", () => {
    expect(parseTags("")).toEqual([])
  })

  it("returns empty array for whitespace-only string", () => {
    expect(parseTags("   ")).toEqual([])
  })

  it("returns empty array for null/undefined input", () => {
    // @ts-expect-error testing invalid input
    expect(parseTags(null)).toEqual([])
    // @ts-expect-error testing invalid input
    expect(parseTags(undefined)).toEqual([])
  })

  it("handles single tag", () => {
    expect(parseTags("urgent")).toEqual(["urgent"])
  })

  it("handles trailing/leading commas", () => {
    expect(parseTags(",urgent,home,")).toEqual(["urgent", "home"])
  })
})

describe("tagsToApiPayload", () => {
  it("returns a clean string array, never a JSON string", () => {
    const result = tagsToApiPayload("urgent, home")
    expect(typeof result).not.toBe("string")
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(["urgent", "home"])
  })

  it("never returns a JSON string representation", () => {
    const result = tagsToApiPayload('["urgent","home"]')
    expect(typeof result).toBe("object")
    expect(Array.isArray(result)).toBe(true)
    expect(result).not.toBe('["urgent","home"]')
  })

  it("deduplicates tags", () => {
    const result = tagsToApiPayload("urgent, Urgent, URGENT")
    expect(result).toEqual(["urgent"])
  })
})

describe("tagsDisplayString", () => {
  it("joins TaskTag array names with comma", () => {
    const tags: TaskTag[] = [
      { id: "1", name: "urgent" },
      { id: "2", name: "home" },
    ]
    expect(tagsDisplayString(tags)).toBe("urgent, home")
  })

  it("returns empty string for empty array", () => {
    expect(tagsDisplayString([])).toBe("")
  })

  it("handles string input (fallback)", () => {
    expect(tagsDisplayString("urgent, home")).toBe("urgent, home")
  })

  it("returns empty string for null input", () => {
    expect(tagsDisplayString(null)).toBe("")
  })

  it("returns empty string for undefined input", () => {
    expect(tagsDisplayString(undefined)).toBe("")
  })
})

describe("tagsToFormInput", () => {
  it("converts TaskTag array to comma-separated string for form input", () => {
    const tags: TaskTag[] = [
      { id: "1", name: "urgent" },
      { id: "2", name: "home" },
    ]
    expect(tagsToFormInput(tags)).toBe("urgent, home")
  })

  it("returns empty string for empty array", () => {
    expect(tagsToFormInput([])).toBe("")
  })
})

describe("round-trip: save and load preserves tags as array", () => {
  it("parseTags output sent to API is always a string array", () => {
    const formInput = "school, urgent, home"
    const payload = tagsToApiPayload(formInput)

    expect(typeof payload).not.toBe("string")
    expect(Array.isArray(payload)).toBe(true)
    expect(payload).toEqual(["school", "urgent", "home"])
  })

  it("tags from API loaded into form input preserves values", () => {
    const apiTags: TaskTag[] = [
      { id: "1", name: "school" },
      { id: "2", name: "urgent" },
      { id: "3", name: "home" },
    ]
    const formInput = tagsToFormInput(apiTags)
    const reparsed = tagsToApiPayload(formInput)

    expect(reparsed).toEqual(["school", "urgent", "home"])
    expect(typeof reparsed).not.toBe("string")
  })
})
