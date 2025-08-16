/**
 * Test file to verify dataset card improvements
 * This file demonstrates that all fixes are working correctly
 */

import { DatasetCard } from "./components/datasets/dataset-card"

// Test datasets that cover all the edge cases we fixed
const testDatasets = [
  // Normal dataset with all fields
  {
    id: "1",
    name: "Kitchen Tasks v2.1",
    description: "Comprehensive dataset for kitchen manipulation tasks including object grasping, pouring, and cleaning operations",
    robotType: "arm" as const,
    createdAt: new Date("2024-01-15"),
    duration: 3600,
    frameCount: 108000,
    fileSize: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
    status: "ready" as const,
    tags: ["manipulation", "kitchen", "grasping"],
    episodeCount: 15,
    fps: 30,
    author: "Dr. Smith",
    likes: 42,
    downloads: 127,
    private: false,
  },

  // Dataset with very long description (tests truncation)
  {
    id: "2", 
    name: "Long Description Test",
    description: "This is an extremely long description that should be truncated to demonstrate the line-clamp functionality. It contains multiple sentences and should overflow beyond the allocated space if not properly handled. The description continues with more details about the dataset, its purpose, methodology, and expected outcomes. This text should definitely be cut off with ellipsis to maintain proper card layout and visual consistency.",
    robotType: "mobile" as const,
    createdAt: new Date("2024-01-10"),
    duration: 7200,
    frameCount: 216000,
    fileSize: 5.1 * 1024 * 1024 * 1024,
    status: "ready" as const,
    tags: ["test", "long-description"],
    author: "Test User",
  },

  // Dataset with zero file size (tests graceful handling)
  {
    id: "3",
    name: "Zero File Size Test", 
    description: "Dataset to test zero file size handling",
    robotType: "arm" as const,
    createdAt: new Date("2024-01-08"),
    duration: 1800,
    frameCount: 54000,
    fileSize: 0, // This should show "Size unavailable"
    status: "processing" as const,
    tags: ["test", "zero-size"],
  },

  // Dataset with empty description (tests fallback)
  {
    id: "4",
    name: "Empty Description Test",
    description: "", // This should show "No description available"
    robotType: "custom" as const,
    createdAt: new Date("2024-01-01"),
    duration: 300,
    frameCount: 9000,
    fileSize: 0, // Also test zero size
    status: "ready" as const,
    tags: ["test"],
  },

  // Dataset with minimal fields (only required ones)
  {
    id: "5",
    name: "Minimal Dataset",
    description: "Basic dataset with only required fields",
    robotType: "humanoid" as const,
    createdAt: new Date("2024-01-05"),
    duration: 5400,
    frameCount: 162000,
    fileSize: 8.7 * 1024 * 1024 * 1024,
    status: "error" as const,
    tags: ["minimal"],
    // No optional fields (author, likes, downloads, etc.)
  }
]

function TestDatasetCards() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dataset Card Test Cases</h1>
      <p className="text-muted-foreground">
        These test cases verify that all frontend issues have been fixed:
      </p>
      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
        <li>• Long descriptions are properly truncated with ellipsis (2-3 lines max)</li>
        <li>• Zero or missing file sizes show "Size unavailable" instead of "0 B"</li>
        <li>• Empty descriptions show fallback text</li>
        <li>• Optional fields (author, likes, downloads) are handled gracefully</li>
        <li>• All dataset types use the cleaned interface matching backend schema</li>
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {testDatasets.map((dataset) => (
          <DatasetCard 
            key={dataset.id} 
            dataset={dataset} 
            showDeleteButton={false}
          />
        ))}
      </div>
    </div>
  )
}

export default TestDatasetCards