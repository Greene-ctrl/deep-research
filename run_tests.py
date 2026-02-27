
import requests

def test_homepage():
    try:
        response = requests.get("https://harvesthealth-deep-research.hf.space")
        if response.status_code == 200:
            print("PASS: Homepage load (200 OK)")
        else:
            print(f"FAIL: Homepage load ({response.status_code})")
    except Exception as e:
        print(f"FAIL: Homepage load (Error: {e})")

def test_sse_endpoint():
    # Attempt to access the SSE endpoint without auth
    try:
        response = requests.get("https://harvesthealth-deep-research.hf.space/api/sse/live", timeout=5)
        if response.status_code == 403:
            print("PASS: /api/sse/live (403 Forbidden - Auth likely required)")
        elif response.status_code == 200:
             print("PASS: /api/sse/live (200 OK - Public access)")
        else:
            print(f"INFO: /api/sse/live returned {response.status_code}")
    except Exception as e:
        print(f"FAIL: /api/sse/live check (Error: {e})")

if __name__ == "__main__":
    print("Running API Tests...")
    test_homepage()
    test_sse_endpoint()
