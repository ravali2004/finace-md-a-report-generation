import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = values[index]
      })
      rows.push(record)
    }
  }

  return { headers, rows }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read the sample CSV file from public directory
    const csvPath = join(process.cwd(), "public", "data", "financials.csv")
    const csvContent = readFileSync(csvPath, "utf-8")
    const { headers, rows } = parseCSV(csvContent)

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid records found in sample data" }, { status: 400 })
    }

    console.log("[v0] Sample data parsed:", {
      columns: headers,
      rowCount: rows.length,
    })

    // Prepare records for insertion
    const financialRecords = rows.map((row) => ({
      user_id: user.id,
      file_name: "financials.csv",
      columns: headers,
      data: row,
    }))

    // Insert in batches to avoid timeout
    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < financialRecords.length; i += batchSize) {
      const batch = financialRecords.slice(i, i + batchSize)
      const { error } = await supabase.from("financial_records").insert(batch)

      if (error) {
        console.error("[v0] Batch insert error:", error)
        return NextResponse.json({ error: "Failed to import batch", details: error.message }, { status: 500 })
      }

      totalInserted += batch.length
      console.log(`[v0] Inserted ${totalInserted}/${financialRecords.length} records`)
    }

    return NextResponse.json({
      success: true,
      recordCount: totalInserted,
      columns: headers,
      message: `Successfully imported ${totalInserted} sample financial records`,
    })
  } catch (error) {
    console.error("[v0] Import error:", error)
    return NextResponse.json({ error: "Failed to import sample data" }, { status: 500 })
  }
}
