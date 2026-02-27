from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Navigate to home
    print("Navigating to home...")
    page.goto("http://localhost:3000")
    page.screenshot(path="verification/step0_home.png")

    # 2. Click Start (Guest)
    print("Clicking start...")
    page.get_by_role("button", name="ゲストとして開始する").click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification/step1_level.png")

    # 3. Select Level (Intermediate)
    print("Selecting level...")
    page.get_by_role("button", name="中級者").click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification/step2_goal.png")

    # 4. Select Goal (Hypertrophy)
    print("Selecting goal...")
    page.get_by_role("button", name="筋肥大").click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification/step3_env.png")

    # 5. Select Environment (Gym) and Next
    print("Selecting environment...")
    page.get_by_role("button", name="ジム (Gym)").click()
    page.get_by_role("button", name="次へ").click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification/step4_1rm.png")

    # 6. Enter 1RM and Next
    print("Entering 1RM...")
    page.get_by_placeholder("Example: 100").fill("100") # Squat
    page.get_by_placeholder("Example: 80").fill("80")   # Bench
    page.get_by_placeholder("Example: 120").fill("140") # Deadlift
    page.get_by_role("button", name="次へ").click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification/step5_health.png")

    # 7. Health Check
    print("Health check...")
    page.get_by_role("button", name="健康です").click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification/step6_ready.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
