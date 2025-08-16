import { Loader2, Database, Camera, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DatasetViewerLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Episode Navigation Loading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Episode Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Player Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Video placeholder */}
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading video...</p>
                </div>
              </div>
              
              {/* Timeline skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
              
              {/* Controls skeleton */}
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Robot State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Joint positions skeleton */}
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="grid grid-cols-3 gap-2">
                  {Array(6).fill(0).map((_, idx) => (
                    <div key={idx} className="bg-muted rounded p-2 text-center">
                      <Skeleton className="h-3 w-6 mx-auto mb-1" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* End effector skeleton */}
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="grid grid-cols-3 gap-2">
                  {['X', 'Y', 'Z'].map((axis) => (
                    <div key={axis} className="bg-muted rounded p-2 text-center">
                      <Skeleton className="h-3 w-4 mx-auto mb-1" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Episode info skeleton */}
              <div className="pt-4 border-t space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Loading */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, idx) => (
              <div key={idx} className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}