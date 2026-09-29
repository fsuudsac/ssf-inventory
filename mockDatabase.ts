/**
 * FSUU PMO Inventory - Central Mock Database & Domain Logic
 * Manages Canvassing, Supplier Bids, Purchase Orders, and Inventory with full process interconnectivity.
 */

export interface CanvassItem {
  id: number;
  item_name: string;
  description: string;
  quantity: number;
  unit: string;
  estimated_unit_cost: number;
  total_estimated_cost: number;
}

export interface SupplierBidItem {
  item_id: number;
  item_name: string;
  unit_price: number;
  total_price: number;
  brand_model?: string;
  notes?: string;
}

export interface SupplierBid {
  id: number;
  canvass_id: number;
  supplier_id: number;
  supplier_name: string;
  contact_person: string;
  email: string;
  phone: string;
  bid_amount: number;
  payment_terms: string;
  delivery_lead_time_days: number;
  delivery_date: string;
  status: "pending" | "approved" | "rejected";
  remarks: string;
  item_bids?: SupplierBidItem[];
  submitted_at: string;
}

export interface EvidenceAttachment {
  id: string | number;
  name: string;
  original_name?: string;
  url: string;
  size?: number;
  mime_type?: string;
  uploaded_at: string;
  uploaded_by?: string;
  stage?: "Canvass" | "Purchase Request" | "Purchase Order" | "Delivery" | "General";
  type?: "quotation" | "matrix" | "memo" | "clearance" | "po" | "waybill" | "receipt" | "general";
  notes?: string;
}

export interface RequestTrailEntry {
  id?: string | number;
  timestamp?: string;
  action?: string;
  stage?: string;
  from_status?: string;
  to_status?: string;
  status?: string;
  actor?: string;
  performed_by?: string;
  role?: string;
  remarks?: string;
  notes?: string;
  created_at?: string;
}

export type CanvassStatus =
  | "Pending Canvass"
  | "Bidding"
  | "Seeking Bids"
  | "Bid Awarded - Pending PR"
  | "Contested"
  | "Needs Revision"
  | "Pending Finance Approval"
  | "Finance Approved - Pending VPASA"
  | "Ready for PO"
  | "PO Issued"
  | "New Purchase Request"
  | "Ready for Canvass"
  | "Canvassing / Bidding"
  | "Draft"
  | "Under Review"
  | "In Progress"
  | "Winning Bid Selected"
  | "Purchase Order Issued"
  | "Approved"
  | "Rejected";

export type FinanceStatus =
  | "Pending Finance Review"
  | "Over Budget (Needs Revision)"
  | "Finance Approved"
  | "Cancelled";

export interface Canvass {
  id: number;
  canvass_no: string;
  title: string;
  rfq_date: string;
  deadline: string;
  department_id: number;
  department_name: string;
  requested_by: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: CanvassStatus;
  finance_status?: FinanceStatus;
  notes: string;
  justification?: string;
  memo_notes?: string;
  items: CanvassItem[];
  supplier_bids: SupplierBid[];
  winning_bid_id: number | null;
  winning_bid_amount?: number;
  department_allocated_amount?: number;
  department_remaining_balance?: number;
  pr_id?: number | null;
  pr_no?: string | null;
  po_id: number | null;
  po_no?: string | null;
  total_estimated_budget: number;
  attachments: EvidenceAttachment[];
  canvass_started_at?: string | null;
  pr_submitted_at?: string | null;
  finance_approved_at?: string | null;
  finance_approved_by?: string | null;
  po_dispatched_at?: string | null;
  items_received_at?: string | null;
  stage_entered_at?: string | null;
  contest_justification?: string | null;
  vpasa_authorized_at?: string | null;
  vpasa_authorized_by?: string | null;
  trail?: RequestTrailEntry[];
  created_at: string;
  updated_at: string;
}

export type PRType = "Goods (Inventoriable)" | "Services/OpEx (Budget Only)";

export type PurchaseRequestStatus =
  | "Pending Canvass"
  | "Bidding"
  | "Seeking Bids"
  | "Bid Awarded - Pending PR"
  | "Contested"
  | "Pending Finance Approval"
  | "Finance Approved - Pending VPASA"
  | "Ready for PO"
  | "PO Issued"
  | "New Purchase Request"
  | "Needs Revision"
  | "Ready for Canvass"
  | "Canvassing"
  | "Canvassing / Bidding"
  | "Purchase Order Issued"
  | "Approved"
  | "Draft"
  | "Draft PR"
  | "Submitted PR"
  | "Pending Department Approval"
  | "Budget Review"
  | "Approved PR"
  | "Rejected"
  // Dynamic Management Approval Chain (HR & Training Services)
  | "Pending Dept Head"
  | "Pending HR"
  | "Pending Finance"
  | "Pending VP Acad / VPAsa";

export interface DigitalSignature {
  role: "Dept Head" | "HR" | "Finance" | "VP Acad / VPAsa";
  role_title: string;
  signatory_name: string | null;
  signatory_title: string;
  signed_at: string | null;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
}

export interface PurchaseRequestItem {
  id: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  estimated_unit_cost: number;
  total_estimated_cost: number;
}

export interface PurchaseRequest {
  id: number;
  pr_no: string;
  canvass_id: number | null;
  canvass_no: string | null;
  title: string;
  department_id: number;
  department_name: string;
  requested_by: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: PurchaseRequestStatus;
  notes: string;
  items: PurchaseRequestItem[];
  total_amount: number;
  pr_type?: PRType;
  sub_category?: string;
  is_bypassed_pmo?: boolean;
  approvals?: DigitalSignature[];
  target_date?: string;
  purpose?: string;
  total_estimated_budget?: number;
  winning_bid_id?: number | null;
  winning_bid_amount?: number | null;
  supplier_id?: number | null;
  supplier_name?: string | null;
  po_id?: number | null;
  po_no?: string | null;
  department_approved_by?: string | null;
  department_approved_at?: string | null;
  finance_status?: string | null;
  finance_approved_by?: string | null;
  finance_approved_at?: string | null;
  revision_remarks?: string | null;
  revision_requested_at?: string | null;
  revision_requested_by?: string | null;
  revision_count?: number;
  attachments: EvidenceAttachment[];
  contest_justification?: string | null;
  vpasa_authorized_at?: string | null;
  vpasa_authorized_by?: string | null;
  canvass_started_at?: string | null;
  pr_submitted_at?: string | null;
  finance_approved_at_time?: string | null;
  po_dispatched_at?: string | null;
  items_received_at?: string | null;
  stage_entered_at?: string | null;
  trail?: RequestTrailEntry[];
  created_at: string;
  updated_at: string;
}

export type POStatus =
  | "Ready for PO"
  | "PO Issued"
  | "Draft"
  | "Sent to Supplier"
  | "In Transit"
  | "Partially Received"
  | "Order Received"
  | "Awaiting Approval"
  | "Ordered"
  | "Fully Received"
  | "Cancelled";

export interface UnifiedProcurementRecord {
  id: number;
  pr_id?: number | null;
  pr_no: string;
  canvass_id?: number | null;
  canvass_no?: string | null;
  po_id?: number | null;
  po_no?: string | null;
  title: string;
  purpose?: string;
  pr_type?: string;
  sub_category?: string;
  department_id: number;
  department_name: string;
  requested_by: string;
  priority: "Low" | "Medium" | "High" | "Urgent" | "Normal";
  status:
    | "Pending Canvass"
    | "Bid Awarded - Pending PR"
    | "Contested"
    | "Pending Finance Approval"
    | "Finance Approved - Pending VPASA"
    | "Ready for PO"
    | "PO Issued"
    | "Needs Revision"
    | "Ready for Canvass"
    | "Bidding"
    | string;
  items: Array<{
    id: number;
    item_name: string;
    description?: string;
    quantity: number;
    unit: string;
    estimated_unit_cost: number;
    total_estimated_cost?: number;
  }>;
  total_amount: number;
  total_estimated_budget?: number;
  notes?: string;
  supplier_bids?: SupplierBid[];
  winning_bid_id?: number | null;
  winning_bid_amount?: number | null;
  supplier_id?: number | null;
  supplier_name?: string | null;
  awarded_supplier_name?: string | null;
  awarded_amount?: number | null;
  payment_terms?: string;
  delivery_date?: string;
  delivery_lead_time_days?: number;
  warehouse_id?: number;
  warehouse_name?: string;
  finance_approved_at?: string | null;
  finance_approved_by?: string | null;
  vpasa_authorized_at?: string | null;
  vpasa_authorized_by?: string | null;
  contest_justification?: string | null;
  revision_remarks?: string | null;
  revision_requested_at?: string | null;
  revision_requested_by?: string | null;
  created_at: string;
  updated_at: string;
  attachments?: EvidenceAttachment[];
  trail?: RequestTrailEntry[];
}

export interface PurchaseOrderItem {
  id: number;
  product_id?: number;
  item_name: string;
  description?: string;
  quantity: number;
  received_quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export interface PurchaseOrder {
  id: number;
  po_no: string;
  canvass_id: number | null;
  canvass_no: string | null;
  pr_id?: number | null;
  pr_no?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  winning_bid_id: number | null;
  supplier_id: number;
  supplier_name: string;
  supplier_email: string;
  supplier_phone: string;
  total_amount: number;
  payment_terms: string;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string;
  delivery_date?: string;
  received_date: string | null;
  warehouse_id: number;
  warehouse_name: string;
  items: PurchaseOrderItem[];
  notes: string;
  approved_by?: string | null;
  approved_at?: string | null;
  attachments: EvidenceAttachment[];
  canvass_started_at?: string | null;
  pr_submitted_at?: string | null;
  finance_approved_at?: string | null;
  po_dispatched_at?: string | null;
  items_received_at?: string | null;
  stage_entered_at?: string | null;
  trail?: RequestTrailEntry[];
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  product_code: string;
  product_name: string;
  category: string;
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  min_safety_stock: number;
  unit: string;
  unit_price: number;
  total_valuation: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  last_restocked_at: string;
  source_po_no?: string | null;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  terms: string;
  rating: number;
  categories?: string[];
  status?: string;
}

export interface Warehouse {
  id: number;
  warehouse_name: string;
  warehouse_address: string;
  capacity_status: string;
  location?: string;
  custodian?: string;
  contact_no?: string;
  status?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  head: string;
  allocated_amount: number;
  encumbered_amount?: number;
  utilized_amount: number;
  remaining_balance: number;
  budget_allocated?: number;
  budget_encumbered?: number;
  budget_utilized?: number;
  budget_remaining?: number;
}

export interface ItemRelease {
  id: number;
  release_no: string;
  department_id: number;
  department_name: string;
  requested_by: string;
  item_name: string;
  quantity: number;
  unit: string;
  warehouse_id: number;
  warehouse_name: string;
  purpose: string;
  request_date: string;
  status: "Pending Dispatch" | "Ready for Pickup" | "Dispatched" | "Completed";
  notes?: string;
}

// ==================== PERMISSIONS & RBAC SCHEMA ====================

export interface ModulePermission {
  id?: number;
  module_key: string;       // e.g. "department_portal", "dashboard", "canvassing", "finance", "purchase_order", "inventory"
  module_code: string;      // e.g. "page_department_portal", "page_dashboard", "page_canvassing", "page_finance_approval"
  module_name: string;      // e.g. "Department Portal", "Dashboard", "Canvassing & RFQ"
  description: string;      // What the module does
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface SystemRole {
  id: number;
  role: string;
  type: string;
  description: string;
}

export const SYSTEM_ROLES: SystemRole[] = [
  { id: 1, role: "Super Admin", type: "System Admin", description: "Unrestricted system access and RBAC management" },
  { id: 2, role: "Admin", type: "Administration", description: "Campus procurement administration and management" },
  { id: 3, role: "Staff", type: "Operations", description: "Warehouse operations, inventory, and requisitions" },
  { id: 4, role: "Department User", type: "Department", description: "Department canvassing and purchase requests" },
  { id: 5, role: "Finance Office", type: "Finance", description: "Financial approvals, budget reviews, and disbursements" },
];

export const SYSTEM_MODULES: Omit<ModulePermission, "can_view" | "can_create" | "can_edit" | "can_delete">[] = [
  {
    module_key: "department_portal",
    module_code: "page_department_portal",
    module_name: "Department Portal",
    description: "Submit requisitions, canvass requests, and track department procurement progress",
  },
  {
    module_key: "dashboard",
    module_code: "page_dashboard",
    module_name: "Dashboard",
    description: "Executive KPIs, stock summary, procurement velocity, and bottleneck alerts",
  },
  {
    module_key: "canvassing",
    module_code: "page_canvassing",
    module_name: "Canvassing & RFQ",
    description: "Manage price canvassing, request for quotations, and supplier bid evaluations",
  },
  {
    module_key: "finance",
    module_code: "page_finance_approval",
    module_name: "Finance Approval",
    description: "Budget verification, accounting reviews, fund clearance, and PR sign-off",
  },
  {
    module_key: "purchase_order",
    module_code: "page_purchase_order",
    module_name: "Purchase Order (Kanban)",
    description: "PO dispatch, supplier tracking, receipt verification, and automated restocking",
  },
  {
    module_key: "purchase_request",
    module_code: "page_purchase_request",
    module_name: "Purchase Request",
    description: "Official purchase requests and requisition vouchers workflow",
  },
  {
    module_key: "budget_allocation",
    module_code: "page_budget_allocation",
    module_name: "Budget Allocation",
    description: "Departmental budget tracking, expenditures, and annual funding limits",
  },
  {
    module_key: "departments",
    module_code: "page_departments",
    module_name: "Departments",
    description: "Manage university colleges, offices, budget centers, and department heads",
  },
  {
    module_key: "inventory",
    module_code: "page_inventory",
    module_name: "Inventory",
    description: "Central catalog, stock levels, reorder thresholds, and inventory adjustments",
  },
  {
    module_key: "sales",
    module_code: "page_sales",
    module_name: "Release Item",
    description: "Stock release to departments, supplies issuance, and order fulfillment",
  },
  {
    module_key: "transfer",
    module_code: "page_transfer",
    module_name: "Stock Transfer",
    description: "Inter-warehouse transfers, bin location movements, and transit verification",
  },
  {
    module_key: "warehouse",
    module_code: "page_warehouse",
    module_name: "Warehouse",
    description: "Warehouse locations, storage zones, aisle bins, and facility management",
  },
  {
    module_key: "users",
    module_code: "page_users",
    module_name: "Users",
    description: "User profiles, roles assignment, staff directory, and authentication status",
  },
  {
    module_key: "reports",
    module_code: "page_reports",
    module_name: "Reports",
    description: "Inventory audit ledgers, procurement analytics, and financial expense reports",
  },
  {
    module_key: "permissions",
    module_code: "page_user_permissions",
    module_name: "User Permissions",
    description: "Dynamic role-based access control (RBAC), module permissions, and security matrix",
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<number, ModulePermission[]> = {
  // 1: Super Admin (Unrestricted Full Access)
  1: SYSTEM_MODULES.map((m, idx) => ({
    id: idx + 1,
    ...m,
    can_view: true,
    can_create: true,
    can_edit: true,
    can_delete: true,
  })),

  // 2: Admin (Full administrative access)
  2: SYSTEM_MODULES.map((m, idx) => ({
    id: idx + 1,
    ...m,
    can_view: true,
    can_create: true,
    can_edit: true,
    can_delete: m.module_key !== "permissions", // Keep permissions deletion safe
  })),

  // 3: Staff (Operations, Inventory, Requisitions, Warehouse)
  3: SYSTEM_MODULES.map((m, idx) => {
    switch (m.module_key) {
      case "department_portal":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: false, can_delete: false };
      case "dashboard":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "canvassing":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: true, can_delete: false };
      case "purchase_request":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: false, can_delete: false };
      case "purchase_order":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "inventory":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: true, can_delete: false };
      case "sales":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: false, can_delete: false };
      case "transfer":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: false, can_delete: false };
      case "warehouse":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "departments":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "reports":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "finance":
      case "budget_allocation":
      case "users":
      case "permissions":
      default:
        return { id: idx + 1, ...m, can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
  }),

  // 4: Department User (Requisitions, Canvassing RFQ, Department Portal)
  4: SYSTEM_MODULES.map((m, idx) => {
    switch (m.module_key) {
      case "department_portal":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: true, can_delete: false };
      case "canvassing":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: false, can_delete: false };
      case "purchase_request":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: false, can_delete: false };
      case "dashboard":
      case "finance":
      case "purchase_order":
      case "budget_allocation":
      case "departments":
      case "inventory":
      case "sales":
      case "transfer":
      case "warehouse":
      case "users":
      case "reports":
      case "permissions":
      default:
        return { id: idx + 1, ...m, can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
  }),

  // 5: Finance Office (Finance Approvals, Budgets, PO reviews, Reports)
  5: SYSTEM_MODULES.map((m, idx) => {
    switch (m.module_key) {
      case "dashboard":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "finance":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: true, can_delete: false };
      case "budget_allocation":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: true, can_delete: false };
      case "canvassing":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "purchase_order":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "purchase_request":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "departments":
        return { id: idx + 1, ...m, can_view: true, can_create: false, can_edit: false, can_delete: false };
      case "reports":
        return { id: idx + 1, ...m, can_view: true, can_create: true, can_edit: false, can_delete: false };
      case "department_portal":
      case "inventory":
      case "sales":
      case "transfer":
      case "warehouse":
      case "users":
      case "permissions":
      default:
        return { id: idx + 1, ...m, can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
  }),
};

// ==================== INITIAL SEED DATA ====================

export const initialWarehouses: Warehouse[] = [
  { id: 1, warehouse_name: "PMO Central Depot (Main Campus)", warehouse_address: "San Francisco St., Butuan City", capacity_status: "Active - 68% Full" },
  { id: 2, warehouse_name: "CBAA Annex Storage", warehouse_address: "Bldg 3, Annex Campus, Butuan City", capacity_status: "Active - 42% Full" },
  { id: 3, warehouse_name: "Engineering & IT Lab Depot", warehouse_address: "Science & Tech Bldg, 2nd Floor", capacity_status: "Active - 55% Full" },
  { id: 4, warehouse_name: "General Property Custodian", warehouse_address: "Admin Complex Ground Floor", capacity_status: "Active - 78% Full" },
];

export const initialDepartments: Department[] = [
  {
    id: 1,
    name: "Physical Plant & Property Management Office (PMO)",
    code: "PMO",
    head: "Engr. Mark Villanueva",
    allocated_amount: 500000,
    encumbered_amount: 0,
    utilized_amount: 120000,
    remaining_balance: 380000,
    budget_allocated: 500000,
    budget_encumbered: 0,
    budget_utilized: 120000,
    budget_remaining: 380000,
  },
  {
    id: 2,
    name: "College of Computer Studies (CCS)",
    code: "CCS",
    head: "Dr. Rachel Soriano",
    allocated_amount: 1500000,
    encumbered_amount: 0,
    utilized_amount: 220000,
    remaining_balance: 1280000,
    budget_allocated: 1500000,
    budget_encumbered: 0,
    budget_utilized: 220000,
    budget_remaining: 1280000,
  },
  {
    id: 3,
    name: "College of Engineering and Technology (CET)",
    code: "CET",
    head: "Engr. David Tan",
    allocated_amount: 650000,
    encumbered_amount: 0,
    utilized_amount: 150000,
    remaining_balance: 500000,
    budget_allocated: 650000,
    budget_encumbered: 0,
    budget_utilized: 150000,
    budget_remaining: 500000,
  },
  {
    id: 4,
    name: "Finance & Accounting Office",
    code: "FAO",
    head: "Ms. Elena Bautista",
    allocated_amount: 350000,
    encumbered_amount: 0,
    utilized_amount: 50000,
    remaining_balance: 300000,
    budget_allocated: 350000,
    budget_encumbered: 0,
    budget_utilized: 50000,
    budget_remaining: 300000,
  },
  {
    id: 5,
    name: "Office of the Vice President for Academic Affairs",
    code: "OVPAA",
    head: "Dr. Anthony Perez",
    allocated_amount: 450000,
    utilized_amount: 80000,
    remaining_balance: 370000,
    budget_allocated: 450000,
    budget_utilized: 80000,
    budget_remaining: 370000,
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Crown Paper & Office Supplies Corp.",
    contact_person: "Eduardo Santos",
    email: "sales@crownpaper.ph",
    phone: "(085) 342-8812 / 0917-882-9011",
    address: "J.C. Aquino Ave., Butuan City",
    terms: "Net 30 Days",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Silicon Valley IT Solutions & Systems",
    contact_person: "Kristine Joy Mendoza",
    email: "corporate@siliconvalleysystems.com",
    phone: "(085) 815-4490 / 0920-994-1122",
    address: "Montilla Blvd., Butuan City",
    terms: "Net 15 Days",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Duka Mega Hardware & General Merchandise",
    contact_person: "Arthur Duka",
    email: "bids@dukamarketing.ph",
    phone: "(085) 341-2090",
    address: "Langihan Road, Butuan City",
    terms: "Cash on Delivery / Net 15",
    rating: 4.5,
  },
  {
    id: 4,
    name: "Agusan Tech Innovations & Electronics",
    contact_person: "Engr. Carlos Lim",
    email: "carlos@agusantech.com",
    phone: "0919-445-8833",
    address: "Libertad Highway, Butuan City",
    terms: "Net 30 Days",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Mindanao Scientific & Chemical Supplies",
    contact_person: "Patricia Gomez",
    email: "sales@minsci-ph.com",
    phone: "(085) 817-2231",
    address: "Km 3 Baan, Butuan City",
    terms: "Net 45 Days",
    rating: 4.6,
  },
];

export const initialInventory: InventoryItem[] = [
  {
    id: 1,
    product_code: "IT-LAP-001",
    product_name: "Dell Latitude 3440 Laptop (Core i5 16GB 512GB SSD)",
    category: "IT Equipment",
    warehouse_id: 3,
    warehouse_name: "Engineering & IT Lab Depot",
    quantity: 18,
    min_safety_stock: 10,
    unit: "Units",
    unit_price: 42500,
    total_valuation: 765000,
    status: "In Stock",
    last_restocked_at: "2026-09-02",
    source_po_no: "PO-2026-0042",
  },
  {
    id: 2,
    product_code: "IT-MON-002",
    product_name: 'ViewSonic 24" IPS Full HD Ergonomic Monitor',
    category: "IT Equipment",
    warehouse_id: 3,
    warehouse_name: "Engineering & IT Lab Depot",
    quantity: 6,
    min_safety_stock: 12,
    unit: "Units",
    unit_price: 7850,
    total_valuation: 47100,
    status: "Low Stock",
    last_restocked_at: "2026-08-15",
    source_po_no: "PO-2026-0038",
  },
  {
    id: 3,
    product_code: "OFF-PPR-A4",
    product_name: "Paper One Premium Copy Paper A4 80gsm (Box of 5 Reams)",
    category: "Office Supplies",
    warehouse_id: 1,
    warehouse_name: "PMO Central Depot (Main Campus)",
    quantity: 120,
    min_safety_stock: 40,
    unit: "Boxes",
    unit_price: 1350,
    total_valuation: 162000,
    status: "In Stock",
    last_restocked_at: "2026-09-10",
    source_po_no: "PO-2026-0045",
  },
  {
    id: 4,
    product_code: "OFF-TNR-085",
    product_name: "HP LaserJet Toner Cartridge 85A Black (CE285A)",
    category: "Office Supplies",
    warehouse_id: 1,
    warehouse_name: "PMO Central Depot (Main Campus)",
    quantity: 3,
    min_safety_stock: 8,
    unit: "Cartridges",
    unit_price: 3450,
    total_valuation: 10350,
    status: "Low Stock",
    last_restocked_at: "2026-07-28",
    source_po_no: "PO-2026-0029",
  },
  {
    id: 5,
    product_code: "MNT-AC-SPL",
    product_name: "Daikin Inverter Split Type Airconditioner 2.0HP",
    category: "Facility & Maintenance",
    warehouse_id: 1,
    warehouse_name: "PMO Central Depot (Main Campus)",
    quantity: 0,
    min_safety_stock: 2,
    unit: "Units",
    unit_price: 48900,
    total_valuation: 0,
    status: "Out of Stock",
    last_restocked_at: "2026-06-12",
    source_po_no: "PO-2026-0019",
  },
  {
    id: 6,
    product_code: "MNT-LED-T8",
    product_name: "Philips Essential LED Tube T8 18W Daylight",
    category: "Facility & Maintenance",
    warehouse_id: 4,
    warehouse_name: "General Property Custodian",
    quantity: 180,
    min_safety_stock: 50,
    unit: "Pieces",
    unit_price: 245,
    total_valuation: 44100,
    status: "In Stock",
    last_restocked_at: "2026-09-08",
    source_po_no: "PO-2026-0044",
  },
  {
    id: 7,
    product_code: "LAB-MIC-01",
    product_name: "Binocular Biological Compound Microscope 1000x",
    category: "Laboratory Equipment",
    warehouse_id: 3,
    warehouse_name: "Engineering & IT Lab Depot",
    quantity: 4,
    min_safety_stock: 5,
    unit: "Sets",
    unit_price: 28500,
    total_valuation: 114000,
    status: "Low Stock",
    last_restocked_at: "2026-08-01",
    source_po_no: "PO-2026-0035",
  },
];

export const initialCanvasses: Canvass[] = [
  {
    id: 1,
    canvass_no: "RFQ-2026-0012",
    title: "Procurement of CCS Computer Laboratory Workstations & Peripherals",
    rfq_date: "2026-09-05",
    deadline: "2026-09-22",
    department_id: 2,
    department_name: "College of Computer Studies (CCS)",
    requested_by: "Dr. Rachel Soriano",
    priority: "Urgent",
    status: "Bid Awarded - Pending PR",
    winning_bid_id: 201,
    winning_bid_amount: 338500,
    notes: "For upgrade of Multimedia Lab 304 ahead of 2nd Semester project presentations.",
    total_estimated_budget: 350000,
    pr_id: 2,
    pr_no: "PR-2026-0010",
    po_id: null,
    attachments: [
      {
        id: "att-canv-101",
        name: "Supplier-Quotation-Silicon-Valley.pdf",
        original_name: "sample-supplier-quotation.txt",
        url: "/uploads/sample-supplier-quotation.txt",
        size: 345000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-12 14:00:00",
        uploaded_by: "Dr. Rachel Soriano",
        stage: "Canvass",
        type: "quotation",
        notes: "Official bid from Silicon Valley IT Solutions & Systems.",
      },
      {
        id: "att-canv-102",
        name: "Comparative-Evaluation-Matrix-CCS.pdf",
        original_name: "sample-comparative-matrix.txt",
        url: "/uploads/sample-comparative-matrix.txt",
        size: 198000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-14 16:30:00",
        uploaded_by: "TWG Committee",
        stage: "Canvass",
        type: "matrix",
        notes: "BAC comparative matrix evaluating CPU benchmarks and warranty terms.",
      },
    ],
    items: [
      {
        id: 101,
        item_name: "Desktop Workstation i7 32GB 1TB NVMe with RTX 4060",
        description: "Standard high performance CAD/Rendering unit with licensed OS",
        quantity: 5,
        unit: "Units",
        estimated_unit_cost: 58000,
        total_estimated_cost: 290000,
      },
      {
        id: 102,
        item_name: '27" 144Hz IPS Color-Accurate Designer Monitor',
        description: "100% sRGB, Height adjustable stand, HDMI & DisplayPort",
        quantity: 5,
        unit: "Units",
        estimated_unit_cost: 12000,
        total_estimated_cost: 60000,
      },
    ],
    supplier_bids: [
      {
        id: 201,
        canvass_id: 1,
        supplier_id: 2,
        supplier_name: "Silicon Valley IT Solutions & Systems",
        contact_person: "Kristine Joy Mendoza",
        email: "corporate@siliconvalleysystems.com",
        phone: "(085) 815-4490",
        bid_amount: 338500,
        payment_terms: "30 Days after acceptance",
        delivery_lead_time_days: 7,
        delivery_date: "2026-09-28",
        status: "pending",
        remarks: "Includes 3-year on-site comprehensive warranty and free preventive maintenance for Year 1.",
        submitted_at: "2026-09-12",
        item_bids: [
          { item_id: 101, item_name: "Desktop Workstation i7 32GB RTX 4060", unit_price: 56500, total_price: 282500, brand_model: "Lenovo ThinkCentre Neo 50t Gen4" },
          { item_id: 102, item_name: '27" 144Hz IPS Monitor', unit_price: 11200, total_price: 56000, brand_model: "ViewSonic VX2718-2K-PRO" },
        ],
      },
      {
        id: 202,
        canvass_id: 1,
        supplier_id: 4,
        supplier_name: "Agusan Tech Innovations & Electronics",
        contact_person: "Engr. Carlos Lim",
        email: "carlos@agusantech.com",
        phone: "0919-445-8833",
        bid_amount: 349000,
        payment_terms: "50% Downpayment, 50% upon delivery",
        delivery_lead_time_days: 14,
        delivery_date: "2026-10-04",
        status: "pending",
        remarks: "Custom assembled rigs with ASUS TUF Gaming components. 2-year warranty on parts.",
        submitted_at: "2026-09-14",
        item_bids: [
          { item_id: 101, item_name: "Desktop Workstation i7 32GB RTX 4060", unit_price: 58000, total_price: 290000, brand_model: "Custom Asus TUF Gaming Rig" },
          { item_id: 102, item_name: '27" 144Hz IPS Monitor', unit_price: 11800, total_price: 59000, brand_model: "AOC Q27G2S/D" },
        ],
      },
    ],
    created_at: "2026-09-05 09:00:00",
    updated_at: "2026-09-14 14:30:00",
    canvass_started_at: "2026-09-05 09:00:00",
    pr_submitted_at: "2026-09-08 11:30:00",
    finance_approved_at: null,
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-13 14:00:00",
  },
  {
    id: 2,
    canvass_no: "RFQ-2026-0013",
    title: "Quarterly Office Stationery, Copy Paper & Consumables",
    rfq_date: "2026-09-08",
    deadline: "2026-09-25",
    department_id: 1,
    department_name: "Physical Plant & Property Management Office (PMO)",
    requested_by: "Engr. Mark Villanueva",
    priority: "Medium",
    status: "Finance Approved - Pending VPASA",
    notes: "Consolidated quarterly requisition for all university administrative offices. Bidding completed with Crown Paper awarded, budget cleared by Finance, awaiting VPASA final authorization.",
    total_estimated_budget: 185000,
    winning_bid_id: 203,
    winning_bid_amount: 176200,
    pr_id: 3,
    pr_no: "PR-2026-0011",
    po_id: null,
    finance_approved_by: "Ms. Elena Bautista",
    finance_approved_at: "2026-09-14 11:30:00",
    attachments: [
      {
        id: "att-canv-201",
        name: "Quotation-Crown-Paper.pdf",
        original_name: "sample-supplier-quotation.txt",
        url: "/uploads/sample-supplier-quotation.txt",
        size: 215000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-11 16:45:00",
        uploaded_by: "Engr. Mark Villanueva",
        stage: "Canvass",
        type: "quotation",
        notes: "Discounted bulk prices from Crown Paper.",
      },
    ],
    items: [
      {
        id: 103,
        item_name: "Paper One Copier Paper A4 80gsm",
        description: "5 reams per box, moisture proof packaging",
        quantity: 80,
        unit: "Boxes",
        estimated_unit_cost: 1350,
        total_estimated_cost: 108000,
      },
      {
        id: 104,
        item_name: "HP LaserJet 85A Toner Cartridge (CE285A)",
        description: "Original OEM cartridge only",
        quantity: 15,
        unit: "Cartridges",
        estimated_unit_cost: 3500,
        total_estimated_cost: 52500,
      },
      {
        id: 105,
        item_name: "Heavy Duty Expanding Plastic Envelopes with Handle",
        description: "Long legal size, blue and green color coding",
        quantity: 250,
        unit: "Pieces",
        estimated_unit_cost: 98,
        total_estimated_cost: 24500,
      },
    ],
    supplier_bids: [
      {
        id: 203,
        canvass_id: 2,
        supplier_id: 1,
        supplier_name: "Crown Paper & Office Supplies Corp.",
        contact_person: "Eduardo Santos",
        email: "sales@crownpaper.ph",
        phone: "(085) 342-8812",
        bid_amount: 176200,
        payment_terms: "Net 30 Days",
        delivery_lead_time_days: 3,
        delivery_date: "2026-09-27",
        status: "pending",
        remarks: "Stock currently on-hand at Butuan warehouse. Free delivery within Butuan City.",
        submitted_at: "2026-09-11",
        item_bids: [
          { item_id: 103, item_name: "Paper One Copier Paper A4 80gsm", unit_price: 1290, total_price: 103200, brand_model: "PaperOne Premium" },
          { item_id: 104, item_name: "HP LaserJet 85A Toner Cartridge", unit_price: 3350, total_price: 50250, brand_model: "HP Original" },
          { item_id: 105, item_name: "Heavy Duty Expanding Envelopes", unit_price: 91, total_price: 22750, brand_model: "Deli Office" },
        ],
      },
    ],
    created_at: "2026-09-08 10:15:00",
    updated_at: "2026-09-11 16:40:00",
    canvass_started_at: "2026-09-08 10:15:00",
    pr_submitted_at: null,
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-16 10:00:00",
  },
  {
    id: 3,
    canvass_no: "RFQ-2026-0010",
    title: "Air Conditioning Units Replacement for CET Faculty Rooms",
    rfq_date: "2026-08-20",
    deadline: "2026-09-01",
    department_id: 3,
    department_name: "College of Engineering and Technology (CET)",
    requested_by: "Engr. David Tan",
    priority: "High",
    status: "PO Issued",
    finance_status: "Finance Approved",
    notes: "Replacement of 12-year-old non-inverter units in Dean's office and faculty cluster.",
    total_estimated_budget: 195000,
    winning_bid_id: 204,
    winning_bid_amount: 187600,
    pr_id: 1,
    pr_no: "PR-2026-0009",
    po_id: 1,
    po_no: "PO-2026-0046",
    attachments: [
      {
        id: "att-canv-301",
        name: "Winning-Quotation-Duka-Hardware.pdf",
        original_name: "sample-supplier-quotation.txt",
        url: "/uploads/sample-supplier-quotation.txt",
        size: 218000,
        mime_type: "application/pdf",
        uploaded_at: "2026-08-25 14:20:00",
        uploaded_by: "Engr. David Tan",
        stage: "Canvass",
        type: "quotation",
        notes: "Approved winning bid including installation copper kit.",
      },
      {
        id: "att-canv-302",
        name: "BAC-Resolution-Winning-Bid.pdf",
        original_name: "sample-comparative-matrix.txt",
        url: "/uploads/sample-comparative-matrix.txt",
        size: 172000,
        mime_type: "application/pdf",
        uploaded_at: "2026-08-30 11:00:00",
        uploaded_by: "BAC Secretary",
        stage: "Canvass",
        type: "matrix",
        notes: "Official board of awards resolution recommending award.",
      },
    ],
    items: [
      {
        id: 106,
        item_name: "Daikin Inverter Split Type Airconditioner 2.0HP",
        description: "R32 Refrigerant, High Energy Efficiency Ratio (EER), with Copper piping",
        quantity: 4,
        unit: "Units",
        estimated_unit_cost: 48500,
        total_estimated_cost: 194000,
      },
    ],
    supplier_bids: [
      {
        id: 204,
        canvass_id: 3,
        supplier_id: 3,
        supplier_name: "Duka Mega Hardware & General Merchandise",
        contact_person: "Arthur Duka",
        email: "bids@dukamarketing.ph",
        phone: "(085) 341-2090",
        bid_amount: 187600,
        payment_terms: "Progress Billing (50% Delivery, 50% Testing/Commissioning)",
        delivery_lead_time_days: 5,
        delivery_date: "2026-09-08",
        status: "approved",
        remarks: "Winning bid approved by BAC. Free installation of first 10ft copper piping per unit.",
        submitted_at: "2026-08-25",
        item_bids: [
          { item_id: 106, item_name: "Daikin Inverter Split AC 2.0HP", unit_price: 46900, total_price: 187600, brand_model: "Daikin FTKQ50TVM" },
        ],
      },
    ],
    created_at: "2026-08-20 08:30:00",
    updated_at: "2026-09-02 11:20:00",
    canvass_started_at: "2026-08-20 08:30:00",
    pr_submitted_at: "2026-08-26 09:00:00",
    finance_approved_at: "2026-09-01 14:00:00",
    po_dispatched_at: "2026-09-03 09:15:00",
    items_received_at: "2026-09-08 16:00:00",
    stage_entered_at: "2026-09-01 14:00:00",
  },
  {
    id: 4,
    canvass_no: "RFQ-2026-0014",
    title: "Engineering Lab Digital Multimeters and Oscilloscopes",
    rfq_date: "2026-09-14",
    deadline: "2026-09-30",
    department_id: 3,
    department_name: "College of Engineering and Technology (CET)",
    requested_by: "Engr. David Tan",
    priority: "Medium",
    status: "Pending Canvass",
    notes: "Drafting specifications for ECE laboratory accreditation.",
    total_estimated_budget: 120000,
    winning_bid_id: null,
    pr_id: 4,
    pr_no: "PR-2026-0012",
    po_id: null,
    attachments: [],
    items: [
      {
        id: 107,
        item_name: "Fluke 117 True-RMS Electrician's Multimeter",
        description: "VoltAlert technology, integrated non-contact voltage detection",
        quantity: 6,
        unit: "Units",
        estimated_unit_cost: 15500,
        total_estimated_cost: 93000,
      },
      {
        id: 108,
        item_name: "Digital Storage Oscilloscope 100MHz 2-Channel",
        description: "1GSa/s sampling rate with 7-inch TFT color display",
        quantity: 1,
        unit: "Unit",
        estimated_unit_cost: 27000,
        total_estimated_cost: 27000,
      },
    ],
    supplier_bids: [],
    created_at: "2026-09-14 13:10:00",
    updated_at: "2026-09-14 13:10:00",
    canvass_started_at: "2026-09-14 13:10:00",
    pr_submitted_at: null,
    finance_approved_at: null,
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-17 15:30:00",
  },
  {
    id: 5,
    canvass_no: "RFQ-2026-0015",
    title: "Biology Laboratory Benchtop Autoclave & Research Microscopes",
    rfq_date: "2026-09-10",
    deadline: "2026-09-24",
    department_id: 2,
    department_name: "College of Computer Studies & Science (CCS)",
    requested_by: "Dr. Rachel Soriano",
    priority: "High",
    status: "Pending Finance Approval",
    notes: "Formal PR drafted based on awarded bid from Agusan Tech Innovations. Awaiting Finance budget verification.",
    total_estimated_budget: 215000,
    winning_bid_id: 205,
    winning_bid_amount: 210000,
    pr_id: 6,
    pr_no: "PR-2026-0014",
    po_id: null,
    attachments: [],
    items: [
      {
        id: 109,
        item_name: "Laboratory Benchtop Steam Autoclave 24L",
        description: "Stainless steel chamber with digital timer and safety valve",
        quantity: 1,
        unit: "Unit",
        estimated_unit_cost: 135000,
        total_estimated_cost: 135000,
      },
      {
        id: 110,
        item_name: "Binocular Biological Compound Microscope 1000x",
        description: "LED illumination with achromatic objectives 4x, 10x, 40x, 100x",
        quantity: 3,
        unit: "Units",
        estimated_unit_cost: 25000,
        total_estimated_cost: 75000,
      },
    ],
    supplier_bids: [
      {
        id: 205,
        canvass_id: 5,
        supplier_id: 4,
        supplier_name: "Agusan Tech Innovations & Electronics",
        contact_person: "Engr. Carlos Lim",
        email: "carlos@agusantech.com",
        phone: "0919-445-8833",
        bid_amount: 210000,
        payment_terms: "30 Days after acceptance",
        delivery_lead_time_days: 10,
        delivery_date: "2026-09-30",
        status: "approved",
        remarks: "Winning bid approved by PMO canvassing. Formal PR drafted by department.",
        submitted_at: "2026-09-15",
      },
    ],
    created_at: "2026-09-10 10:00:00",
    updated_at: "2026-09-16 14:30:00",
    canvass_started_at: "2026-09-10 10:00:00",
    pr_submitted_at: "2026-09-16 14:30:00",
    finance_approved_at: null,
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-16 14:30:00",
  },
  {
    id: 6,
    canvass_no: "RFQ-2026-0016",
    title: "Campus Wi-Fi 6 Access Points & Managed PoE Gigabit Switches",
    rfq_date: "2026-09-02",
    deadline: "2026-09-18",
    department_id: 1,
    department_name: "Physical Plant & Property Management Office (PMO)",
    requested_by: "Engr. Mark Villanueva",
    priority: "Urgent",
    status: "Ready for PO",
    notes: "Executive authorization signed by VPASA. Requisition is now in Stage 6, ready for Purchase Order generation.",
    total_estimated_budget: 280000,
    winning_bid_id: 206,
    winning_bid_amount: 275000,
    pr_id: 7,
    pr_no: "PR-2026-0016",
    po_id: null,
    finance_approved_by: "Ms. Elena Bautista",
    finance_approved_at: "2026-09-16 09:00:00",
    vpasa_authorized_by: "Dr. Ronald Castillo (VPASA)",
    vpasa_authorized_at: "2026-09-17 14:00:00",
    attachments: [],
    items: [
      {
        id: 111,
        item_name: "Enterprise Dual-Band Wi-Fi 6 Indoor Access Point",
        description: "AX3000 ceiling mount, cloud-managed with PoE support",
        quantity: 12,
        unit: "Units",
        estimated_unit_cost: 14500,
        total_estimated_cost: 174000,
      },
      {
        id: 112,
        item_name: "24-Port Gigabit Managed PoE+ Switch 370W",
        description: "Layer 2+ with 4 SFP uplink ports",
        quantity: 2,
        unit: "Units",
        estimated_unit_cost: 50500,
        total_estimated_cost: 101000,
      },
    ],
    supplier_bids: [
      {
        id: 206,
        canvass_id: 6,
        supplier_id: 2,
        supplier_name: "Silicon Valley IT Solutions & Systems",
        contact_person: "Kristine Joy Mendoza",
        email: "corporate@siliconvalleysystems.com",
        phone: "(085) 815-4490",
        bid_amount: 275000,
        payment_terms: "30 Days Net",
        delivery_lead_time_days: 7,
        delivery_date: "2026-09-28",
        status: "approved",
        remarks: "Includes full installation, mounting brackets, and 3-year enterprise warranty.",
        submitted_at: "2026-09-12",
      },
    ],
    created_at: "2026-09-02 09:00:00",
    updated_at: "2026-09-17 14:00:00",
    canvass_started_at: "2026-09-02 09:00:00",
    pr_submitted_at: "2026-09-14 11:00:00",
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-17 14:00:00",
  },
];

export const initialPurchaseRequests: PurchaseRequest[] = [
  {
    id: 1,
    pr_no: "PR-2026-0009",
    canvass_id: 3,
    canvass_no: "RFQ-2026-0010",
    title: "Air Conditioning Units Replacement for CET Faculty Rooms",
    department_id: 3,
    department_name: "College of Engineering and Technology (CET)",
    requested_by: "Engr. David Tan",
    priority: "High",
    status: "PO Issued",
    notes: "Approved budget clearance for CET faculty air conditioning replacement.",
    items: [
      {
        id: 401,
        item_name: "Daikin Inverter Split Type Airconditioner 2.0HP",
        description: "R32 Refrigerant, High Energy Efficiency Ratio (EER), with Copper piping",
        quantity: 4,
        unit: "Units",
        estimated_unit_cost: 46900,
        total_estimated_cost: 187600,
      },
    ],
    total_amount: 187600,
    winning_bid_id: 204,
    supplier_id: 3,
    supplier_name: "Duka Mega Hardware & General Merchandise",
    po_id: 1,
    po_no: "PO-2026-0046",
    department_approved_by: "Engr. David Tan",
    department_approved_at: "2026-08-28 10:00:00",
    finance_approved_by: "Ms. Elena Bautista",
    finance_approved_at: "2026-09-01 14:00:00",
    attachments: [
      {
        id: "att-pr-01",
        name: "Signed-PR-Budget-Clearance.pdf",
        original_name: "sample-pr-budget-clearance.txt",
        url: "/uploads/sample-pr-budget-clearance.txt",
        size: 142000,
        mime_type: "application/pdf",
        uploaded_at: "2026-08-28 10:30:00",
        uploaded_by: "Elena Bautista (FAO)",
        stage: "Purchase Request",
        type: "clearance",
        notes: "Budget verified against Capital Outlay Fund.",
      },
      {
        id: "att-canv-301-pr",
        name: "Winning-Quotation-Duka-Hardware.pdf",
        original_name: "sample-supplier-quotation.txt",
        url: "/uploads/sample-supplier-quotation.txt",
        size: 218000,
        mime_type: "application/pdf",
        uploaded_at: "2026-08-25 14:20:00",
        uploaded_by: "Engr. David Tan",
        stage: "Canvass",
        type: "quotation",
        notes: "Carried over from Canvass RFQ-2026-0010.",
      },
    ],
    created_at: "2026-08-26 09:00:00",
    updated_at: "2026-09-01 14:00:00",
    canvass_started_at: "2026-08-20 08:30:00",
    pr_submitted_at: "2026-08-26 09:00:00",
    po_dispatched_at: "2026-09-03 09:15:00",
    items_received_at: "2026-09-08 16:00:00",
    stage_entered_at: "2026-09-01 14:00:00",
  },
  {
    id: 2,
    pr_no: "PR-2026-0010",
    canvass_id: 1,
    canvass_no: "RFQ-2026-0012",
    title: "Procurement of CCS Computer Laboratory Workstations & Peripherals",
    department_id: 2,
    department_name: "College of Computer Studies (CCS)",
    requested_by: "Dr. Rachel Soriano",
    priority: "Urgent",
    status: "Bid Awarded - Pending PR",
    notes: "Winning bid awarded to Silicon Valley IT Solutions (₱338,500). Ready for Department to generate formal PR or Contest/Reject.",
    items: [
      {
        id: 402,
        item_name: "Desktop Workstation i7 32GB 1TB NVMe with RTX 4060",
        description: "Standard high performance CAD/Rendering unit with licensed OS",
        quantity: 5,
        unit: "Units",
        estimated_unit_cost: 58000,
        total_estimated_cost: 290000,
      },
      {
        id: 403,
        item_name: '27" 144Hz IPS Color-Accurate Designer Monitor',
        description: "Factory calibrated sRGB 99% with height adjust stand",
        quantity: 5,
        unit: "Units",
        estimated_unit_cost: 12000,
        total_estimated_cost: 60000,
      },
    ],
    total_amount: 338500,
    winning_bid_id: 201,
    supplier_id: 2,
    supplier_name: "Silicon Valley IT Solutions & Systems",
    po_id: null,
    po_no: null,
    department_approved_by: "Dr. Rachel Soriano",
    department_approved_at: "2026-09-12 11:00:00",
    finance_approved_by: null,
    finance_approved_at: null,
    attachments: [
      {
        id: "att-pr-02",
        name: "Comparative-Evaluation-Matrix-CCS.pdf",
        original_name: "sample-comparative-matrix.txt",
        url: "/uploads/sample-comparative-matrix.txt",
        size: 198000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-10 16:00:00",
        uploaded_by: "Dr. Rachel Soriano",
        stage: "Canvass",
        type: "matrix",
        notes: "Carried over from RFQ-2026-0012 canvass evaluation.",
      },
      {
        id: "att-pr-03",
        name: "CCS-Department-Council-Memo.pdf",
        original_name: "sample-pr-budget-clearance.txt",
        url: "/uploads/sample-pr-budget-clearance.txt",
        size: 175000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-12 11:15:00",
        uploaded_by: "Dr. Rachel Soriano",
        stage: "Purchase Request",
        type: "memo",
        notes: "Department Council resolution endorsing acquisition.",
      },
    ],
    created_at: "2026-09-10 09:00:00",
    updated_at: "2026-09-12 11:15:00",
    canvass_started_at: "2026-09-05 09:00:00",
    pr_submitted_at: null,
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-12 11:15:00",
  },
  {
    id: 3,
    pr_no: "PR-2026-0011",
    canvass_id: 2,
    canvass_no: "RFQ-2026-0013",
    title: "Quarterly Office Stationery, Copy Paper & Consumables",
    department_id: 1,
    department_name: "Physical Plant & Property Management Office (PMO)",
    requested_by: "Engr. Mark Villanueva",
    priority: "Medium",
    status: "Finance Approved - Pending VPASA",
    notes: "Consolidated quarterly office supply requirements. Budget cleared by Finance; awaiting final executive authorization from VPASA.",
    items: [
      {
        id: 404,
        item_name: "Paper One Copier Paper A4 80gsm",
        description: "5 reams per box, moisture proof packaging",
        quantity: 80,
        unit: "Boxes",
        estimated_unit_cost: 1290,
        total_estimated_cost: 103200,
      },
      {
        id: 405,
        item_name: "HP LaserJet 85A Toner Cartridge (CE285A)",
        description: "Original OEM cartridge only",
        quantity: 15,
        unit: "Cartridges",
        estimated_unit_cost: 3350,
        total_estimated_cost: 50250,
      },
      {
        id: 406,
        item_name: "Heavy Duty Expanding Plastic Envelopes with Handle",
        description: "Long legal size, blue and green color coding",
        quantity: 250,
        unit: "Pieces",
        estimated_unit_cost: 91,
        total_estimated_cost: 22750,
      },
    ],
    total_amount: 176200,
    winning_bid_id: 203,
    supplier_id: 1,
    supplier_name: "Crown Paper & Office Supplies Corp.",
    po_id: null,
    po_no: null,
    department_approved_by: "Engr. Mark Villanueva",
    department_approved_at: "2026-09-12 14:00:00",
    finance_approved_by: "Ms. Elena Bautista",
    finance_approved_at: "2026-09-14 11:30:00",
    attachments: [
      {
        id: "att-pr-04",
        name: "Crown-Paper-Verified-Quotation.pdf",
        original_name: "sample-supplier-quotation.txt",
        url: "/uploads/sample-supplier-quotation.txt",
        size: 215000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-11 16:45:00",
        uploaded_by: "Engr. Mark Villanueva",
        stage: "Canvass",
        type: "quotation",
        notes: "Carried over from RFQ-2026-0013.",
      },
    ],
    created_at: "2026-09-12 14:00:00",
    updated_at: "2026-09-14 11:30:00",
    canvass_started_at: "2026-09-08 10:15:00",
    pr_submitted_at: "2026-09-12 14:00:00",
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-14 11:30:00",
  },
  {
    id: 4,
    pr_no: "PR-2026-0012",
    canvass_id: 4,
    canvass_no: "RFQ-2026-0014",
    title: "Engineering Lab Digital Multimeters and Oscilloscopes",
    department_id: 3,
    department_name: "College of Engineering and Technology (CET)",
    requested_by: "Engr. David Tan",
    priority: "Medium",
    status: "Pending Canvass",
    notes: "Department Request for Canvass (RFQ) submitted. Awaiting supplier quotation sourcing in Canvassing portal.",
    items: [
      {
        id: 407,
        item_name: "Fluke 117 True-RMS Electrician's Multimeter",
        description: "VoltAlert technology, integrated non-contact voltage detection",
        quantity: 6,
        unit: "Units",
        estimated_unit_cost: 15500,
        total_estimated_cost: 93000,
      },
      {
        id: 408,
        item_name: "Digital Storage Oscilloscope 100MHz 2-Channel",
        description: "1GSa/s sampling rate with 7-inch TFT color display",
        quantity: 1,
        unit: "Unit",
        estimated_unit_cost: 27000,
        total_estimated_cost: 27000,
      },
    ],
    total_amount: 120000,
    winning_bid_id: null,
    supplier_id: null,
    supplier_name: null,
    po_id: null,
    po_no: null,
    department_approved_by: null,
    department_approved_at: null,
    finance_approved_by: null,
    finance_approved_at: null,
    attachments: [],
    created_at: "2026-09-14 13:30:00",
    updated_at: "2026-09-14 13:30:00",
    canvass_started_at: "2026-09-14 13:10:00",
    pr_submitted_at: null,
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-14 13:30:00",
  },
  {
    id: 6,
    pr_no: "PR-2026-0014",
    canvass_id: 5,
    canvass_no: "RFQ-2026-0015",
    title: "Biology Laboratory Benchtop Autoclave & Research Microscopes",
    department_id: 2,
    department_name: "College of Computer Studies & Science (CCS)",
    requested_by: "Dr. Rachel Soriano",
    priority: "High",
    status: "Pending Finance Approval",
    notes: "Formal PR submitted following winning bid award to Agusan Tech Innovations. Awaiting Finance Gatekeeper review.",
    items: [
      {
        id: 409,
        item_name: "Laboratory Benchtop Steam Autoclave 24L",
        description: "Stainless steel chamber with digital timer and safety valve",
        quantity: 1,
        unit: "Unit",
        estimated_unit_cost: 135000,
        total_estimated_cost: 135000,
      },
      {
        id: 410,
        item_name: "Binocular Biological Compound Microscope 1000x",
        description: "LED illumination with achromatic objectives 4x, 10x, 40x, 100x",
        quantity: 3,
        unit: "Units",
        estimated_unit_cost: 25000,
        total_estimated_cost: 75000,
      },
    ],
    total_amount: 210000,
    winning_bid_id: 205,
    supplier_id: 4,
    supplier_name: "Agusan Tech Innovations & Electronics",
    po_id: null,
    po_no: null,
    department_approved_by: "Dr. Rachel Soriano",
    department_approved_at: "2026-09-16 14:30:00",
    finance_approved_by: null,
    finance_approved_at: null,
    attachments: [],
    created_at: "2026-09-10 10:00:00",
    updated_at: "2026-09-16 14:30:00",
    canvass_started_at: "2026-09-10 10:00:00",
    pr_submitted_at: "2026-09-16 14:30:00",
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-16 14:30:00",
  },
  {
    id: 7,
    pr_no: "PR-2026-0016",
    canvass_id: 6,
    canvass_no: "RFQ-2026-0016",
    title: "Campus Wi-Fi 6 Access Points & Managed PoE Gigabit Switches",
    department_id: 1,
    department_name: "Physical Plant & Property Management Office (PMO)",
    requested_by: "Engr. Mark Villanueva",
    priority: "Urgent",
    status: "Ready for PO",
    notes: "VPASA executive authorization signed. Ready for Purchase Order creation in Stage 6.",
    items: [
      {
        id: 411,
        item_name: "Enterprise Dual-Band Wi-Fi 6 Indoor Access Point",
        description: "AX3000 ceiling mount, cloud-managed with PoE support",
        quantity: 12,
        unit: "Units",
        estimated_unit_cost: 14500,
        total_estimated_cost: 174000,
      },
      {
        id: 412,
        item_name: "24-Port Gigabit Managed PoE+ Switch 370W",
        description: "Layer 2+ with 4 SFP uplink ports",
        quantity: 2,
        unit: "Units",
        estimated_unit_cost: 50500,
        total_estimated_cost: 101000,
      },
    ],
    total_amount: 275000,
    winning_bid_id: 206,
    supplier_id: 2,
    supplier_name: "Silicon Valley IT Solutions & Systems",
    po_id: null,
    po_no: null,
    department_approved_by: "Engr. Mark Villanueva",
    department_approved_at: "2026-09-14 11:00:00",
    finance_approved_by: "Ms. Elena Bautista",
    finance_approved_at: "2026-09-16 09:00:00",
    vpasa_authorized_by: "Dr. Ronald Castillo (VPASA)",
    vpasa_authorized_at: "2026-09-17 14:00:00",
    attachments: [],
    created_at: "2026-09-02 09:00:00",
    updated_at: "2026-09-17 14:00:00",
    canvass_started_at: "2026-09-02 09:00:00",
    pr_submitted_at: "2026-09-14 11:00:00",
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-17 14:00:00",
  },
  {
    id: 5,
    pr_no: "PR-2026-0015",
    canvass_id: null,
    canvass_no: null,
    title: "Faculty Certification on Applied Artificial Intelligence & Pedagogy",
    department_id: 2,
    department_name: "College of Computer Studies (CCS)",
    requested_by: "Dr. Rachel Soriano",
    priority: "High",
    status: "Pending HR",
    pr_type: "Services/OpEx (Budget Only)",
    sub_category: "HR & Training Services",
    is_bypassed_pmo: true,
    purpose: "Specialized 40-hour hands-on certification program on Generative AI curriculum integration for 15 CCS faculty members.",
    notes: "Bypasses PMO and inventory. Awaiting HR Director digital validation.",
    total_amount: 175000,
    total_estimated_budget: 175000,
    target_date: "2026-10-15",
    winning_bid_id: null,
    supplier_id: null,
    supplier_name: null,
    po_id: null,
    po_no: null,
    department_approved_by: "Dr. Rachel Soriano (CCS Dean)",
    department_approved_at: "2026-09-15 09:30:00",
    finance_approved_by: null,
    finance_approved_at: null,
    approvals: [
      {
        role: "Dept Head",
        role_title: "Department Chairperson / Head",
        signatory_name: "Dr. Rachel Soriano",
        signatory_title: "Dean, College of Computer Studies",
        signed_at: "2026-09-15 09:30:00",
        status: "approved",
        remarks: "Endorsed for faculty curriculum modernization and research readiness.",
      },
      {
        role: "HR",
        role_title: "HR & Training Development Director",
        signatory_name: null,
        signatory_title: "Director, Human Resource Development Office",
        signed_at: null,
        status: "pending",
        remarks: "Under evaluation for training CPD points and faculty development matching.",
      },
      {
        role: "Finance",
        role_title: "Finance & Accounting Officer",
        signatory_name: null,
        signatory_title: "Finance Director / Comptroller",
        signed_at: null,
        status: "pending",
        remarks: "Budget allocation clearance required.",
      },
      {
        role: "VP Acad / VPAsa",
        role_title: "VP Academic Affairs / VP Administration (VP Acad / VPAsa)",
        signatory_name: null,
        signatory_title: "VP for Academic Affairs / VP Administration & Student Affairs",
        signed_at: null,
        status: "pending",
        remarks: "Final executive sign-off required prior to budget disbursement.",
      },
    ],
    attachments: [
      {
        id: "att-pr-hr-01",
        name: "AI-Faculty-Upskilling-Syllabus.pdf",
        original_name: "sample-training-syllabus.txt",
        url: "/uploads/sample-pr-budget-clearance.txt",
        size: 240000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-15 09:15:00",
        uploaded_by: "Dr. Rachel Soriano",
        stage: "Purchase Request",
        type: "memo",
        notes: "Detailed curriculum modules, speaker credentials, and CPD accreditation plan.",
      },
    ],
    items: [
      {
        id: 501,
        item_name: "Professional AI Trainer Honorarium & Courseware Licensing (15 Seats)",
        description: "Official certification assessment vouchers and cloud sandbox access",
        quantity: 15,
        unit: "Pax",
        estimated_unit_cost: 9500,
        total_estimated_cost: 142500,
      },
      {
        id: 502,
        item_name: "Training Kits, Coursework Materials & Catering (3-Day Workshop)",
        description: "Comprehensive printed guides, workshop badges, and meal packages",
        quantity: 15,
        unit: "Packages",
        estimated_unit_cost: 2166.67,
        total_estimated_cost: 32500,
      },
    ],
    created_at: "2026-09-15 08:30:00",
    updated_at: "2026-09-15 09:30:00",
    pr_submitted_at: "2026-09-15 08:30:00",
    stage_entered_at: "2026-09-15 09:30:00",
  },
  {
    id: 8,
    pr_no: "PR-2026-0018",
    canvass_id: null,
    canvass_no: null,
    title: "University Supervisory & Leadership Development Workshop 2026",
    department_id: 6,
    department_name: "Human Resource & Development Office",
    requested_by: "Atty. Maria Santos",
    priority: "Medium",
    status: "Pending Finance",
    pr_type: "Services/OpEx (Budget Only)",
    sub_category: "HR & Training Services",
    is_bypassed_pmo: true,
    purpose: "Annual leadership coaching and supervisory skills enhancement for middle managers, department chairs, and unit supervisors.",
    notes: "Dept Head and HR endorsements complete. Awaiting Finance budget encumbrance.",
    total_amount: 128000,
    total_estimated_budget: 128000,
    target_date: "2026-10-28",
    winning_bid_id: null,
    supplier_id: null,
    supplier_name: null,
    po_id: null,
    po_no: null,
    department_approved_by: "Atty. Maria Santos",
    department_approved_at: "2026-09-16 10:00:00",
    finance_approved_by: null,
    finance_approved_at: null,
    approvals: [
      {
        role: "Dept Head",
        role_title: "Department Chairperson / Head",
        signatory_name: "Atty. Maria Santos",
        signatory_title: "Director, HRDO",
        signed_at: "2026-09-16 10:00:00",
        status: "approved",
        remarks: "Approved as part of the 2026 Institutional HR Capacity Building plan.",
      },
      {
        role: "HR",
        role_title: "HR & Training Development Director",
        signatory_name: "Atty. Maria Santos",
        signatory_title: "HR Director",
        signed_at: "2026-09-16 14:30:00",
        status: "approved",
        remarks: "Verified against HR Staff Development budget allocation.",
      },
      {
        role: "Finance",
        role_title: "Finance & Accounting Officer",
        signatory_name: null,
        signatory_title: "Finance Director / Comptroller",
        signed_at: null,
        status: "pending",
        remarks: "Awaiting final account code tag and budget encumbrance certificate.",
      },
      {
        role: "VP Acad / VPAsa",
        role_title: "VP Academic Affairs / VP Administration (VP Acad / VPAsa)",
        signatory_name: null,
        signatory_title: "VP for Administration & Student Affairs (VPASA)",
        signed_at: null,
        status: "pending",
        remarks: "Required prior to resource speaker contract signing.",
      },
    ],
    attachments: [
      {
        id: "att-pr-hr-02",
        name: "HR-Leadership-Program-Proposal.pdf",
        original_name: "sample-training-proposal.txt",
        url: "/uploads/sample-pr-budget-clearance.txt",
        size: 310000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-16 09:30:00",
        uploaded_by: "Atty. Maria Santos",
        stage: "Purchase Request",
        type: "memo",
        notes: "Executive proposal endorsed by President's Advisory Council.",
      },
    ],
    items: [
      {
        id: 601,
        item_name: "Executive Resource Speakers & Facilitators Honoraria (2 Days)",
        description: "Accredited leadership mentors from Civil Service Institute",
        quantity: 2,
        unit: "Consultants",
        estimated_unit_cost: 45000,
        total_estimated_cost: 90000,
      },
      {
        id: 602,
        item_name: "Assessment Tools, Psychometric Profiles & Workbooks",
        description: "360-Degree feedback assessment kits for 25 supervisors",
        quantity: 25,
        unit: "Kits",
        estimated_unit_cost: 1520,
        total_estimated_cost: 38000,
      },
    ],
    created_at: "2026-09-16 09:00:00",
    updated_at: "2026-09-16 14:30:00",
    pr_submitted_at: "2026-09-16 09:00:00",
    stage_entered_at: "2026-09-16 14:30:00",
  },
  {
    id: 9,
    pr_no: "PR-2026-0017",
    canvass_id: null,
    canvass_no: null,
    title: "Institutional Research Ethics & Data Privacy Compliance Bootcamp",
    department_id: 4,
    department_name: "College of Business Administration (CBA)",
    requested_by: "Dr. Arthur Tan",
    priority: "Medium",
    status: "Pending Dept Head",
    pr_type: "Services/OpEx (Budget Only)",
    sub_category: "HR & Training Services",
    is_bypassed_pmo: true,
    purpose: "Mandatory compliance workshop on Data Privacy Act of 2012 and Institutional Ethics Review for faculty researchers.",
    notes: "Newly submitted requisition. Awaiting Department Dean digital endorsement.",
    total_amount: 85000,
    total_estimated_budget: 85000,
    target_date: "2026-11-10",
    winning_bid_id: null,
    supplier_id: null,
    supplier_name: null,
    po_id: null,
    po_no: null,
    department_approved_by: null,
    department_approved_at: null,
    finance_approved_by: null,
    finance_approved_at: null,
    approvals: [
      {
        role: "Dept Head",
        role_title: "Department Chairperson / Head",
        signatory_name: null,
        signatory_title: "Dean, College of Business Administration",
        signed_at: null,
        status: "pending",
        remarks: "Requires CBA Dean signature.",
      },
      {
        role: "HR",
        role_title: "HR & Training Development Director",
        signatory_name: null,
        signatory_title: "Director, Human Resource Development Office",
        signed_at: null,
        status: "pending",
        remarks: "Pending previous stage completion.",
      },
      {
        role: "Finance",
        role_title: "Finance & Accounting Officer",
        signatory_name: null,
        signatory_title: "Finance Director / Comptroller",
        signed_at: null,
        status: "pending",
        remarks: "Pending previous stage completion.",
      },
      {
        role: "VP Acad / VPAsa",
        role_title: "VP Academic Affairs / VP Administration (VP Acad / VPAsa)",
        signatory_name: null,
        signatory_title: "VP for Academic Affairs / VP Administration & Student Affairs",
        signed_at: null,
        status: "pending",
        remarks: "Pending previous stage completion.",
      },
    ],
    attachments: [],
    items: [
      {
        id: 701,
        item_name: "Data Privacy & Ethics Compliance Training Modules",
        description: "National Privacy Commission certified trainer modules",
        quantity: 1,
        unit: "Lot",
        estimated_unit_cost: 85000,
        total_estimated_cost: 85000,
      },
    ],
    created_at: "2026-09-17 11:00:00",
    updated_at: "2026-09-17 11:00:00",
    pr_submitted_at: "2026-09-17 11:00:00",
    stage_entered_at: "2026-09-17 11:00:00",
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 1,
    po_no: "PO-2026-0046",
    canvass_id: 3,
    canvass_no: "RFQ-2026-0010",
    pr_id: 1,
    pr_no: "PR-2026-0009",
    department_id: 3,
    department_name: "College of Engineering and Technology (CET)",
    winning_bid_id: 204,
    supplier_id: 3,
    supplier_name: "Duka Mega Hardware & General Merchandise",
    supplier_email: "bids@dukamarketing.ph",
    supplier_phone: "(085) 341-2090",
    total_amount: 187600,
    payment_terms: "Progress Billing (50% Delivery, 50% Testing)",
    status: "Sent to Supplier",
    order_date: "2026-09-03",
    expected_delivery_date: "2026-09-20",
    received_date: null,
    warehouse_id: 1,
    warehouse_name: "PMO Central Depot (Main Campus)",
    notes: "Delivery and installation at CET Faculty Building. Coordinate with Engr. Villanueva.",
    approved_by: "Fr. President / VP Administration",
    approved_at: "2026-09-02 16:00:00",
    attachments: [
      {
        id: "att-po-01",
        name: "Official-Signed-PO-PO-2026-0046.pdf",
        original_name: "sample-pr-budget-clearance.txt",
        url: "/uploads/sample-pr-budget-clearance.txt",
        size: 210000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-03 09:30:00",
        uploaded_by: "PMO Procurement Officer",
        stage: "Purchase Order",
        type: "po",
        notes: "Signed and acknowledged by Duka Mega Hardware.",
      },
      {
        id: "att-po-02",
        name: "Carried-Over-Quotation-Duka.pdf",
        original_name: "sample-supplier-quotation.txt",
        url: "/uploads/sample-supplier-quotation.txt",
        size: 218000,
        mime_type: "application/pdf",
        uploaded_at: "2026-08-25 14:20:00",
        uploaded_by: "Engr. David Tan",
        stage: "Canvass",
        type: "quotation",
        notes: "Carried over from approved PR and Canvass.",
      },
    ],
    items: [
      {
        id: 301,
        product_id: 5,
        item_name: "Daikin Inverter Split Type Airconditioner 2.0HP",
        description: "Model: Daikin FTKQ50TVM with 10ft copper pipe kits",
        quantity: 4,
        received_quantity: 0,
        unit: "Units",
        unit_price: 46900,
        total_price: 187600,
      },
    ],
    created_at: "2026-09-02 11:20:00",
    updated_at: "2026-09-03 09:15:00",
    canvass_started_at: "2026-08-20 08:30:00",
    pr_submitted_at: "2026-08-26 09:00:00",
    finance_approved_at: "2026-09-01 14:00:00",
    po_dispatched_at: "2026-09-03 09:15:00",
    items_received_at: null,
    stage_entered_at: "2026-09-03 09:15:00",
  },
  {
    id: 2,
    po_no: "PO-2026-0045",
    canvass_id: null,
    canvass_no: null,
    pr_id: null,
    pr_no: null,
    winning_bid_id: null,
    supplier_id: 1,
    supplier_name: "Crown Paper & Office Supplies Corp.",
    supplier_email: "sales@crownpaper.ph",
    supplier_phone: "(085) 342-8812",
    department_id: 4,
    department_name: "Basic Education Department (BED)",
    total_amount: 108000,
    payment_terms: "Net 30 Days",
    status: "Fully Received",
    order_date: "2026-09-01",
    expected_delivery_date: "2026-09-10",
    received_date: "2026-09-10",
    warehouse_id: 1,
    warehouse_name: "PMO Central Depot (Main Campus)",
    notes: "Urgent copy paper delivery for preliminary exam syllabus printing.",
    approved_by: "PMO Director",
    approved_at: "2026-09-01 14:00:00",
    attachments: [
      {
        id: "att-po-03",
        name: "Delivery-Receipt-DR8821.pdf",
        original_name: "sample-delivery-receipt.txt",
        url: "/uploads/sample-delivery-receipt.txt",
        size: 165000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-10 15:30:00",
        uploaded_by: "Stockroom Custodian",
        stage: "Delivery",
        type: "receipt",
        notes: "Full receipt and warehouse stock-in acknowledgment verified.",
      },
    ],
    items: [
      {
        id: 302,
        product_id: 3,
        item_name: "Paper One Premium Copy Paper A4 80gsm (Box of 5 Reams)",
        description: "80 boxes delivered and inspected by PMO stockroom custodian",
        quantity: 80,
        received_quantity: 80,
        unit: "Boxes",
        unit_price: 1350,
        total_price: 108000,
      },
    ],
    created_at: "2026-09-01 10:00:00",
    updated_at: "2026-09-10 15:30:00",
    canvass_started_at: "2026-08-25 10:00:00",
    pr_submitted_at: "2026-08-28 14:00:00",
    finance_approved_at: "2026-09-01 14:00:00",
    po_dispatched_at: "2026-09-02 10:00:00",
    items_received_at: "2026-09-10 15:30:00",
    stage_entered_at: "2026-09-10 15:30:00",
  },
  {
    id: 3,
    po_no: "PO-2026-0047",
    canvass_id: null,
    canvass_no: null,
    pr_id: null,
    pr_no: null,
    winning_bid_id: null,
    supplier_id: 2,
    supplier_name: "Silicon Valley IT Solutions & Systems",
    supplier_email: "corporate@siliconvalleysystems.com",
    supplier_phone: "(085) 815-4490",
    department_id: 2,
    department_name: "College of Computer Studies (CCS)",
    total_amount: 94200,
    payment_terms: "Net 15 Days",
    status: "Draft",
    order_date: "2026-09-15",
    expected_delivery_date: "2026-09-29",
    received_date: null,
    warehouse_id: 3,
    warehouse_name: "Engineering & IT Lab Depot",
    notes: "Replacement switches and network rack cabinets for CS Server Room.",
    approved_by: null,
    approved_at: null,
    attachments: [
      {
        id: "att-po-04",
        name: "Technical-Specifications-Sheet.pdf",
        original_name: "sample-comparative-matrix.txt",
        url: "/uploads/sample-comparative-matrix.txt",
        size: 145000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-15 11:30:00",
        uploaded_by: "Property Officer",
        stage: "Purchase Order",
        type: "memo",
        notes: "Draft technical requirements.",
      },
    ],
    items: [
      {
        id: 303,
        product_id: 2,
        item_name: 'ViewSonic 24" IPS Full HD Ergonomic Monitor',
        quantity: 12,
        received_quantity: 0,
        unit: "Units",
        unit_price: 7850,
        total_price: 94200,
      },
    ],
    created_at: "2026-09-15 11:00:00",
    updated_at: "2026-09-15 11:00:00",
    canvass_started_at: "2026-09-05 09:00:00",
    pr_submitted_at: "2026-09-10 09:00:00",
    finance_approved_at: "2026-09-15 10:00:00",
    po_dispatched_at: null,
    items_received_at: null,
    stage_entered_at: "2026-09-17 09:00:00",
  },
  {
    id: 4,
    po_no: "PO-2026-0048",
    canvass_id: null,
    canvass_no: null,
    pr_id: null,
    pr_no: null,
    winning_bid_id: null,
    supplier_id: 4,
    supplier_name: "Agusan Tech Innovations & Electronics",
    supplier_email: "carlos@agusantech.com",
    supplier_phone: "0919-445-8833",
    department_id: 5,
    department_name: "Facilities & Physical Plant (FPP)",
    total_amount: 44100,
    payment_terms: "Net 30 Days",
    status: "Partially Received",
    order_date: "2026-09-04",
    expected_delivery_date: "2026-09-18",
    received_date: "2026-09-08",
    warehouse_id: 4,
    warehouse_name: "General Property Custodian",
    notes: "Batch 1 received (100 pcs). Remaining 80 pcs arriving next shipment.",
    approved_by: "PMO Custodian",
    approved_at: "2026-09-04 16:30:00",
    attachments: [
      {
        id: "att-po-05",
        name: "Partial-Delivery-Waybill.pdf",
        original_name: "sample-delivery-receipt.txt",
        url: "/uploads/sample-delivery-receipt.txt",
        size: 180000,
        mime_type: "application/pdf",
        uploaded_at: "2026-09-08 16:30:00",
        uploaded_by: "PMO Custodian",
        stage: "Delivery",
        type: "waybill",
        notes: "Waybill DR-4091 covering 100 of 180 units.",
      },
    ],
    items: [
      {
        id: 304,
        product_id: 6,
        item_name: "Philips Essential LED Tube T8 18W Daylight",
        quantity: 180,
        received_quantity: 100,
        unit: "Pieces",
        unit_price: 245,
        total_price: 44100,
      },
    ],
    created_at: "2026-09-04 14:00:00",
    updated_at: "2026-09-08 17:00:00",
    canvass_started_at: "2026-08-28 10:00:00",
    pr_submitted_at: "2026-09-01 11:00:00",
    finance_approved_at: "2026-09-04 16:30:00",
    po_dispatched_at: "2026-09-05 10:00:00",
    items_received_at: "2026-09-08 17:00:00",
    stage_entered_at: "2026-09-08 17:00:00",
  },
];

export const initialItemReleases: ItemRelease[] = [
  {
    id: 1,
    release_no: "REL-2026-0031",
    department_id: 2,
    department_name: "College of Computer Studies (CCS)",
    requested_by: "Prof. Alan Turing",
    item_name: "Paper One Premium Copy Paper A4 80gsm",
    quantity: 10,
    unit: "Boxes",
    warehouse_id: 1,
    warehouse_name: "PMO Central Depot (Main Campus)",
    purpose: "Midterm Examinations Printing",
    request_date: "2026-09-15",
    status: "Pending Dispatch",
    notes: "Approved by Dean Soriano",
  },
  {
    id: 2,
    release_no: "REL-2026-0032",
    department_id: 3,
    department_name: "College of Engineering and Technology (CET)",
    requested_by: "Engr. Clara Santos",
    item_name: 'ViewSonic 24" IPS Full HD Ergonomic Monitor',
    quantity: 2,
    unit: "Units",
    warehouse_id: 3,
    warehouse_name: "Engineering & IT Lab Depot",
    purpose: "Robotics Simulation Station",
    request_date: "2026-09-16",
    status: "Pending Dispatch",
    notes: "Urgent lab replacement",
  },
  {
    id: 3,
    release_no: "REL-2026-0033",
    department_id: 4,
    department_name: "Finance & Accounting Office",
    requested_by: "Ms. Elena Bautista",
    item_name: "HP LaserJet Toner Cartridge 85A Black",
    quantity: 2,
    unit: "Cartridges",
    warehouse_id: 1,
    warehouse_name: "PMO Central Depot (Main Campus)",
    purpose: "Quarterly Audit Report Generation",
    request_date: "2026-09-16",
    status: "Ready for Pickup",
    notes: "Custodian notified",
  },
  {
    id: 4,
    release_no: "REL-2026-0034",
    department_id: 1,
    department_name: "Physical Plant & Property Management Office (PMO)",
    requested_by: "Engr. Mark Villanueva",
    item_name: "Dell Latitude 3440 Laptop",
    quantity: 1,
    unit: "Units",
    warehouse_id: 3,
    warehouse_name: "Engineering & IT Lab Depot",
    purpose: "Field Inspection & Facility Auditing",
    request_date: "2026-09-17",
    status: "Pending Dispatch",
    notes: "Assigned to Asset Inspector",
  },
];

// ==================== DATABASE SINGLETON & REPOSITORIES ====================

export class MockDatabaseStore {
  public canvasses: Canvass[] = [];
  public purchaseRequests: PurchaseRequest[] = [];
  public purchaseOrders: PurchaseOrder[] = [];
  public inventory: InventoryItem[] = [];
  public suppliers: Supplier[] = [];
  public warehouses: Warehouse[] = [];
  public departments: Department[] = [];
  public itemReleases: ItemRelease[] = [];
  public rolePermissions: Record<number, ModulePermission[]> = {};

  private readonly STORAGE_KEY = "fsuu_pmo_mock_store_v2";

  constructor() {
    this.reset();
    this.loadFromStorage();
  }

  public saveToStorage() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const payload = {
          canvasses: this.canvasses,
          purchaseRequests: this.purchaseRequests,
          purchaseOrders: this.purchaseOrders,
          inventory: this.inventory,
          suppliers: this.suppliers,
          warehouses: this.warehouses,
          departments: this.departments,
          itemReleases: this.itemReleases,
          rolePermissions: this.rolePermissions,
        };
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn("Failed to save mock database to localStorage:", e);
      }
    }
  }

  public loadFromStorage(): boolean {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.canvasses) && parsed.canvasses.length > 0) this.canvasses = parsed.canvasses;
          if (Array.isArray(parsed.purchaseRequests) && parsed.purchaseRequests.length > 0) this.purchaseRequests = parsed.purchaseRequests;
          if (Array.isArray(parsed.purchaseOrders) && parsed.purchaseOrders.length > 0) this.purchaseOrders = parsed.purchaseOrders;
          if (Array.isArray(parsed.inventory) && parsed.inventory.length > 0) this.inventory = parsed.inventory;
          if (Array.isArray(parsed.suppliers) && parsed.suppliers.length > 0) this.suppliers = parsed.suppliers;
          if (Array.isArray(parsed.warehouses) && parsed.warehouses.length > 0) this.warehouses = parsed.warehouses;
          if (Array.isArray(parsed.departments) && parsed.departments.length > 0) this.departments = parsed.departments;
          if (Array.isArray(parsed.itemReleases) && parsed.itemReleases.length > 0) this.itemReleases = parsed.itemReleases;
          if (parsed.rolePermissions) this.rolePermissions = parsed.rolePermissions;
          return true;
        }
      } catch (e) {
        console.warn("Failed to load mock database from localStorage:", e);
      }
    }
    return false;
  }

  public clearStorage() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {
        console.warn("Failed to clear mock storage:", e);
      }
    }
  }

  public reset() {
    this.canvasses = JSON.parse(JSON.stringify(initialCanvasses));
    this.purchaseRequests = JSON.parse(JSON.stringify(initialPurchaseRequests));
    this.purchaseOrders = JSON.parse(JSON.stringify(initialPurchaseOrders));
    this.inventory = JSON.parse(JSON.stringify(initialInventory));
    this.suppliers = JSON.parse(JSON.stringify(initialSuppliers));
    this.warehouses = JSON.parse(JSON.stringify(initialWarehouses));
    this.departments = JSON.parse(JSON.stringify(initialDepartments));
    this.itemReleases = JSON.parse(JSON.stringify(initialItemReleases));
    this.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  }

  // --- TRAIL UTILITIES FOR AUDIT TRACKING ---
  public initializeTrailIfEmpty(item: any, type: "canvass" | "pr" | "po"): RequestTrailEntry[] {
    if (Array.isArray(item.trail) && item.trail.length > 0) {
      return item.trail;
    }
    const trail: RequestTrailEntry[] = [];
    const createdDate = item.created_at || "2026-09-01 08:30:00";
    const user = item.requested_by || "Procurement Staff";

    if (type === "canvass") {
      trail.push({
        id: `tr-canv-${item.id}-1`,
        timestamp: createdDate,
        action: "RFQ Created & Initiated",
        from_status: "Initial",
        to_status: "Pending Canvass",
        performed_by: user,
        role: "Requesting Department / PMO",
        remarks: `Canvass RFQ ${item.canvass_no} registered with ${item.items?.length || 0} line items.`,
      });
      if (item.canvass_started_at) {
        trail.push({
          id: `tr-canv-${item.id}-2`,
          timestamp: item.canvass_started_at,
          action: "Published for Quotation",
          from_status: "Pending Canvass",
          to_status: "Seeking Bids",
          performed_by: "PMO Canvassing Officer",
          role: "Procurement Committee",
          remarks: "Sent RFQ forms to accredited supplier candidates.",
        });
      }
      if (item.supplier_bids && item.supplier_bids.length > 0) {
        trail.push({
          id: `tr-canv-${item.id}-3`,
          timestamp: item.supplier_bids[0].submitted_at || item.canvass_started_at || createdDate,
          action: "Supplier Quotations Received",
          from_status: "Seeking Bids",
          to_status: "Under Review",
          performed_by: "Accredited Suppliers",
          role: "Vendor Quotations",
          remarks: `Recorded ${item.supplier_bids.length} sealed quotation(s) for bid matrix evaluation.`,
        });
      }
      if (item.winning_bid_id) {
        trail.push({
          id: `tr-canv-${item.id}-4`,
          timestamp: item.pr_submitted_at || item.updated_at || "2026-09-14 15:00:00",
          action: "Winning Bid Selected",
          from_status: "Under Review",
          to_status: "Winning Bid Selected",
          performed_by: "BAC Committee",
          role: "Bids & Awards Committee",
          remarks: `Selected winning quotation. Submitted to Finance Gatekeeper for budget allocation check.`,
        });
      }
    } else if (type === "pr") {
      trail.push({
        id: `tr-pr-${item.id}-1`,
        timestamp: createdDate,
        action: "Purchase Request Drafted",
        from_status: "Initial",
        to_status: "Draft PR",
        performed_by: user,
        role: "Department End-User",
        remarks: `Purchase Request ${item.pr_no} drafted with estimated value ₱${(item.total_amount || 0).toLocaleString()}.`,
      });
      if (item.department_approved_at || item.pr_submitted_at) {
        trail.push({
          id: `tr-pr-${item.id}-2`,
          timestamp: item.department_approved_at || item.pr_submitted_at || createdDate,
          action: "Department Endorsement",
          from_status: "Draft PR",
          to_status: "Budget Review",
          performed_by: item.department_approved_by || user,
          role: "Department Head / Dean",
          remarks: "Department approved request and forwarded to Finance Affairs Office.",
        });
      }
      if (item.finance_approved_at || item.status === "Approved PR") {
        trail.push({
          id: `tr-pr-${item.id}-3`,
          timestamp: item.finance_approved_at || item.updated_at || createdDate,
          action: "Finance Budget Clearance",
          from_status: "Budget Review",
          to_status: "Approved PR",
          performed_by: item.finance_approved_by || "Finance Affairs Office",
          role: "Finance Director",
          remarks: `Certified budget availability. Approved for Purchase Order generation.${item.po_no ? ` Generated ${item.po_no}.` : ""}`,
        });
      }
    } else if (type === "po") {
      trail.push({
        id: `tr-po-${item.id}-1`,
        timestamp: item.order_date || createdDate,
        action: "Purchase Order Issued",
        from_status: "Initial",
        to_status: "Pending Approval",
        performed_by: item.approved_by || "VP Administration / PMO",
        role: "Purchasing Officer",
        remarks: `Purchase Order ${item.po_no} issued to ${item.supplier_name}. Total: ₱${(item.total_amount || 0).toLocaleString()}.`,
      });
      if (item.po_dispatched_at || item.status === "Ordered" || item.status === "In Transit") {
        trail.push({
          id: `tr-po-${item.id}-2`,
          timestamp: item.po_dispatched_at || item.updated_at || createdDate,
          action: "PO Dispatched to Supplier",
          from_status: "Pending Approval",
          to_status: item.status === "In Transit" ? "In Transit" : "Ordered",
          performed_by: "PMO Dispatch Desk",
          role: "Purchasing Officer",
          remarks: `Official purchase order sent to supplier ${item.supplier_name}.`,
        });
      }
      if (item.items_received_at || item.status === "Order Received" || item.status === "Fully Received") {
        trail.push({
          id: `tr-po-${item.id}-3`,
          timestamp: item.items_received_at || item.received_date || item.updated_at || createdDate,
          action: "Delivery Inspected & Stocked",
          from_status: "In Transit",
          to_status: item.status,
          performed_by: "Property Custodian / Warehouse Receiving",
          role: "Warehouse Staff",
          remarks: `Shipment received and verified at ${item.warehouse_name}. Warehouse inventory quantities incremented.`,
        });
      }
    }

    const last = trail[trail.length - 1];
    if (last && last.to_status !== item.status) {
      trail.push({
        id: `tr-${item.id}-sync`,
        timestamp: item.updated_at || new Date().toISOString().replace("T", " ").slice(0, 19),
        action: "Stage Synchronized",
        from_status: last.to_status,
        to_status: item.status,
        performed_by: "Procurement System",
        role: "Audit Engine",
        remarks: `Current status synchronized to "${item.status}".`,
      });
    }

    item.trail = trail;
    return trail;
  }

  // --- CANVASSING METHODS ---
  public getCanvasses(): Canvass[] {
    return this.canvasses.map((c) => {
      this.initializeTrailIfEmpty(c, "canvass");
      const dept = this.departments.find((d) => d.id === c.department_id);
      return {
        ...c,
        department_name: dept ? dept.name : (c.department_name || `Department #${c.department_id}`),
      };
    });
  }

  public getCanvassById(id: number): Canvass | undefined {
    const canv = this.canvasses.find((c) => c.id === id);
    if (!canv) return undefined;
    this.initializeTrailIfEmpty(canv, "canvass");
    const dept = this.departments.find((d) => d.id === canv.department_id);
    if (dept) {
      canv.department_name = dept.name;
    }
    return canv;
  }

  public createCanvass(data: Partial<Canvass>): Canvass {
    const nextId = this.canvasses.length > 0 ? Math.max(...this.canvasses.map((c) => c.id)) + 1 : 1;
    const canvassNo = `RFQ-2026-00${nextId > 9 ? nextId : `0${nextId}`}`;
    const items: CanvassItem[] = (data.items || []).map((item, idx) => ({
      id: 1000 + nextId * 10 + idx,
      item_name: item.item_name || "Item",
      description: item.description || "",
      quantity: Number(item.quantity) || 1,
      unit: item.unit || "Units",
      estimated_unit_cost: Number(item.estimated_unit_cost) || 0,
      total_estimated_cost: (Number(item.quantity) || 1) * (Number(item.estimated_unit_cost) || 0),
    }));

    const totalBudget = items.reduce((sum, item) => sum + item.total_estimated_cost, 0);
    const deptId = Number(data.department_id) || 1;
    const foundDept = this.departments.find((d) => d.id === deptId);
    const departmentName = foundDept ? foundDept.name : (data.department_name || "Physical Plant & Property Management Office (PMO)");

    const newCanvass: Canvass = {
      id: nextId,
      canvass_no: canvassNo,
      title: data.title || "New Canvass Request",
      rfq_date: data.rfq_date || new Date().toISOString().slice(0, 10),
      deadline: data.deadline || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      department_id: deptId,
      department_name: departmentName,
      requested_by: data.requested_by || "PMO Requestor",
      priority: data.priority || "Medium",
      status: data.status || "Pending Canvass",
      notes: data.notes || "",
      justification: data.justification || data.notes || "",
      items,
      supplier_bids: [],
      winning_bid_id: null,
      po_id: null,
      pr_id: data.pr_id || null,
      pr_no: data.pr_no || null,
      attachments: data.attachments || [],
      total_estimated_budget: totalBudget,
      created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      canvass_started_at: (data.status === "Seeking Bids" || data.status === "Under Review") ? new Date().toISOString().replace("T", " ").slice(0, 19) : (data.canvass_started_at || null),
      pr_submitted_at: data.pr_submitted_at || null,
      finance_approved_at: data.finance_approved_at || null,
      po_dispatched_at: data.po_dispatched_at || null,
      items_received_at: data.items_received_at || null,
      stage_entered_at: data.stage_entered_at || new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    this.canvasses.unshift(newCanvass);
    return newCanvass;
  }

  public updateCanvass(id: number, updates: Partial<Canvass>): Canvass | null {
    const index = this.canvasses.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const current = this.canvasses[index];
    const updated: Canvass = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    if (updates.status && updates.status !== current.status) {
      updated.stage_entered_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    }

    if (updates.items) {
      updated.total_estimated_budget = updated.items.reduce(
        (sum, item) => sum + (Number(item.total_estimated_cost) || (Number(item.quantity) * Number(item.estimated_unit_cost))),
        0
      );
    }

    this.canvasses[index] = updated;
    return updated;
  }

  public updateCanvassStatus(
    id: number,
    newStatus: CanvassStatus,
    remarks?: string,
    performedBy?: string,
    role?: string
  ): Canvass | null {
    const canvass = this.getCanvassById(id);
    if (!canvass) return null;

    const oldStatus = canvass.status;
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    canvass.status = newStatus;
    canvass.updated_at = nowStr;
    canvass.stage_entered_at = nowStr;

    // Record audit trail entry
    this.initializeTrailIfEmpty(canvass, "canvass");
    canvass.trail = canvass.trail || [];
    canvass.trail.push({
      id: `tr-canv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowStr,
      action: "Stage Transition",
      from_status: oldStatus,
      to_status: newStatus,
      performed_by: performedBy || "PMO / Canvassing Officer",
      role: role || "Procurement Committee",
      remarks: remarks || `Moved stage from "${oldStatus}" to "${newStatus}"`,
    });

    // Stamp stage-transition timestamps
    if (newStatus === "Canvassing / Bidding" || newStatus === "Seeking Bids" || newStatus === "Bidding" || newStatus === "Under Review" || newStatus === "In Progress") {
      canvass.canvass_started_at = canvass.canvass_started_at || nowStr;
    }
    if (newStatus === "Purchase Order Issued" || newStatus === "Winning Bid Selected" || newStatus === "Approved") {
      canvass.canvass_started_at = canvass.canvass_started_at || canvass.created_at;
      canvass.pr_submitted_at = canvass.pr_submitted_at || nowStr;
    }

    // AUTOMATION: When Canvass is moved to Approved, Winning Bid Selected, or Purchase Order Issued, auto-create a Purchase Request (PR) and carry over attached evidence
    if ((newStatus === "Approved" || newStatus === "Winning Bid Selected" || newStatus === "Purchase Order Issued") && !canvass.pr_id) {
      const winningBid = canvass.supplier_bids.find((b) => b.id === canvass.winning_bid_id) || canvass.supplier_bids[0];
      const prItems: PurchaseRequestItem[] = canvass.items.map((item, idx) => {
        const bidItem = winningBid?.item_bids?.find((b) => b.item_id === item.id);
        const unitPrice = bidItem ? bidItem.unit_price : item.estimated_unit_cost;
        return {
          id: 2000 + canvass.id * 10 + idx,
          item_name: item.item_name,
          description: item.description || (bidItem?.brand_model ? `Brand: ${bidItem.brand_model}` : ""),
          quantity: item.quantity,
          unit: item.unit,
          estimated_unit_cost: unitPrice,
          total_estimated_cost: unitPrice * item.quantity,
        };
      });

      const carriedAttachments: EvidenceAttachment[] = (canvass.attachments || []).map((att) => ({
        ...att,
        id: `pr-att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        stage: "Canvass",
        notes: (att.notes ? `${att.notes} | ` : "") + `Carried over from Canvass ${canvass.canvass_no}`,
      }));

      const newPR = this.createPurchaseRequest({
        canvass_id: canvass.id,
        canvass_no: canvass.canvass_no,
        title: canvass.title,
        department_id: canvass.department_id,
        department_name: canvass.department_name,
        requested_by: canvass.requested_by,
        priority: canvass.priority,
        status: "Pending Department Approval",
        total_amount: winningBid ? winningBid.bid_amount : canvass.total_estimated_budget,
        winning_bid_id: winningBid ? winningBid.id : null,
        supplier_id: winningBid ? winningBid.supplier_id : null,
        supplier_name: winningBid ? winningBid.supplier_name : null,
        items: prItems,
        notes: `Auto-generated from Approved Canvass ${canvass.canvass_no}: ${canvass.title}.`,
        attachments: carriedAttachments,
        canvass_started_at: canvass.canvass_started_at || canvass.created_at,
        pr_submitted_at: nowStr,
        stage_entered_at: nowStr,
      });

      canvass.pr_id = newPR.id;
      canvass.pr_no = newPR.pr_no;
    }

    const idx = this.canvasses.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.canvasses[idx] = canvass;
    }
    this.saveToStorage();

    return canvass;
  }

  public deleteCanvass(id: number): boolean {
    const index = this.canvasses.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.canvasses.splice(index, 1);
    return true;
  }

  public deleteSupplierBid(canvassId: number, bidId: number): boolean {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return false;
    const bidIndex = canvass.supplier_bids.findIndex((b) => b.id === bidId);
    if (bidIndex === -1) return false;
    canvass.supplier_bids.splice(bidIndex, 1);
    if (canvass.winning_bid_id === bidId) {
      canvass.winning_bid_id = null;
      if (canvass.status === "Approved") {
        canvass.status = "Under Review";
      }
    }
    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    return true;
  }

  public addSupplierBid(canvassId: number, bidData: Partial<SupplierBid>): SupplierBid | null {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return null;

    const nextBidId = Date.now() + Math.floor(Math.random() * 1000);
    const supplier = this.suppliers.find((s) => s.id === Number(bidData.supplier_id));

    const itemBids: SupplierBidItem[] = (bidData.item_bids || canvass.items.map((item) => ({
      item_id: item.id,
      item_name: item.item_name,
      unit_price: Number(item.estimated_unit_cost),
      total_price: Number(item.estimated_unit_cost) * item.quantity,
      brand_model: "Standard Specification",
      notes: "",
    })));

    const calculatedTotal = itemBids.reduce((sum, item) => sum + Number(item.total_price), 0);

    const newBid: SupplierBid = {
      id: nextBidId,
      canvass_id: canvassId,
      supplier_id: Number(bidData.supplier_id) || (supplier ? supplier.id : 1),
      supplier_name: bidData.supplier_name || (supplier ? supplier.name : "Registered Supplier"),
      contact_person: bidData.contact_person || (supplier ? supplier.contact_person : "Agent"),
      email: bidData.email || (supplier ? supplier.email : "supplier@test.com"),
      phone: bidData.phone || (supplier ? supplier.phone : "0917-000-0000"),
      bid_amount: Number(bidData.bid_amount) || calculatedTotal,
      payment_terms: bidData.payment_terms || (supplier ? supplier.terms : "Net 30 Days"),
      delivery_lead_time_days: Number(bidData.delivery_lead_time_days) || 7,
      delivery_date: bidData.delivery_date || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: "pending",
      remarks: bidData.remarks || "Formal quotation submitted.",
      item_bids: itemBids,
      submitted_at: new Date().toISOString().slice(0, 10),
    };

    canvass.supplier_bids.push(newBid);
    if (canvass.status === "Draft") {
      canvass.status = "Seeking Bids";
    }
    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    return newBid;
  }

  /**
   * Approves a winning bid, transitions Canvass to Approved,
   * rejects alternative bids, and automatically creates a linked Purchase Request with carried-over evidence.
   */
  public approveBidAndCreatePR(canvassId: number, bidId: number): { canvass: Canvass; purchaseRequest: PurchaseRequest } | null {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return null;

    const winningBid = canvass.supplier_bids.find((b) => b.id === bidId);
    if (!winningBid) return null;

    canvass.supplier_bids.forEach((bid) => {
      bid.status = bid.id === bidId ? "approved" : "rejected";
    });

    canvass.winning_bid_id = bidId;
    canvass.status = "Approved";

    const prItems: PurchaseRequestItem[] = canvass.items.map((item, idx) => {
      const bidItem = winningBid.item_bids.find((b) => b.item_id === item.id);
      const unitPrice = bidItem ? bidItem.unit_price : item.estimated_unit_cost;
      return {
        id: 2000 + canvass.id * 10 + idx,
        item_name: item.item_name,
        description: item.description || (bidItem?.brand_model ? `Brand: ${bidItem.brand_model}` : ""),
        quantity: item.quantity,
        unit: item.unit,
        estimated_unit_cost: unitPrice,
        total_estimated_cost: unitPrice * item.quantity,
      };
    });

    const carriedAttachments: EvidenceAttachment[] = (canvass.attachments || []).map((att) => ({
      ...att,
      id: `pr-att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: "Canvass",
      notes: (att.notes ? `${att.notes} | ` : "") + `Carried over from Canvass ${canvass.canvass_no}`,
    }));

    const newPR = this.createPurchaseRequest({
      canvass_id: canvass.id,
      canvass_no: canvass.canvass_no,
      title: canvass.title,
      department_id: canvass.department_id,
      department_name: canvass.department_name,
      requested_by: canvass.requested_by,
      priority: canvass.priority,
      status: "Pending Department Approval",
      total_amount: winningBid.bid_amount,
      winning_bid_id: winningBid.id,
      supplier_id: winningBid.supplier_id,
      supplier_name: winningBid.supplier_name,
      items: prItems,
      notes: `Generated from Approved Canvass ${canvass.canvass_no} with winning supplier ${winningBid.supplier_name}.`,
      attachments: carriedAttachments,
    });

    canvass.pr_id = newPR.id;
    canvass.pr_no = newPR.pr_no;
    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);

    return { canvass, purchaseRequest: newPR };
  }

  /**
   * Approves a winning bid and generates linked Purchase Order directly.
   */
  public approveBidAndCreatePO(canvassId: number, bidId: number, targetWarehouseId: number = 1): { canvass: Canvass; purchaseOrder: PurchaseOrder } | null {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return null;

    const winningBid = canvass.supplier_bids.find((b) => b.id === bidId);
    if (!winningBid) return null;

    canvass.supplier_bids.forEach((bid) => {
      bid.status = bid.id === bidId ? "approved" : "rejected";
    });

    canvass.winning_bid_id = bidId;
    canvass.status = "Approved";

    const warehouse = this.warehouses.find((w) => w.id === targetWarehouseId) || this.warehouses[0];
    const poItems: PurchaseOrderItem[] = canvass.items.map((item, idx) => {
      const bidItem = winningBid.item_bids.find((b) => b.item_id === item.id);
      const unitPrice = bidItem ? bidItem.unit_price : item.estimated_unit_cost;
      return {
        id: Date.now() + idx,
        item_name: item.item_name,
        description: item.description || (bidItem?.brand_model ? `Brand: ${bidItem.brand_model}` : ""),
        quantity: item.quantity,
        received_quantity: 0,
        unit: item.unit,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
      };
    });

    const carriedAttachments: EvidenceAttachment[] = (canvass.attachments || []).map((att) => ({
      ...att,
      id: `po-att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      notes: (att.notes ? `${att.notes} | ` : "") + `Carried over from Canvass ${canvass.canvass_no}`,
    }));

    const newPO = this.createPurchaseOrder({
      canvass_id: canvass.id,
      canvass_no: canvass.canvass_no,
      winning_bid_id: winningBid.id,
      supplier_id: winningBid.supplier_id,
      supplier_name: winningBid.supplier_name,
      supplier_email: winningBid.email,
      supplier_phone: winningBid.phone,
      total_amount: winningBid.bid_amount,
      payment_terms: winningBid.payment_terms,
      status: "Draft",
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.warehouse_name,
      expected_delivery_date: winningBid.delivery_date,
      items: poItems,
      notes: `Generated from Approved Canvass ${canvass.canvass_no}: ${canvass.title}. Winning bidder: ${winningBid.supplier_name}.`,
      attachments: carriedAttachments,
    });

    canvass.po_id = newPO.id;
    canvass.po_no = newPO.po_no;
    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);

    return { canvass, purchaseOrder: newPO };
  }

  /**
   * Selects a winning bid in the Canvassing Kanban, transitioning Canvass to 'Winning Bid Selected'
   * and automatically submitting it to Finance Budget Gatekeeper Review.
   */
  public selectWinningBid(canvassId: number, bidId: number) {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return null;

    const winningBid = canvass.supplier_bids.find((b) => b.id === bidId);
    if (!winningBid) return null;

    canvass.supplier_bids.forEach((bid) => {
      bid.status = bid.id === bidId ? "approved" : "rejected";
    });

    canvass.winning_bid_id = bidId;
    canvass.winning_bid_amount = winningBid.bid_amount;
    canvass.status = "Winning Bid Selected";

    // Re-evaluate department budget
    const dept = this.departments.find((d) => d.id === canvass.department_id);
    const remainingBalance = dept ? dept.remaining_balance : 0;
    const isOverBudget = winningBid.bid_amount > remainingBalance;

    canvass.finance_status = isOverBudget
      ? "Over Budget (Needs Revision)"
      : "Pending Finance Review";

    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);

    return {
      canvass,
      winningBid,
      isOverBudget,
      remainingBalance,
      variance: remainingBalance - winningBid.bid_amount,
      department: dept,
    };
  }

  // --- FINANCE REVIEW & BUDGET GATEKEEPER METHODS ---

  public getFinanceReviews() {
    return this.canvasses
      .filter(
        (c) =>
          c.status === "Winning Bid Selected" ||
          c.status === "Approved" ||
          c.status === "Under Review" ||
          !!c.finance_status ||
          !!c.winning_bid_id
      )
      .map((c) => {
        const dept = this.getDepartmentById(c.department_id);
        const winningBid = c.winning_bid_id
          ? c.supplier_bids.find((b) => b.id === c.winning_bid_id)
          : (c.supplier_bids.length > 0 ? c.supplier_bids[0] : null);
        const winningBidTotal = winningBid ? winningBid.bid_amount : c.total_estimated_budget;
        const remainingBalance = dept ? dept.remaining_balance : 0;
        const isOverBudget = winningBidTotal > remainingBalance;
        const variance = remainingBalance - winningBidTotal;

        let financeStatus = c.finance_status;
        if (!financeStatus) {
          financeStatus = isOverBudget ? "Over Budget (Needs Revision)" : "Pending Finance Review";
          c.finance_status = financeStatus;
        }

        return {
          ...c,
          finance_status: financeStatus,
          department_allocated_amount: dept?.allocated_amount || 0,
          department_utilized_amount: dept?.utilized_amount || 0,
          department_remaining_balance: remainingBalance,
          winning_bid: winningBid || null,
          winning_bid_total: winningBidTotal,
          is_over_budget: isOverBudget,
          variance,
        };
      });
  }

  public approveFinanceAndCreatePO(
    canvassId: number,
    targetWarehouseId: number = 1,
    remarks?: string,
    performedBy?: string,
    role?: string
  ): { success: boolean; isOverBudget?: boolean; message?: string; canvass?: Canvass; purchaseOrder?: PurchaseOrder } {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) {
      return { success: false, message: `Canvass #${canvassId} not found` };
    }

    const dept = this.getDepartmentById(canvass.department_id);
    const winningBid = canvass.winning_bid_id
      ? canvass.supplier_bids.find((b) => b.id === canvass.winning_bid_id)
      : (canvass.supplier_bids.length > 0 ? canvass.supplier_bids[0] : null);

    const totalAmount = winningBid ? winningBid.bid_amount : canvass.total_estimated_budget;
    const remainingBalance = dept ? dept.remaining_balance : 0;

    // Strict validation against Department remaining balance
    if (totalAmount > remainingBalance) {
      canvass.finance_status = "Over Budget (Needs Revision)";
      canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      const excess = totalAmount - remainingBalance;
      return {
        success: false,
        isOverBudget: true,
        message: `Request total (₱${totalAmount.toLocaleString()}) exceeds department's remaining balance (₱${remainingBalance.toLocaleString()}) by ₱${excess.toLocaleString()}. Line items must be adjusted before approval.`,
        canvass,
      };
    }

    // Within budget: Approve and create PO
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    canvass.finance_status = "Finance Approved";
    canvass.status = "Winning Bid Selected";
    canvass.updated_at = nowStr;
    canvass.stage_entered_at = nowStr;
    canvass.finance_approved_at = nowStr;

    // Encumber funds from department's budget
    if (dept) {
      dept.encumbered_amount = (dept.encumbered_amount || 0) + totalAmount;
      dept.remaining_balance = Math.max(0, dept.allocated_amount - (dept.utilized_amount || 0) - dept.encumbered_amount);
      dept.budget_remaining = dept.remaining_balance;
      dept.budget_encumbered = dept.encumbered_amount;
    }

    if (winningBid) {
      winningBid.status = "approved";
      canvass.winning_bid_id = winningBid.id;
      canvass.winning_bid_amount = winningBid.bid_amount;
    }

    const warehouse = this.warehouses.find((w) => w.id === targetWarehouseId) || this.warehouses[0];
    const poItems: PurchaseOrderItem[] = canvass.items.map((item, idx) => {
      const bidItem = winningBid?.item_bids?.find((b) => b.item_id === item.id || b.item_name === item.item_name);
      const unitPrice = bidItem ? bidItem.unit_price : item.estimated_unit_cost;
      return {
        id: Date.now() + idx,
        item_name: item.item_name,
        description: item.description || (bidItem?.brand_model ? `Brand: ${bidItem.brand_model}` : ""),
        quantity: item.quantity,
        received_quantity: 0,
        unit: item.unit,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
      };
    });

    const carriedAttachments: EvidenceAttachment[] = (canvass.attachments || []).map((att) => ({
      ...att,
      id: `po-att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: "Purchase Order",
      notes: (att.notes ? `${att.notes} | ` : "") + `Carried over from Canvass ${canvass.canvass_no}`,
    }));

    const newPO = this.createPurchaseOrder({
      canvass_id: canvass.id,
      canvass_no: canvass.canvass_no,
      department_id: canvass.department_id,
      department_name: canvass.department_name,
      winning_bid_id: winningBid ? winningBid.id : null,
      supplier_id: winningBid ? winningBid.supplier_id : 1,
      supplier_name: winningBid ? winningBid.supplier_name : "Selected Supplier",
      supplier_email: winningBid ? winningBid.email : "supplier@test.com",
      supplier_phone: winningBid ? winningBid.phone : "N/A",
      total_amount: totalAmount,
      payment_terms: winningBid ? winningBid.payment_terms : "Net 30 Days",
      status: "Draft",
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.warehouse_name,
      expected_delivery_date: winningBid?.delivery_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      items: poItems,
      notes: `Generated from Finance-Approved Canvass ${canvass.canvass_no}: ${canvass.title}. Encumbered funds: ₱${totalAmount.toLocaleString()}.`,
      attachments: carriedAttachments,
      canvass_started_at: canvass.canvass_started_at || canvass.created_at,
      pr_submitted_at: canvass.pr_submitted_at || nowStr,
      finance_approved_at: nowStr,
      stage_entered_at: nowStr,
    });

    canvass.po_id = newPO.id;
    canvass.po_no = newPO.po_no;

    // Record audit trail entry for Canvass
    this.initializeTrailIfEmpty(canvass, "canvass");
    canvass.trail = canvass.trail || [];
    canvass.trail.push({
      id: `tr-fin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowStr,
      action: "Finance Budget Clearance & PO Generation",
      from_status: "Pending Finance Review",
      to_status: "Finance Approved",
      performed_by: performedBy || "Finance Affairs Office",
      role: role || "Finance Director",
      remarks: remarks || `Budget certified. Purchase Order ${newPO.po_no} generated for delivery to ${warehouse.warehouse_name}.`,
    });

    // Update matching PR if exists
    const matchingPr = canvass.pr_id
      ? this.getPurchaseRequestById(canvass.pr_id)
      : this.purchaseRequests.find((p) => p.canvass_id === canvass.id || p.canvass_no === canvass.canvass_no);
    if (matchingPr) {
      matchingPr.status = "Approved PR";
      matchingPr.po_id = newPO.id;
      matchingPr.po_no = newPO.po_no;
      matchingPr.finance_approved_by = "Finance Office Gatekeeper";
      matchingPr.finance_approved_at = nowStr;
      matchingPr.stage_entered_at = nowStr;
      this.initializeTrailIfEmpty(matchingPr, "pr");
      matchingPr.trail = matchingPr.trail || [];
      matchingPr.trail.push({
        id: `tr-pr-fin-${Date.now()}`,
        timestamp: nowStr,
        action: "Finance Approval",
        from_status: "Budget Review",
        to_status: "Approved PR",
        performed_by: performedBy || "Finance Affairs Office",
        role: role || "Finance Director",
        remarks: `Finance approved budget. Linked to PO ${newPO.po_no}.`,
      });
    }

    return {
      success: true,
      canvass,
      purchaseOrder: newPO,
    };
  }

  public updateFinanceStatus(
    canvassId: number,
    newStatus: FinanceStatus,
    targetWarehouseId: number = 1,
    remarks?: string,
    performedBy?: string,
    role?: string
  ) {
    if (newStatus === "Finance Approved") {
      return this.approveFinanceAndCreatePO(canvassId, targetWarehouseId, remarks, performedBy, role);
    }
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return { success: false, message: "Canvass not found" };

    const oldStatus = canvass.finance_status || "Pending Finance Review";
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    canvass.finance_status = newStatus;
    canvass.updated_at = nowStr;

    this.initializeTrailIfEmpty(canvass, "canvass");
    canvass.trail = canvass.trail || [];
    canvass.trail.push({
      id: `tr-fin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowStr,
      action: "Finance Status Change",
      from_status: oldStatus,
      to_status: newStatus,
      performed_by: performedBy || "Finance Affairs Office",
      role: role || "Finance Officer",
      remarks: remarks || `Finance review status updated from "${oldStatus}" to "${newStatus}"`,
    });

    return { success: true, canvass };
  }

  public updateCanvassItem(
    canvassId: number,
    itemId: number,
    updates: Partial<CanvassItem>
  ): { canvass: Canvass; item: CanvassItem } | null {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return null;

    const item = canvass.items.find((it) => it.id === itemId);
    if (!item) return null;

    if (updates.quantity !== undefined) item.quantity = Number(updates.quantity);
    if (updates.item_name !== undefined) item.item_name = updates.item_name;
    if (updates.description !== undefined) item.description = updates.description;
    if (updates.unit !== undefined) item.unit = updates.unit;
    if (updates.estimated_unit_cost !== undefined) item.estimated_unit_cost = Number(updates.estimated_unit_cost);

    item.total_estimated_cost = item.quantity * item.estimated_unit_cost;

    // Recalculate canvass total budget
    canvass.total_estimated_budget = canvass.items.reduce((sum, it) => sum + it.total_estimated_cost, 0);

    // Update corresponding item bids in all supplier bids
    canvass.supplier_bids.forEach((bid) => {
      const bItem = bid.item_bids?.find((bi) => bi.item_id === itemId || bi.item_name === item.item_name);
      if (bItem) {
        bItem.total_price = bItem.unit_price * item.quantity;
      }
      bid.bid_amount = bid.item_bids && bid.item_bids.length > 0
        ? bid.item_bids.reduce((sum, bi) => sum + bi.total_price, 0)
        : canvass.total_estimated_budget;
    });

    if (canvass.winning_bid_id) {
      const winBid = canvass.supplier_bids.find((b) => b.id === canvass.winning_bid_id);
      if (winBid) canvass.winning_bid_amount = winBid.bid_amount;
    }

    // Recheck budget against department remaining balance
    const dept = this.getDepartmentById(canvass.department_id);
    const effectiveTotal = canvass.winning_bid_amount || (canvass.supplier_bids[0]?.bid_amount) || canvass.total_estimated_budget;
    if (dept) {
      if (effectiveTotal <= dept.remaining_balance) {
        if (canvass.finance_status === "Over Budget (Needs Revision)") {
          canvass.finance_status = "Pending Finance Review";
        }
      } else {
        canvass.finance_status = "Over Budget (Needs Revision)";
      }
    }

    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    return { canvass, item };
  }

  public deleteCanvassItem(canvassId: number, itemId: number): Canvass | null {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return null;

    const itemIdx = canvass.items.findIndex((it) => it.id === itemId);
    if (itemIdx === -1) return null;

    canvass.items.splice(itemIdx, 1);

    // Remove from all supplier bids
    canvass.supplier_bids.forEach((bid) => {
      if (bid.item_bids) {
        bid.item_bids = bid.item_bids.filter((bi) => bi.item_id !== itemId);
        bid.bid_amount = bid.item_bids.reduce((sum, bi) => sum + bi.total_price, 0);
      }
    });

    canvass.total_estimated_budget = canvass.items.reduce((sum, it) => sum + it.total_estimated_cost, 0);

    if (canvass.winning_bid_id) {
      const winBid = canvass.supplier_bids.find((b) => b.id === canvass.winning_bid_id);
      if (winBid) canvass.winning_bid_amount = winBid.bid_amount;
    }

    const dept = this.getDepartmentById(canvass.department_id);
    const effectiveTotal = canvass.winning_bid_amount || (canvass.supplier_bids[0]?.bid_amount) || canvass.total_estimated_budget;
    if (dept) {
      if (effectiveTotal <= dept.remaining_balance) {
        if (canvass.finance_status === "Over Budget (Needs Revision)") {
          canvass.finance_status = "Pending Finance Review";
        }
      } else {
        canvass.finance_status = "Over Budget (Needs Revision)";
      }
    }

    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    return canvass;
  }

  public batchUpdateCanvassItems(
    canvassId: number,
    itemsData: Array<{ id?: number; item_name: string; description?: string; quantity: number; unit: string; estimated_unit_cost?: number }>
  ): Canvass | null {
    const canvass = this.getCanvassById(canvassId);
    if (!canvass) return null;

    const updatedItems: CanvassItem[] = itemsData.map((data, idx) => {
      const existing = canvass.items.find((it) => it.id === data.id);
      const itemId = data.id || (existing ? existing.id : Date.now() + idx);
      const qty = Number(data.quantity) || 1;
      const unitCost = Number(data.estimated_unit_cost) || (existing ? existing.estimated_unit_cost : 0);
      return {
        id: itemId,
        item_name: data.item_name || (existing ? existing.item_name : "Item"),
        description: data.description || (existing ? existing.description : ""),
        quantity: qty,
        unit: data.unit || (existing ? existing.unit : "Units"),
        estimated_unit_cost: unitCost,
        total_estimated_cost: qty * unitCost,
      };
    });

    canvass.items = updatedItems;
    canvass.total_estimated_budget = updatedItems.reduce((sum, it) => sum + it.total_estimated_cost, 0);

    canvass.supplier_bids.forEach((bid) => {
      if (bid.item_bids) {
        bid.item_bids = updatedItems.map((uItem) => {
          const existingBItem = bid.item_bids?.find((bi) => bi.item_id === uItem.id || bi.item_name === uItem.item_name);
          const unitP = existingBItem ? existingBItem.unit_price : uItem.estimated_unit_cost;
          return {
            item_id: uItem.id,
            item_name: uItem.item_name,
            unit_price: unitP,
            total_price: unitP * uItem.quantity,
            brand_model: existingBItem?.brand_model || "Standard Specification",
            notes: existingBItem?.notes || "",
          };
        });
        bid.bid_amount = bid.item_bids.reduce((sum, bi) => sum + bi.total_price, 0);
      }
    });

    if (canvass.winning_bid_id) {
      const winBid = canvass.supplier_bids.find((b) => b.id === canvass.winning_bid_id);
      if (winBid) canvass.winning_bid_amount = winBid.bid_amount;
    }

    const dept = this.getDepartmentById(canvass.department_id);
    const effectiveTotal = canvass.winning_bid_amount || (canvass.supplier_bids[0]?.bid_amount) || canvass.total_estimated_budget;
    if (dept) {
      if (effectiveTotal <= dept.remaining_balance) {
        if (canvass.finance_status === "Over Budget (Needs Revision)") {
          canvass.finance_status = "Pending Finance Review";
        }
      } else {
        canvass.finance_status = "Over Budget (Needs Revision)";
      }
    }

    canvass.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    return canvass;
  }

  // --- PURCHASE REQUEST METHODS ---
  public getPurchaseRequests(): PurchaseRequest[] {
    return this.purchaseRequests.map((p) => {
      this.initializeTrailIfEmpty(p, "pr");
      const dept = this.departments.find((d) => d.id === p.department_id);
      return {
        ...p,
        department_name: dept ? dept.name : (p.department_name || `Department #${p.department_id}`),
      };
    });
  }

  public getPurchaseRequestById(id: number): PurchaseRequest | undefined {
    const pr = this.purchaseRequests.find((p) => p.id === id);
    if (!pr) return undefined;
    this.initializeTrailIfEmpty(pr, "pr");
    const dept = this.departments.find((d) => d.id === pr.department_id);
    if (dept) {
      pr.department_name = dept.name;
    }
    return pr;
  }

  public createPurchaseRequest(data: Partial<PurchaseRequest>): PurchaseRequest {
    const nextId = this.purchaseRequests.length > 0 ? Math.max(...this.purchaseRequests.map((p) => p.id)) + 1 : 1;
    const prNo = data.pr_no || `PR-2026-00${nextId > 9 ? nextId : `0${nextId}`}`;

    const items: PurchaseRequestItem[] = (data.items || []).map((item, idx) => ({
      id: 2000 + nextId * 10 + idx,
      item_name: item.item_name || "Item",
      description: item.description || "",
      quantity: Number(item.quantity) || 1,
      unit: item.unit || "Units",
      estimated_unit_cost: Number(item.estimated_unit_cost) || 0,
      total_estimated_cost: (Number(item.quantity) || 1) * (Number(item.estimated_unit_cost) || 0),
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.total_estimated_cost, 0);
    const deptId = Number(data.department_id) || 1;
    const foundDept = this.departments.find((d) => d.id === deptId);
    const departmentName = foundDept ? foundDept.name : (data.department_name || "Physical Plant & Property Management Office (PMO)");

    const prType: PRType = data.pr_type || "Goods (Inventoriable)";
    const subCategory =
      data.sub_category ||
      (prType === "Services/OpEx (Budget Only)"
        ? "HR & Training Services"
        : "General Inventoriable Goods");
    const isHRTraining = subCategory === "HR & Training Services";
    const isBypassedPMO = isHRTraining || prType === "Services/OpEx (Budget Only)";

    const initialStatus: PurchaseRequestStatus =
      data.status || (isHRTraining ? "Pending Dept Head" : "Draft PR");

    // Dynamic approvals checklist for HR & Training Services
    const defaultApprovals: DigitalSignature[] = isHRTraining
      ? [
          {
            role: "Dept Head",
            role_title: "Department Chairperson / Head",
            signatory_name: null,
            signatory_title: "Department Chairperson / Dean",
            signed_at: null,
            status: "pending",
            remarks: "Requires Department Chair / Dean verification & academic endorsement",
          },
          {
            role: "HR",
            role_title: "HR & Training Development Director",
            signatory_name: null,
            signatory_title: "Director, Human Resource Development Office",
            signed_at: null,
            status: "pending",
            remarks: "Requires Human Resource validation for faculty/staff training programs",
          },
          {
            role: "Finance",
            role_title: "Finance & Accounting Officer",
            signatory_name: null,
            signatory_title: "Finance Director / Comptroller",
            signed_at: null,
            status: "pending",
            remarks: "Requires operational budget encumbrance & fund allocation check",
          },
          {
            role: "VP Acad / VPAsa",
            role_title: "VP Academic Affairs / VP Administration (VP Acad / VPAsa)",
            signatory_name: null,
            signatory_title: "VP for Academic Affairs / VP for Administration & Student Affairs",
            signed_at: null,
            status: "pending",
            remarks: "Executive sign-off prior to budget release & disbursement",
          },
        ]
      : [];

    const newPR: PurchaseRequest = {
      id: nextId,
      pr_no: prNo,
      canvass_id: data.canvass_id || null,
      canvass_no: data.canvass_no || null,
      title: data.title || data.purpose || "Purchase Request",
      department_id: deptId,
      department_name: departmentName,
      requested_by: data.requested_by || "Department Requestor",
      priority: data.priority || "Medium",
      status: initialStatus,
      pr_type: prType,
      sub_category: subCategory,
      is_bypassed_pmo: isBypassedPMO,
      approvals: data.approvals || defaultApprovals,
      target_date: data.target_date || null,
      purpose: data.purpose || data.title || "Purchase Request",
      total_estimated_budget: Number(data.total_estimated_budget) || totalAmount,
      notes: data.notes || "",
      items,
      total_amount: Number(data.total_amount) || totalAmount,
      winning_bid_id: data.winning_bid_id || null,
      supplier_id: data.supplier_id || null,
      supplier_name: data.supplier_name || null,
      po_id: data.po_id || null,
      po_no: data.po_no || null,
      department_approved_by: data.department_approved_by || null,
      department_approved_at: data.department_approved_at || null,
      finance_approved_by: data.finance_approved_by || null,
      finance_approved_at: data.finance_approved_at || null,
      attachments: data.attachments || [],
      created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      canvass_started_at: data.canvass_started_at || null,
      pr_submitted_at: data.pr_submitted_at || new Date().toISOString().replace("T", " ").slice(0, 19),
      po_dispatched_at: data.po_dispatched_at || null,
      items_received_at: data.items_received_at || null,
      stage_entered_at: data.stage_entered_at || new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    this.purchaseRequests.unshift(newPR);
    return newPR;
  }

  public updatePurchaseRequest(id: number, updates: Partial<PurchaseRequest>): PurchaseRequest | null {
    const index = this.purchaseRequests.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.purchaseRequests[index];
    const updated: PurchaseRequest = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    if (updates.status && updates.status !== current.status) {
      updated.stage_entered_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    }

    if (updates.items) {
      updated.total_amount = updated.items.reduce((sum, item) => sum + (item.total_estimated_cost || item.quantity * item.estimated_unit_cost), 0);
    }

    this.purchaseRequests[index] = updated;
    return updated;
  }

  public updatePurchaseRequestStatus(
    id: number,
    newStatus: PurchaseRequestStatus,
    remarks?: string,
    performedBy?: string,
    role?: string
  ): PurchaseRequest | null {
    const pr = this.getPurchaseRequestById(id);
    if (!pr) return null;

    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    // If Finance approves, mark finance approval and transition to Canvassing / Bidding
    if (newStatus === "Approved") {
      pr.finance_approved_at = nowStr;
      pr.finance_approved_by = performedBy || "Finance Officer";
      pr.finance_status = "Finance Approved";
      newStatus = "Canvassing / Bidding";
    }

    // Strict Validation: Cannot transition into Canvassing unless it has explicitly passed Finance Approval
    if (newStatus === "Canvassing / Bidding" || (newStatus as string) === "Canvassing") {
      if (role === "Finance" || performedBy?.toLowerCase().includes("finance")) {
        pr.finance_approved_at = nowStr;
        pr.finance_approved_by = performedBy || "Finance Officer";
        pr.finance_status = "Finance Approved";
      }

      const hasFinanceApproval =
        Boolean(pr.finance_approved_at) ||
        pr.finance_status === "Finance Approved" ||
        Boolean(pr.finance_approved_by) ||
        (pr.approvals && pr.approvals.some((a) => (a.role === "Finance" || a.role_title?.toLowerCase().includes("finance")) && a.status === "approved"));

      if (!hasFinanceApproval) {
        throw new Error("Validation Error: Cannot move Purchase Request into Canvassing / Bidding without explicit Finance Approval.");
      }
      newStatus = "Canvassing / Bidding";
    }

    if (newStatus === "Needs Revision") {
      pr.revision_remarks = remarks || "Needs revision by requesting department";
      pr.revision_requested_at = nowStr;
      pr.revision_requested_by = performedBy || "Finance Officer";
      pr.revision_count = (pr.revision_count || 0) + 1;
    }

    if (newStatus === "Pending Finance Approval") {
      // Re-submission from Department or initial submission
      if (remarks) {
        pr.notes = (pr.notes ? pr.notes + "\n" : "") + `[Resubmitted]: ${remarks}`;
      }
    }

    const oldStatus = pr.status;
    pr.status = newStatus;
    pr.updated_at = nowStr;
    pr.stage_entered_at = nowStr;

    // Synchronize approvals checklist if HR & Training or approvals exist
    if (pr.approvals && pr.approvals.length > 0) {
      if (newStatus === "Pending HR") {
        if (pr.approvals[0] && pr.approvals[0].status !== "approved") {
          pr.approvals[0].status = "approved";
          pr.approvals[0].signatory_name = performedBy || pr.requested_by || "Department Head";
          pr.approvals[0].signed_at = nowStr;
          pr.approvals[0].remarks = remarks || "Endorsed by Department Head";
        }
      } else if (newStatus === "Pending Finance") {
        if (pr.approvals[0] && pr.approvals[0].status !== "approved") {
          pr.approvals[0].status = "approved";
          pr.approvals[0].signatory_name = pr.approvals[0].signatory_name || "Department Head";
          pr.approvals[0].signed_at = pr.approvals[0].signed_at || nowStr;
        }
        if (pr.approvals[1] && pr.approvals[1].status !== "approved") {
          pr.approvals[1].status = "approved";
          pr.approvals[1].signatory_name = performedBy || "Atty. Maria Santos (HR Director)";
          pr.approvals[1].signed_at = nowStr;
          pr.approvals[1].remarks = remarks || "Endorsed by HR & Training Director";
        }
      } else if (newStatus === "Pending VP Acad / VPAsa") {
        if (pr.approvals[0]) pr.approvals[0].status = "approved";
        if (pr.approvals[1]) pr.approvals[1].status = "approved";
        if (pr.approvals[2] && pr.approvals[2].status !== "approved") {
          pr.approvals[2].status = "approved";
          pr.approvals[2].signatory_name = performedBy || "Prof. Vicente Mendoza (Finance Director)";
          pr.approvals[2].signed_at = nowStr;
          pr.approvals[2].remarks = remarks || "Budget encumbered and cleared by Finance Office";
        }
      } else if (newStatus === "Approved PR") {
        pr.approvals.forEach((app) => {
          if (app.status !== "approved") {
            app.status = "approved";
            app.signatory_name = app.signatory_name || performedBy || app.signatory_title;
            app.signed_at = app.signed_at || nowStr;
            app.remarks = app.remarks || "Approved step in management sequence";
          }
        });
      }
    }

    // Record audit trail entry
    this.initializeTrailIfEmpty(pr, "pr");
    pr.trail = pr.trail || [];
    pr.trail.push({
      id: `tr-pr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowStr,
      action: "Stage Transition",
      from_status: oldStatus,
      to_status: newStatus,
      performed_by: performedBy || (pr.sub_category === "HR & Training Services" ? "Management Signatory" : "PMO / Requesting Department"),
      role: role || (pr.sub_category === "HR & Training Services" ? "Executive Approver" : "Procurement End-User"),
      remarks: remarks || `Moved stage from "${oldStatus}" to "${newStatus}"`,
    });

    if (newStatus === "Pending Department Approval") {
      pr.department_approved_by = null;
      pr.department_approved_at = null;
    } else if (newStatus === "Pending Finance Approval") {
      pr.pr_submitted_at = pr.pr_submitted_at || nowStr;
      pr.department_approved_by = pr.department_approved_by || pr.requested_by;
      pr.department_approved_at = nowStr;
    } else if (newStatus === "Approved PR" || newStatus === "Purchase Order Issued") {
      pr.finance_approved_by = pr.finance_approved_by || "Finance Affairs Office / VP Administration";
      pr.finance_approved_at = pr.finance_approved_at || nowStr;

      // AUTOMATION: When PR is moved to "Approved PR" or "Purchase Order Issued", auto-generate Purchase Order (PO) and carry over evidence
      // EXCEPTION: IF flagged as "HR & Training Services" or "Services/OpEx (Budget Only)", COMPLETELY BYPASS PMO, Inventory, and Canvassing!
      const isOpExOrHR = pr.is_bypassed_pmo || pr.pr_type === "Services/OpEx (Budget Only)" || pr.sub_category === "HR & Training Services";

      if (!pr.po_id && !isOpExOrHR) {
        const poItems: PurchaseOrderItem[] = pr.items.map((item, idx) => ({
          id: Date.now() + idx,
          item_name: item.item_name,
          description: item.description || "",
          quantity: item.quantity,
          received_quantity: 0,
          unit: item.unit,
          unit_price: item.estimated_unit_cost,
          total_price: item.total_estimated_cost || item.quantity * item.estimated_unit_cost,
        }));

        const carriedAttachments: EvidenceAttachment[] = (pr.attachments || []).map((att) => ({
          ...att,
          id: `po-att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          notes: (att.notes ? `${att.notes} | ` : "") + `Carried over from Purchase Request ${pr.pr_no}`,
        }));

        const supplier = pr.supplier_id ? this.suppliers.find((s) => s.id === pr.supplier_id) : this.suppliers[0];
        const warehouse = this.warehouses[0];

        const newPO = this.createPurchaseOrder({
          canvass_id: pr.canvass_id,
          canvass_no: pr.canvass_no,
          pr_id: pr.id,
          pr_no: pr.pr_no,
          winning_bid_id: pr.winning_bid_id,
          supplier_id: supplier ? supplier.id : 1,
          supplier_name: supplier ? supplier.name : (pr.supplier_name || "Official Supplier"),
          supplier_email: supplier ? supplier.email : "supplier@pmo.ph",
          supplier_phone: supplier ? supplier.phone : "N/A",
          total_amount: pr.total_amount,
          payment_terms: supplier ? supplier.terms : "Net 30 Days",
          status: "Draft",
          warehouse_id: warehouse.id,
          warehouse_name: warehouse.warehouse_name,
          items: poItems,
          notes: `Auto-generated from Approved PR ${pr.pr_no}: ${pr.title}.`,
          attachments: carriedAttachments,
          canvass_started_at: pr.canvass_started_at || null,
          pr_submitted_at: pr.pr_submitted_at || nowStr,
          finance_approved_at: nowStr,
          stage_entered_at: nowStr,
        });

        pr.po_id = newPO.id;
        pr.po_no = newPO.po_no;

        if (pr.canvass_id) {
          const canvass = this.getCanvassById(pr.canvass_id);
          if (canvass) {
            canvass.po_id = newPO.id;
            canvass.po_no = newPO.po_no;
            canvass.finance_approved_at = nowStr;
          }
        }
      }
    }

    const idx = this.purchaseRequests.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.purchaseRequests[idx] = pr;
    }
    this.saveToStorage();

    return pr;
  }

  public signPurchaseRequestStage(
    id: number,
    role: "Dept Head" | "HR" | "Finance" | "VP Acad / VPAsa",
    signatoryName?: string,
    remarks?: string
  ): PurchaseRequest | null {
    const pr = this.getPurchaseRequestById(id);
    if (!pr || !pr.approvals) return null;

    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    const approval = pr.approvals.find((a) => a.role === role);
    if (approval) {
      approval.status = "approved";
      approval.signatory_name = signatoryName || approval.signatory_title;
      approval.signed_at = nowStr;
      approval.remarks = remarks || `Digitally endorsed and signed by ${approval.signatory_name}.`;
    }

    // Advance sequence: Dept Head -> Pending HR -> Pending Finance -> Pending VP Acad / VPAsa -> Approved PR
    let nextStatus: PurchaseRequestStatus = pr.status;
    if (role === "Dept Head") {
      nextStatus = "Pending HR";
    } else if (role === "HR") {
      nextStatus = "Pending Finance";
    } else if (role === "Finance") {
      nextStatus = "Pending VP Acad / VPAsa";
    } else if (role === "VP Acad / VPAsa") {
      nextStatus = "Approved PR";
    }

    return this.updatePurchaseRequestStatus(
      id,
      nextStatus,
      `Digital Signature validated: ${remarks || "Approved step in management sequence"}`,
      signatoryName || role,
      role
    );
  }

  public deletePurchaseRequest(id: number): boolean {
    const index = this.purchaseRequests.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.purchaseRequests.splice(index, 1);
    return true;
  }

  public approvePurchaseRequest(id: number) {
    const pr = this.getPurchaseRequestById(id);
    if (!pr) return { success: false, message: `Purchase Request #${id} not found` };

    const dept = this.getDepartmentById(pr.department_id);

    // Encumber funds from department's allocated budget
    if (dept) {
      dept.encumbered_amount = (dept.encumbered_amount || 0) + pr.total_amount;
      dept.remaining_balance = Math.max(0, dept.allocated_amount - (dept.utilized_amount || 0) - dept.encumbered_amount);
      dept.budget_remaining = dept.remaining_balance;
      dept.budget_encumbered = dept.encumbered_amount;
    }

    pr.finance_approved_by = "Finance Office Gatekeeper";
    pr.finance_approved_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    const updatedPr = this.updatePurchaseRequestStatus(id, "Approved PR");
    const po = updatedPr?.po_id ? this.getPurchaseOrderById(updatedPr.po_id) : null;

    return {
      success: true,
      message: `PR #${pr.pr_no} approved. ₱${pr.total_amount.toLocaleString()} encumbered from ${dept?.name || "department"} budget. Purchase Order #${po?.po_no || "created"} generated in PO stage.`,
      pr: updatedPr,
      purchaseOrder: po,
      department: dept,
    };
  }

  public rejectPurchaseRequest(id: number, reason?: string) {
    const pr = this.getPurchaseRequestById(id);
    if (!pr) return { success: false, message: `Purchase Request #${id} not found` };

    pr.status = "Rejected";
    pr.notes = (pr.notes ? `${pr.notes} | ` : "") + `[Finance Returned: ${reason || "Budget revision needed"}]`;
    pr.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);

    return {
      success: true,
      message: `PR #${pr.pr_no} has been returned / rejected.`,
      pr,
    };
  }

  // --- EVIDENCE & ATTACHMENT METHODS ---
  public addAttachment(
    module: "canvasses" | "purchase-requests" | "purchase-orders",
    id: number,
    attData: Partial<EvidenceAttachment>
  ): EvidenceAttachment | null {
    const attachment: EvidenceAttachment = {
      id: attData.id || `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: attData.name || "Evidence-Document.pdf",
      original_name: attData.original_name || attData.name || "Document",
      url: attData.url || "/uploads/sample-supplier-quotation.txt",
      size: Number(attData.size) || 125000,
      mime_type: attData.mime_type || "application/pdf",
      uploaded_at: attData.uploaded_at || new Date().toISOString().replace("T", " ").slice(0, 19),
      uploaded_by: attData.uploaded_by || "PMO Authorized Officer",
      stage: attData.stage || (module === "canvasses" ? "Canvass" : module === "purchase-requests" ? "Purchase Request" : "Purchase Order"),
      type: attData.type || "general",
      notes: attData.notes || "",
    };

    if (module === "canvasses") {
      const c = this.getCanvassById(id);
      if (!c) return null;
      if (!Array.isArray(c.attachments)) c.attachments = [];
      c.attachments.unshift(attachment);
      c.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      return attachment;
    } else if (module === "purchase-requests") {
      const pr = this.getPurchaseRequestById(id);
      if (!pr) return null;
      if (!Array.isArray(pr.attachments)) pr.attachments = [];
      pr.attachments.unshift(attachment);
      pr.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      return attachment;
    } else if (module === "purchase-orders") {
      const po = this.getPurchaseOrderById(id);
      if (!po) return null;
      if (!Array.isArray(po.attachments)) po.attachments = [];
      po.attachments.unshift(attachment);
      po.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      return attachment;
    }
    return null;
  }

  public deleteAttachment(
    module: "canvasses" | "purchase-requests" | "purchase-orders",
    id: number,
    attachmentId: string | number
  ): boolean {
    if (module === "canvasses") {
      const c = this.getCanvassById(id);
      if (!c || !Array.isArray(c.attachments)) return false;
      const idx = c.attachments.findIndex((a) => String(a.id) === String(attachmentId));
      if (idx === -1) return false;
      c.attachments.splice(idx, 1);
      c.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      return true;
    } else if (module === "purchase-requests") {
      const pr = this.getPurchaseRequestById(id);
      if (!pr || !Array.isArray(pr.attachments)) return false;
      const idx = pr.attachments.findIndex((a) => String(a.id) === String(attachmentId));
      if (idx === -1) return false;
      pr.attachments.splice(idx, 1);
      pr.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      return true;
    } else if (module === "purchase-orders") {
      const po = this.getPurchaseOrderById(id);
      if (!po || !Array.isArray(po.attachments)) return false;
      const idx = po.attachments.findIndex((a) => String(a.id) === String(attachmentId));
      if (idx === -1) return false;
      po.attachments.splice(idx, 1);
      po.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      return true;
    }
    return false;
  }

  // --- PURCHASE ORDER METHODS ---
  public getPurchaseOrders(): PurchaseOrder[] {
    return this.purchaseOrders.map((po) => {
      this.initializeTrailIfEmpty(po, "po");
      const dept = po.department_id ? this.departments.find((d) => d.id === po.department_id) : null;
      let deptName = dept ? dept.name : (po.department_name || "");
      if (!deptName && po.pr_id) {
        const pr = this.purchaseRequests.find((p) => p.id === po.pr_id);
        if (pr) {
          const prDept = this.departments.find((d) => d.id === pr.department_id);
          deptName = prDept ? prDept.name : (pr.department_name || "");
        }
      }
      if (!deptName && po.canvass_id) {
        const canv = this.canvasses.find((c) => c.id === po.canvass_id);
        if (canv) {
          const cDept = this.departments.find((d) => d.id === canv.department_id);
          deptName = cDept ? cDept.name : (canv.department_name || "");
        }
      }
      return {
        ...po,
        department_name: deptName || "Physical Plant & Property Management Office (PMO)",
      };
    });
  }

  public getPurchaseOrderById(id: number): PurchaseOrder | undefined {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) return undefined;
    this.initializeTrailIfEmpty(po, "po");
    const dept = po.department_id ? this.departments.find((d) => d.id === po.department_id) : null;
    let deptName = dept ? dept.name : (po.department_name || "");
    if (!deptName && po.pr_id) {
      const pr = this.purchaseRequests.find((p) => p.id === po.pr_id);
      if (pr) {
        const prDept = this.departments.find((d) => d.id === pr.department_id);
        deptName = prDept ? prDept.name : (pr.department_name || "");
      }
    }
    po.department_name = deptName || "Physical Plant & Property Management Office (PMO)";
    return po;
  }

  public createPurchaseOrder(data: Partial<PurchaseOrder>): PurchaseOrder {
    const nextId = this.purchaseOrders.length > 0 ? Math.max(...this.purchaseOrders.map((p) => p.id)) + 1 : 1;
    const poNo = data.po_no || `PO-2026-00${nextId > 9 ? nextId : `0${nextId}`}`;
    const warehouse = this.warehouses.find((w) => w.id === Number(data.warehouse_id)) || this.warehouses[0];

    const items: PurchaseOrderItem[] = (data.items || []).map((item, idx) => ({
      id: Date.now() + idx,
      product_id: item.product_id,
      item_name: item.item_name || "PO Item",
      description: item.description || "",
      quantity: Number(item.quantity) || 1,
      received_quantity: Number(item.received_quantity) || 0,
      unit: item.unit || "Units",
      unit_price: Number(item.unit_price) || 0,
      total_price: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

    let deptId = data.department_id ? Number(data.department_id) : null;
    let deptName = data.department_name || null;
    if (!deptId && data.pr_id) {
      const pr = this.purchaseRequests.find((p) => p.id === data.pr_id);
      if (pr) {
        deptId = pr.department_id;
        deptName = pr.department_name;
      }
    }
    if (!deptId && data.canvass_id) {
      const canv = this.canvasses.find((c) => c.id === data.canvass_id);
      if (canv) {
        deptId = canv.department_id;
        deptName = canv.department_name;
      }
    }
    if (deptId && !deptName) {
      const foundDept = this.departments.find((d) => d.id === deptId);
      if (foundDept) deptName = foundDept.name;
    }

    const newPO: PurchaseOrder = {
      id: nextId,
      po_no: poNo,
      canvass_id: data.canvass_id || null,
      canvass_no: data.canvass_no || null,
      pr_id: data.pr_id || null,
      pr_no: data.pr_no || null,
      department_id: deptId,
      department_name: deptName || "Physical Plant & Property Management Office (PMO)",
      winning_bid_id: data.winning_bid_id || null,
      supplier_id: Number(data.supplier_id) || 1,
      supplier_name: data.supplier_name || "Selected Supplier",
      supplier_email: data.supplier_email || "supplier@test.com",
      supplier_phone: data.supplier_phone || "N/A",
      total_amount: Number(data.total_amount) || totalAmount,
      payment_terms: data.payment_terms || "Net 30 Days",
      status: data.status || "Draft",
      order_date: data.order_date || new Date().toISOString().slice(0, 10),
      expected_delivery_date: data.expected_delivery_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      received_date: data.received_date || null,
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.warehouse_name,
      items,
      notes: data.notes || "",
      approved_by: data.approved_by || null,
      approved_at: data.approved_at || null,
      attachments: data.attachments || [],
      created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      canvass_started_at: data.canvass_started_at || null,
      pr_submitted_at: data.pr_submitted_at || null,
      finance_approved_at: data.finance_approved_at || null,
      po_dispatched_at: (data.status === "Ordered" || data.status === "In Transit" || data.status === "Sent to Supplier") ? new Date().toISOString().replace("T", " ").slice(0, 19) : (data.po_dispatched_at || null),
      items_received_at: data.items_received_at || null,
      stage_entered_at: data.stage_entered_at || new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    this.purchaseOrders.unshift(newPO);
    return newPO;
  }

  public updatePOStatus(
    poId: number,
    newStatus: POStatus,
    remarks?: string,
    performedBy?: string,
    role?: string
  ): { po: PurchaseOrder; restockedItems: InventoryItem[] } | null {
    const po = this.getPurchaseOrderById(poId);
    if (!po) return null;

    const oldStatus = po.status;
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    po.status = newStatus;
    po.updated_at = nowStr;
    po.stage_entered_at = nowStr;

    // Record audit trail entry
    this.initializeTrailIfEmpty(po, "po");
    po.trail = po.trail || [];
    po.trail.push({
      id: `tr-po-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowStr,
      action: "Stage Transition",
      from_status: oldStatus,
      to_status: newStatus,
      performed_by: performedBy || "Property Custodian / PMO",
      role: role || "Purchasing Officer",
      remarks: remarks || `Moved stage from "${oldStatus}" to "${newStatus}" via Kanban drag-and-drop`,
    });

    // Automatic timestamp stamping on PO stage transitions
    if (newStatus === "Ordered" || newStatus === "In Transit" || newStatus === "Sent to Supplier") {
      po.po_dispatched_at = po.po_dispatched_at || nowStr;
    }
    if (newStatus === "Order Received" || newStatus === "Fully Received" || newStatus === "Partially Received") {
      po.items_received_at = po.items_received_at || nowStr;
    }

    const restockedItems: InventoryItem[] = [];

    // Automatically increment Inventory stock levels when Order Received, Fully Received, or Partially Received
    const isReceived = newStatus === "Order Received" || newStatus === "Fully Received" || newStatus === "Partially Received";
    if (isReceived) {
      po.received_date = po.received_date || new Date().toISOString().slice(0, 10);

      po.items.forEach((poItem) => {
        // Mark received quantity
        const isFull = newStatus === "Order Received" || newStatus === "Fully Received";
        const addedQty = isFull
          ? (poItem.quantity - poItem.received_quantity)
          : Math.ceil(poItem.quantity * 0.5);

        poItem.received_quantity = isFull ? poItem.quantity : (poItem.received_quantity + addedQty);

        if (addedQty > 0) {
          // Find matching inventory item or create new one
          let inv = this.inventory.find(
            (item) => item.product_name.toLowerCase().trim() === poItem.item_name.toLowerCase().trim()
          );

          if (inv) {
            inv.quantity += addedQty;
            inv.total_valuation = inv.quantity * inv.unit_price;
            inv.last_restocked_at = new Date().toISOString().slice(0, 10);
            inv.source_po_no = po.po_no;
            inv.status = inv.quantity <= 0 ? "Out of Stock" : (inv.quantity <= inv.min_safety_stock ? "Low Stock" : "In Stock");
            restockedItems.push(inv);
          } else {
            // Create new inventory item record
            const nextInvId = this.inventory.length > 0 ? Math.max(...this.inventory.map((i) => i.id)) + 1 : 1;
            const categoryMatch = poItem.item_name.includes("Laptop") || poItem.item_name.includes("Monitor") || poItem.item_name.includes("Workstation")
              ? "IT Equipment"
              : poItem.item_name.includes("Aircon") || poItem.item_name.includes("Tube") || poItem.item_name.includes("AC")
              ? "Facility & Maintenance"
              : "Office Supplies";

            const codePrefix = categoryMatch === "IT Equipment" ? "IT" : (categoryMatch === "Facility & Maintenance" ? "MNT" : "GEN");
            const newInv: InventoryItem = {
              id: nextInvId,
              product_code: `${codePrefix}-${nextInvId.toString().padStart(3, "0")}`,
              product_name: poItem.item_name,
              category: categoryMatch,
              warehouse_id: po.warehouse_id,
              warehouse_name: po.warehouse_name,
              quantity: addedQty,
              min_safety_stock: 5,
              unit: poItem.unit,
              unit_price: poItem.unit_price,
              total_valuation: addedQty * poItem.unit_price,
              status: addedQty <= 5 ? "Low Stock" : "In Stock",
              last_restocked_at: new Date().toISOString().slice(0, 10),
              source_po_no: po.po_no,
            };
            this.inventory.unshift(newInv);
            restockedItems.push(newInv);
          }
        }
      });
    }

    // 2. Permanently deduct the final PO total from the requesting Department's remaining_balance (moving it to utilized_amount)
    if (newStatus === "Fully Received") {
      const targetDeptId = po.department_id || (po.canvass_id ? this.getCanvassById(po.canvass_id)?.department_id : null) || (po.pr_id ? this.getPurchaseRequestById(po.pr_id)?.department_id : null);
      if (targetDeptId) {
        const dept = this.getDepartmentById(targetDeptId);
        if (dept) {
          dept.utilized_amount += po.total_amount;
          dept.remaining_balance = Math.max(0, dept.allocated_amount - dept.utilized_amount);
          dept.budget_utilized = dept.utilized_amount;
          dept.budget_remaining = dept.remaining_balance;
        }
      }
    }

    const idx = this.purchaseOrders.findIndex((p) => p.id === poId);
    if (idx !== -1) {
      this.purchaseOrders[idx] = po;
    }
    this.saveToStorage();

    return { po, restockedItems };
  }

  public updatePurchaseOrder(id: number, updates: Partial<PurchaseOrder>): PurchaseOrder | null {
    const index = this.purchaseOrders.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.purchaseOrders[index];
    const updated: PurchaseOrder = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    if (updates.status && updates.status !== current.status) {
      updated.stage_entered_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    }

    if (updates.items) {
      updated.total_amount = updated.items.reduce(
        (sum, it) => sum + (Number(it.total_price) || (Number(it.quantity) * Number(it.unit_price))),
        0
      );
    }

    this.purchaseOrders[index] = updated;
    return updated;
  }

  public updatePurchaseOrderStatus(
    id: number,
    status: POStatus,
    remarks?: string,
    performed_by?: string,
    role?: string
  ): PurchaseOrder | null {
    const res = this.updatePOStatus(id, status, remarks, performed_by, role);
    return res ? res.po : null;
  }

  public deletePurchaseOrder(id: number): boolean {
    const index = this.purchaseOrders.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.purchaseOrders.splice(index, 1);
    return true;
  }

  /**
   * Procurement Velocity & Lead Time Analytics
   * Analyzes real timestamps across Canvass, Finance Review, PR, and PO dispatch/receiving.
   */
  public getProcurementVelocity() {
    const parseTime = (dateStr?: string | null) => {
      if (!dateStr) return null;
      const t = new Date(dateStr).getTime();
      return isNaN(t) ? null : t;
    };

    const diffDays = (t1: number, t2: number) => Math.max(0.1, parseFloat(((t2 - t1) / (1000 * 60 * 60 * 24)).toFixed(1)));

    const canvassDurations: number[] = [];
    const financeDurations: number[] = [];
    const dispatchDurations: number[] = [];
    const receivingDurations: number[] = [];
    const endToEndDurations: number[] = [];

    // Evaluate PO pipeline durations
    this.purchaseOrders.forEach((po) => {
      const canvassStart = parseTime(po.canvass_started_at) || (po.canvass_id ? parseTime(this.getCanvassById(po.canvass_id)?.canvass_started_at || this.getCanvassById(po.canvass_id)?.created_at) : null);
      const prSubmit = parseTime(po.pr_submitted_at) || (po.pr_id ? parseTime(this.getPurchaseRequestById(po.pr_id)?.pr_submitted_at || this.getPurchaseRequestById(po.pr_id)?.created_at) : null);
      const financeApprove = parseTime(po.finance_approved_at) || parseTime(po.approved_at);
      const poDispatch = parseTime(po.po_dispatched_at) || parseTime(po.order_date);
      const itemsReceived = parseTime(po.items_received_at) || parseTime(po.received_date);

      if (canvassStart && prSubmit && prSubmit >= canvassStart) {
        canvassDurations.push(diffDays(canvassStart, prSubmit));
      }
      if (prSubmit && financeApprove && financeApprove >= prSubmit) {
        financeDurations.push(diffDays(prSubmit, financeApprove));
      }
      if (financeApprove && poDispatch && poDispatch >= financeApprove) {
        dispatchDurations.push(diffDays(financeApprove, poDispatch));
      }
      if (poDispatch && itemsReceived && itemsReceived >= poDispatch) {
        receivingDurations.push(diffDays(poDispatch, itemsReceived));
      }
      if (canvassStart && itemsReceived && itemsReceived >= canvassStart) {
        endToEndDurations.push(diffDays(canvassStart, itemsReceived));
      }
    });

    // Also include canvasses that moved past PR submission
    this.canvasses.forEach((c) => {
      const start = parseTime(c.canvass_started_at) || parseTime(c.created_at);
      const submit = parseTime(c.pr_submitted_at);
      if (start && submit && submit >= start) {
        canvassDurations.push(diffDays(start, submit));
      }
      const finance = parseTime(c.finance_approved_at);
      if (submit && finance && finance >= submit) {
        financeDurations.push(diffDays(submit, finance));
      }
    });

    const avg = (arr: number[], fallback: number) => {
      if (arr.length === 0) return fallback;
      const sum = arr.reduce((a, b) => a + b, 0);
      return parseFloat((sum / arr.length).toFixed(1));
    };

    const avgCanvassing = avg(canvassDurations, 4.2);
    const avgFinance = avg(financeDurations, 2.8);
    const avgDispatch = avg(dispatchDurations, 3.5);
    const avgReceiving = avg(receivingDurations, 6.2);
    const avgEndToEnd = avg(endToEndDurations, parseFloat((avgCanvassing + avgFinance + avgDispatch + avgReceiving).toFixed(1)));

    // Active bottlenecks: card sits in current stage for >= 3 days
    const now = Date.now();
    const activeBottlenecks: any[] = [];

    this.canvasses.forEach((c) => {
      if (c.status !== "Approved") {
        const enteredAt = parseTime(c.stage_entered_at) || parseTime(c.updated_at) || parseTime(c.created_at);
        if (enteredAt) {
          const daysInStage = diffDays(enteredAt, now);
          if (daysInStage >= 3.0) {
            activeBottlenecks.push({
              id: c.id,
              type: "Canvass",
              ref_no: c.canvass_no,
              title: c.title,
              department: c.department_name,
              stage: c.status,
              days_in_stage: daysInStage,
              stage_entered_at: c.stage_entered_at || c.updated_at || c.created_at,
              priority: c.priority,
              amount: c.total_estimated_budget,
            });
          }
        }
      }
    });

    // Check Finance Gatekeeper reviews
    this.canvasses.forEach((c) => {
      if (c.finance_status === "Pending Finance Review" || c.finance_status === "Over Budget (Needs Revision)") {
        const enteredAt = parseTime(c.stage_entered_at) || parseTime(c.updated_at);
        if (enteredAt) {
          const daysInStage = diffDays(enteredAt, now);
          if (daysInStage >= 3.0) {
            if (!activeBottlenecks.some((b) => b.ref_no === c.canvass_no && b.type === "Finance Review")) {
              activeBottlenecks.push({
                id: c.id,
                type: "Finance Review",
                ref_no: c.canvass_no,
                title: c.title,
                department: c.department_name,
                stage: c.finance_status,
                days_in_stage: daysInStage,
                stage_entered_at: c.stage_entered_at || c.updated_at,
                priority: c.priority,
                amount: c.winning_bid_amount || c.total_estimated_budget,
              });
            }
          }
        }
      }
    });

    // Check POs
    this.purchaseOrders.forEach((po) => {
      if (po.status !== "Fully Received") {
        const enteredAt = parseTime(po.stage_entered_at) || parseTime(po.updated_at) || parseTime(po.created_at);
        if (enteredAt) {
          const daysInStage = diffDays(enteredAt, now);
          if (daysInStage >= 3.0) {
            activeBottlenecks.push({
              id: po.id,
              type: "Purchase Order",
              ref_no: po.po_no,
              title: `${po.supplier_name} - ${po.items?.[0]?.item_name || "Procurement Items"}`,
              department: po.department_name,
              stage: po.status,
              days_in_stage: daysInStage,
              stage_entered_at: po.stage_entered_at || po.updated_at || po.created_at,
              priority: "High",
              amount: po.total_amount,
            });
          }
        }
      }
    });

    return {
      overall_avg_days: avgEndToEnd,
      total_completed_orders: this.purchaseOrders.filter((po) => po.status === "Fully Received").length,
      stage_metrics: [
        {
          key: "canvassing",
          stage_name: "Canvassing & Quotations",
          from_stage: "Request Initiated",
          to_stage: "PR Submitted",
          avg_days: avgCanvassing,
          benchmark_days: 5.0,
          completed_count: canvassDurations.length || 6,
          status: avgCanvassing <= 5.0 ? "optimal" : "delayed",
        },
        {
          key: "finance_approval",
          stage_name: "Finance Budget Gatekeeper",
          from_stage: "PR Submitted",
          to_stage: "Finance Approved",
          avg_days: avgFinance,
          benchmark_days: 3.0,
          completed_count: financeDurations.length || 5,
          status: avgFinance <= 3.0 ? "optimal" : "delayed",
        },
        {
          key: "po_dispatch",
          stage_name: "PO Issuance & Supplier Dispatch",
          from_stage: "Finance Approved",
          to_stage: "PO In Transit",
          avg_days: avgDispatch,
          benchmark_days: 2.5,
          completed_count: dispatchDurations.length || 5,
          status: avgDispatch <= 2.5 ? "optimal" : "delayed",
        },
        {
          key: "vendor_fulfillment",
          stage_name: "Fulfillment & Receiving Inspection",
          from_stage: "PO Dispatched",
          to_stage: "Items Received",
          avg_days: avgReceiving,
          benchmark_days: 7.0,
          completed_count: receivingDurations.length || 4,
          status: avgReceiving <= 7.0 ? "optimal" : "delayed",
        },
      ],
      active_bottlenecks: activeBottlenecks.sort((a, b) => b.days_in_stage - a.days_in_stage),
      recent_transitions: this.purchaseOrders.map((po) => ({
        id: po.id,
        ref_no: po.po_no,
        pr_no: po.pr_no,
        canvass_no: po.canvass_no,
        title: po.items?.[0]?.item_name || "Procurement Items",
        supplier_name: po.supplier_name,
        department: po.department_name,
        stage: po.status,
        canvass_started_at: po.canvass_started_at,
        pr_submitted_at: po.pr_submitted_at,
        finance_approved_at: po.finance_approved_at,
        po_dispatched_at: po.po_dispatched_at,
        items_received_at: po.items_received_at,
        stage_entered_at: po.stage_entered_at,
        total_days: po.items_received_at && (po.canvass_started_at || po.created_at)
          ? diffDays(parseTime(po.canvass_started_at || po.created_at)!, parseTime(po.items_received_at)!)
          : null,
      })),
    };
  }

  // --- INVENTORY METHODS ---
  public getInventory(): InventoryItem[] {
    return this.inventory;
  }

  public getInventoryItems(): InventoryItem[] {
    return this.inventory;
  }

  public getInventoryById(id: number): InventoryItem | undefined {
    return this.inventory.find((item) => item.id === id);
  }

  public createInventoryItem(data: Partial<InventoryItem>): InventoryItem {
    const nextId = this.inventory.length > 0 ? Math.max(...this.inventory.map((i) => i.id)) + 1 : 1;
    const warehouse = this.warehouses.find((w) => w.id === Number(data.warehouse_id)) || this.warehouses[0];
    const qty = Number(data.quantity) || 0;
    const unitPrice = Number(data.unit_price) || 0;
    const minStock = Number(data.min_safety_stock) || 5;

    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (qty <= 0) status = "Out of Stock";
    else if (qty <= minStock) status = "Low Stock";

    const newItem: InventoryItem = {
      id: nextId,
      product_code: data.product_code || `INV-${nextId.toString().padStart(3, "0")}`,
      product_name: data.product_name || "New Inventory Product",
      category: data.category || "General Supplies",
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.warehouse_name,
      quantity: qty,
      min_safety_stock: minStock,
      unit: data.unit || "Units",
      unit_price: unitPrice,
      total_valuation: qty * unitPrice,
      status,
      last_restocked_at: data.last_restocked_at || new Date().toISOString().slice(0, 10),
      source_po_no: data.source_po_no || undefined,
    };

    this.inventory.unshift(newItem);
    return newItem;
  }

  public updateInventoryItem(id: number, updates: Partial<InventoryItem>): InventoryItem | null {
    const index = this.inventory.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const current = this.inventory[index];
    const qty = updates.quantity !== undefined ? Number(updates.quantity) : current.quantity;
    const minStock = updates.min_safety_stock !== undefined ? Number(updates.min_safety_stock) : current.min_safety_stock;
    const unitPrice = updates.unit_price !== undefined ? Number(updates.unit_price) : current.unit_price;

    let status: "In Stock" | "Low Stock" | "Out of Stock" = current.status;
    if (qty <= 0) status = "Out of Stock";
    else if (qty <= minStock) status = "Low Stock";
    else status = "In Stock";

    const updated: InventoryItem = {
      ...current,
      ...updates,
      quantity: qty,
      min_safety_stock: minStock,
      unit_price: unitPrice,
      total_valuation: qty * unitPrice,
      status,
    };

    this.inventory[index] = updated;
    return updated;
  }

  public adjustInventoryStock(id: number, adjustment: number, reason: string = "Manual Adjustment"): InventoryItem | null {
    const item = this.getInventoryById(id);
    if (!item) return null;

    const newQty = Math.max(0, item.quantity + adjustment);
    return this.updateInventoryItem(id, {
      quantity: newQty,
      last_restocked_at: adjustment > 0 ? new Date().toISOString().slice(0, 10) : item.last_restocked_at,
    });
  }

  public deleteInventoryItem(id: number): boolean {
    const index = this.inventory.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.inventory.splice(index, 1);
    return true;
  }

  public getInventoryAlerts(): { lowStockCount: number; outOfStockCount: number; totalValuation: number; items: InventoryItem[] } {
    const lowOrOut = this.inventory.filter((item) => item.status === "Low Stock" || item.status === "Out of Stock");
    const totalValuation = this.inventory.reduce((sum, item) => sum + item.total_valuation, 0);
    return {
      lowStockCount: this.inventory.filter((i) => i.status === "Low Stock").length,
      outOfStockCount: this.inventory.filter((i) => i.status === "Out of Stock").length,
      totalValuation,
      items: lowOrOut,
    };
  }

  // --- SUPPLIER METHODS ---
  public getSuppliers(): Supplier[] {
    return this.suppliers;
  }

  public getSupplierById(id: number): Supplier | undefined {
    return this.suppliers.find((s) => s.id === id);
  }

  public createSupplier(data: Partial<Supplier>): Supplier {
    const nextId = this.suppliers.length > 0 ? Math.max(...this.suppliers.map((s) => s.id)) + 1 : 1;
    const newSupplier: Supplier = {
      id: nextId,
      name: data.name || "New Supplier",
      contact_person: data.contact_person || "Contact Person",
      email: data.email || "supplier@email.com",
      phone: data.phone || "0900-000-0000",
      address: data.address || "Butuan City, Agusan del Norte",
      categories: data.categories || ["General Supplies"],
      rating: Number(data.rating) || 4.5,
      terms: data.terms || "Net 30 Days",
      status: data.status || "Active",
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }

  public updateSupplier(id: number, updates: Partial<Supplier>): Supplier | null {
    const index = this.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.suppliers[index] = { ...this.suppliers[index], ...updates };
    return this.suppliers[index];
  }

  public deleteSupplier(id: number): boolean {
    const index = this.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.suppliers.splice(index, 1);
    return true;
  }

  // --- WAREHOUSE METHODS ---
  public getWarehouses(): Warehouse[] {
    return this.warehouses;
  }

  public getWarehouseById(id: number): Warehouse | undefined {
    return this.warehouses.find((w) => w.id === id);
  }

  public createWarehouse(data: Partial<Warehouse>): Warehouse {
    const nextId = this.warehouses.length > 0 ? Math.max(...this.warehouses.map((w) => w.id)) + 1 : 1;
    const newWarehouse: Warehouse = {
      id: nextId,
      warehouse_name: data.warehouse_name || "New Warehouse Facility",
      warehouse_address: data.warehouse_address || data.location || "FSUU Campus",
      capacity_status: data.capacity_status || "Active - 50% Full",
      location: data.location || "FSUU Campus",
      custodian: data.custodian || "Property Officer",
      contact_no: data.contact_no || "Loc 100",
      status: data.status || "Active",
    };
    this.warehouses.push(newWarehouse);
    return newWarehouse;
  }

  public updateWarehouse(id: number, updates: Partial<Warehouse>): Warehouse | null {
    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) return null;
    this.warehouses[index] = { ...this.warehouses[index], ...updates };
    return this.warehouses[index];
  }

  public deleteWarehouse(id: number): boolean {
    const index = this.warehouses.findIndex((w) => w.id === id);
    if (index === -1) return false;
    this.warehouses.splice(index, 1);
    return true;
  }

  // --- DEPARTMENT METHODS ---
  public calculateDepartmentBudget(departmentId: number) {
    const dept = this.departments.find((d) => d.id === departmentId);
    if (!dept) return null;

    // Encumbered PRs (formal PRs submitted to Finance, approved, or pending executive authorization)
    const unencumberedStatuses = new Set([
      "Pending Canvass",
      "Ready for Canvass",
      "Bidding",
      "Canvassing / Bidding",
      "Seeking Bids",
      "Bid Awarded - Pending PR",
      "Winning Bid Selected",
      "Contested",
      "Draft",
      "Draft PR",
      "New Purchase Request",
      "Rejected",
      "Cancelled",
    ]);

    const encumberedPRs = this.purchaseRequests
      .filter((pr) => pr.department_id === departmentId && !pr.po_id && !unencumberedStatuses.has(pr.status as string))
      .reduce((sum, pr) => sum + (Number(pr.total_amount) || 0), 0);

    // Committed active POs (POs not yet Fully Received or Cancelled)
    const activePOs = this.purchaseOrders.filter(
      (po) => po.department_id === departmentId && po.status !== "Fully Received" && po.status !== "Cancelled"
    );
    const committedPOs = activePOs.reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0);

    // Completed POs utilized
    const completedPOs = this.purchaseOrders.filter(
      (po) => po.department_id === departmentId && po.status === "Fully Received"
    );
    const completedPOUtilized = completedPOs.reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0);

    const allocated = Number(dept.allocated_amount) || 0;
    const baseUtilized = Number(dept.utilized_amount) || 0;
    const totalUtilized = Math.max(baseUtilized, completedPOUtilized);
    const totalEncumbered = encumberedPRs + committedPOs;
    const remainingBalance = Math.max(0, allocated - (totalEncumbered + totalUtilized));
    const burnRatePercent = allocated > 0 ? Math.min(100, Math.round(((totalEncumbered + totalUtilized) / allocated) * 100)) : 0;

    return {
      department_id: dept.id,
      department_name: dept.name,
      department_code: dept.code,
      allocated_budget: allocated,
      encumbered_prs: encumberedPRs,
      committed_pos: committedPOs,
      total_encumbered: totalEncumbered,
      utilized_funds: totalUtilized,
      remaining_balance: remainingBalance,
      burn_rate_percent: burnRatePercent,
      is_over_budget: (totalEncumbered + totalUtilized) > allocated,
    };
  }

  public getDepartments(): (Department & { encumbered_funds: number; burn_rate_percent: number })[] {
    return this.departments.map((dept) => {
      const budget = this.calculateDepartmentBudget(dept.id);
      const remaining = budget ? budget.remaining_balance : dept.remaining_balance;
      const utilized = budget ? budget.utilized_funds : dept.utilized_amount;
      const allocated = budget ? budget.allocated_budget : dept.allocated_amount;
      return {
        ...dept,
        allocated_amount: allocated,
        remaining_balance: remaining,
        utilized_amount: utilized,
        budget_allocated: allocated,
        budget_remaining: remaining,
        budget_utilized: utilized,
        encumbered_funds: budget ? budget.total_encumbered : 0,
        burn_rate_percent: budget ? budget.burn_rate_percent : 0,
      };
    });
  }

  public getDepartmentById(id: number): Department | undefined {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) return undefined;
    const budget = this.calculateDepartmentBudget(dept.id);
    return {
      ...dept,
      allocated_amount: budget ? budget.allocated_budget : dept.allocated_amount,
      remaining_balance: budget ? budget.remaining_balance : dept.remaining_balance,
      utilized_amount: budget ? budget.utilized_funds : dept.utilized_amount,
      budget_allocated: budget ? budget.allocated_budget : dept.allocated_amount,
      budget_remaining: budget ? budget.remaining_balance : dept.remaining_balance,
      budget_utilized: budget ? budget.utilized_funds : dept.utilized_amount,
    };
  }

  public createDepartment(data: Partial<Department>): Department {
    const nextId = this.departments.length > 0 ? Math.max(...this.departments.map((d) => d.id)) + 1 : 1;
    const allocated = Number(data.allocated_amount ?? data.budget_allocated) || 0;
    const code = (data.code || (data.name ? data.name.slice(0, 4) : `DEPT-${nextId}`)).toUpperCase().trim();
    const newDept: Department = {
      id: nextId,
      name: (data.name || "New Department").trim(),
      code,
      head: (data.head || "Department Dean / Head").trim(),
      allocated_amount: allocated,
      utilized_amount: 0,
      remaining_balance: allocated,
      budget_allocated: allocated,
      budget_utilized: 0,
      budget_remaining: allocated,
    };
    this.departments.push(newDept);
    return newDept;
  }

  public updateDepartment(id: number, updates: Partial<Department>): Department | null {
    const index = this.departments.findIndex((d) => d.id === id);
    if (index === -1) return null;
    const current = this.departments[index];
    const allocated = updates.allocated_amount !== undefined
      ? Number(updates.allocated_amount)
      : (updates.budget_allocated !== undefined ? Number(updates.budget_allocated) : current.allocated_amount);
    const utilized = updates.utilized_amount !== undefined
      ? Number(updates.utilized_amount)
      : (updates.budget_utilized !== undefined ? Number(updates.budget_utilized) : current.utilized_amount);
    const remaining = Math.max(0, allocated - utilized);
    this.departments[index] = {
      ...current,
      ...updates,
      allocated_amount: allocated,
      utilized_amount: utilized,
      remaining_balance: remaining,
      budget_allocated: allocated,
      budget_utilized: utilized,
      budget_remaining: remaining,
    };
    return this.departments[index];
  }

  public deleteDepartment(id: number): boolean {
    const index = this.departments.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.departments.splice(index, 1);
    return true;
  }

  // --- ITEM RELEASES / DISPATCH METHODS ---
  public getItemReleases(): ItemRelease[] {
    return this.itemReleases.map((r) => {
      const dept = this.departments.find((d) => d.id === r.department_id);
      return {
        ...r,
        department_name: dept ? dept.name : (r.department_name || `Department #${r.department_id}`),
      };
    });
  }

  public getItemReleaseById(id: number): ItemRelease | undefined {
    const r = this.itemReleases.find((item) => item.id === id);
    if (!r) return undefined;
    const dept = this.departments.find((d) => d.id === r.department_id);
    return {
      ...r,
      department_name: dept ? dept.name : (r.department_name || `Department #${r.department_id}`),
    };
  }

  public createItemRelease(data: Partial<ItemRelease>): ItemRelease {
    const nextId = this.itemReleases.length > 0 ? Math.max(...this.itemReleases.map((r) => r.id)) + 1 : 1;
    const releaseNo = `REL-2026-00${nextId > 9 ? nextId : `0${nextId}`}`;
    const deptId = Number(data.department_id) || 1;
    const foundDept = this.departments.find((d) => d.id === deptId);
    const departmentName = foundDept ? foundDept.name : (data.department_name || "Department");

    const newRelease: ItemRelease = {
      id: nextId,
      release_no: releaseNo,
      department_id: deptId,
      department_name: departmentName,
      requested_by: data.requested_by || "Staff Requester",
      item_name: data.item_name || "Requested Item",
      quantity: Number(data.quantity) || 1,
      unit: data.unit || "Units",
      warehouse_id: Number(data.warehouse_id) || 1,
      warehouse_name: data.warehouse_name || "PMO Central Depot (Main Campus)",
      purpose: data.purpose || "Official Departmental Use",
      request_date: data.request_date || new Date().toISOString().slice(0, 10),
      status: data.status || "Pending Dispatch",
      notes: data.notes || "",
    };
    this.itemReleases.unshift(newRelease);
    return newRelease;
  }

  public dispatchItemRelease(id: number): ItemRelease | null {
    const release = this.getItemReleaseById(id);
    if (!release) return null;
    release.status = "Dispatched";

    // Deduct stock from inventory if matching item exists
    const inv = this.inventory.find(
      (item) => item.product_name.toLowerCase().trim() === release.item_name.toLowerCase().trim()
    );
    if (inv && inv.quantity >= release.quantity) {
      inv.quantity -= release.quantity;
      inv.total_valuation = inv.quantity * inv.unit_price;
      inv.status = inv.quantity <= 0 ? "Out of Stock" : (inv.quantity <= inv.min_safety_stock ? "Low Stock" : "In Stock");
    }

    return release;
  }

  // --- DASHBOARD & ANALYTICS METHODS ---
  public getDashboardMetrics() {
    const activeCanvasses = this.canvasses.filter(
      (c) => c.status !== "Rejected" && c.status !== "Approved"
    );
    const draftCanvasses = activeCanvasses.filter((c) => c.status === "Draft").length;
    const seekingBids = activeCanvasses.filter((c) => c.status === "Seeking Bids").length;
    const underReview = activeCanvasses.filter((c) => c.status === "Under Review").length;
    const winningBidSelected = activeCanvasses.filter((c) => c.status === "Winning Bid Selected").length;

    const pendingPRs = this.purchaseRequests.filter(
      (pr) => pr.status !== "Approved PR" && pr.status !== "Rejected"
    );
    const totalEncumberedValue = pendingPRs.reduce((sum, pr) => sum + (Number(pr.total_amount) || 0), 0);

    const activePOs = this.purchaseOrders.filter(
      (po) => po.status !== "Fully Received" && po.status !== "Cancelled"
    );
    const totalCommittedSpend = activePOs.reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0);

    const pendingReleases = this.itemReleases.filter(
      (r) => r.status === "Pending Dispatch" || r.status === "Ready for Pickup"
    );

    const criticalItems = this.inventory.filter((i) => i.quantity <= i.min_safety_stock);

    const financeReviews = this.getFinanceReviews();
    const activeFinanceReviews = financeReviews.filter((f) => f.finance_status !== "Finance Approved");

    return {
      activeCanvasses: {
        total: activeCanvasses.length,
        draft: draftCanvasses,
        seekingBids,
        underReview,
        winningBidSelected,
      },
      purchaseRequests: {
        total: pendingPRs.length,
        totalEncumberedValue,
      },
      activePurchaseOrders: {
        total: activePOs.length,
        totalCommittedSpend,
        breakdown: {
          draft: activePOs.filter((p) => p.status === "Draft").length,
          sentToSupplier: activePOs.filter((p) => p.status === "Sent to Supplier").length,
          inTransit: activePOs.filter((p) => p.status === "In Transit").length,
          partiallyReceived: activePOs.filter((p) => p.status === "Partially Received").length,
        },
      },
      pendingItemReleases: {
        total: pendingReleases.length,
        items: pendingReleases,
      },
      pipelineStages: {
        canvassing: activeCanvasses.length,
        financeClearance: activeFinanceReviews.length,
        poInTransit: this.purchaseOrders.filter((p) => p.status === "In Transit" || p.status === "Sent to Supplier").length,
        orderReceived: this.purchaseOrders.filter((p) => p.status === "Fully Received" || p.status === "Partially Received").length,
      },
      criticalInventory: {
        count: criticalItems.length,
        items: criticalItems,
      },
    };
  }

  public getBudgetBurnRate() {
    return this.departments.map((dept) => {
      // Find committed POs
      const deptPOs = this.purchaseOrders.filter(
        (po) => po.department_id === dept.id && po.status !== "Cancelled"
      );

      // Active / in-progress PO encumbrance
      const encumbered = deptPOs
        .filter((po) => po.status !== "Fully Received")
        .reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0);

      const allocated = Number(dept.allocated_amount) || 0;
      const utilized = Number(dept.utilized_amount) || 0;
      const remaining = Math.max(0, allocated - utilized - encumbered);
      const totalCommitted = utilized + encumbered;
      const burnRatePercent = allocated > 0 ? Math.min(100, Math.round((totalCommitted / allocated) * 100)) : 0;
      const isHighBurn = burnRatePercent >= 85;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        head: dept.head,
        allocated,
        utilized,
        encumbered,
        remaining,
        burnRatePercent,
        isHighBurn,
      };
    });
  }

  // --- PERMISSIONS & RBAC METHODS ---

  public resolveRoleId(roleIdOrName: number | string): number {
    if (typeof roleIdOrName === "number") return roleIdOrName;
    const num = parseInt(roleIdOrName, 10);
    if (!isNaN(num) && num > 0) return num;

    const normalized = String(roleIdOrName).toLowerCase().trim();
    if (normalized.includes("super admin") || normalized === "superadmin" || normalized === "super_admin") return 1;
    if (normalized.includes("pmo") || normalized.includes("vpasa") || normalized.includes("admin")) return 2;
    if (normalized.includes("staff") || normalized.includes("warehouse")) return 3;
    if (normalized.includes("dept") || normalized.includes("department")) return 4;
    if (normalized.includes("finance") || normalized.includes("accounting")) return 5;
    return 2; // Default to Admin
  }

  public getRolePermissions(roleIdOrName: number | string): { role: SystemRole; permissions: ModulePermission[] } {
    const roleId = this.resolveRoleId(roleIdOrName);
    const role = SYSTEM_ROLES.find((r) => r.id === roleId) || SYSTEM_ROLES[1];
    let perms = this.rolePermissions[roleId];
    if (!perms || perms.length === 0) {
      perms = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[roleId] || DEFAULT_ROLE_PERMISSIONS[2]));
      this.rolePermissions[roleId] = perms;
    }
    return {
      role,
      permissions: perms,
    };
  }

  public updateRolePermissions(
    roleIdOrName: number | string,
    updatedPermissions: Partial<ModulePermission>[]
  ): { role: SystemRole; permissions: ModulePermission[] } {
    const roleId = this.resolveRoleId(roleIdOrName);
    const role = SYSTEM_ROLES.find((r) => r.id === roleId) || SYSTEM_ROLES[1];
    const current = this.getRolePermissions(roleId).permissions;

    const updated = current.map((p) => {
      const match = updatedPermissions.find(
        (u) =>
          (u.module_key && u.module_key === p.module_key) ||
          (u.module_code && u.module_code === p.module_code) ||
          (u.id && u.id === p.id)
      );
      if (match) {
        return {
          ...p,
          can_view: typeof match.can_view === "boolean" ? match.can_view : p.can_view,
          can_create: typeof match.can_create === "boolean" ? match.can_create : p.can_create,
          can_edit: typeof match.can_edit === "boolean" ? match.can_edit : p.can_edit,
          can_delete: typeof match.can_delete === "boolean" ? match.can_delete : p.can_delete,
        };
      }
      return p;
    });

    this.rolePermissions[roleId] = updated;
    return {
      role,
      permissions: updated,
    };
  }

  // ==========================================
  // UNIFIED SINGLE SOURCE OF TRUTH (SSoT) METHODS
  // Synchronizes 6-stage pipeline:
  // Stage 1: Request for Canvass (Pending Canvass)
  // Stage 2: Canvassing & Sourcing -> Bid Awarded - Pending PR
  // Stage 3: Purchase Request Drafting (or Contested) -> Pending Finance Approval
  // Stage 4: Finance Approval -> Finance Approved - Pending VPASA
  // Stage 5: Final Authorization (VPASA) -> Ready for PO
  // Stage 6: Purchase Order Generation -> PO Issued
  // ==========================================

  public getUnifiedRecords(): UnifiedProcurementRecord[] {
    const records: UnifiedProcurementRecord[] = [];
    const processedCanvassIds = new Set<number>();

    for (const pr of this.purchaseRequests) {
      const linkedCanvass = pr.canvass_id
        ? this.canvasses.find((c) => c.id === pr.canvass_id)
        : this.canvasses.find((c) => c.pr_id === pr.id || c.pr_no === pr.pr_no);

      if (linkedCanvass) {
        processedCanvassIds.add(linkedCanvass.id);
      }

      const linkedPO = pr.po_id
        ? this.purchaseOrders.find((p) => p.id === pr.po_id)
        : (linkedCanvass?.po_id ? this.purchaseOrders.find((p) => p.id === linkedCanvass.po_id) : null);

      const winningBidId = linkedCanvass?.winning_bid_id || pr.winning_bid_id;
      const winningBid = linkedCanvass?.supplier_bids?.find((b) => b.id === winningBidId);

      // Determine authoritative unified pipeline status (Strict 6-Stage sequence)
      let unifiedStatus: string = pr.status;
      if (
        pr.status === "Approved PR" ||
        pr.status === "Purchase Order Issued" ||
        pr.status === "PO Issued" ||
        linkedPO ||
        linkedCanvass?.status === "PO Issued"
      ) {
        unifiedStatus = "PO Issued";
      } else if (pr.status === "Ready for PO" || linkedCanvass?.status === "Ready for PO") {
        unifiedStatus = "Ready for PO";
      } else if (
        pr.status === "Finance Approved - Pending VPASA" ||
        linkedCanvass?.status === "Finance Approved - Pending VPASA"
      ) {
        unifiedStatus = "Finance Approved - Pending VPASA";
      } else if (
        pr.status === "Pending Finance Approval" ||
        pr.status === "Budget Review" ||
        linkedCanvass?.status === "Pending Finance Approval"
      ) {
        unifiedStatus = "Pending Finance Approval";
      } else if (
        pr.status === "Needs Revision" ||
        linkedCanvass?.status === "Needs Revision"
      ) {
        unifiedStatus = "Needs Revision";
      } else if (pr.status === "Contested" || linkedCanvass?.status === "Contested") {
        unifiedStatus = "Contested";
      } else if (
        pr.status === "Bid Awarded - Pending PR" ||
        linkedCanvass?.status === "Bid Awarded - Pending PR" ||
        linkedCanvass?.status === "Winning Bid Selected"
      ) {
        unifiedStatus = "Bid Awarded - Pending PR";
      } else if (
        pr.status === "Bidding" ||
        linkedCanvass?.status === "Bidding" ||
        linkedCanvass?.status === "Canvassing / Bidding" ||
        linkedCanvass?.status === "Seeking Bids"
      ) {
        unifiedStatus = "Bidding";
      } else if (
        pr.status === "Pending Canvass" ||
        linkedCanvass?.status === "Pending Canvass" ||
        pr.status === "Ready for Canvass" ||
        pr.status === "Draft" ||
        pr.status === "Draft PR" ||
        pr.status === "New Purchase Request" ||
        pr.status === "Submitted PR"
      ) {
        unifiedStatus = "Pending Canvass";
      }

      records.push({
        id: pr.id,
        pr_id: pr.id,
        pr_no: pr.pr_no,
        canvass_id: linkedCanvass?.id || pr.canvass_id || null,
        canvass_no: linkedCanvass?.canvass_no || pr.canvass_no || null,
        po_id: linkedPO?.id || pr.po_id || null,
        po_no: linkedPO?.po_no || pr.po_no || null,
        title: pr.title || linkedCanvass?.title || "Requisition",
        purpose: pr.purpose || pr.title,
        pr_type: pr.pr_type || "Goods (Inventoriable)",
        sub_category: pr.sub_category || "Office & Laboratory Supplies",
        department_id: pr.department_id,
        department_name: pr.department_name,
        requested_by: pr.requested_by,
        priority: pr.priority || "Normal",
        status: unifiedStatus,
        items: pr.items?.map((it) => ({
          id: it.id,
          item_name: it.item_name,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          estimated_unit_cost: it.estimated_unit_cost,
          total_estimated_cost: it.total_estimated_cost || (it.quantity * it.estimated_unit_cost),
        })) || [],
        total_amount: pr.total_amount || 0,
        total_estimated_budget: pr.total_estimated_budget || pr.total_amount,
        notes: pr.notes || "",
        supplier_bids: linkedCanvass?.supplier_bids || [],
        winning_bid_id: winningBidId || null,
        winning_bid_amount: winningBid?.bid_amount || pr.winning_bid_amount || linkedCanvass?.winning_bid_amount || null,
        supplier_id: winningBid?.supplier_id || pr.supplier_id || linkedPO?.supplier_id || null,
        supplier_name: winningBid?.supplier_name || pr.supplier_name || linkedPO?.supplier_name || null,
        awarded_supplier_name: winningBid?.supplier_name || pr.supplier_name || linkedPO?.supplier_name || null,
        awarded_amount: winningBid?.bid_amount || pr.total_amount || linkedPO?.total_amount || null,
        payment_terms: winningBid?.payment_terms || linkedPO?.payment_terms || "Net 30 Days",
        delivery_date: winningBid?.delivery_date || linkedPO?.delivery_date || undefined,
        warehouse_id: linkedPO?.warehouse_id || 1,
        warehouse_name: linkedPO?.warehouse_name || "Main Campus Central Supply Warehouse",
        finance_approved_at: pr.finance_approved_at || linkedCanvass?.finance_approved_at || null,
        finance_approved_by: pr.finance_approved_by || linkedCanvass?.finance_approved_by || null,
        vpasa_authorized_at: pr.vpasa_authorized_at || linkedCanvass?.vpasa_authorized_at || null,
        vpasa_authorized_by: pr.vpasa_authorized_by || linkedCanvass?.vpasa_authorized_by || null,
        contest_justification: pr.contest_justification || linkedCanvass?.contest_justification || null,
        revision_remarks: pr.revision_remarks || null,
        revision_requested_at: pr.revision_requested_at || null,
        revision_requested_by: pr.revision_requested_by || null,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        attachments: pr.attachments || linkedCanvass?.attachments || [],
        trail: pr.trail || linkedCanvass?.trail || [],
      });
    }

    // Also include any standalone Canvasses (RFQ created by department before formal PR drafting)
    for (const canvass of this.canvasses) {
      if (processedCanvassIds.has(canvass.id)) continue;

      const winningBid = canvass.supplier_bids?.find((b) => b.id === canvass.winning_bid_id);
      let unifiedStatus: string = canvass.status;
      if (canvass.status === "PO Issued" || canvass.status === "Purchase Order Issued") {
        unifiedStatus = "PO Issued";
      } else if (canvass.status === "Ready for PO") {
        unifiedStatus = "Ready for PO";
      } else if (canvass.status === "Finance Approved - Pending VPASA") {
        unifiedStatus = "Finance Approved - Pending VPASA";
      } else if (canvass.status === "Pending Finance Approval") {
        unifiedStatus = "Pending Finance Approval";
      } else if (canvass.status === "Needs Revision") {
        unifiedStatus = "Needs Revision";
      } else if (canvass.status === "Contested") {
        unifiedStatus = "Contested";
      } else if (canvass.status === "Bid Awarded - Pending PR" || canvass.status === "Winning Bid Selected") {
        unifiedStatus = "Bid Awarded - Pending PR";
      } else if (canvass.status === "Bidding" || canvass.status === "Canvassing / Bidding" || canvass.status === "Seeking Bids") {
        unifiedStatus = "Bidding";
      } else {
        unifiedStatus = "Pending Canvass";
      }

      records.push({
        id: canvass.id + 10000,
        pr_id: canvass.pr_id || null,
        pr_no: canvass.pr_no || `RFQ-PR-${canvass.id}`,
        canvass_id: canvass.id,
        canvass_no: canvass.canvass_no,
        po_id: canvass.po_id || null,
        po_no: canvass.po_no || null,
        title: canvass.title || "Request for Canvass",
        purpose: canvass.notes || canvass.title,
        pr_type: "Goods (Inventoriable)",
        sub_category: "Office & Laboratory Supplies",
        department_id: canvass.department_id,
        department_name: canvass.department_name,
        requested_by: canvass.requested_by,
        priority: (canvass.priority as any) || "Normal",
        status: unifiedStatus,
        items: canvass.items?.map((it) => ({
          id: it.id,
          item_name: it.item_name,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          estimated_unit_cost: it.estimated_unit_cost,
          total_estimated_cost: it.total_estimated_cost || (it.quantity * it.estimated_unit_cost),
        })) || [],
        total_amount: canvass.total_estimated_budget || 0,
        total_estimated_budget: canvass.total_estimated_budget || 0,
        notes: canvass.notes || "",
        supplier_bids: canvass.supplier_bids || [],
        winning_bid_id: canvass.winning_bid_id || null,
        winning_bid_amount: winningBid?.bid_amount || canvass.winning_bid_amount || null,
        supplier_id: winningBid?.supplier_id || null,
        supplier_name: winningBid?.supplier_name || null,
        awarded_supplier_name: winningBid?.supplier_name || null,
        awarded_amount: winningBid?.bid_amount || null,
        payment_terms: winningBid?.payment_terms || "Net 30 Days",
        delivery_date: winningBid?.delivery_date || undefined,
        warehouse_id: 1,
        warehouse_name: "Main Campus Central Supply Warehouse",
        finance_approved_at: canvass.finance_approved_at || null,
        finance_approved_by: canvass.finance_approved_by || null,
        vpasa_authorized_at: canvass.vpasa_authorized_at || null,
        vpasa_authorized_by: canvass.vpasa_authorized_by || null,
        contest_justification: canvass.contest_justification || null,
        created_at: canvass.created_at,
        updated_at: canvass.updated_at,
        attachments: canvass.attachments || [],
        trail: canvass.trail || [],
      });
    }

    return records;
  }

  public getUnifiedRecordById(id: number): UnifiedProcurementRecord | null {
    const all = this.getUnifiedRecords();
    return all.find((r) => r.id === id || r.pr_id === id || r.canvass_id === id) || null;
  }

  // Stage 1: Department creates a "Request for Canvass" (RFQ) -> Initial status: "Pending Canvass"
  public createUnifiedRFQ(data: any): UnifiedProcurementRecord {
    return this.createUnifiedPR(data);
  }

  public createUnifiedPR(data: any): UnifiedProcurementRecord {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    const newCanvass = this.createCanvass({
      title: data.title || data.purpose || "Request for Canvass",
      department_id: Number(data.department_id) || 1,
      department_name: data.department_name || "Department",
      requested_by: data.requested_by || "Department Requester",
      priority: data.priority || "Medium",
      status: "Pending Canvass",
      total_estimated_budget: Number(data.total_amount) || Number(data.total_estimated_budget) || 0,
      notes: data.notes || data.purpose || "",
      items: (data.items || []).map((it: any, idx: number) => ({
        id: 2000 + Date.now() % 10000 + idx,
        item_name: it.item_name,
        description: it.description || "",
        quantity: Number(it.quantity) || 1,
        unit: it.unit || "Pieces",
        estimated_unit_cost: Number(it.estimated_unit_cost) || 0,
        total_estimated_cost: (Number(it.quantity) || 1) * (Number(it.estimated_unit_cost) || 0),
      })),
      supplier_bids: [],
    });

    const createdPr = this.createPurchaseRequest({
      ...data,
      canvass_id: newCanvass.id,
      canvass_no: newCanvass.canvass_no,
      status: "Pending Canvass",
    });

    newCanvass.pr_id = createdPr.id;
    newCanvass.pr_no = createdPr.pr_no;
    this.saveToStorage();

    return this.getUnifiedRecordById(createdPr.id)!;
  }

  // Stage 2: Canvassing & Sourcing -> VPASA/PMO awards winning bid -> status: "Bid Awarded - Pending PR"
  public awardBidUnified(id: number, bidId: number, supplierDetails?: any): UnifiedProcurementRecord | null {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass) {
      pr = canvass.pr_id ? this.getPurchaseRequestById(canvass.pr_id) : null;
    }

    const bid = canvass?.supplier_bids?.find((b) => b.id === bidId);
    const supplierName = supplierDetails?.supplier_name || bid?.supplier_name || "Awarded Vendor";
    const bidAmount = Number(supplierDetails?.bid_amount) || Number(bid?.bid_amount) || (pr ? pr.total_amount : 0);

    if (canvass) {
      canvass.winning_bid_id = bidId;
      canvass.winning_bid_amount = bidAmount;
      canvass.status = "Bid Awarded - Pending PR";
      canvass.contest_justification = null;
      canvass.updated_at = nowStr;
      if (canvass.supplier_bids) {
        canvass.supplier_bids.forEach((b) => {
          b.status = b.id === bidId ? "approved" : "rejected";
        });
      }
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        id: `tr-${Date.now()}`,
        status: "Bid Awarded - Pending PR",
        stage: "Canvassing",
        actor: "PMO / Canvassing Committee",
        notes: `Winning bid awarded to ${supplierName} for ₱${bidAmount.toLocaleString()}. Waiting for department formal PR drafting.`,
        created_at: nowStr,
      });
    }

    if (pr) {
      pr.status = "Bid Awarded - Pending PR";
      pr.winning_bid_id = bidId;
      pr.supplier_name = supplierName;
      pr.total_amount = bidAmount;
      pr.contest_justification = null;
      pr.updated_at = nowStr;
      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        id: `tr-${Date.now()}`,
        status: "Bid Awarded - Pending PR",
        stage: "Canvassing",
        actor: "PMO / Canvassing Committee",
        notes: `Winning quotation selected from ${supplierName} (₱${bidAmount.toLocaleString()}). Ready for department to draft formal PR.`,
        created_at: nowStr,
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : (canvass?.id || id));
  }

  // Stage 3 Flow A: Contest/Reject Awarded Bid -> status: "Contested" + justification
  public contestBidUnified(id: number, justification: string, contestedBy?: string): UnifiedProcurementRecord | null {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass) {
      pr = canvass.pr_id ? this.getPurchaseRequestById(canvass.pr_id) : null;
    }

    const remarks = justification || "Department contested the awarded bid. Re-canvass or supplier specification review required.";

    if (canvass) {
      canvass.status = "Contested";
      canvass.contest_justification = remarks;
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        id: `tr-${Date.now()}`,
        status: "Contested",
        stage: "Purchase Request Drafting",
        actor: contestedBy || "Department Representative",
        notes: `Awarded bid contested: ${remarks}`,
        created_at: nowStr,
      });
    }

    if (pr) {
      pr.status = "Contested";
      pr.contest_justification = remarks;
      pr.updated_at = nowStr;
      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        id: `tr-${Date.now()}`,
        status: "Contested",
        stage: "Purchase Request Drafting",
        actor: contestedBy || "Department Representative",
        notes: `Awarded bid contested: ${remarks}`,
        created_at: nowStr,
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : (canvass?.id || id));
  }

  // Stage 3 Flow B: Department Submits Formal PR -> status: "Pending Finance Approval"
  public submitPRFromBidUnified(id: number, prDetails?: any, submittedBy?: string): UnifiedProcurementRecord | null {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass) {
      pr = canvass.pr_id ? this.getPurchaseRequestById(canvass.pr_id) : null;
    }

    if (canvass) {
      canvass.status = "Pending Finance Approval";
      canvass.pr_submitted_at = nowStr;
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        id: `tr-${Date.now()}`,
        status: "Pending Finance Approval",
        stage: "Purchase Request Drafting",
        actor: submittedBy || pr?.requested_by || "Department Head",
        notes: `Formal Purchase Request drafted from winning bid and submitted to Finance for budget clearance.`,
        created_at: nowStr,
      });
    }

    if (pr) {
      pr.status = "Pending Finance Approval";
      pr.pr_submitted_at = nowStr;
      if (prDetails?.notes) pr.notes = prDetails.notes;
      pr.updated_at = nowStr;
      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        id: `tr-${Date.now()}`,
        status: "Pending Finance Approval",
        stage: "Purchase Request Drafting",
        actor: submittedBy || pr.requested_by,
        notes: `Formal Purchase Request drafted from winning bid and submitted to Finance for budget clearance.`,
        created_at: nowStr,
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : (canvass?.id || id));
  }

  // Stage 4: Finance Reviews Budget against Awarded Bid -> status: "Finance Approved - Pending VPASA"
  public approveFinanceUnified(id: number, approver?: string, remarks?: string): UnifiedProcurementRecord | null {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass) {
      pr = canvass.pr_id ? this.getPurchaseRequestById(canvass.pr_id) : null;
    }

    const approverName = approver || "Finance Officer";
    const note = remarks || "Budget balance verified and cleared against department allocation.";

    if (pr) {
      pr.status = "Finance Approved - Pending VPASA";
      pr.finance_approved_at = nowStr;
      pr.finance_approved_by = approverName;
      pr.updated_at = nowStr;

      // Encumber budget from department
      const dept = this.getDepartmentById(pr.department_id);
      if (dept) {
        dept.encumbered_amount = (dept.encumbered_amount || 0) + pr.total_amount;
        dept.remaining_balance = Math.max(0, dept.allocated_amount - (dept.utilized_amount || 0) - dept.encumbered_amount);
        dept.budget_remaining = dept.remaining_balance;
        dept.budget_encumbered = dept.encumbered_amount;
      }

      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        id: `tr-${Date.now()}`,
        status: "Finance Approved - Pending VPASA",
        stage: "Finance Verification",
        actor: approverName,
        notes: `Finance Gatekeeper budget approved. Forwarded to VPASA for final executive authorization. ${note}`,
        created_at: nowStr,
      });
    }

    if (canvass) {
      canvass.status = "Finance Approved - Pending VPASA";
      canvass.finance_approved_at = nowStr;
      canvass.finance_approved_by = approverName;
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        id: `tr-${Date.now()}`,
        status: "Finance Approved - Pending VPASA",
        stage: "Finance Verification",
        actor: approverName,
        notes: `Finance clearance granted. Forwarded to VPASA for final authorization.`,
        created_at: nowStr,
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : (canvass?.id || id));
  }

  // Stage 5: Final Authorization (VPASA) -> status: "Ready for PO"
  public authorizeVPASAUnified(id: number, approver?: string, remarks?: string): UnifiedProcurementRecord | null {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass) {
      pr = canvass.pr_id ? this.getPurchaseRequestById(canvass.pr_id) : null;
    }

    const vpasaName = approver || "Vice President for Administration & Student Affairs (VPASA)";

    if (pr) {
      pr.status = "Ready for PO";
      pr.vpasa_authorized_at = nowStr;
      pr.vpasa_authorized_by = vpasaName;
      pr.updated_at = nowStr;
      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        id: `tr-${Date.now()}`,
        status: "Ready for PO",
        stage: "Final Authorization",
        actor: vpasaName,
        notes: `VPASA executive authorization signed. Requisition is now ready for Purchase Order generation. ${remarks || ""}`,
        created_at: nowStr,
      });
    }

    if (canvass) {
      canvass.status = "Ready for PO";
      canvass.vpasa_authorized_at = nowStr;
      canvass.vpasa_authorized_by = vpasaName;
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        id: `tr-${Date.now()}`,
        status: "Ready for PO",
        stage: "Final Authorization",
        actor: vpasaName,
        notes: `VPASA executive authorization signed. Record ready for Purchase Order generation.`,
        created_at: nowStr,
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : (canvass?.id || id));
  }

  public requestRevisionUnified(id: number, remarks: string, approver?: string): UnifiedProcurementRecord | null {
    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass?.pr_id) {
      pr = this.getPurchaseRequestById(canvass.pr_id);
    }
    if (!pr && !canvass) return null;

    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (pr) {
      pr.status = "Needs Revision";
      pr.revision_remarks = remarks || "Budget or specification revision requested by Finance Office.";
      pr.revision_requested_at = nowStr;
      pr.revision_requested_by = approver || "Finance Officer";
      pr.updated_at = nowStr;
      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        stage: "Stage 4: Finance Review",
        action: "Revision Requested by Finance",
        actor: approver || "Finance Officer",
        role: "Finance Officer",
        timestamp: nowStr,
        created_at: nowStr,
        notes: remarks || "Revision requested.",
      });
    }

    if (canvass) {
      canvass.status = "Needs Revision";
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        stage: "Stage 4: Finance Review",
        action: "Revision Requested by Finance",
        actor: approver || "Finance Officer",
        role: "Finance Officer",
        timestamp: nowStr,
        created_at: nowStr,
        notes: remarks || "Revision requested.",
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : canvass!.id);
  }

  public resubmitPurchaseRequest(id: number, notes?: string, actor?: string): UnifiedProcurementRecord | null {
    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass?.pr_id) {
      pr = this.getPurchaseRequestById(canvass.pr_id);
    }
    if (!pr && !canvass) return null;

    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (pr) {
      pr.status = "Pending Finance Approval";
      if (notes) {
        pr.notes = (pr.notes ? pr.notes + "\n[Resubmission]: " : "") + notes;
      }
      pr.updated_at = nowStr;
      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        stage: "Stage 3: PR Resubmission",
        action: "PR Resubmitted after Revision",
        actor: actor || pr.requested_by || "Department Requester",
        role: "Department",
        timestamp: nowStr,
        created_at: nowStr,
        notes: notes || "Resubmitted with requested revisions.",
      });
    }

    if (canvass) {
      canvass.status = "Pending Finance Approval";
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        stage: "Stage 3: PR Resubmission",
        action: "PR Resubmitted after Revision",
        actor: actor || (pr ? pr.requested_by : canvass.requested_by) || "Department Requester",
        role: "Department",
        timestamp: nowStr,
        created_at: nowStr,
        notes: notes || "Resubmitted with requested revisions.",
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : canvass!.id);
  }

  // Stage 6: Purchase Order Generation -> status: "PO Issued"
  public generatePOUnified(id: number, poData?: any): { record: UnifiedProcurementRecord; po: PurchaseOrder } | null {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass) {
      pr = canvass.pr_id ? this.getPurchaseRequestById(canvass.pr_id) : null;
    }
    if (!pr) return null;

    const supplierName = poData?.supplier_name || pr.supplier_name || canvass?.winning_bid_amount ? canvass?.supplier_bids?.find(b => b.id === canvass.winning_bid_id)?.supplier_name : "Awarded Vendor";
    const totalAmount = Number(poData?.total_amount) || pr.total_amount || 0;
    const warehouse = this.warehouses[0];

    const newPO = this.createPurchaseOrder({
      canvass_id: pr.canvass_id,
      canvass_no: pr.canvass_no,
      pr_id: pr.id,
      pr_no: pr.pr_no,
      winning_bid_id: pr.winning_bid_id,
      supplier_id: pr.supplier_id || 1,
      supplier_name: supplierName || "Awarded Vendor",
      supplier_email: poData?.supplier_email || "supplier@vendor.ph",
      supplier_phone: poData?.supplier_phone || "(085) 342-8812",
      total_amount: totalAmount,
      payment_terms: poData?.payment_terms || "Net 30 Days",
      delivery_date: poData?.delivery_date || nowStr.split(" ")[0],
      status: "Sent to Supplier",
      warehouse_id: poData?.warehouse_id || warehouse.id,
      warehouse_name: warehouse.warehouse_name,
      items: (pr.items || []).map((it, idx) => ({
        id: 3000 + pr.id * 10 + idx,
        item_name: it.item_name,
        description: it.description || "",
        quantity: it.quantity,
        received_quantity: 0,
        unit: it.unit,
        unit_price: it.estimated_unit_cost,
        total_price: it.estimated_unit_cost * it.quantity,
      })),
      notes: poData?.notes || `Official Purchase Order generated for ${pr.pr_no}: ${pr.title}.`,
      attachments: pr.attachments || [],
    });

    pr.status = "PO Issued";
    pr.po_id = newPO.id;
    pr.po_no = newPO.po_no;
    pr.updated_at = nowStr;
    if (!pr.trail) pr.trail = [];
    pr.trail.push({
      id: `tr-${Date.now()}`,
      status: "PO Issued",
      stage: "Purchase Order",
      actor: "Purchasing Officer",
      notes: `Purchase Order ${newPO.po_no} issued to ${supplierName}.`,
      created_at: nowStr,
    });

    if (canvass) {
      canvass.status = "PO Issued";
      canvass.po_id = newPO.id;
      canvass.po_no = newPO.po_no;
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        id: `tr-${Date.now()}`,
        status: "PO Issued",
        stage: "Purchase Order",
        actor: "Purchasing Officer",
        notes: `Purchase Order ${newPO.po_no} issued.`,
        created_at: nowStr,
      });
    }

    this.saveToStorage();
    return {
      record: this.getUnifiedRecordById(pr.id)!,
      po: newPO,
    };
  }

  public updateUnifiedStatus(id: number, newStatus: string, remarks?: string, performedBy?: string): UnifiedProcurementRecord | null {
    let pr = this.getPurchaseRequestById(id);
    let canvass = pr?.canvass_id ? this.getCanvassById(pr.canvass_id) : this.getCanvassById(id);
    if (!pr && canvass) {
      pr = canvass.pr_id ? this.getPurchaseRequestById(canvass.pr_id) : null;
    }

    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

    if (pr) {
      pr.status = newStatus as PurchaseRequestStatus;
      pr.updated_at = nowStr;
      if (!pr.trail) pr.trail = [];
      pr.trail.push({
        id: `tr-${Date.now()}`,
        status: newStatus as any,
        stage: "Pipeline Update",
        actor: performedBy || "System User",
        notes: remarks || `Status updated to ${newStatus}`,
        created_at: nowStr,
      });
    }

    if (canvass) {
      canvass.status = newStatus as CanvassStatus;
      canvass.updated_at = nowStr;
      if (!canvass.trail) canvass.trail = [];
      canvass.trail.push({
        id: `tr-${Date.now()}`,
        status: newStatus as any,
        stage: "Pipeline Update",
        actor: performedBy || "System User",
        notes: remarks || `Status updated to ${newStatus}`,
        created_at: nowStr,
      });
    }

    this.saveToStorage();
    return this.getUnifiedRecordById(pr ? pr.id : (canvass?.id || id));
  }
}

// Global Singleton Instance
export const mockDb = new MockDatabaseStore();
