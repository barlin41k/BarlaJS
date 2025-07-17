import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { BarlaAsync, BarlaSync } from "../src/classes"
import * as fs from "fs/promises"
import * as fsSync from "fs"
import * as path from "path"

/*
Этот файл предназначен для теста функций библиотеки
*/

const testFile = path.resolve(__dirname, "test_data.json")

describe("BarlaAsync JSON Operations", () => {

  beforeAll(async () => {
    try { await fs.unlink(testFile) } catch {}
  })
  afterAll(async () => {
    try { await fs.unlink(testFile) } catch {}
  })

  it("should create a JSON file", async () => {
    const resultPath = await BarlaAsync.create(testFile, { name: "AsyncTest" })
    expect(resultPath).toBe(testFile)

    const content = await fs.readFile(testFile, "utf-8")
    const json = JSON.parse(content)
    expect(json.name).toBe("AsyncTest")
  })
  it("should get object from JSON file", async () => {
    const data = await BarlaAsync.get(testFile)
    expect(data.name).toBe("AsyncTest")
  })
  it("should update and save new object to JSON file", async () => {
    const updated = { name: "Updated", age: 30 }
    await BarlaAsync.save(testFile, updated)
    const data = await BarlaAsync.get(testFile)
    expect(data.name).toBe("Updated")
    expect(data.age).toBe(30)
  })
  it("should search a key from object in JSON file", async () => {
    const result = await BarlaAsync.search(testFile, "age")
    expect(result).toBe(30)
  })
  it("should return null when searching nonexistent key in JSON file", async () => {
    const result = await BarlaAsync.search(testFile, "nonexistent")
    expect(result).toBeNull()
  })
  it("should remove a key in JSON file", async () => {
    const newData = await BarlaAsync.removeKey(testFile, "age")
    expect("age" in newData).toBe(false)
  })
  it("should detect empty JSON", async () => {
    await BarlaAsync.save(testFile, {})
    const data = await BarlaAsync.get(testFile)
    const result = await BarlaAsync.isJsonEmpty(data)
    expect(result).toBe(true)
  })
  it("should delete JSON file", async () => {
    const deleted = await BarlaAsync.delete(testFile)
    expect(deleted).toBe(true)
  })

})

describe("BarlaSync JSON Operations", () => {

  beforeAll(() => {
    try { fsSync.unlinkSync(testFile) } catch {}
  })

  afterAll(() => {
    try { fsSync.unlinkSync(testFile) } catch {}
  })

  it("should create a JSON file", () => {
    const resultPath = BarlaSync.create(testFile, { name: "SyncTest" })
    expect(resultPath).toBe(testFile)

    const content = fsSync.readFileSync(testFile, "utf-8")
    const json = JSON.parse(content)
    expect(json.name).toBe("SyncTest")
  })

  it("should get object from JSON file", () => {
    const data = BarlaSync.get(testFile)
    expect(data.name).toBe("SyncTest")
  })

  it("should update and save new object to JSON file", () => {
    const updated = { name: "UpdatedSync", age: 20 }
    BarlaSync.save(testFile, updated)
    const data = BarlaSync.get(testFile)
    expect(data.name).toBe("UpdatedSync")
    expect(data.age).toBe(20)
  })

  it("should search key in JSON", () => {
    const result = BarlaSync.search(testFile, "age")
    expect(result).toBe(20)
  })

  it("should return null for nonexistent key in JSON file", () => {
    const result = BarlaSync.search(testFile, "nonexistent")
    expect(result).toBeNull()
  })

  it("should remove a key in JSON file", () => {
    const newData = BarlaSync.removeKey(testFile, "age")
    expect("age" in newData).toBe(false)
  })

  it("should detect empty JSON", () => {
    BarlaSync.save(testFile, {})
    const data = BarlaSync.get(testFile)
    const result = BarlaSync.isJsonEmpty(data)
    expect(result).toBe(true)
  })

  it("should delete JSON file", () => {
    const deleted = BarlaSync.delete(testFile)
    expect(deleted).toBe(true)
  })
})
