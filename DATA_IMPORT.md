# Financial Data Import Guide

Your project now includes a sample financial dataset (`financials.csv`) with 700+ records of sales data across multiple segments, countries, and products.

## Dataset Overview

The dataset contains the following columns:
- **Segment**: Business segment (Government, Midmarket, Enterprise, Small Business, Channel Partners)
- **Country**: Sales country (Canada, Germany, France, Mexico, USA)
- **Product**: Product name (Carretera, Montana, Paseo, Velo, VTT, Amarilla)
- **Discount Band**: Discount level applied (None, Low, Medium, High)
- **Units Sold**: Number of units sold
- **Manufacturing Price**: Cost to manufacture
- **Sale Price**: Price sold to customer
- **Gross Sales**: Total sales before discounts
- **Discounts**: Discount amount applied
- **Sales**: Net sales after discounts
- **COGS**: Cost of goods sold
- **Profit**: Net profit
- **Date**: Transaction date
- **Month Number**: Month (1-12)
- **Month Name**: Month name
- **Year**: Year (2013-2014)

## How to Import the Data

### Option 1: Using the Dashboard (Recommended)

1. Sign up or log in to your AutoMD&A account
2. Go to the Dashboard
3. Click "Upload CSV" in the Data Upload card
4. Select the `public/data/financials.csv` file
5. Click "Upload"

The system will automatically parse and import all 700+ records.

### Option 2: Using the Import Script

If you want to bulk import the data programmatically:

1. Ensure you have set up your Supabase integration
2. Add your Supabase service role key to your environment variables:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Run the import script:
   ```bash
   npx tsx scripts/003_import_sample_data.ts
   ```

## What You Can Do With This Data

Once imported, you can:

1. **Generate MD&A Reports**: Analyze performance across segments, products, and regions
2. **Calculate KPIs**: Automatically compute:
   - Revenue growth by period
   - Profit margins by segment
   - Product performance metrics
   - Geographic sales distribution
   - Discount impact analysis

3. **Ask Questions**: Use the AI-powered report generator to answer questions like:
   - "Which product segment performed best in 2014?"
   - "How did discounts impact profitability?"
   - "What were the top-performing countries by revenue?"
   - "Analyze the trend in monthly sales across 2013-2014"

## Sample Analysis Examples

Try generating reports with these prompts:

- "Generate an executive summary of sales performance by segment"
- "Analyze the profitability of each product line"
- "Compare revenue growth between countries"
- "Evaluate the impact of discount strategies on margins"

The AI will automatically calculate relevant KPIs and generate professional MD&A narrative based on your data!
