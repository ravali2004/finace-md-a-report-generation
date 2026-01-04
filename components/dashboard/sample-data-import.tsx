"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function SampleDataImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [imported, setImported] = useState(false)

  const handleImport = async () => {
    setIsImporting(true)

    try {
      const response = await fetch("/api/import-sample-data", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to import data")
      }

      setImported(true)
      toast.success("Sample data imported successfully!", {
        description: `Imported ${data.recordCount} financial records`,
      })
    } catch (error) {
      toast.error("Failed to import sample data", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Sample Financial Data</CardTitle>
        </div>
        <CardDescription>Import 700+ sample financial records to test the report generation features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium mb-2">Dataset includes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Sales data across 5 business segments</li>
              <li>• 6 product lines with pricing & profitability</li>
              <li>• Multi-country performance (USA, Canada, Germany, France, Mexico)</li>
              <li>• Monthly data covering 2013-2014</li>
              <li>• Complete P&L metrics (Revenue, COGS, Profit, Margins)</li>
            </ul>
          </div>

          {imported ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Sample data has been imported</span>
            </div>
          ) : (
            <Button onClick={handleImport} disabled={isImporting} className="w-full">
              {isImporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Import Sample Data
                </>
              )}
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            This will add sample data to your account. You can delete it anytime from the Data Records section.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
