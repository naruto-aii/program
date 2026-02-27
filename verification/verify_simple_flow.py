from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to home...")
    page.goto("http://localhost:3000")

    print("Clicking Start...")

    # Use evaluate to click the button directly in the DOM, bypassing potential overlays
    # We select the button that contains the text 'ゲストとして開始する'
    page.evaluate("""
        const buttons = Array.from(document.querySelectorAll('button'));
        const startBtn = buttons.find(b => b.textContent.includes('ゲストとして開始する'));
        if (startBtn) startBtn.click();
    """)

    # Wait for the transition
    page.wait_for_timeout(1000)

    print("Checking for Step 1...")

    # Check if any step 1 content is visible
    # We look for "Question 1" or the specific text
    content_visible = False

    if page.locator("text=Question 1").is_visible():
        print("Question 1 header found.")
        content_visible = True
    elif page.locator("text=現在のレベルを教えてください").is_visible():
        print("Step 1 text found.")
        content_visible = True

    if not content_visible:
        print("Step 1 not visible. Taking screenshot.")
        page.screenshot(path="verification/failed_step1.png")
        print(page.content()[:1000]) # Dump content
        exit(1)

    print("Step 1: Level Selection")
    # Click "中級者"
    page.evaluate("""
        const divs = Array.from(document.querySelectorAll('div[role="button"]'));
        const levelBtn = divs.find(d => d.textContent.includes('中級者'));
        if (levelBtn) levelBtn.click();
    """)
    page.wait_for_timeout(500)

    print("Step 2: Goal Selection")
    page.evaluate("""
        const divs = Array.from(document.querySelectorAll('div[role="button"]'));
        const goalBtn = divs.find(d => d.textContent.includes('筋肥大'));
        if (goalBtn) goalBtn.click();
    """)
    page.wait_for_timeout(500)

    print("Step 3: Environment Selection")
    # Select Gym
    page.evaluate("""
        const btns = Array.from(document.querySelectorAll('button[type="button"]'));
        const gymBtn = btns.find(b => b.textContent.includes('ジム (Gym)'));
        if (gymBtn) gymBtn.click();
    """)
    # Click Next
    page.evaluate("""
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent.includes('次へ'));
        if (nextBtn) nextBtn.click();
    """)
    page.wait_for_timeout(500)

    print("Step 4: 1RM (Skip)")
    # Click Next (skip inputs)
    page.evaluate("""
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent.includes('次へ'));
        if (nextBtn) nextBtn.click();
    """)
    page.wait_for_timeout(500)

    print("Step 5: Health Check")
    page.evaluate("""
        const divs = Array.from(document.querySelectorAll('div[role="button"]'));
        const healthBtn = divs.find(d => d.textContent.includes('健康です'));
        if (healthBtn) healthBtn.click();
    """)
    page.wait_for_timeout(500)

    print("Step 6: Generate Page")
    # Check for Generate button
    generate_visible = page.evaluate("""
        const btns = Array.from(document.querySelectorAll('button'));
        const genBtn = btns.find(b => b.textContent.includes('メニューを生成する'));
        return !!genBtn;
    """)

    if generate_visible:
        print("Success: Generate button found.")
        page.screenshot(path="verification/step6_success.png")
    else:
        print("Error: Generate button not found.")
        page.screenshot(path="verification/step6_fail.png")
        exit(1)

    print("Verification complete: Flow is intact.")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
