#!/usr/bin/env python
"""
Comprehensive Real Data Test Suite
Tests with actual HuggingFace API key and real LeRobot datasets
"""

import requests
import json
import os
import sys
import time
from typing import Dict, Any, List

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.huggingface_service import HuggingFaceService

# Test configuration
API_BASE = "http://localhost:8000"
REAL_DATASETS = [
    "lerobot/aloha_mobile_cabinet",
    "lerobot/aloha_sim_insertion_human_image",
    "cadene/pusht_image"
]

class ComprehensiveDataTester:
    def __init__(self):
        """Initialize with real HF token from environment"""
        self.hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        if not self.hf_token:
            raise ValueError("Please set HF_TOKEN environment variable with your HuggingFace API key")
        
        self.headers = {"Authorization": f"Bearer {self.hf_token}"}
        self.results = []
        
    def run_comprehensive_tests(self):
        """Run all tests with real data"""
        print("Comprehensive LeRobot Backend Tests with Real API Key")
        print("=" * 60)
        print(f"Using HF Token: {self.hf_token[:8]}***{self.hf_token[-4:]}")
        print()
        
        # Check server status
        if not self._check_server():
            return
        
        # Test direct service functionality
        self._test_direct_service()
        
        # Test API endpoints with real data
        for dataset_id in REAL_DATASETS:
            self._test_dataset_comprehensive(dataset_id)
        
        # Test performance and large data handling
        self._test_performance()
        
        self._print_final_results()
    
    def _check_server(self) -> bool:
        """Check if server is running"""
        try:
            response = requests.get(f"{API_BASE}/health", timeout=5)
            if response.status_code == 200:
                print("Server Status: RUNNING")
                return True
            else:
                print(f"Server Status: ERROR ({response.status_code})")
                return False
        except Exception as e:
            print(f"Server Status: NOT ACCESSIBLE ({e})")
            print("Please start server with: python main.py")
            return False
    
    def _test_direct_service(self):
        """Test HuggingFaceService directly"""
        print("\n" + "=" * 40)
        print("DIRECT SERVICE TESTS")
        print("=" * 40)
        
        try:
            service = HuggingFaceService(self.hf_token)
            
            # Test user info
            print("Testing user authentication...")
            user_info = service.get_user_info()
            print(f"  User: {user_info.get('username', 'Unknown')}")
            print(f"  Organizations: {len(user_info.get('organizations', []))}")
            self._log_result("Direct Service", "User Info", True, "Successfully retrieved user info")
            
            # Test dataset listing
            print("\nTesting dataset listing...")
            datasets = service.get_user_datasets(limit=5)
            print(f"  Found {len(datasets)} datasets")
            if datasets:
                print(f"  Sample: {datasets[0]['name']}")
            self._log_result("Direct Service", "Dataset Listing", True, f"Retrieved {len(datasets)} datasets")
            
            # Test with a real LeRobot dataset
            test_repo = "lerobot/aloha_mobile_cabinet"
            print(f"\nTesting with {test_repo}...")
            
            # Test metadata extraction
            metadata = service._get_lerobot_metadata(test_repo)
            if metadata:
                features_count = len(metadata.get('features', {}))
                robot_type = metadata.get('robot_type', 'unknown')
                print(f"  Metadata: {features_count} features, robot: {robot_type}")
                self._log_result("Direct Service", "Metadata Extraction", True, f"{features_count} features extracted")
            else:
                self._log_result("Direct Service", "Metadata Extraction", False, "No metadata found")
            
            # Test enhanced features
            features = service.get_dataset_features(test_repo)
            if features:
                states_count = len(features.get('states', {}))
                actions_count = len(features.get('actions', {}))
                videos_count = len(features.get('videos', {}))
                print(f"  Features: {states_count} states, {actions_count} actions, {videos_count} videos")
                self._log_result("Direct Service", "Feature Analysis", True, 
                               f"{states_count}S/{actions_count}A/{videos_count}V")
            
        except Exception as e:
            print(f"  ERROR: {e}")
            self._log_result("Direct Service", "General", False, str(e))
    
    def _test_dataset_comprehensive(self, dataset_id: str):
        """Test all endpoints for a dataset"""
        owner, name = dataset_id.split("/")
        
        print(f"\n" + "=" * 40)
        print(f"TESTING DATASET: {dataset_id}")
        print("=" * 40)
        
        # Test basic dataset info
        self._test_endpoint(f"/api/v1/datasets/{owner}/{name}", "Basic Dataset Info")
        
        # Test enhanced endpoints
        self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/enhanced", "Enhanced Dataset")
        self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/features", "Dataset Features")
        self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/analytics", "Dataset Analytics")
        self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/robot-config", "Robot Config")
        
        # Test episodes
        episodes_response = self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/episodes", "Episodes List")
        
        # If we got episodes, test episode-specific endpoints
        if episodes_response and episodes_response.get('status_code') == 200:
            episodes_data = episodes_response.get('data', [])
            if episodes_data:
                episode_count = len(episodes_data)
                print(f"  Found {episode_count} episodes")
                
                # Test first episode in detail
                episode_id = episodes_data[0].get('id', 0)
                print(f"  Testing episode {episode_id} in detail...")
                
                self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/episodes/{episode_id}", 
                                  f"Episode {episode_id} Data")
                self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/episodes/{episode_id}/enhanced", 
                                  f"Episode {episode_id} Enhanced")
                
                # Test telemetry with different parameters
                telemetry_response = self._test_endpoint(
                    f"/api/v1/datasets/{owner}/{name}/episodes/{episode_id}/telemetry", 
                    f"Episode {episode_id} Telemetry"
                )
                
                # Test with filtering
                self._test_endpoint(
                    f"/api/v1/datasets/{owner}/{name}/episodes/{episode_id}/telemetry?features=observation.state&downsample=10", 
                    f"Episode {episode_id} Filtered Telemetry"
                )
                
                self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/episodes/{episode_id}/video-metadata", 
                                  f"Episode {episode_id} Video Meta")
    
    def _test_endpoint(self, endpoint: str, description: str) -> Dict[str, Any]:
        """Test a single endpoint and return response info"""
        print(f"  {description:<25} ", end="", flush=True)
        
        start_time = time.time()
        try:
            response = requests.get(f"{API_BASE}{endpoint}", headers=self.headers, timeout=30)
            duration = time.time() - start_time
            
            status = response.status_code
            
            if status == 200:
                try:
                    data = response.json()
                    data_size = len(json.dumps(data)) if data else 0
                    print(f"PASS ({duration:.2f}s, {data_size} bytes)")
                    self._log_result("API", description, True, f"{duration:.2f}s, {data_size}B")
                    return {"status_code": 200, "data": data, "duration": duration}
                except:
                    print(f"PASS ({duration:.2f}s, non-JSON)")
                    self._log_result("API", description, True, f"{duration:.2f}s, non-JSON")
                    return {"status_code": 200, "data": None, "duration": duration}
            
            elif status == 401:
                print("AUTH_ERROR")
                self._log_result("API", description, False, "Authentication failed")
            elif status == 404:
                print("NOT_FOUND")
                self._log_result("API", description, False, "Dataset/episode not found")
            elif status == 500:
                try:
                    error_data = response.json()
                    print(f"SERVER_ERROR: {error_data.get('detail', 'Unknown')}")
                    self._log_result("API", description, False, f"Server error: {error_data.get('detail')}")
                except:
                    print("SERVER_ERROR")
                    self._log_result("API", description, False, "Server error")
            else:
                print(f"UNEXPECTED ({status})")
                self._log_result("API", description, False, f"Unexpected status: {status}")
                
        except requests.exceptions.Timeout:
            print("TIMEOUT")
            self._log_result("API", description, False, "Request timeout")
        except Exception as e:
            print(f"ERROR: {str(e)[:30]}")
            self._log_result("API", description, False, f"Exception: {str(e)[:30]}")
        
        return {"status_code": 0, "data": None, "duration": 0}
    
    def _test_performance(self):
        """Test performance and large data handling"""
        print(f"\n" + "=" * 40)
        print("PERFORMANCE TESTS")
        print("=" * 40)
        
        # Test with largest dataset
        dataset = "lerobot/aloha_mobile_cabinet"  # Usually has more episodes
        owner, name = dataset.split("/")
        
        print("Testing large dataset handling...")
        
        # Test episodes list performance
        start_time = time.time()
        response = requests.get(f"{API_BASE}/api/v1/datasets/{owner}/{name}/episodes", 
                              headers=self.headers, timeout=60)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            episodes = response.json()
            episode_count = len(episodes)
            response_size = len(response.content)
            print(f"  Episodes List: {episode_count} episodes in {duration:.2f}s ({response_size} bytes)")
            self._log_result("Performance", "Episodes List", True, 
                           f"{episode_count} episodes, {duration:.2f}s, {response_size}B")
            
            # Test telemetry with different downsample rates
            if episodes:
                episode_id = episodes[0]['id']
                print(f"  Testing telemetry downsampling for episode {episode_id}...")
                
                for downsample in [1, 10, 50]:
                    start_time = time.time()
                    response = requests.get(
                        f"{API_BASE}/api/v1/datasets/{owner}/{name}/episodes/{episode_id}/telemetry?downsample={downsample}",
                        headers=self.headers, timeout=60
                    )
                    duration = time.time() - start_time
                    
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            states = data.get('states', {})
                            if states:
                                first_feature = list(states.keys())[0]
                                data_points = len(states[first_feature]) if states[first_feature] else 0
                                response_size = len(response.content)
                                print(f"    Downsample {downsample}: {data_points} points in {duration:.2f}s ({response_size} bytes)")
                                self._log_result("Performance", f"Downsample {downsample}", True,
                                               f"{data_points} points, {duration:.2f}s, {response_size}B")
                        except:
                            print(f"    Downsample {downsample}: Response received but couldn't parse")
                    else:
                        print(f"    Downsample {downsample}: Failed ({response.status_code})")
        else:
            print(f"  Episodes List: Failed ({response.status_code})")
            self._log_result("Performance", "Episodes List", False, f"Status: {response.status_code}")
    
    def _log_result(self, category: str, test: str, success: bool, details: str):
        """Log test result"""
        self.results.append({
            "category": category,
            "test": test,
            "success": success,
            "details": details
        })
    
    def _print_final_results(self):
        """Print comprehensive test results"""
        print(f"\n" + "=" * 60)
        print("FINAL TEST RESULTS")
        print("=" * 60)
        
        # Count results by category
        categories = {}
        for result in self.results:
            cat = result["category"]
            if cat not in categories:
                categories[cat] = {"total": 0, "passed": 0, "failed": 0}
            categories[cat]["total"] += 1
            if result["success"]:
                categories[cat]["passed"] += 1
            else:
                categories[cat]["failed"] += 1
        
        # Print summary by category
        total_tests = len(self.results)
        total_passed = sum(1 for r in self.results if r["success"])
        total_failed = total_tests - total_passed
        
        print(f"Overall: {total_passed}/{total_tests} tests passed ({(total_passed/total_tests)*100:.1f}%)")
        print()
        
        for category, stats in categories.items():
            success_rate = (stats["passed"] / stats["total"]) * 100
            print(f"{category}: {stats['passed']}/{stats['total']} passed ({success_rate:.1f}%)")
        
        print()
        
        # Print failed tests details
        failed_tests = [r for r in self.results if not r["success"]]
        if failed_tests:
            print("FAILED TESTS:")
            for result in failed_tests[:10]:  # Show first 10 failures
                print(f"  {result['category']} - {result['test']}: {result['details']}")
            if len(failed_tests) > 10:
                print(f"  ... and {len(failed_tests) - 10} more")
        else:
            print("ALL TESTS PASSED!")
        
        print()
        
        # Performance insights
        perf_results = [r for r in self.results if r["category"] == "Performance" and r["success"]]
        if perf_results:
            print("PERFORMANCE INSIGHTS:")
            for result in perf_results:
                print(f"  {result['test']}: {result['details']}")

def main():
    """Main test runner"""
    try:
        tester = ComprehensiveDataTester()
        tester.run_comprehensive_tests()
    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("\nTo run these tests:")
        print("1. Set your HuggingFace API key: export HF_TOKEN=your_token_here")
        print("2. Start the backend server: python main.py")
        print("3. Run this test: python test_comprehensive_real_data.py")
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    main()