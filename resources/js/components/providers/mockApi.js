import axios from "axios";
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import { mockDb, SYSTEM_ROLES } from "../../../../mockDatabase";

// Mock database in memory with localStorage persistence for mutations
const DB_STORAGE_KEY = "fsuu_pmo_inventory_mock_db";

const defaultProfileAddress = [
  { id: 1, address: "FSUU Main Campus, San Francisco St., Butuan City", status: 1 },
];

export const defaultSuperAdminUser = {
  id: 1,
  username: "superadmin",
  email: "superadmin@test.com",
  status: "Active",
  user_role_id: 1,
  role: "Super Admin",
  firstname: "Super",
  lastname: "Admin",
  profile_id: 1,
  profile_picture: "/images/default.png",
  created_at: "2026-08-01 08:00:00",
  created_at_formatted: "Aug 01, 2026",
  profile: {
    profile_addresses: defaultProfileAddress,
  },
};

export const defaultAdminUser = {
  id: 2,
  username: "admin",
  email: "admin@test.com",
  status: "Active",
  user_role_id: 2,
  role: "Admin",
  firstname: "Staff",
  lastname: "Admin",
  profile_id: 2,
  profile_picture: "/images/default.png",
  created_at: "2026-08-05 09:30:00",
  created_at_formatted: "Aug 05, 2026",
  profile: {
    profile_addresses: defaultProfileAddress,
  },
};

const initialUsers = [
  defaultSuperAdminUser,
  defaultAdminUser,
  {
    id: 3,
    username: "crown_supplier",
    email: "supplier@crownpaper.ph",
    status: "Active",
    user_role_id: 4,
    role: "Supplier",
    firstname: "Crown",
    lastname: "Paper & Supplies",
    profile_id: 3,
    profile_picture: "/images/default.png",
    created_at: "2026-08-10 10:00:00",
    created_at_formatted: "Aug 10, 2026",
    profile: {
      profile_addresses: [
        { id: 1, address: "J.C. Aquino Ave, Butuan City", status: 1 },
      ],
    },
  },
  {
    id: 4,
    username: "evergreen_supplier",
    email: "supplier@evergreentextile.ph",
    status: "Active",
    user_role_id: 4,
    role: "Supplier",
    firstname: "Evergreen",
    lastname: "Textiles Corp",
    profile_id: 4,
    profile_picture: "/images/default.png",
    created_at: "2026-08-11 11:00:00",
    created_at_formatted: "Aug 11, 2026",
    profile: {
      profile_addresses: [
        { id: 1, address: "Montilla Blvd, Butuan City", status: 1 },
      ],
    },
  },
  {
    id: 5,
    username: "cas_dept",
    email: "cas@urios.edu.ph",
    status: "Active",
    user_role_id: 5,
    role: "Customer",
    firstname: "College of",
    lastname: "Arts & Sciences",
    profile_id: 5,
    profile_picture: "/images/default.png",
    created_at: "2026-08-12 12:00:00",
    created_at_formatted: "Aug 12, 2026",
    profile: {
      profile_addresses: [
        { id: 1, address: "FSUU Main Campus, CBS Building", status: 1 },
      ],
    },
  },
  {
    id: 6,
    username: "ccs_dept",
    email: "ccs@urios.edu.ph",
    status: "Active",
    user_role_id: 5,
    role: "Customer",
    firstname: "College of",
    lastname: "Computer Studies",
    profile_id: 6,
    profile_picture: "/images/default.png",
    created_at: "2026-08-13 13:00:00",
    created_at_formatted: "Aug 13, 2026",
    profile: {
      profile_addresses: [
        { id: 1, address: "FSUU Main Campus, Engineering & Tech Hall", status: 1 },
      ],
    },
  },
];

const initialProducts = [
  {
    id: 1,
    product_name: "A4 Copy Paper 80gsm (Box of 5 reams)",
    item_code: "PRD-2026-0001",
    category: "Office Supplies",
    brand: "PaperOne",
    unit: "Box",
    unit_price: 1250.0,
    cost_price: 980.0,
    quantity: 140,
    safety_stock: 25,
    warehouse_id: 1,
    warehouse_name: "Main Campus Storage",
    status: 1,
    description: "High quality premium multi-purpose copy paper.",
  },
  {
    id: 2,
    product_name: "Whiteboard Marker Black (Pack of 12)",
    item_code: "PRD-2026-0002",
    category: "Office Supplies",
    brand: "Pilot",
    unit: "Pack",
    unit_price: 360.0,
    cost_price: 260.0,
    quantity: 85,
    safety_stock: 15,
    warehouse_id: 1,
    warehouse_name: "Main Campus Storage",
    status: 1,
    description: "Dry-erase bullet tip marker, non-toxic low odor.",
  },
  {
    id: 3,
    product_name: "School Uniform Polo Fabric (Roll - 50m)",
    item_code: "PRD-2026-0003",
    category: "Textiles & Garments",
    brand: "Tetoron Cotton",
    unit: "Roll",
    unit_price: 4800.0,
    cost_price: 3650.0,
    quantity: 32,
    safety_stock: 8,
    warehouse_id: 2,
    warehouse_name: "Textile Warehouse",
    status: 1,
    description: "Standard institutional breathable polo cloth for uniform production.",
  },
  {
    id: 4,
    product_name: "Sewing Machine Needle #14 (Pack of 100)",
    item_code: "PRD-2026-0004",
    category: "Equipment & Parts",
    brand: "Organ",
    unit: "Pack",
    unit_price: 450.0,
    cost_price: 310.0,
    quantity: 50,
    safety_stock: 10,
    warehouse_id: 2,
    warehouse_name: "Textile Warehouse",
    status: 1,
    description: "Industrial high-speed needle suitable for heavy duty fabrics.",
  },
  {
    id: 5,
    product_name: "Industrial Sewing Machine Lubricant 1L",
    item_code: "PRD-2026-0005",
    category: "Maintenance Supplies",
    brand: "Singer",
    unit: "Bottle",
    unit_price: 280.0,
    cost_price: 190.0,
    quantity: 40,
    safety_stock: 10,
    warehouse_id: 2,
    warehouse_name: "Textile Warehouse",
    status: 1,
    description: "Pure white mineral oil for precision machines.",
  },
  {
    id: 6,
    product_name: "Heavy Duty Stapler (240 sheets capacity)",
    item_code: "PRD-2026-0006",
    category: "Office Supplies",
    brand: "KANGARO",
    unit: "Piece",
    unit_price: 890.0,
    cost_price: 650.0,
    quantity: 18,
    safety_stock: 5,
    warehouse_id: 1,
    warehouse_name: "Main Campus Storage",
    status: 1,
    description: "All-metal construction high capacity binding stapler.",
  },
];

const initialWarehouses = [
  { id: 1, warehouse_name: "Main Campus Storage", location: "Building A, Ground Floor", status: "Active", created_at: "2026-01-10" },
  { id: 2, warehouse_name: "Textile Warehouse", location: "SSF Tech Center, 2nd Floor", status: "Active", created_at: "2026-01-15" },
  { id: 3, warehouse_name: "Auxiliary Annex", location: "South Campus Gate 2", status: "Active", created_at: "2026-02-01" },
];

const initialPurchases = [
  {
    id: 1,
    po_number: "PO-2026-0012",
    purchase_order_no: "PO-2026-0012",
    supplier_name: "Crown Paper & Supplies",
    order_date: "2026-08-10",
    date_due: "2026-09-30",
    total_amount: 32500.0,
    total_amount_payable: 32500.0,
    balance_payable: 12500.0,
    status: "Completed",
    notes: "Q3 regular academic office replenishment",
  },
  {
    id: 2,
    po_number: "PO-2026-0013",
    purchase_order_no: "PO-2026-0013",
    supplier_name: "Evergreen Textiles Corp",
    order_date: "2026-08-18",
    date_due: "2026-10-05",
    total_amount: 96000.0,
    total_amount_payable: 96000.0,
    balance_payable: 45000.0,
    status: "Approved",
    notes: "SSF shared service facility materials procurement",
  },
  {
    id: 3,
    po_number: "PO-2026-0014",
    purchase_order_no: "PO-2026-0014",
    supplier_name: "National Industrial Parts Traders",
    order_date: "2026-09-02",
    date_due: "2026-09-25",
    total_amount: 14250.0,
    total_amount_payable: 14250.0,
    balance_payable: 14250.0,
    status: "Pending",
    notes: "Preventive maintenance spare needles and lubricants",
  },
];

const initialSales = [
  {
    id: 1,
    so_number: "SO-2026-0045",
    sales_order_no: "SO-2026-0045",
    customer_name: "College of Arts and Sciences",
    release_date: "2026-08-25",
    date_due: "2026-09-28",
    total_amount: 8750.0,
    total_amount_payable: 8750.0,
    balance_payable: 3500.0,
    discount: 250.0,
    status: "Released",
    approved_by: "Super Admin",
  },
  {
    id: 2,
    so_number: "SO-2026-0046",
    sales_order_no: "SO-2026-0046",
    customer_name: "Department of Education - Caraga",
    release_date: "2026-09-01",
    date_due: "2026-10-10",
    total_amount: 15400.0,
    total_amount_payable: 15400.0,
    balance_payable: 7000.0,
    discount: 500.0,
    status: "Released",
    approved_by: "Super Admin",
  },
  {
    id: 3,
    so_number: "SO-2026-0047",
    sales_order_no: "SO-2026-0047",
    customer_name: "University Registrar Office",
    release_date: "2026-09-10",
    date_due: "2026-09-22",
    total_amount: 6250.0,
    total_amount_payable: 6250.0,
    balance_payable: 6250.0,
    discount: 0,
    status: "Pending",
    approved_by: "Admin",
  },
];

const initialTransfers = [
  { id: 1, transfer_number: "TR-2026-0001", source_warehouse_id: 1, source_warehouse_name: "Main Campus Storage", target_warehouse_id: 2, target_warehouse_name: "Textile Warehouse", transfer_date: "2026-08-15", item_count: 5, status: "Completed" },
  { id: 2, transfer_number: "TR-2026-0002", source_warehouse_id: 2, source_warehouse_name: "Textile Warehouse", target_warehouse_id: 3, target_warehouse_name: "Auxiliary Annex", transfer_date: "2026-09-05", item_count: 12, status: "Pending" },
];

const initialDepartments = [
  { id: 1, department_name: "Physical Plant & Property Management Office (PMO)", name: "Physical Plant & Property Management Office (PMO)", code: "PMO", head: "Engr. Mark Villanueva", allocated_amount: 500000, utilized_amount: 120000, remaining_balance: 380000, department_type_id: 3, department_type_name: "Administrative", status: "Active" },
  { id: 2, department_name: "College of Computer Studies", name: "College of Computer Studies", code: "CCS", head: "Dr. Rachel Soriano", allocated_amount: 400000, utilized_amount: 220000, remaining_balance: 180000, department_type_id: 1, department_type_name: "Colleges", status: "Active" },
  { id: 3, department_name: "College of Business Administration", name: "College of Business Administration", code: "CBA", head: "Dean Carlos Mendoza", allocated_amount: 350000, utilized_amount: 95000, remaining_balance: 255000, department_type_id: 1, department_type_name: "Colleges", status: "Active" },
  { id: 4, department_name: "College of Arts and Sciences", name: "College of Arts and Sciences", code: "CAS", head: "Dr. Eleanor Vance", allocated_amount: 300000, utilized_amount: 140000, remaining_balance: 160000, department_type_id: 1, department_type_name: "Colleges", status: "Active" },
  { id: 5, department_name: "College of Nursing", name: "College of Nursing", code: "CON", head: "Prof. Maria Santos", allocated_amount: 250000, utilized_amount: 50000, remaining_balance: 200000, department_type_id: 1, department_type_name: "Colleges", status: "Active" },
  { id: 6, department_name: "College of Education", name: "College of Education", code: "COED", head: "Dr. Antonio Luna", allocated_amount: 200000, utilized_amount: 45000, remaining_balance: 155000, department_type_id: 1, department_type_name: "Colleges", status: "Active" },
  { id: 7, department_name: "College of Engineering", name: "College of Engineering", code: "ENGR", head: "Engr. Roberto Gomez", allocated_amount: 450000, utilized_amount: 180000, remaining_balance: 270000, department_type_id: 1, department_type_name: "Colleges", status: "Active" },
];

const initialBudgetAllocations = [
  { id: 1, department_id: 1, department_name: "College of Arts and Sciences", allocation_type: "Annual Operating Budget", allocated_amount: 250000.0, utilized_amount: 68500.0, remaining_amount: 181500.0, school_year: "2026-2027", status: "Active" },
  { id: 2, department_id: 2, department_name: "College of Computer Studies", allocation_type: "Annual Operating Budget", allocated_amount: 320000.0, utilized_amount: 112000.0, remaining_amount: 208000.0, school_year: "2026-2027", status: "Active" },
  { id: 3, department_id: 3, department_name: "SSF Garments & Shared Service Facility", allocation_type: "SSF Grant Capital", allocated_amount: 750000.0, utilized_amount: 298400.0, remaining_amount: 451600.0, school_year: "2026-2027", status: "Active" },
];

function loadDatabase() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    users: initialUsers,
    products: initialProducts,
    warehouses: initialWarehouses,
    purchases: initialPurchases,
    sales: initialSales,
    transfers: initialTransfers,
    departments: initialDepartments,
    budgetAllocations: initialBudgetAllocations,
  };
}

const db = loadDatabase();

function saveDatabase() {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error(e);
  }
}

const allAppModules = [
  { module_code: "page_dashboard", module_name: "Dashboard" },
  { module_code: "page_department_portal", module_name: "Department Request Portal" },
  { module_code: "page_canvassing", module_name: "Canvassing & RFQ" },
  { module_code: "page_finance_approval", module_name: "Finance Budget Approval" },
  { module_code: "page_finance", module_name: "Finance Office" },
  { module_code: "page_purchase_order", module_name: "Purchase Order (Kanban)" },
  { module_code: "page_purchase_request", module_name: "Purchase Request" },
  { module_code: "page_budget_allocation", module_name: "Budget Allocation" },
  { module_code: "page_departments", module_name: "Departments" },
  { module_code: "page_purchase", module_name: "Purchase Order" },
  { module_code: "page_sales", module_name: "Release Item" },
  { module_code: "page_product", module_name: "Product Canvas Price" },
  { module_code: "page_inventory", module_name: "Inventory" },
  { module_code: "page_transfer", module_name: "Transfer" },
  { module_code: "page_warehouse", module_name: "Warehouse" },
  { module_code: "page_users", module_name: "Users" },
  { module_code: "page_reports", module_name: "Reports" },
  { module_code: "page_admin_setting", module_name: "Admin Settings" },
  { module_code: "page_user_permissions", module_name: "User Permissions" },
  { module_code: "page_permissions", module_name: "Permissions" },
  { module_code: "page_video_faq", module_name: "Video FAQs" },
];

const buttonCodes = [
  "view_page", "btn_active_archive", "btn_add", "btn_decline", "btn_delete",
  "btn_download", "btn_edit", "btn_edit_permission", "btn_generate_report",
  "btn_import", "btn_payment", "btn_preview", "btn_print", "btn_request",
  "btn_status", "btn_submit", "btn_sweep", "btn_switch", "btn_upload_excel", "btn_view"
];

function getPermissions() {
  return allAppModules.map((m, idx) => ({
    id: idx + 1,
    module_code: m.module_code,
    module_name: m.module_name,
    system_id: 12,
    module_buttons: buttonCodes.map((code, bIdx) => ({
      id: idx * 100 + bIdx + 1,
      mod_button_code: code,
      mod_button_name: code.replace(/_/g, " ").toUpperCase(),
      status: 1,
    })),
  }));
}

// Intercept axios requests with a custom adapter
const defaultAdapter = axios.defaults.adapter;

axios.interceptors.request.use((config) => {
  config.adapter = async (cfg) => {
    const url = cfg.url || "";
    const method = (cfg.method || "get").toLowerCase();
    const data = typeof cfg.data === "string" ? (() => { try { return JSON.parse(cfg.data); } catch { return cfg.data; } })() : (cfg.data || {});

    // Helper response constructor
    const mockRes = (body, status = 200) => ({
      data: body,
      status,
      statusText: status === 200 ? "OK" : "Error",
      headers: {},
      config: cfg,
      request: {},
    });

    // Helper to produce data that works whether caller expects an Array or a Laravel paginated object { data: [...], total }
    const makePaginatedOrListData = (items) => {
      const list = [...items];
      list.data = items;
      list.total = items.length;
      list.current_page = 1;
      list.per_page = 20;
      return list;
    };

    if (url.includes("api/login")) {
      const email = data.email || "";
      const user = db.users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() ||
          u.username.toLowerCase() === email.toLowerCase()
      ) || db.users[0];

      return mockRes({
        success: true,
        message: "Login successfully.",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || "Super Admin",
          user_role_id: user.user_role_id,
          firstname: user.firstname,
          lastname: user.lastname,
          profile_id: user.profile_id,
          profile_picture: user.profile_picture || "/images/default.png",
          status: user.status,
          profile: user.profile || {
            profile_addresses: [
              { id: 1, address: "FSUU Main Campus, Butuan City", status: 1 },
            ],
          },
        },
        token: `token-${user.id}-${Date.now()}`,
      });
    }

    // ==================== CANVASSING / RFQ ====================
    if (url.includes("api/canvasses")) {
      // Approve Bid: /api/canvasses/:id/bids/:bidId/approve
      if (url.includes("/approve")) {
        const parts = url.split("/");
        const canvassId = Number(parts[parts.indexOf("canvasses") + 1]);
        const bidId = Number(parts[parts.indexOf("bids") + 1]);
        const result = mockDb.approveBidAndCreatePO(canvassId, bidId, Number(data?.warehouse_id) || 1);
        return mockRes({
          success: true,
          message: `Bid approved! Purchase Order ${result?.purchaseOrder?.po_no} automatically generated.`,
          data: result,
        });
      }

      // Add Bid: POST /api/canvasses/:id/bids
      if (url.includes("/bids") && method === "post") {
        const parts = url.split("/");
        const canvassId = Number(parts[parts.indexOf("canvasses") + 1]);
        const bid = mockDb.addSupplierBid(canvassId, data);
        const canvass = mockDb.getCanvassById(canvassId);
        return mockRes({ success: true, message: "Bid submitted successfully", data: bid, canvass });
      }

      // Explicit Finance Approval: POST /api/canvasses/:id/finance-approve
      if (url.includes("/finance-approve") && method === "post") {
        const idMatch = url.match(/api\/canvasses\/(\d+)\/finance-approve/);
        const parts = url.split("/");
        const canvassId = idMatch ? Number(idMatch[1]) : Number(parts[parts.indexOf("canvasses") + 1]);
        const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
        const updated = mockDb.updateCanvass(canvassId, {
          finance_status: "Finance Approved",
          finance_approved_at: nowStr,
          finance_approved_by: data?.approved_by || "Finance Director",
        });
        mockDb.saveToStorage();
        return mockRes({ success: true, message: `Finance Approval granted for ${updated?.canvass_no || "Canvass"}`, data: updated });
      }

      // Update Status: PATCH /api/canvasses/:id/status
      if (url.includes("/status") && method === "patch") {
        const idMatch = url.match(/api\/canvasses\/(\d+)\/status/);
        const parts = url.split("/");
        const canvassId = idMatch ? Number(idMatch[1]) : Number(parts[parts.indexOf("canvasses") + 1]);
        const updated = mockDb.updateCanvassStatus(
          canvassId,
          data?.status,
          data?.remarks,
          data?.performed_by,
          data?.role
        );
        return mockRes({ success: true, message: `Canvass moved to ${data?.status}`, data: updated });
      }

      // Single Canvass: GET /api/canvasses/:id
      const idMatch = url.match(/api\/canvasses\/(\d+)/);
      if (idMatch && method === "get") {
        const item = mockDb.getCanvassById(Number(idMatch[1]));
        return mockRes({ success: true, data: item });
      }

      // Create Canvass: POST /api/canvasses
      if (method === "post") {
        const created = mockDb.createCanvass(data);
        return mockRes({ success: true, message: "Canvass created successfully", data: created });
      }

      // List Canvasses: GET /api/canvasses
      return mockRes({ success: true, data: mockDb.getCanvasses() });
    }

    // ==================== PURCHASE ORDERS (KANBAN) ====================
    if (url.includes("api/purchase-orders")) {
      // Update Status: PATCH /api/purchase-orders/:id/status
      if (url.includes("/status") && method === "patch") {
        const idMatch = url.match(/api\/purchase-orders\/(\d+)\/status/);
        const parts = url.split("/");
        const poId = idMatch ? Number(idMatch[1]) : Number(parts[parts.indexOf("purchase-orders") + 1]);
        const result = mockDb.updatePOStatus(
          poId,
          data?.status,
          data?.remarks,
          data?.performed_by,
          data?.role
        );
        const msg =
          data?.status === "Fully Received"
            ? `PO ${result?.po?.po_no} marked as Fully Received. ${result?.restockedItems?.length || 0} items restocked in Inventory!`
            : `Purchase Order moved to ${data?.status}`;
        return mockRes({
          success: true,
          message: msg,
          data: result?.po,
          restockedItems: result?.restockedItems,
        });
      }

      // Create PO: POST /api/purchase-orders
      if (method === "post") {
        const created = mockDb.createPurchaseOrder(data);
        return mockRes({ success: true, message: "Purchase Order created", data: created });
      }

      // List POs: GET /api/purchase-orders
      return mockRes({ success: true, data: mockDb.getPurchaseOrders() });
    }

    // ==================== PURCHASE REQUESTS (PR) ====================
    if (url.includes("api/purchase-requests")) {
      // Approve PR & Encumber Budget: POST /api/purchase-requests/:id/approve
      if (url.includes("/approve") && method === "post") {
        const parts = url.split("/");
        const prId = Number(parts[parts.indexOf("purchase-requests") + 1]);
        const result = mockDb.approvePurchaseRequest(prId);
        return mockRes(result);
      }

      // Reject / Return PR: POST /api/purchase-requests/:id/reject
      if (url.includes("/reject") && method === "post") {
        const parts = url.split("/");
        const prId = Number(parts[parts.indexOf("purchase-requests") + 1]);
        const reason = data?.reason || data?.notes || "";
        const result = mockDb.rejectPurchaseRequest(prId, reason);
        return mockRes(result);
      }

      // Update PR Status: PATCH /api/purchase-requests/:id/status
      if (url.includes("/status") && method === "patch") {
        const idMatch = url.match(/api\/purchase-requests\/(\d+)\/status/);
        const parts = url.split("/");
        const prId = idMatch ? Number(idMatch[1]) : Number(parts[parts.indexOf("purchase-requests") + 1]);
        const updated = mockDb.updatePurchaseRequestStatus(
          prId,
          data?.status,
          data?.remarks,
          data?.performed_by,
          data?.role
        );
        return mockRes({ success: true, message: `PR status updated to ${data?.status}`, data: updated });
      }

      // Single PR: GET /api/purchase-requests/:id
      const singlePrMatch = url.match(/api\/purchase-requests\/(\d+)/);
      if (singlePrMatch && method === "get") {
        const prId = Number(singlePrMatch[1]);
        const pr = mockDb.getPurchaseRequestById(prId);
        return mockRes({ success: true, data: pr });
      }

      // Create PR: POST /api/purchase-requests
      if (method === "post") {
        const created = mockDb.createPurchaseRequest(data);
        return mockRes({ success: true, message: "Purchase Request created", data: created });
      }

      // List PRs: GET /api/purchase-requests
      return mockRes({ success: true, data: mockDb.getPurchaseRequests() });
    }

    // ==================== FINANCE REVIEWS ====================
    if (url.includes("api/finance")) {
      if (url.includes("/approve") && method === "post") {
        const parts = url.split("/");
        const canvassId = Number(parts[parts.indexOf("reviews") + 1] || parts[parts.indexOf("finance") + 1]);
        const result = mockDb.approveFinanceAndCreatePO(canvassId);
        return mockRes(result);
      }

      if (url.includes("/status") && method === "patch") {
        const parts = url.split("/");
        const canvassId = Number(parts[parts.indexOf("reviews") + 1] || parts[parts.indexOf("finance") + 1]);
        const result = mockDb.updateFinanceStatus(canvassId, data.status);
        return mockRes(result);
      }

      if (url.includes("reviews")) {
        return mockRes({ success: true, data: mockDb.getFinanceReviews() });
      }
    }

    // ==================== INVENTORY / ALERTS ====================
    if (url.includes("api/inventory/alerts")) {
      return mockRes({ success: true, data: mockDb.getInventoryAlerts() });
    }

    if (url.includes("api/suppliers")) {
      return mockRes({ success: true, data: mockDb.suppliers });
    }

    if (url.includes("api/check_auth_status")) {
      return mockRes({ success: true, message: "Authenticated." });
    }

    // RBAC GET & PUT /api/permissions/:role
    if (url.match(/api\/permissions\/([^\/\?]+)/)) {
      const match = url.match(/api\/permissions\/([^\/\?]+)/);
      const roleParam = decodeURIComponent(match[1]);

      if (method === "put" || method === "post") {
        const payload = Array.isArray(data) ? data : (data.permissions || data.data || []);
        const updated = mockDb.updateRolePermissions(roleParam, payload);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("permissions_updated", { detail: updated }));
          window.dispatchEvent(new CustomEvent("role_changed", { detail: localStorage.getItem("simulated_role") || "PMO/VPASA (Admin)" }));
        }
        return mockRes({
          success: true,
          message: `Permissions for ${updated.role.role} updated successfully.`,
          data: updated.permissions,
          role: updated.role,
        });
      }

      // GET
      const result = mockDb.getRolePermissions(roleParam);
      return mockRes({
        success: true,
        data: result.permissions,
        role: result.role,
      });
    }

    if (url.includes("api/user_permission")) {
      const activeRole = (typeof localStorage !== "undefined" && localStorage.getItem("simulated_role")) || "PMO/VPASA (Admin)";
      const { permissions } = mockDb.getRolePermissions(activeRole);
      const bCodes = [
        "view_page", "btn_active_archive", "btn_add", "btn_decline", "btn_delete",
        "btn_download", "btn_edit", "btn_edit_permission", "btn_generate_report",
        "btn_import", "btn_payment", "btn_preview", "btn_print", "btn_request",
        "btn_status", "btn_submit", "btn_sweep", "btn_switch", "btn_upload_excel", "btn_view"
      ];
      const formatted = permissions.map((p, idx) => ({
        id: p.id || idx + 1,
        module_code: p.module_code,
        module_name: p.module_name,
        module_key: p.module_key,
        description: p.description,
        can_view: p.can_view,
        can_create: p.can_create,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
        system_id: 12,
        module_buttons: bCodes.map((code, bIdx) => {
          let status = 0;
          if (code === "view_page" || code === "btn_view") {
            status = p.can_view ? 1 : 0;
          } else if (code.includes("add") || code.includes("request") || code.includes("submit") || code.includes("upload") || code.includes("import")) {
            status = p.can_create ? 1 : 0;
          } else if (code.includes("edit") || code.includes("status") || code.includes("active")) {
            status = p.can_edit ? 1 : 0;
          } else if (code.includes("delete") || code.includes("decline")) {
            status = p.can_delete ? 1 : 0;
          } else {
            status = p.can_view ? 1 : 0;
          }
          return {
            id: (p.id || idx + 1) * 100 + bIdx + 1,
            mod_button_code: code,
            mod_button_name: code.replace(/_/g, " ").toUpperCase(),
            status,
          };
        }),
      }));
      return mockRes({ success: true, data: formatted });
    }

    if (url.includes("api/user_role")) {
      return mockRes({
        success: true,
        data: SYSTEM_ROLES,
      });
    }

    if (url.includes("api/module") && !url.includes("api/module_update")) {
      const parsedUrl = new URL("http://dummy.com" + (url.startsWith("/") ? "" : "/") + url);
      const roleParam = parsedUrl.searchParams.get("user_role_id") || parsedUrl.searchParams.get("role") || "1";
      const { permissions } = mockDb.getRolePermissions(roleParam);
      return mockRes({
        success: true,
        data: {
          data: permissions,
          total: permissions.length,
          current_page: 1,
          per_page: 50,
        },
      });
    }

    if (url.includes("api/product_detail_preview")) {
      const prodId = data.product_id;
      const prod = db.products.find((p) => p.id === prodId) || db.products[0];
      return mockRes({
        success: true,
        data: {
          ...prod,
          details: [
            { id: 1, size: "Standard", color: "Default", barcode: "890123456789", stock: prod.quantity },
          ],
        },
      });
    }

    if (
      url.includes("api/product_inventory") ||
      url.includes("api/products") ||
      url.includes("api/inventory")
    ) {
      const inventoryItems = mockDb.getInventory().map((item) => {
        const cost = Number(item.unit_price || item.unit_cost || 100);
        const dealersPrice = Math.round(cost * 1.15);
        const wholesalePrice = Math.round(cost * 1.25);
        const srp = Math.round(cost * 1.4);
        const fleetPrice = Math.round(cost * 1.2);
        const stock = item.quantity !== undefined ? item.quantity : (item.stock_on_hand !== undefined ? item.stock_on_hand : 25);
        const reorder = item.min_safety_stock !== undefined ? item.min_safety_stock : (item.reorder_point !== undefined ? item.reorder_point : 10);

        return {
          id: item.id,
          product_id: item.id,
          product_name: item.product_name || item.item_name || "Inventory Item",
          product_code: item.product_code || item.sku || `INV-${item.id}`,
          product_type: item.category || "General Supplies",
          product_size: item.unit || "Piece",
          available_stock: stock,
          reorder_point: reorder,
          status: item.status || (stock <= reorder ? "Low Stock" : "In Stock"),
          warehouse_id: item.warehouse_id,
          warehouse_name: item.warehouse_name,
          unit_price: cost,
          cost: cost,
          dealers_price: dealersPrice,
          wholesale_price: wholesalePrice,
          srp: srp,
          fleet_price: fleetPrice,
          product_detail_prices: [
            {
              id: item.id,
              product_detail_id: item.id,
              cost: cost,
              dealers_price: dealersPrice,
              wholesale_price: wholesalePrice,
              srp: srp,
              fleet_price: fleetPrice,
              start_date: "2020-01-01",
              end_date: "2035-12-31",
            },
          ],
          created_at_format: item.last_restocked_at || "2026-01-15 08:30:00",
          last_restocked_date: item.last_restocked_date || item.last_restocked_at,
        };
      });
      return mockRes({
        data: makePaginatedOrListData(inventoryItems),
      });
    }

    if (url.includes("api/warehouse")) {
      return mockRes({
        data: makePaginatedOrListData(db.warehouses),
      });
    }

    if (url.includes("api/purchases")) {
      return mockRes({
        data: makePaginatedOrListData(db.purchases),
      });
    }

    if (url.includes("api/purchase_order_no")) {
      return mockRes({ success: true, data: `PO-2026-00${db.purchases.length + 15}` });
    }

    if (url.includes("api/sales")) {
      return mockRes({
        data: makePaginatedOrListData(db.sales),
      });
    }

    if (url.includes("api/sales_order_no")) {
      return mockRes({ success: true, data: `SO-2026-00${db.sales.length + 48}` });
    }

    if (url.includes("api/transfers")) {
      return mockRes({
        data: makePaginatedOrListData(db.transfers),
      });
    }

    if (url.includes("api/department_allocation")) {
      return mockRes({
        data: makePaginatedOrListData(db.budgetAllocations),
      });
    }

    if (url.includes("api/department")) {
      const dbDepts = mockDb?.getDepartments ? mockDb.getDepartments() : [];
      const baseList = dbDepts.length > 0 ? dbDepts : (db.departments || initialDepartments);

      const enrichedDepartments = baseList.map((dept) => {
        const allocations = (db.budgetAllocations || [])
          .filter((b) => b.department_id === dept.id)
          .map((b) => ({
            ...b,
            base_amount: b.allocated_amount || b.base_amount || 0,
            remaining_amount:
              b.remaining_amount !== undefined
                ? b.remaining_amount
                : Math.max(0, (b.allocated_amount || 0) - (b.utilized_amount || 0)),
          }));

        const abbrMap = {
          1: "PMO",
          2: "CCS",
          3: "CBA",
          4: "CAS",
          5: "CON",
          6: "COED",
          7: "ENGR",
        };

        const liveDept = mockDb.departments.find((d) => d.id === dept.id);
        const deptName = liveDept?.name || dept.department_name || dept.name || `Department #${dept.id}`;
        const allocated = Number(liveDept?.allocated_amount ?? dept.allocated_amount ?? dept.budget_allocated ?? 400000);
        const encumbered = Number(liveDept?.encumbered_amount ?? dept.encumbered_amount ?? dept.budget_encumbered ?? 0);
        const utilized = Number(liveDept?.utilized_amount ?? dept.utilized_amount ?? dept.budget_utilized ?? 120000);
        const remaining = Number(liveDept?.remaining_balance ?? dept.remaining_balance ?? Math.max(0, allocated - utilized - encumbered));

        return {
          ...dept,
          id: dept.id,
          name: deptName,
          department_name: deptName,
          code: dept.code || dept.abbr || abbrMap[dept.id] || "DEPT",
          abbr: dept.abbr || dept.code || abbrMap[dept.id] || "DEPT",
          head: liveDept?.head || dept.head || "Department Head",
          allocated_amount: allocated,
          encumbered_amount: encumbered,
          utilized_amount: utilized,
          remaining_balance: remaining,
          budget_allocated: allocated,
          budget_encumbered: encumbered,
          budget_utilized: utilized,
          budget_remaining: remaining,
          department_type: dept.department_type_name || dept.department_type || "Academic",
          ref_department_allocations: allocations,
        };
      });

      const singleMatch = url.match(/api\/department\/(\d+)/);
      if (singleMatch) {
        const targetId = Number(singleMatch[1]);
        const found =
          enrichedDepartments.find((d) => d.id === targetId) ||
          enrichedDepartments[0];
        return mockRes({
          data: found,
        });
      }

      return mockRes({
        data: makePaginatedOrListData(enrichedDepartments),
      });
    }

    if (url.includes("api/product_sales_and_purchase")) {
      const totalP = db.purchases.reduce((acc, curr) => acc + (Number(curr.total_amount || curr.total_amount_payable) || 0), 0);
      const totalS = db.sales.reduce((acc, curr) => acc + (Number(curr.total_amount || curr.total_amount_payable) || 0), 0);
      return mockRes({
        countProduct: db.products.length,
        totalPurchase: totalP,
        totalSales: totalS,
      });
    }

    if (url.includes("api/graph_product")) {
      return mockRes({
        data: {
          data_series_name: db.products.slice(0, 5).map((p) => p.product_name),
          data_series_value: [
            {
              name: "Remaining Quantity",
              data: db.products.slice(0, 5).map((p) => p.quantity),
            },
            {
              name: "Sold Quantity",
              data: [45, 80, 12, 60, 30],
            },
          ],
          action: "PRODUCT",
          downTo: "DAILY",
        },
      });
    }

    if (url.includes("api/graph_sales_and_inventory")) {
      return mockRes({
        data: {
          data_series_name: ["2022", "2023", "2024", "2025", "2026"],
          data_series_value: [
            { name: "Sales", data: [450000, 520000, 610000, 720000, 840000] },
            { name: "Inventory", data: [1200000, 1150000, 1250000, 1350000, 1450000] },
          ],
          action: "year",
          downTo: "quarter",
        },
      });
    }

    if (url.includes("api/graph_revenue")) {
      const isYear = url.includes("action=year") || !url.includes("action=");
      return mockRes({
        data: {
          data_series_name: isYear
            ? ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]
            : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
          data_series_value: [
            {
              name: "Revenue",
              data: isYear
                ? [350000, 420000, 480000, 520000, 610000, 680000, 750000, 830000, 920000, 1050000]
                : [65000, 72000, 68000, 85000, 79000, 94000, 110000, 105000, 125000],
            },
          ],
          action: isYear ? "year" : "month",
          downTo: "month",
        },
      });
    }

    if (url.includes("api/revenue_snap_shot")) {
      return mockRes({
        success: true,
        data: db.sales.map((s) => ({
          id: s.id,
          total_amount_payable: s.total_amount_payable || s.total_amount || 8750,
          discount: s.discount || 0,
          sales_order_details: [
            {
              id: 1,
              orig_cost: 3650,
              cost_price: 3650,
              price: 4800,
              unit_price: 4800,
              quantity: 2,
              product_name: "School Uniform Polo Fabric (Roll - 50m)",
            },
          ],
        })),
      });
    }

    if (url.includes("api/user_notifications")) {
      return mockRes({ success: true, data: [] });
    }

    // Default catch-all for any other API routes
    if (url.includes("/api/")) {
      return mockRes({ success: true, message: "OK", data: makePaginatedOrListData([]) });
    }

    if (defaultAdapter) {
      return defaultAdapter(cfg);
    }

    return mockRes({ success: true });
  };

  return config;
});

// Auto-seed default Super Admin session if not already logged in
export const initDefaultSession = () => {
  try {
    const year = dayjs().format("YYYY");
    const encryptKey = `FSUU-DSAC-ADMIN-APPLICATION-${year}`;
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(defaultSuperAdminUser),
      encryptKey
    ).toString();
    localStorage.setItem("userdata", encrypted);
    localStorage.setItem("token", "default-fsuu-superadmin-token");
  } catch (err) {
    console.error("Failed to initialize default session:", err);
  }
};

// Check if user session exists and is valid; if not, initialize default login
try {
  const token = localStorage.getItem("token");
  const encryptedUserData = localStorage.getItem("userdata");
  if (!token || !encryptedUserData) {
    initDefaultSession();
  } else {
    let parsed = null;
    const trimmed = String(encryptedUserData).trim();
    if (trimmed.startsWith("{")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {}
    }
    if (!parsed) {
      const year = dayjs().format("YYYY");
      const candidateKeys = [
        `FSUU-DSAC-ADMIN-APPLICATION-${year}`,
        "FSUU-DSAC-ADMIN-APPLICATION",
        `FSUU-DSAC-ADMIN-APPLICATION-${Number(year) - 1}`,
      ];
      for (const k of candidateKeys) {
        try {
          const bytes = CryptoJS.AES.decrypt(trimmed, k);
          const str = bytes.toString(CryptoJS.enc.Utf8);
          if (str && (str.startsWith("{") || str.startsWith("["))) {
            parsed = JSON.parse(str);
            break;
          }
        } catch {
          // Suppress malformed UTF-8 exceptions
        }
      }
    }
    if (!parsed || !parsed.profile) {
      initDefaultSession();
    }
  }
} catch {
  initDefaultSession();
}

export const resetDatabaseToDefault = () => {
  try {
    localStorage.removeItem(DB_STORAGE_KEY);
    initDefaultSession();
    window.location.reload();
  } catch (e) {
    console.error("Error resetting database:", e);
  }
};

console.log("FSUU PMO Inventory Mock API initialized with default dataset.");
