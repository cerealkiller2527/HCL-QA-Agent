#!/usr/bin/env python
"""
Comprehensive Test Suite for LeRobot Backend
Tests with real cerealkiller2527 datasets and validates performance
"""

import requests
import json
import os
import sys
import time
from typing import Dict, Any, List, Optional

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.huggingface_service import HuggingFaceService

# Test configuration using cerealkiller2527 datasets
API_BASE = "http://localhost:8000"
REAL_DATASETS = [
    "cerealkiller2527/pick_knife",                              # Small: 860 frames
    "cerealkiller2527/so101_test",                             # Medium: 32.7k frames  
    "cerealkiller2527/so101_rayban_quality_assessment_002",    # Large: 56.4k frames
    "cerealkiller2527/so101_rayban_quality_assessment_001"     # Medium: 8.78k frames
]

class ComprehensiveBackendTester:
    def __init__(self):
        """Initialize with real HF token from environment"""
        self.hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        if not self.hf_token:
            raise ValueError("Please set HF_TOKEN environment variable")
        
        self.headers = {"Authorization": f"Bearer {self.hf_token}"}
        self.results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "performance_metrics": {},
            "errors": []
        }
        
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("Comprehensive LeRobot Backend Test Suite")
        print("=" * 60)
        print(f"Using HF Token: {self.hf_token[:8]}***{self.hf_token[-4:]}")
        print(f"Testing {len(REAL_DATASETS)} real datasets")
        print()
        
        if not self._check_server():
            return
            
        # Test each dataset comprehensively
        for dataset_id in REAL_DATASETS:
            print(f"Testing Dataset: {dataset_id}")
            print("-" * 40)
            self._test_dataset_complete(dataset_id)
            print()
        
        # Performance and memory tests
        self._test_performance_scenarios()
        
        # Type compatibility tests
        self._test_data_type_compatibility()
        
        self._print_final_results()
    
    def _check_server(self) -> bool:
        """Check if server is running"""
        try:
            response = requests.get(f"{API_BASE}/health", timeout=10)
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
    
    def _test_dataset_complete(self, dataset_id: str):
        """Complete test suite for a single dataset"""
        owner, name = dataset_id.split("/")
        
        # Test basic endpoints
        basic_endpoints = [
            (f"/api/v1/datasets/{owner}/{name}", "Basic Dataset Info"),
            (f"/api/v1/datasets/{owner}/{name}/enhanced", "Enhanced Dataset"),
            (f"/api/v1/datasets/{owner}/{name}/features", "Dataset Features"),
            (f"/api/v1/datasets/{owner}/{name}/analytics", "Dataset Analytics"),
            (f"/api/v1/datasets/{owner}/{name}/robot-config", "Robot Config"),
            (f"/api/v1/datasets/{owner}/{name}/episodes", "Episodes List")
        ]
        
        for endpoint, description in basic_endpoints:
            self._test_endpoint(endpoint, description)
        
        # Test episode-specific endpoints  
        episodes_response = self._test_endpoint(f"/api/v1/datasets/{owner}/{name}/episodes", "Episodes List", return_data=True)
        
        if episodes_response and episodes_response.get("status_code") == 200:
            episodes = episodes_response.get("data", [])
            if episodes:
                episode_id = episodes[0].get("id", 0)
                self._test_episode_endpoints(owner, name, episode_id)
    
    def _test_episode_endpoints(self, owner: str, name: str, episode_id: int):
        """Test episode-specific endpoints"""
        base_url = f"/api/v1/datasets/{owner}/{name}/episodes/{episode_id}"
        
        # Basic episode data
        self._test_endpoint(f"{base_url}", f"Episode {episode_id} Data")
        self._test_endpoint(f"{base_url}/enhanced", f"Episode {episode_id} Enhanced")
        
        # Telemetry with different parameters
        telemetry_tests = [
            (f"{base_url}/telemetry", "Basic Telemetry"),
            (f"{base_url}/telemetry?downsample=10", "Downsampled Telemetry"),
            (f"{base_url}/telemetry?features=observation.state", "Filtered Telemetry"),
            (f"{base_url}/telemetry?downsample=5&max_points=500", "Limited Telemetry")
        ]
        
        for endpoint, description in telemetry_tests:
            self._test_endpoint(endpoint, description)
        
        # Video and metadata
        self._test_endpoint(f"{base_url}/video-metadata", f"Episode {episode_id} Video Meta")
    
    def _test_endpoint(self, endpoint: str, description: str, return_data: bool = False) -> Optional[Dict[str, Any]]:
        """Test a single endpoint"""
        print(f"  {description:<30} ", end="", flush=True)
        self.results["total_tests"] += 1
        
        start_time = time.time()
        try:
            response = requests.get(f"{API_BASE}{endpoint}", headers=self.headers, timeout=30)
            duration = time.time() - start_time
            
            # Record performance metric
            if description not in self.results["performance_metrics"]:
                self.results["performance_metrics"][description] = []
            self.results["performance_metrics"][description].append(duration)
            
            status = response.status_code
            
            if status == 200:
                try:
                    data = response.json()
                    data_size = len(response.content)
                    print(f"PASS ({duration:.2f}s, {data_size:,} bytes)")
                    self.results["passed"] += 1
                    
                    if return_data:
                        return {"status_code": 200, "data": data}
                        
                except json.JSONDecodeError:
                    print(f"PASS ({duration:.2f}s, non-JSON)")
                    self.results["passed"] += 1
                    
            elif status == 401:
                print("AUTH_ERROR")
                self.results["failed"] += 1
                self.results["errors"].append(f"{description}: Authentication failed")
                
            elif status == 404:
                print("NOT_FOUND")  
                self.results["failed"] += 1
                self.results["errors"].append(f"{description}: Resource not found")
                
            elif status == 500:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", "Unknown server error")
                    print(f"SERVER_ERROR: {error_msg}")
                    self.results["failed"] += 1
                    self.results["errors"].append(f"{description}: {error_msg}")
                except:
                    print("SERVER_ERROR")
                    self.results["failed"] += 1
                    self.results["errors"].append(f"{description}: Unknown server error")
                    
            else:
                print(f"UNEXPECTED ({status})")
                self.results["failed"] += 1
                self.results["errors"].append(f"{description}: Unexpected status {status}")
                
        except requests.exceptions.Timeout:
            print("TIMEOUT")
            self.results["failed"] += 1
            self.results["errors"].append(f"{description}: Request timeout")
            
        except Exception as e:
            print(f"ERROR: {str(e)[:40]}")
            self.results["failed"] += 1
            self.results["errors"].append(f"{description}: {str(e)[:40]}")
        
        return None
    
    def _test_performance_scenarios(self):
        """Test performance with different data sizes"""
        print("Performance & Memory Tests")
        print("-" * 40)
        
        # Test large dataset handling
        large_dataset = "cerealkiller2527/so101_rayban_quality_assessment_002"  # 56.4k frames
        owner, name = large_dataset.split("/")
        
        # Test different downsample rates
        print("Testing downsampling performance...")
        for downsample in [1, 5, 10, 20]:
            endpoint = f"/api/v1/datasets/{owner}/{name}/episodes/0/telemetry?downsample={downsample}"
            start_time = time.time()
            
            try:
                response = requests.get(f"{API_BASE}{endpoint}", headers=self.headers, timeout=60)
                duration = time.time() - start_time
                
                if response.status_code == 200:
                    data_size = len(response.content)
                    print(f"  Downsample {downsample:2d}: {duration:.2f}s, {data_size:,} bytes")
                else:
                    print(f"  Downsample {downsample:2d}: Failed ({response.status_code})")
                    
            except Exception as e:
                print(f"  Downsample {downsample:2d}: Error - {str(e)[:30]}")
        
        print()
        
        # Test different datasets by size
        print("Testing by dataset size...")
        for dataset_id in REAL_DATASETS:
            owner, name = dataset_id.split("/")
            endpoint = f"/api/v1/datasets/{owner}/{name}/episodes/0/telemetry"
            
            start_time = time.time()
            try:
                response = requests.get(f"{API_BASE}{endpoint}", headers=self.headers, timeout=60)
                duration = time.time() - start_time
                
                if response.status_code == 200:
                    data_size = len(response.content)
                    print(f"  {name[:30]:<30}: {duration:.2f}s, {data_size:,} bytes")
                else:
                    print(f"  {name[:30]:<30}: Failed ({response.status_code})")
                    
            except Exception as e:
                print(f"  {name[:30]:<30}: Error - {str(e)[:30]}")
        
        print()
    
    def _test_data_type_compatibility(self):
        """Test data type compatibility with LeRobot"""
        print("Data Type Compatibility Tests")
        print("-" * 40)
        
        # Test with a known dataset
        dataset = "cerealkiller2527/so101_test"
        owner, name = dataset.split("/")
        
        # Test features endpoint for type validation
        endpoint = f"/api/v1/datasets/{owner}/{name}/features"
        try:
            response = requests.get(f"{API_BASE}{endpoint}", headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                features = response.json()
                
                # Check for expected LeRobot features
                expected_categories = ["states", "actions", "videos"]
                found_categories = []
                
                for category in expected_categories:
                    if category in features and features[category]:
                        found_categories.append(category)
                        print(f"  {category.capitalize():<15}: {len(features[category])} features found")
                
                if len(found_categories) >= 2:  # At least states and actions
                    print("  Compatibility: COMPATIBLE with LeRobot format")
                else:
                    print("  Compatibility: PARTIAL compatibility")
                    
                # Check specific data types
                if "states" in features:
                    for feature_name, feature_info in features["states"].items():
                        dtype = feature_info.get("dtype", "unknown")
                        shape = feature_info.get("shape", [])
                        print(f"    {feature_name}: {dtype}, shape={shape}")
                        
            else:
                print(f"  Features test failed: {response.status_code}")
                
        except Exception as e:
            print(f"  Compatibility test error: {e}")
        
        print()
    
    def _print_final_results(self):
        """Print comprehensive test results"""
        print("=" * 60)
        print("FINAL TEST RESULTS")
        print("=" * 60)
        
        # Overall statistics
        total = self.results["total_tests"]
        passed = self.results["passed"]
        failed = self.results["failed"]
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        # Performance summary
        if self.results["performance_metrics"]:
            print("PERFORMANCE SUMMARY:")
            for test_name, durations in self.results["performance_metrics"].items():
                if durations:
                    avg_duration = sum(durations) / len(durations)
                    min_duration = min(durations)
                    max_duration = max(durations)
                    print(f"  {test_name[:40]:<40}: avg={avg_duration:.2f}s, min={min_duration:.2f}s, max={max_duration:.2f}s")
            print()
        
        # Error summary
        if self.results["errors"]:
            print("FAILED TESTS:")
            for error in self.results["errors"][:10]:  # Show first 10 errors
                print(f"  {error}")
            if len(self.results["errors"]) > 10:
                print(f"  ... and {len(self.results['errors']) - 10} more errors")
            print()
        
        # Final assessment
        if success_rate >= 90:
            print("ASSESSMENT: EXCELLENT - Backend performing very well")
        elif success_rate >= 70:
            print("ASSESSMENT: GOOD - Backend mostly functional with minor issues")
        elif success_rate >= 50:
            print("ASSESSMENT: NEEDS IMPROVEMENT - Several issues to address")
        else:
            print("ASSESSMENT: CRITICAL - Major issues need immediate attention")
        
        print()
        print("Next steps:")
        print("1. Address any failed tests")
        print("2. Optimize slow endpoints (>5s)")
        print("3. Test with larger datasets for scalability")

def main():
    """Main test runner"""
    try:
        tester = ComprehensiveBackendTester()
        tester.run_all_tests()
    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("\nTo run these tests:")
        print("1. Set your HuggingFace API key: export HF_TOKEN=your_token_here")
        print("2. Start the backend server: python main.py")
        print("3. Run this test: python test_comprehensive.py")
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    main()