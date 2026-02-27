from playwright.sync_api import sync_playwright
import json

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Log all requests
    page.on("request", lambda request: print(f"Request: {request.method} {request.url}"))
    page.on("response", lambda response: print(f"Response: {response.status} {response.url}"))

    print("Navigating to https://harvesthealth-deep-research.hf.space...")
    page.goto("https://harvesthealth-deep-research.hf.space")

    # Wait for the textarea to be visible
    print("Waiting for input field...")
    page.wait_for_selector("textarea[name='topic']")

    # Fill in the topic
    print("Filling topic...")
    page.fill("textarea[name='topic']", "AI in Healthcare")

    # Click the "Start Thinking" button
    # The button text is "Start Thinking" based on previous view_text_website output
    print("Clicking Start Thinking...")
    page.click("button:has-text('Start Thinking')")

    # Wait a bit for requests to happen
    print("Waiting for requests...")
    page.wait_for_timeout(5000)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
