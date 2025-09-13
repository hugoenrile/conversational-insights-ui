
export type Customer = {
  id: string;
  name: string;
  industry: string;
  size: "startup" | "small" | "medium" | "enterprise";
  status: "active" | "inactive" | "prospect" | "churned";
  tier: "free" | "basic" | "pro" | "enterprise";
  joinDate: string;
  lastActivity: string;
  contactPerson: string;
  email: string;
  phone?: string;
  website?: string;
  location: string;
  revenue?: number;
  health: "excellent" | "good" | "at-risk" | "critical";
  tags: string[];
};

export type Conversation = {
  id: string;
  customerId: string;
  type: "call" | "email" | "chat";
  date: string;
  duration?: number;
  subject?: string;
  summary: string;
  participants: string[];
  status: "completed" | "scheduled" | "cancelled";
  sentiment: "positive" | "neutral" | "negative";
  priority: "high" | "medium" | "low";
  tags: string[];
};

export type Insight = {
  id: string;
  conversationId: string;
  category: string;
  text: string;
  topics?: string[];
};

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Acme Corp",
    industry: "SaaS",
    size: "medium",
    status: "active",
    tier: "pro",
    joinDate: "2024-01-15",
    lastActivity: "2025-09-12",
    contactPerson: "John Smith",
    email: "john.smith@acmecorp.com",
    phone: "+1 (555) 123-4567",
    website: "https://acmecorp.com",
    location: "San Francisco, CA",
    revenue: 48000,
    health: "good",
    tags: ["high-value", "product-roadmap", "integration"]
  },
  {
    id: "c2",
    name: "Globex Inc",
    industry: "Finance",
    size: "enterprise",
    status: "active",
    tier: "enterprise",
    joinDate: "2023-08-22",
    lastActivity: "2025-09-03",
    contactPerson: "Lisa Wong",
    email: "lisa.wong@globex.com",
    phone: "+1 (555) 987-6543",
    website: "https://globex.com",
    location: "New York, NY",
    revenue: 120000,
    health: "excellent",
    tags: ["enterprise", "compliance", "security"]
  },
  {
    id: "c3",
    name: "TechStart Solutions",
    industry: "Technology",
    size: "startup",
    status: "prospect",
    tier: "free",
    joinDate: "2025-09-01",
    lastActivity: "2025-09-15",
    contactPerson: "Alex Rivera",
    email: "alex@techstart.io",
    website: "https://techstart.io",
    location: "Austin, TX",
    health: "excellent",
    tags: ["new-customer", "demo", "high-potential"]
  },
  {
    id: "c4",
    name: "Healthcare Plus",
    industry: "Healthcare",
    size: "medium",
    status: "active",
    tier: "basic",
    joinDate: "2024-06-10",
    lastActivity: "2025-09-07",
    contactPerson: "Dr. Maria Garcia",
    email: "maria.garcia@healthcareplus.com",
    phone: "+1 (555) 456-7890",
    website: "https://healthcareplus.com",
    location: "Chicago, IL",
    revenue: 24000,
    health: "at-risk",
    tags: ["support", "technical-issues", "api"]
  },
  {
    id: "c5",
    name: "RetailMax",
    industry: "Retail",
    size: "large",
    status: "active",
    tier: "pro",
    joinDate: "2023-11-05",
    lastActivity: "2025-09-10",
    contactPerson: "Robert Kim",
    email: "robert.kim@retailmax.com",
    phone: "+1 (555) 321-0987",
    website: "https://retailmax.com",
    location: "Seattle, WA",
    revenue: 72000,
    health: "good",
    tags: ["renewal", "expansion", "roi"]
  },
  {
    id: "c6",
    name: "EduTech Academy",
    industry: "Education",
    size: "small",
    status: "active",
    tier: "basic",
    joinDate: "2024-03-20",
    lastActivity: "2025-08-28",
    contactPerson: "Sarah Johnson",
    email: "sarah@edutech.edu",
    location: "Boston, MA",
    revenue: 18000,
    health: "good",
    tags: ["education", "non-profit", "growth"]
  },
  {
    id: "c7",
    name: "Manufacturing Pro",
    industry: "Manufacturing",
    size: "enterprise",
    status: "churned",
    tier: "enterprise",
    joinDate: "2023-02-14",
    lastActivity: "2025-07-15",
    contactPerson: "Mike Thompson",
    email: "mike@manufacturingpro.com",
    location: "Detroit, MI",
    revenue: 0,
    health: "critical",
    tags: ["churned", "pricing-concerns", "competitor"]
  }
];

export const conversations: Conversation[] = [
  {
    id: "conv1",
    customerId: "c1",
    type: "call",
    date: "2025-09-01",
    duration: 45,
    subject: "Q3 Product Roadmap Discussion",
    summary: "Discussed upcoming features for Q3 release. Customer expressed interest in AI-powered analytics and raised concerns about current CRM integration speed.",
    participants: ["John Smith (Acme)", "Sarah Johnson (Sales)", "Mike Chen (Product)"],
    status: "completed",
    sentiment: "positive",
    priority: "high",
    tags: ["product-roadmap", "ai-features", "integration"]
  },
  {
    id: "conv2",
    customerId: "c2",
    type: "email",
    date: "2025-09-03",
    subject: "Data Privacy and Security Inquiry",
    summary: "Customer inquired about our data privacy policies and security measures. Requested detailed documentation on GDPR compliance.",
    participants: ["Lisa Wong (Globex)", "David Brown (Legal)"],
    status: "completed",
    sentiment: "neutral",
    priority: "medium",
    tags: ["privacy", "security", "compliance", "gdpr"]
  },
  {
    id: "conv3",
    customerId: "c3",
    type: "call",
    date: "2025-09-05",
    duration: 30,
    subject: "Initial Discovery Call",
    summary: "First call with potential customer. Discussed their current tech stack and pain points with existing solutions. Very interested in our platform.",
    participants: ["Alex Rivera (TechStart)", "Emma Davis (Sales)"],
    status: "completed",
    sentiment: "positive",
    priority: "high",
    tags: ["discovery", "new-customer", "tech-stack"]
  },
  {
    id: "conv4",
    customerId: "c4",
    type: "chat",
    date: "2025-09-07",
    subject: "Support Request - Integration Issues",
    summary: "Customer experiencing issues with API integration. Provided troubleshooting steps and escalated to technical team.",
    participants: ["Dr. Maria Garcia (Healthcare Plus)", "Tom Wilson (Support)"],
    status: "completed",
    sentiment: "negative",
    priority: "high",
    tags: ["support", "api", "integration", "technical-issue"]
  },
  {
    id: "conv5",
    customerId: "c5",
    type: "call",
    date: "2025-09-10",
    duration: 60,
    subject: "Contract Renewal Discussion",
    summary: "Annual contract renewal meeting. Discussed usage metrics, ROI, and potential expansion opportunities. Customer satisfied with current service.",
    participants: ["Robert Kim (RetailMax)", "Jennifer Lee (Account Management)", "Chris Taylor (Sales)"],
    status: "completed",
    sentiment: "positive",
    priority: "medium",
    tags: ["renewal", "contract", "expansion", "roi"]
  },
  {
    id: "conv6",
    customerId: "c1",
    type: "email",
    date: "2025-09-12",
    subject: "Follow-up on Integration Improvements",
    summary: "Follow-up email regarding CRM integration performance improvements discussed in previous call. Shared technical specifications and timeline.",
    participants: ["John Smith (Acme)", "Mike Chen (Product)", "Anna Rodriguez (Engineering)"],
    status: "completed",
    sentiment: "positive",
    priority: "medium",
    tags: ["follow-up", "integration", "crm", "technical-specs"]
  },
  {
    id: "conv7",
    customerId: "c3",
    type: "call",
    date: "2025-09-15",
    duration: 0,
    subject: "Product Demo Session",
    summary: "Scheduled product demonstration for TechStart Solutions team.",
    participants: ["Alex Rivera (TechStart)", "Emma Davis (Sales)", "Product Team"],
    status: "scheduled",
    sentiment: "neutral",
    priority: "high",
    tags: ["demo", "scheduled", "product-showcase"]
  }
];

export const insights: Insight[] = [
  {
    id: "i1",
    conversationId: "conv1",
    category: "Pain Point",
    text: "Integration with CRM is too slow.",
    topics: ["CRM", "Integration"],
  },
  {
    id: "i2",
    conversationId: "conv1",
    category: "Opportunity",
    text: "Looking for AI-powered reporting.",
    topics: ["AI", "Reporting"],
  },
  {
    id: "i3",
    conversationId: "conv2",
    category: "Objection",
    text: "Concerned about data privacy.",
    topics: ["Privacy", "Security"],
  },
  {
    id: "i4",
    conversationId: "conv2",
    category: "Request",
    text: "Needs GDPR compliance documentation.",
    topics: ["GDPR", "Compliance", "Documentation"],
  },
  {
    id: "i5",
    conversationId: "conv3",
    category: "Opportunity",
    text: "Interested in replacing current analytics platform.",
    topics: ["Analytics", "Platform Migration"],
  },
  {
    id: "i6",
    conversationId: "conv3",
    category: "Pain Point",
    text: "Current solution lacks real-time capabilities.",
    topics: ["Real-time", "Performance"],
  },
  {
    id: "i7",
    conversationId: "conv4",
    category: "Issue",
    text: "API integration failing with 500 errors.",
    topics: ["API", "Error", "Integration"],
  },
  {
    id: "i8",
    conversationId: "conv5",
    category: "Success",
    text: "Achieved 300% ROI in first year.",
    topics: ["ROI", "Success", "Metrics"],
  },
  {
    id: "i9",
    conversationId: "conv5",
    category: "Opportunity",
    text: "Interested in expanding to additional departments.",
    topics: ["Expansion", "Growth"],
  },
  {
    id: "i10",
    conversationId: "conv6",
    category: "Update",
    text: "CRM integration performance improved by 40%.",
    topics: ["CRM", "Performance", "Improvement"],
  },
];
