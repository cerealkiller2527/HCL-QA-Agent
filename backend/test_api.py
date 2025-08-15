"""
Test script for the FastAPI backend
Run this to verify the API is working correctly
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint: str, description: str) -> Dict[str, Any]:
    """Test a single endpoint and print results"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint}")
    print("-" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        response.raise_for_status()
        data = response.json()
        
        print(f"[OK] Status: {response.status_code}")
        print(f"Response preview:")
        
        # Pretty print the response (truncated if too large)
        response_str = json.dumps(data, indent=2)
        if len(response_str) > 1000:
            print(response_str[:1000] + "\n... (truncated)")
        else:
            print(response_str)
        
        return data
        
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to server")
        print("Make sure the server is running: python main.py")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] HTTP Error: {e}")
        print(f"Response: {response.text if 'response' in locals() else 'N/A'}")
        return None
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return None

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("LEROBOT DATASET API TEST SUITE")
    print("="*60)
    
    # Test 1: Root endpoint
    test_endpoint("/", "Root Endpoint")
    
    # Test 2: Health check
    test_endpoint("/health", "Health Check")
    
    # Test 3: User info
    user_data = test_endpoint("/api/v1/user", "User Information")
    
    # Test 4: List datasets
    datasets = test_endpoint("/api/v1/datasets", "List Datasets")
    
    if datasets and len(datasets) > 0:
        # Test 5: Get first dataset details
        first_dataset_id = datasets[0]["id"]
        test_endpoint(
            f"/api/v1/datasets/{first_dataset_id}", 
            f"Dataset Details for {first_dataset_id}"
        )
        
        # Test 6: Get episodes
        episodes = test_endpoint(
            f"/api/v1/datasets/{first_dataset_id}/episodes",
            f"Episodes for {first_dataset_id}"
        )
        
        if episodes and len(episodes) > 0:
            # Test 7: Get first episode data
            test_endpoint(
                f"/api/v1/datasets/{first_dataset_id}/episodes/0",
                f"Episode 0 Data for {first_dataset_id}"
            )
    
    print("\n" + "="*60)
    print("TEST SUITE COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()