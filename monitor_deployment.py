from huggingface_hub import HfApi
import time

api = HfApi()
repo_id = "harvesthealth/deep-research"

print(f"Monitoring build status for {repo_id}...")

while True:
    try:
        runtime = api.get_space_runtime(repo_id=repo_id)
        stage = runtime.stage
        print(f"Current stage: {stage}")

        if stage == "RUNNING":
            print("Deployment successful! Space is RUNNING.")
            break
        elif stage == "BUILDING":
            print("Building...")
        elif stage == "APP_STARTING":
            print("Starting app...")
        elif stage == "FAILED":
            print("Deployment FAILED.")
            # Can we get logs? Maybe not easily via this simple call.
            break

        time.sleep(10)
    except Exception as e:
        print(f"Error checking status: {e}")
        time.sleep(10)
