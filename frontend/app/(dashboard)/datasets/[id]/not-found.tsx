import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { DatabaseX, Search, ArrowLeft, FolderOpen } from "lucide-react"
import Link from "next/link"

export default function DatasetNotFound() {
  const breadcrumbItems = [
    {
      label: "Datasets",
      href: "/datasets",
      icon: <FolderOpen className="h-4 w-4" />
    },
    {
      label: "Not Found",
      icon: <DatabaseX className="h-4 w-4" />
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Not Found Content */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <DatabaseX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Dataset Not Found</CardTitle>
            <CardDescription>
              The dataset you're looking for doesn't exist or has been removed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Suggestions */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Possible reasons:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• The dataset ID may be incorrect</li>
                <li>• The dataset might have been deleted</li>
                <li>• You may not have permission to view this dataset</li>
                <li>• The dataset might be temporarily unavailable</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/datasets">
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Datasets
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/datasets">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Datasets
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Double-check the dataset ID in the URL or search for the dataset
                in the datasets list.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}