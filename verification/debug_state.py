from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to home...")
    page.goto("http://localhost:3000")

    print("Initial Content Check:")
    print(page.title())

    # Try finding the start button
    start_btn = page.locator("button:has-text('ゲストとして開始する')")

    if start_btn.count() > 0:
        print("Start button found.")
        start_btn.click()
        page.wait_for_timeout(2000)

        # Check if step 1 appeared
        step1 = page.locator("text=現在のレベルを教えてください")
        if step1.count() > 0:
            print("Step 1 is visible!")
        else:
            print("Step 1 NOT visible. Dumping content for debug.")
            print(page.content()[:500]) # Print first 500 chars
            page.screenshot(path="verification/failed_transition.png")

            # Check if we are still on step 0
            if page.locator("text=Training Menu AI").count() > 0:
                print("Still on Step 0.")
    else:
        print("Start button not found via locator.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
