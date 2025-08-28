import { test, expect } from "@playwright/test"

test("Create a new chat and send a message", async ({ page }) => {
  await page.goto("http://localhost:3000/")

  // Click the new chat button
  await page.getByRole("button", { name: "New Chat" }).click()

  // Type a message
  await page.getByPlaceholder("Ask anything...").fill("Hello, world!")

  // Send the message
  await page.getByRole("button", { name: "Send" }).click()

  // Check if the message appears in the chat
  await expect(page.getByText("Hello, world!")).toBeVisible()

  // Check if the chat is saved in local storage
  const chat = await page.evaluate(() => {
    const chats = localStorage.getItem("chats")
    if (!chats) return null
    return JSON.parse(chats)[0]
  })

  expect(chat).not.toBeNull()
  expect(chat.name).toBe("Hello, world!")
})
