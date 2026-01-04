/**
 * Script to import sample financial data from CSV
 * This can be run to populate the database with the provided financial dataset
 *
 * Run this script after you have:
 * 1. Set up Supabase integration
 * 2. Run the database schema scripts (001 and 002)
 * 3. Created a user account
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin access

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

async function importData() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing required environment variables:")
    console.error("- NEXT_PUBLIC_SUPABASE_URL")
    console.error("- SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Read the CSV file
  const csvPath = join(process.cwd(), "public", "data", "financials.csv")
  console.log(`Reading CSV from: ${csvPath}`)

  const csvContent = readFileSync(csvPath, "utf-8")
  const { headers, rows } = parseCSV(csvContent)

  console.log(`Parsed ${rows.length} records with ${headers.length} columns`)
  console.log(`Columns: ${headers.join(", ")}`)

  // Get the first user (or you can specify a user ID)
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()

  if (userError || !users.users.length) {
    console.error("No users found. Please create a user account first.")
    process.exit(1)
  }

  const userId = users.users[0].id
  console.log(`Importing data for user: ${userId}`)

  // Prepare records for insertion
  const financialRecords = rows.map((row) => ({
    user_id: userId,
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
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      process.exit(1)
    }

    totalInserted += batch.length
    console.log(`Inserted ${totalInserted}/${financialRecords.length} records`)
  }

  console.log("✅ Successfully imported all financial data!")
  console.log(`Total records: ${totalInserted}`)
}

importData().catch(console.error)
