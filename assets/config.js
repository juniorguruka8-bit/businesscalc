/*
 * BusinessCalc.ca - central configuration.
 * Per spec section 40, every editable value lives here: tax rates, platform
 * fee defaults, form endpoints, and calculator metadata (names, categories,
 * descriptions, SEO text, related tools). Do not scatter these in page code.
 */
var CONFIG = {
  siteName: "BusinessCalc.ca",
  tagline: "Free Business Calculators for Smarter Decisions",
  baseUrl: "https://businesscalc.ca",

  /* Form endpoints. Empty string = form not open yet (honest on-page note). */
  leadFormEndpoint: "",
  contactFormEndpoint: "",

  leadMagnet: {
    title: "Want a free Small Business Profit Checklist?",
    text: "A one-page checklist of the numbers every small business should know: margins, break-even, true employee cost and more.",
    cta: "Send Me the Checklist"
  },

  /* Canadian sales tax table (verified 2026 rates). GST is 5% everywhere.
     Each province lists the tax lines that apply to the pre-tax amount. */
  taxTable: {
    AB: { name: "Alberta", lines: [ { label: "GST", rate: 5 } ] },
    BC: { name: "British Columbia", lines: [ { label: "GST", rate: 5 }, { label: "PST", rate: 7 } ] },
    SK: { name: "Saskatchewan", lines: [ { label: "GST", rate: 5 }, { label: "PST", rate: 6 } ] },
    MB: { name: "Manitoba", lines: [ { label: "GST", rate: 5 }, { label: "RST", rate: 7 } ] },
    ON: { name: "Ontario", lines: [ { label: "HST", rate: 13 } ] },
    NS: { name: "Nova Scotia", lines: [ { label: "HST", rate: 14 } ] },
    NB: { name: "New Brunswick", lines: [ { label: "HST", rate: 15 } ] },
    NL: { name: "Newfoundland and Labrador", lines: [ { label: "HST", rate: 15 } ] },
    PE: { name: "Prince Edward Island", lines: [ { label: "HST", rate: 15 } ] },
    QC: { name: "Quebec", lines: [ { label: "GST", rate: 5 }, { label: "QST", rate: 9.975 } ] },
    YT: { name: "Yukon", lines: [ { label: "GST", rate: 5 } ] },
    NT: { name: "Northwest Territories", lines: [ { label: "GST", rate: 5 } ] },
    NU: { name: "Nunavut", lines: [ { label: "GST", rate: 5 } ] }
  },

  /* Platform fee defaults. These prefill editable fields on the calculator
     pages; users can change them, and admins update them here only. */
  etsyFees: {
    listingFee: 0.27,
    transactionPct: 6.5,
    processingPct: 3.0,
    processingFlat: 0.30
  },
  shopifyFees: {
    processingPct: 2.9,
    processingFlat: 0.30
  },

  categories: [
    { id: "profit-revenue", name: "Profit & Revenue" },
    { id: "ecommerce", name: "E-commerce" },
    { id: "employees-freelancers", name: "Employees & Freelancers" },
    { id: "finance", name: "Finance" }
  ],

  resourceCategories: [
    "Starting a Business", "Pricing", "Profitability", "E-commerce",
    "Shopify", "Etsy", "Freelancing", "Business Finance"
  ],

  /* Calculator metadata. Order matters: it is the search tie-break order. */
  calculators: [
    {
      slug: "profit-calculator", name: "Profit Calculator", category: "profit-revenue",
      cta: "Calculate Profit",
      description: "See exactly how much you earn after product, shipping, advertising and other costs.",
      keywords: "profit per sale net earnings shopify etsy marketplace costs margin",
      seoTitle: "Free Profit Calculator - Calculate Business Profit & Margin | BusinessCalc.ca",
      seoDescription: "Calculate business profit, costs and profit margin instantly with our free online Profit Calculator. Ideal for small businesses, Shopify sellers and entrepreneurs.",
      related: ["profit-margin-calculator", "markup-calculator", "pricing-calculator", "break-even-calculator", "shopify-profit-calculator", "etsy-profit-calculator"]
    },
    {
      slug: "profit-margin-calculator", name: "Profit Margin Calculator", category: "profit-revenue",
      cta: "Calculate Margin",
      description: "Find the percentage of every sales dollar that stays as gross profit.",
      keywords: "margin percentage gross profit revenue cost percent",
      seoTitle: "Free Profit Margin Calculator - Gross Margin Percentage | BusinessCalc.ca",
      seoDescription: "Work out your gross profit and profit margin percentage in seconds. Enter revenue and cost and see how much of every sale you keep, with a plain-English explanation.",
      related: ["profit-calculator", "markup-calculator", "pricing-calculator", "break-even-calculator"]
    },
    {
      slug: "markup-calculator", name: "Markup Calculator", category: "profit-revenue",
      cta: "Calculate Markup",
      description: "Convert between cost, selling price and markup percentage, and see the margin too.",
      keywords: "markup price cost selling margin wholesale retail",
      seoTitle: "Free Markup Calculator - Markup Percentage & Selling Price | BusinessCalc.ca",
      seoDescription: "Calculate markup dollars, markup percentage and profit margin from cost and selling price, or find the price you need for a target markup. Free and instant.",
      related: ["profit-margin-calculator", "pricing-calculator", "profit-calculator"]
    },
    {
      slug: "break-even-calculator", name: "Break-Even Calculator", category: "profit-revenue",
      cta: "Find Break-Even",
      description: "See how many sales you need each month to cover your fixed and variable costs.",
      keywords: "break even breakeven fixed costs cover costs sales needed",
      seoTitle: "Free Break-Even Calculator - Break-Even Point in Units & Revenue | BusinessCalc.ca",
      seoDescription: "Find your break-even point fast: enter fixed costs, price and variable cost per sale to see the sales and revenue you need to cover your costs each month.",
      related: ["profit-calculator", "pricing-calculator", "revenue-calculator", "profit-margin-calculator"]
    },
    {
      slug: "pricing-calculator", name: "Pricing Calculator", category: "profit-revenue",
      cta: "Calculate Price",
      description: "Build a selling price from your real costs plus the profit margin you want.",
      keywords: "pricing price should i charge selling price margin shopify product",
      seoTitle: "Free Pricing Calculator - Price Products for Your Target Margin | BusinessCalc.ca",
      seoDescription: "Set the right selling price: add up product, shipping, ads and fees, choose your target margin with a slider, and see your minimum and suggested price instantly.",
      related: ["profit-calculator", "markup-calculator", "profit-margin-calculator", "shopify-profit-calculator"]
    },
    {
      slug: "revenue-calculator", name: "Revenue Calculator", category: "profit-revenue",
      cta: "Calculate Revenue",
      description: "Total up sales revenue, other revenue and your average revenue per sale.",
      keywords: "revenue sales income total gross turnover",
      seoTitle: "Free Revenue Calculator - Total & Average Revenue Per Sale | BusinessCalc.ca",
      seoDescription: "Calculate total revenue from price, number of sales and other income, plus your average revenue per sale. Simple, free and instant for any small business.",
      related: ["profit-calculator", "break-even-calculator", "profit-margin-calculator"]
    },
    {
      slug: "shopify-profit-calculator", name: "Shopify Profit Calculator", category: "ecommerce",
      cta: "Calculate Shopify Profit",
      description: "Your real per-order profit after product, shipping, ads, fees and refunds.",
      keywords: "shopify store fees dropshipping ecommerce roas orders",
      seoTitle: "Free Shopify Profit Calculator - Profit Per Order & Break-Even ROAS | BusinessCalc.ca",
      seoDescription: "See your true Shopify profit per order after product cost, shipping, advertising, payment fees and refunds, plus break-even ROAS and sales needed for your profit target.",
      related: ["pricing-calculator", "profit-calculator", "inventory-margin-calculator", "break-even-calculator"]
    },
    {
      slug: "etsy-profit-calculator", name: "Etsy Profit Calculator", category: "ecommerce",
      cta: "Calculate Etsy Profit",
      description: "Profit per Etsy order after listing, transaction and payment processing fees.",
      keywords: "etsy fees listing transaction handmade vintage orders",
      seoTitle: "Free Etsy Profit Calculator - Profit Per Order After Etsy Fees | BusinessCalc.ca",
      seoDescription: "Calculate your Etsy profit per order with editable listing, transaction and processing fees, and see estimated profit at 10, 50 and 100 orders. Independent tool.",
      related: ["profit-calculator", "pricing-calculator", "inventory-margin-calculator", "shopify-profit-calculator"]
    },
    {
      slug: "inventory-margin-calculator", name: "Inventory Margin Calculator", category: "ecommerce",
      cta: "Calculate Inventory Margin",
      description: "Profit, margin and ROI on a batch of inventory, including unsold stock value.",
      keywords: "inventory stock reseller marketplace wholesale roi batch unsold",
      seoTitle: "Free Inventory Margin Calculator - Inventory Profit, Margin & ROI | BusinessCalc.ca",
      seoDescription: "Work out the profit, margin and return on investment for a batch of inventory before you buy: units, costs, freight, ads and fees, plus the value of unsold stock.",
      related: ["profit-calculator", "shopify-profit-calculator", "etsy-profit-calculator", "pricing-calculator"]
    },
    {
      slug: "employee-cost-calculator", name: "Employee Cost Calculator", category: "employees-freelancers",
      cta: "Calculate Employee Cost",
      description: "The true annual cost of an employee, beyond wages: payroll, benefits and vacation.",
      keywords: "employee cost salary wage hire payroll benefits vacation employer",
      seoTitle: "Free Employee Cost Calculator - True Cost of an Employee | BusinessCalc.ca",
      seoDescription: "An employee costs more than their wage. Add payroll costs, benefits, vacation pay and bonuses to see the true annual, monthly and hourly cost of hiring.",
      related: ["hourly-rate-calculator", "break-even-calculator", "revenue-calculator"]
    },
    {
      slug: "hourly-rate-calculator", name: "Hourly Rate Calculator", category: "employees-freelancers",
      cta: "Calculate My Rate",
      description: "The hourly rate freelancers and contractors need to hit their income goal.",
      keywords: "hourly rate freelancer consultant contractor charge employee self employed",
      seoTitle: "Free Hourly Rate Calculator - Freelance & Contractor Rates | BusinessCalc.ca",
      seoDescription: "Set your freelance hourly rate from your income goal, business expenses and realistic billable hours. See minimum and recommended rates plus weekly and monthly targets.",
      related: ["employee-cost-calculator", "pricing-calculator", "profit-calculator"]
    },
    {
      slug: "business-loan-calculator", name: "Business Loan Calculator", category: "finance",
      cta: "Calculate Loan Payment",
      description: "Loan payments, total interest and a full amortization schedule.",
      keywords: "loan borrowing interest payment amortization finance debt",
      seoTitle: "Free Business Loan Calculator - Payments & Amortization Schedule | BusinessCalc.ca",
      seoDescription: "Estimate business loan payments by amount, interest rate, term and payment frequency. Includes total interest, total repayment and a full amortization table.",
      related: ["break-even-calculator", "revenue-calculator", "sales-tax-calculator"]
    },
    {
      slug: "sales-tax-calculator", name: "Sales Tax Calculator", category: "finance",
      cta: "Calculate Sales Tax",
      description: "Add or extract tax at any rate, with a Canadian GST/HST/PST mode by province.",
      keywords: "tax gst hst pst qst canada province vat add extract",
      seoTitle: "Free Sales Tax Calculator - GST, HST & PST by Province | BusinessCalc.ca",
      seoDescription: "Add tax to a price or extract it from a tax-inclusive total. Canadian mode covers GST, HST, PST, RST and QST for every province and territory.",
      related: ["business-loan-calculator", "pricing-calculator", "profit-calculator"]
    }
  ]
};

if (typeof module !== "undefined" && module.exports) { module.exports = CONFIG; }
