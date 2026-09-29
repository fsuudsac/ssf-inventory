import express, { type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import {
  mockDb,
  SYSTEM_ROLES,
  SYSTEM_MODULES,
  type CanvassStatus,
  type POStatus,
  type PurchaseRequestStatus,
  type Canvass,
  type PurchaseRequest,
  type PurchaseOrder,
  type InventoryItem,
  type Supplier,
  type Warehouse,
  type Department,
  type EvidenceAttachment,
  type ModulePermission,
} from "./mockDatabase.ts";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Configure File Uploads directory (/public/uploads)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      cb(null, `${safeName}-${uniqueSuffix}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
  });

  // Serve uploaded evidence files directly
  app.use("/uploads", express.static(uploadsDir));

  // JSON Body parsing
  app.use(express.json());

  // CORS and pre-flight handling
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "FSUU PMO Inventory & Procurement REST API",
      timestamp: new Date().toISOString(),
    });
  });

  // File upload endpoints (Ant Design <Upload> and standard multipart/form-data)
  app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const fileData = {
        name: req.file.originalname,
        original_name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      };
      res.json({
        success: true,
        message: "File uploaded successfully",
        data: fileData,
        // Ant Design Upload compatibility
        url: fileData.url,
        name: fileData.name,
        status: "done",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to upload file" });
    }
  });

  app.post("/api/upload_multiple", upload.array("files", 10), (req: Request, res: Response) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const fileDataList = files.map((f) => ({
        name: f.originalname,
        original_name: f.originalname,
        url: `/uploads/${f.filename}`,
        size: f.size,
        mime_type: f.mimetype,
        uploaded_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      }));
      res.json({
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        data: fileDataList,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to upload files" });
    }
  });

  // =========================================================================
  // 0. AUTHENTICATION & PERMISSIONS ENDPOINTS
  // =========================================================================

  app.post("/api/login", (req: Request, res: Response) => {
    try {
      const { email } = req.body || {};
      const identifier = String(email || "").toLowerCase().trim();

      const demoUsers = [
        {
          id: 1,
          username: "superadmin",
          email: "superadmin@test.com",
          role: "Super Admin",
          user_role_id: 1,
          firstname: "Super",
          lastname: "Admin",
          profile_id: 1,
          profile_picture: "/images/default.png",
          status: "Active",
          profile: {
            profile_addresses: [
              { id: 1, address: "FSUU Main Campus, San Francisco St., Butuan City", status: 1 },
            ],
          },
        },
        {
          id: 2,
          username: "admin",
          email: "admin@test.com",
          role: "Admin",
          user_role_id: 2,
          firstname: "Staff",
          lastname: "Admin",
          profile_id: 2,
          profile_picture: "/images/default.png",
          status: "Active",
          profile: {
            profile_addresses: [
              { id: 1, address: "FSUU Main Campus, Butuan City", status: 1 },
            ],
          },
        },
      ];

      const user =
        demoUsers.find(
          (u) =>
            u.username.toLowerCase() === identifier ||
            u.email.toLowerCase() === identifier
        ) || demoUsers[0];

      res.json({
        success: true,
        message: "Login successfully.",
        data: user,
        token: `token-${user.id}-${Date.now()}`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Login error" });
    }
  });

  app.get("/api/check_auth_status", (_req: Request, res: Response) => {
    res.json({ success: true, message: "Authenticated." });
  });

  app.post("/api/logout", (_req: Request, res: Response) => {
    res.json({ success: true, message: "Logged out successfully." });
  });

  // =========================================================================
  // DYNAMIC ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS ENDPOINTS
  // =========================================================================

  /**
   * GET /api/user_role
   * Fetches all defined system roles
   */
  app.get("/api/user_role", (_req: Request, res: Response) => {
    res.json({ success: true, data: SYSTEM_ROLES });
  });

  /**
   * GET /api/permissions/:role
   * Fetches a role's permissions matrix
   */
  app.get("/api/permissions/:role", (req: Request, res: Response) => {
    try {
      const { role } = req.params;
      const result = mockDb.getRolePermissions(role);
      res.json({
        success: true,
        data: result.permissions,
        role: result.role,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  /**
   * PUT /api/permissions/:role
   * Bulk updates a role's permissions matrix
   */
  app.put("/api/permissions/:role", (req: Request, res: Response) => {
    try {
      const { role } = req.params;
      const permissionsPayload = Array.isArray(req.body)
        ? req.body
        : req.body.permissions || req.body.data || [];

      const result = mockDb.updateRolePermissions(role, permissionsPayload);
      res.json({
        success: true,
        message: `Permissions for ${result.role.role} updated successfully.`,
        data: result.permissions,
        role: result.role,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  /**
   * GET /api/user_permission
   * Returns active permissions for the current user or simulated role
   */
  app.get("/api/user_permission", (req: Request, res: Response) => {
    const roleParam = (req.query.role as string) || (req.query.simulated_role as string) || "Admin";
    const { permissions } = mockDb.getRolePermissions(roleParam);

    const buttonCodes = [
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
      module_buttons: buttonCodes.map((code, bIdx) => {
        let status = 0;
        if (code === "view_page" || code === "btn_view") {
          status = p.can_view ? 1 : 0;
        } else if (code === "btn_add" || code === "btn_request" || code === "btn_submit" || code === "btn_upload_excel" || code === "btn_import") {
          status = p.can_create ? 1 : 0;
        } else if (code === "btn_edit" || code === "btn_edit_permission" || code === "btn_status" || code === "btn_active_archive") {
          status = p.can_edit ? 1 : 0;
        } else if (code === "btn_delete" || code === "btn_decline") {
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

    res.json({ success: true, data: formatted });
  });

  /**
   * GET /api/module
   * Ant Design table module list endpoint
   */
  app.get("/api/module", (req: Request, res: Response) => {
    const roleParam = (req.query.user_role_id as string) || (req.query.role as string) || "1";
    const { permissions } = mockDb.getRolePermissions(roleParam);

    const buttonCodes = [
      "view_page", "btn_active_archive", "btn_add", "btn_decline", "btn_delete",
      "btn_download", "btn_edit", "btn_edit_permission", "btn_generate_report",
      "btn_import", "btn_payment", "btn_preview", "btn_print", "btn_request",
      "btn_status", "btn_submit", "btn_sweep", "btn_switch", "btn_upload_excel", "btn_view"
    ];

    const data = permissions.map((p, idx) => ({
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
      module_buttons: buttonCodes.map((code, bIdx) => ({
        id: (p.id || idx + 1) * 100 + bIdx + 1,
        mod_button_code: code,
        mod_button_name: code.replace(/_/g, " ").toUpperCase(),
        status: code === "view_page" ? (p.can_view ? 1 : 0) : (code.includes("add") ? (p.can_create ? 1 : 0) : (code.includes("edit") ? (p.can_edit ? 1 : 0) : (p.can_view ? 1 : 0))),
      })),
    }));

    res.json({
      success: true,
      data: {
        data,
        total: data.length,
        current_page: 1,
        per_page: 50,
      },
    });
  });

  // =========================================================================
  // 1. CANVASSING & RFQ MODULE ENDPOINTS (FULL CRUD + BIDDING & APPROVAL)
  // =========================================================================

  /**
   * GET /api/canvasses
   * Supports query filters: ?status=... & ?priority=... & ?search=... & ?department_id=...
   */
  app.get("/api/canvasses", (req: Request, res: Response) => {
    try {
      let canvasses = mockDb.getCanvasses();
      const { status, priority, search, department_id, is_active } = req.query;

      if (is_active !== undefined) {
        if (is_active === "true") {
          canvasses = canvasses.filter((c) => c.status !== "Rejected" && c.status !== "Approved");
        } else if (is_active === "false") {
          canvasses = canvasses.filter((c) => c.status === "Rejected" || c.status === "Approved");
        }
      }

      if (status) {
        canvasses = canvasses.filter((c) => c.status.toLowerCase() === String(status).toLowerCase());
      }
      if (priority) {
        canvasses = canvasses.filter((c) => c.priority.toLowerCase() === String(priority).toLowerCase());
      }
      if (department_id) {
        canvasses = canvasses.filter((c) => c.department_id === Number(department_id));
      }
      if (search) {
        const q = String(search).toLowerCase();
        canvasses = canvasses.filter(
          (c) =>
            c.canvass_no.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.requested_by.toLowerCase().includes(q) ||
            c.department_name.toLowerCase().includes(q)
        );
      }

      res.json({
        success: true,
        total: canvasses.length,
        data: canvasses,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve canvasses" });
    }
  });

  /**
   * GET /api/canvasses/:id
   * Retrieve a single Canvass with line items and supplier quotations
   */
  app.get("/api/canvasses/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const canvass = mockDb.getCanvassById(id);
      if (!canvass) {
        return res.status(404).json({ success: false, message: `Canvass #${id} not found` });
      }
      res.json({ success: true, data: canvass });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve canvass" });
    }
  });

  /**
   * POST /api/canvasses
   * Create a new Canvass / Request for Quotation
   */
  app.post("/api/canvasses", (req: Request, res: Response) => {
    try {
      const { title, department_id, requested_by } = req.body;
      if (!title || !department_id || !requested_by) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing: title, department_id, and requested_by are required",
        });
      }

      const created = mockDb.createCanvass(req.body);
      res.status(201).json({
        success: true,
        message: `Canvass ${created.canvass_no} created successfully`,
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create canvass" });
    }
  });

  /**
   * PUT /api/canvasses/:id
   * Update full details of an existing Canvass
   */
  app.put("/api/canvasses/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updated = mockDb.updateCanvass(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Canvass #${id} not found` });
      }
      res.json({
        success: true,
        message: `Canvass ${updated.canvass_no} updated successfully`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update canvass" });
    }
  });

  /**
   * PATCH /api/canvasses/:id/status
   * Update workflow status (Kanban drag-and-drop transitions)
   */
  app.patch("/api/canvasses/:id/status", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status, remarks, performed_by, role } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Field 'status' is required" });
      }

      const validStatuses: CanvassStatus[] = [
        "New Purchase Request",
        "Pending Finance Approval",
        "Canvassing / Bidding",
        "Purchase Order Issued",
        "Pending Canvass",
        "Draft",
        "Seeking Bids",
        "Bidding",
        "Under Review",
        "In Progress",
        "Winning Bid Selected",
        "Approved",
        "Rejected",
      ];
      if (!validStatuses.includes(status as CanvassStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status '${status}'. Valid values: ${validStatuses.join(", ")}`,
        });
      }

      const updated = mockDb.updateCanvassStatus(id, status as CanvassStatus, remarks, performed_by, role);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Canvass #${id} not found` });
      }

      res.json({
        success: true,
        message: `Canvass ${updated.canvass_no} transitioned to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update canvass status" });
    }
  });

  /**
   * POST /api/canvasses/:id/finance-approve
   * Explicit Finance Approval clearance for Canvassing
   */
  app.post("/api/canvasses/:id/finance-approve", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { approved_by, remarks } = req.body;
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      const updated = mockDb.updateCanvass(id, {
        finance_status: "Finance Approved",
        finance_approved_at: nowStr,
        finance_approved_by: approved_by || "Finance Director",
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: `Canvass #${id} not found` });
      }
      res.json({
        success: true,
        message: `Finance Approval granted for ${updated.canvass_no}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to approve canvass in finance" });
    }
  });

  /**
   * DELETE /api/canvasses/:id
   * Delete a Canvass
   */
  app.delete("/api/canvasses/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = mockDb.deleteCanvass(id);
      if (!success) {
        return res.status(404).json({ success: false, message: `Canvass #${id} not found` });
      }
      res.json({
        success: true,
        message: `Canvass #${id} deleted successfully`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to delete canvass" });
    }
  });

  /**
   * POST /api/canvasses/:id/bids
   * Submit a supplier quotation / bid
   */
  app.post("/api/canvasses/:id/bids", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const bid = mockDb.addSupplierBid(id, req.body);
      if (!bid) {
        return res.status(404).json({ success: false, message: `Canvass #${id} not found` });
      }
      const updatedCanvass = mockDb.getCanvassById(id);
      res.status(201).json({
        success: true,
        message: `Supplier quotation from ${bid.supplier_name} submitted successfully`,
        data: bid,
        canvass: updatedCanvass,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to add bid" });
    }
  });

  /**
   * DELETE /api/canvasses/:id/bids/:bidId
   * Remove / withdraw a supplier bid
   */
  app.delete("/api/canvasses/:id/bids/:bidId", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.id);
      const bidId = Number(req.params.bidId);
      const success = mockDb.deleteSupplierBid(canvassId, bidId);
      if (!success) {
        return res.status(404).json({ success: false, message: "Canvass or Bid quotation not found" });
      }
      res.json({
        success: true,
        message: `Quotation #${bidId} removed from Canvass #${canvassId}`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to delete bid" });
    }
  });

  /**
   * PATCH /api/canvasses/:id/bids/:bidId/approve
   * Approves winning bid and automatically generates a linked Purchase Order
   */
  app.patch("/api/canvasses/:id/bids/:bidId/approve", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.id);
      const bidId = Number(req.params.bidId);
      const targetWarehouseId = Number(req.body.warehouse_id) || 1;

      const result = mockDb.approveBidAndCreatePO(canvassId, bidId, targetWarehouseId);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Canvass #${canvassId} or Bid #${bidId} not found`,
        });
      }

      res.json({
        success: true,
        message: `Bid approved! Purchase Order ${result.purchaseOrder.po_no} automatically generated.`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to approve bid and generate PO" });
    }
  });

  /**
   * PATCH /api/canvasses/:id/bids/:bidId/approve-to-pr
   * Approves winning bid and automatically generates a linked Purchase Request (PR) with carried-over evidence
   */
  app.patch("/api/canvasses/:id/bids/:bidId/approve-to-pr", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.id);
      const bidId = Number(req.params.bidId);

      const result = mockDb.approveBidAndCreatePR(canvassId, bidId);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Canvass #${canvassId} or Bid #${bidId} not found`,
        });
      }

      res.json({
        success: true,
        message: `Bid approved! Purchase Request ${result.purchaseRequest.pr_no} automatically generated with attached evidence.`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to approve bid and generate PR" });
    }
  });

  /**
   * POST /api/canvasses/:id/bids/:bidId/select-winner
   * Selects winning quotation, transitions to 'Winning Bid Selected', and triggers Finance Review
   */
  app.post("/api/canvasses/:id/bids/:bidId/select-winner", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.id);
      const bidId = Number(req.params.bidId);

      const result = mockDb.selectWinningBid(canvassId, bidId);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Canvass #${canvassId} or Bid #${bidId} not found`,
        });
      }

      res.json({
        success: true,
        message: result.isOverBudget
          ? `Winning bid awarded to ${result.winningBid.supplier_name}. Flagged as Over Budget by ₱${Math.abs(result.variance).toLocaleString()} for Finance revision.`
          : `Winning bid awarded to ${result.winningBid.supplier_name} (₱${result.winningBid.bid_amount.toLocaleString()}) and submitted to Finance Budget Approval.`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to select winning bid" });
    }
  });

  /**
   * PUT /api/canvasses/:id/items/:itemId
   * Adjust or edit line item quantity, specifications, or costs
   */
  app.put("/api/canvasses/:id/items/:itemId", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.id);
      const itemId = Number(req.params.itemId);
      const result = mockDb.updateCanvassItem(canvassId, itemId, req.body);
      if (!result) {
        return res.status(404).json({ success: false, message: "Canvass or Item not found" });
      }
      res.json({
        success: true,
        message: `Line item updated successfully`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update item" });
    }
  });

  /**
   * DELETE /api/canvasses/:id/items/:itemId
   * Remove a line item from a Canvass (recalculates bids & budget)
   */
  app.delete("/api/canvasses/:id/items/:itemId", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.id);
      const itemId = Number(req.params.itemId);
      const updated = mockDb.deleteCanvassItem(canvassId, itemId);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Canvass or Item not found" });
      }
      res.json({
        success: true,
        message: `Item removed from canvass`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to delete item" });
    }
  });

  /**
   * PUT /api/canvasses/:id/items
   * Batch update line items (used by Finance Approval "Edit Items" modal)
   */
  app.put("/api/canvasses/:id/items", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.id);
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: "items must be an array" });
      }
      const updated = mockDb.batchUpdateCanvassItems(canvassId, items);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Canvass not found" });
      }
      res.json({
        success: true,
        message: `Canvass items updated successfully. Total recalculated to ₱${updated.total_estimated_budget.toLocaleString()}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update items" });
    }
  });

  // =========================================================================
  // 1.2. FINANCE APPROVAL & BUDGET GATEKEEPER ENDPOINTS
  // =========================================================================

  /**
   * GET /api/finance/reviews
   * Retrieves all procurement requests awaiting or undergoing Finance budget review
   */
  app.get("/api/finance/reviews", (req: Request, res: Response) => {
    try {
      let reviews = mockDb.getFinanceReviews();
      const { is_active, department_id } = req.query;

      if (is_active !== undefined) {
        if (is_active === "true") {
          reviews = reviews.filter((r) => r.finance_status !== "Finance Approved" && r.finance_status !== "Cancelled");
        } else if (is_active === "false") {
          reviews = reviews.filter((r) => r.finance_status === "Finance Approved" || r.finance_status === "Cancelled");
        }
      }
      if (department_id) {
        reviews = reviews.filter((r) => r.department_id === Number(department_id));
      }

      res.json({
        success: true,
        total: reviews.length,
        data: reviews,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve finance reviews" });
    }
  });

  /**
   * PATCH /api/finance/reviews/:canvassId/status
   * Updates finance status (Pending Finance Review | Over Budget (Needs Revision) | Finance Approved)
   */
  app.patch("/api/finance/reviews/:canvassId/status", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.canvassId);
      const { status, warehouse_id, remarks, performed_by, role } = req.body;

      const result = mockDb.updateFinanceStatus(canvassId, status, Number(warehouse_id) || 1, remarks, performed_by, role);
      if (!result.success) {
        return res.status(422).json(result);
      }
      res.json({
        success: true,
        message: status === "Finance Approved" ? "Finance Approved and PO automatically generated!" : `Finance status updated to '${status}'`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update finance status" });
    }
  });

  /**
   * POST /api/finance/reviews/:canvassId/approve
   * Validates budget balance, marks Finance Approved, and automatically creates Purchase Order (PO)
   */
  app.post("/api/finance/reviews/:canvassId/approve", (req: Request, res: Response) => {
    try {
      const canvassId = Number(req.params.canvassId);
      const warehouseId = Number(req.body.warehouse_id) || 1;
      const { remarks, performed_by, role } = req.body;

      const result = mockDb.approveFinanceAndCreatePO(canvassId, warehouseId, remarks, performed_by, role);
      if (!result.success) {
        return res.status(422).json(result);
      }
      res.json({
        success: true,
        message: `Budget approved! Purchase Order ${result.purchaseOrder?.po_no} generated with carried-over evidence.`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to approve finance request" });
    }
  });

  // =========================================================================
  // 1.5. PURCHASE REQUEST (PR) MODULE ENDPOINTS (FULL CRUD + WORKFLOW + REALTIME)
  // =========================================================================

  // Active SSE clients for real-time synchronization between Kanban and List views and modules
  const sseClients = new Set<Response>();

  const broadcastProcurementUpdate = (type: string, data: any) => {
    const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    for (const client of sseClients) {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch (err) {
        sseClients.delete(client);
      }
    }
  };

  /**
   * GET /api/realtime/procurement-stream
   * Real-time Server-Sent Events (SSE) stream for instant synchronization across
   * Department Module, Finance Module, Kanban Board, and List view.
   */
  app.get("/api/realtime/procurement-stream", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (typeof (res as any).flushHeaders === "function") {
      (res as any).flushHeaders();
    }

    // Send initial snapshot immediately
    const initialPayload = JSON.stringify({
      type: "INITIAL_SNAPSHOT",
      data: mockDb.getPurchaseRequests(),
      unified: mockDb.getUnifiedRecords(),
      canvasses: mockDb.getCanvasses(),
      purchaseOrders: mockDb.getPurchaseOrders(),
      timestamp: new Date().toISOString(),
    });
    res.write(`data: ${initialPayload}\n\n`);

    sseClients.add(res);

    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // =========================================================================
  // UNIFIED SINGLE SOURCE OF TRUTH (SSoT) PIPELINE REST ENDPOINTS
  // Implements the 6-stage sequence:
  // Stage 1: Request for Canvass (RFQ) -> "Pending Canvass"
  // Stage 2: Canvassing & Sourcing -> "Bid Awarded - Pending PR"
  // Stage 3: PR Drafting -> "Pending Finance Approval" (or "Contested" with justification)
  // Stage 4: Finance Approval -> "Finance Approved - Pending VPASA"
  // Stage 5: Final Authorization (VPASA) -> "Ready for PO"
  // Stage 6: Purchase Order Generation -> "PO Issued"
  // =========================================================================

  /**
   * GET /api/procurement/unified
   * Returns all unified procurement records across all pipeline stages
   */
  app.get("/api/procurement/unified", (_req: Request, res: Response) => {
    try {
      const records = mockDb.getUnifiedRecords();
      res.json({
        success: true,
        data: records,
        count: records.length,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to fetch unified records" });
    }
  });

  /**
   * POST /api/procurement/unified
   * Stage 1: Department creates a "Request for Canvass" (RFQ) -> status: 'Pending Canvass'
   */
  app.post("/api/procurement/unified", (req: Request, res: Response) => {
    try {
      const created = mockDb.createUnifiedPR(req.body);
      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "CREATE_RFQ",
        data: created,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });
      res.status(201).json({
        success: true,
        data: created,
        message: "Request for Canvass (RFQ) initiated successfully with status 'Pending Canvass'.",
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || "Failed to create Request for Canvass" });
    }
  });

  /**
   * POST /api/procurement/canvassing/award/:id
   * Stage 2: VPASA/PMO awards winning bid -> status: 'Bid Awarded - Pending PR'
   */
  app.post("/api/procurement/canvassing/award/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { bid_id, supplier_name, bid_amount, remarks } = req.body;
      const updated = mockDb.awardBidUnified(id, Number(bid_id), { supplier_name, bid_amount, remarks });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Canvass or Purchase Request record not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "CANVASS_AWARD",
        data: updated,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.json({
        success: true,
        data: updated,
        message: "Winning vendor bid awarded successfully. Status updated to 'Bid Awarded - Pending PR'.",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to award canvass" });
    }
  });

  /**
   * POST /api/procurement/purchase-requests/contest/:id
   * Stage 3: Department contests/rejects awarded bid -> status: 'Contested' + justification
   */
  app.post("/api/procurement/purchase-requests/contest/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { justification, contested_by } = req.body;
      const updated = mockDb.contestBidUnified(id, justification, contested_by);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Record not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "CONTEST_BID",
        data: updated,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.json({
        success: true,
        data: updated,
        message: "Awarded bid contested successfully. Status updated to 'Contested'.",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to contest awarded bid" });
    }
  });

  /**
   * POST /api/procurement/purchase-requests/submit-pr/:id
   * Stage 3: Department generates & submits formal Purchase Request -> status: 'Pending Finance Approval'
   */
  app.post("/api/procurement/purchase-requests/submit-pr/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { notes, submitted_by } = req.body;
      const updated = mockDb.submitPRFromBidUnified(id, { notes }, submitted_by);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Record not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "SUBMIT_FORMAL_PR",
        data: updated,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.json({
        success: true,
        data: updated,
        message: "Formal Purchase Request drafted and submitted to Finance. Status: 'Pending Finance Approval'.",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to submit Purchase Request" });
    }
  });

  /**
   * POST /api/procurement/finance/approve/:id
   * Stage 4: Finance Gatekeeper reviews budget against awarded bid -> status: 'Finance Approved - Pending VPASA'
   */
  app.post("/api/procurement/finance/approve/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { approver, remarks } = req.body;
      const updated = mockDb.approveFinanceUnified(id, approver, remarks);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Purchase Request not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "FINANCE_APPROVE",
        data: updated,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.json({
        success: true,
        data: updated,
        message: "Finance budget cleared successfully. Status: 'Finance Approved - Pending VPASA'.",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to approve request" });
    }
  });

  /**
   * POST /api/procurement/vpasa/authorize/:id
   * Stage 5: Final Executive Authorization (VPASA) -> status: 'Ready for PO'
   */
  app.post("/api/procurement/vpasa/authorize/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { approver, remarks } = req.body;
      const updated = mockDb.authorizeVPASAUnified(id, approver, remarks);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Purchase Request not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "VPASA_AUTHORIZE",
        data: updated,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.json({
        success: true,
        data: updated,
        message: "VPASA final authorization granted. Status updated to 'Ready for PO'.",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to authorize request" });
    }
  });

  /**
   * POST /api/procurement/finance/revision/:id
   * Finance requests revision: status -> 'Needs Revision' / 'Contested'
   */
  app.post("/api/procurement/finance/revision/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { remarks, approver } = req.body;
      const updated = mockDb.requestRevisionUnified(id, remarks, approver);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Purchase Request not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "FINANCE_REVISION",
        data: updated,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.json({
        success: true,
        data: updated,
        message: "Revision request recorded and sent back to Department.",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to request revision" });
    }
  });

  /**
   * POST /api/procurement/purchase-orders/generate/:id
   * Stage 6: Purchase Order Generation -> status: 'PO Issued'
   */
  app.post("/api/procurement/purchase-orders/generate/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const result = mockDb.generatePOUnified(id, req.body);
      if (!result) {
        return res.status(404).json({ success: false, message: "Record not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "PO_GENERATE",
        data: result.record,
        po: result.po,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.status(201).json({
        success: true,
        data: result.record,
        po: result.po,
        message: `Purchase Order ${result.po.po_no} successfully generated. Status: 'PO Issued'.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to generate Purchase Order" });
    }
  });

  /**
   * PATCH /api/procurement/unified/:id/status
   * General status transition synchronization
   */
  app.patch("/api/procurement/unified/:id/status", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status, remarks, performedBy } = req.body;
      const updated = mockDb.updateUnifiedStatus(id, status, remarks, performedBy);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Record not found" });
      }

      broadcastProcurementUpdate("UNIFIED_SYNC", {
        action: "STATUS_UPDATE",
        data: updated,
        allRecords: mockDb.getUnifiedRecords(),
        canvasses: mockDb.getCanvasses(),
        purchaseOrders: mockDb.getPurchaseOrders(),
      });

      res.json({
        success: true,
        data: updated,
        message: `Status updated to ${status}`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to update status" });
    }
  });

  /**
   * GET /api/purchase-requests
   * Supports query filters: ?status=... & ?department_id=... & ?search=... & ?pmo_view=true & ?pr_type=... & ?sub_category=...
   */
  app.get("/api/purchase-requests", (req: Request, res: Response) => {
    try {
      let requests = mockDb.getPurchaseRequests();
      const { status, department_id, search, pmo_view, pr_type, sub_category } = req.query;

      // When PMO view is active: "Ensure these cards do not appear in the PMO's view."
      if (pmo_view === "true" || pmo_view === "1") {
        requests = requests.filter(
          (r) => !r.is_bypassed_pmo && r.sub_category !== "HR & Training Services" && r.pr_type !== "Services/OpEx (Budget Only)"
        );
      }

      if (pr_type) {
        requests = requests.filter((r) => r.pr_type === String(pr_type));
      }

      if (sub_category) {
        requests = requests.filter((r) => r.sub_category === String(sub_category));
      }

      if (status) {
        requests = requests.filter((r) => r.status.toLowerCase() === String(status).toLowerCase());
      }
      if (department_id) {
        requests = requests.filter((r) => r.department_id === Number(department_id));
      }
      if (search) {
        const q = String(search).toLowerCase();
        requests = requests.filter(
          (r) =>
            r.pr_no.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.department_name.toLowerCase().includes(q) ||
            r.requested_by.toLowerCase().includes(q) ||
            (r.sub_category && r.sub_category.toLowerCase().includes(q)) ||
            (r.canvass_no && r.canvass_no.toLowerCase().includes(q))
        );
      }

      res.json({
        success: true,
        total: requests.length,
        data: requests,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve purchase requests" });
    }
  });

  /**
   * GET /api/purchase-requests/:id
   */
  app.get("/api/purchase-requests/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const pr = mockDb.getPurchaseRequestById(id);
      if (!pr) {
        return res.status(404).json({ success: false, message: `Purchase Request #${id} not found` });
      }
      res.json({ success: true, data: pr });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve purchase request" });
    }
  });

  /**
   * POST /api/purchase-requests
   */
  app.post("/api/purchase-requests", (req: Request, res: Response) => {
    try {
      const newPR = mockDb.createPurchaseRequest(req.body);
      broadcastProcurementUpdate("PR_CREATED", { pr: newPR, all: mockDb.getPurchaseRequests() });
      res.status(201).json({
        success: true,
        message: `Purchase Request ${newPR.pr_no} created successfully`,
        data: newPR,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create purchase request" });
    }
  });

  /**
   * PUT /api/purchase-requests/:id
   */
  app.put("/api/purchase-requests/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updated = mockDb.updatePurchaseRequest(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Purchase Request #${id} not found` });
      }
      broadcastProcurementUpdate("PR_UPDATED", { pr: updated, all: mockDb.getPurchaseRequests() });
      res.json({
        success: true,
        message: `Purchase Request ${updated.pr_no} updated successfully`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update purchase request" });
    }
  });

  /**
   * PATCH /api/purchase-requests/:id/status
   * Advance pipeline status. When set to 'Approved PR', automatically generates PO!
   * Enforces role check: Only users with 'Finance' role can approve/change status from 'Pending Finance Approval'.
   */
  app.patch("/api/purchase-requests/:id/status", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status, remarks, performed_by, role } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: "New status is required" });
      }

      const currentPR = mockDb.getPurchaseRequestById(id);
      if (!currentPR) {
        return res.status(404).json({ success: false, message: `Purchase Request #${id} not found` });
      }

      // Role check: Only users with the 'Finance' role are allowed to change a card's status if it is currently in 'Pending Finance Approval'
      if (currentPR.status === "Pending Finance Approval") {
        const isFinanceUser =
          Boolean(role) &&
          (role.toLowerCase() === "finance" ||
            role.toLowerCase() === "finance officer" ||
            role.toLowerCase() === "finance office" ||
            role.toLowerCase() === "super admin");

        if (!isFinanceUser) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized: Only Finance can approve this step.",
          });
        }
      }

      const updated = mockDb.updatePurchaseRequestStatus(id, status as PurchaseRequestStatus, remarks, performed_by, role);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Purchase Request #${id} not found` });
      }

      let extraMessage = "";
      if (status === "Approved PR" && updated.po_id) {
        extraMessage = ` Purchase Order ${updated.po_no} automatically generated with carried-over evidence.`;
      }

      broadcastProcurementUpdate("PR_STATUS_UPDATED", { pr: updated, all: mockDb.getPurchaseRequests() });

      res.json({
        success: true,
        message: `Purchase Request status updated to "${status}".${extraMessage}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update status" });
    }
  });

  /**
   * POST /api/purchase-requests/:id/resubmit
   * Department Initiator edits and resubmits a PR flagged as 'Needs Revision'
   * Transitions status back to 'Pending Finance Approval' and clears revision flag
   */
  app.post("/api/purchase-requests/:id/resubmit", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const pr = mockDb.getPurchaseRequestById(id);
      if (!pr) {
        return res.status(404).json({ success: false, message: `Purchase Request #${id} not found` });
      }

      const { items, title, purpose, notes, priority, performed_by } = req.body;
      const updates: any = {
        status: "Pending Finance Approval",
        revision_remarks: null,
        revision_requested_at: null,
      };

      if (items && Array.isArray(items)) updates.items = items;
      if (title) updates.title = title;
      if (purpose) updates.purpose = purpose;
      if (priority) updates.priority = priority;
      if (notes) {
        updates.notes = (pr.notes ? pr.notes + "\n" : "") + `[Resubmitted by ${performed_by || "Initiator"}]: ${notes}`;
      }

      const updated = mockDb.updatePurchaseRequest(id, updates);
      if (updated) {
        updated.status = "Pending Finance Approval";
        updated.revision_remarks = null;
        updated.stage_entered_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      }

      broadcastProcurementUpdate("PR_RESUBMITTED", { pr: updated, all: mockDb.getPurchaseRequests() });

      res.json({
        success: true,
        message: `Purchase Request ${pr.pr_no} successfully resubmitted to Finance queue.`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to resubmit purchase request" });
    }
  });

  /**
   * POST /api/purchase-requests/:id/sign
   * Register digital signature for dynamic management approval sequence (HR & Training Services)
   */
  app.post("/api/purchase-requests/:id/sign", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { role, signatory_name, remarks } = req.body;
      if (!role) {
        return res.status(400).json({ success: false, message: "Signatory role is required" });
      }
      const updated = mockDb.signPurchaseRequestStage(id, role, signatory_name, remarks);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Purchase Request #${id} not found or has no approval checklist` });
      }
      broadcastProcurementUpdate("PR_SIGNED", { pr: updated, all: mockDb.getPurchaseRequests() });
      res.json({
        success: true,
        message: `Digital signature registered for ${role}. Requisition moved to "${updated.status}".`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to register digital signature" });
    }
  });

  /**
   * POST /api/purchase-requests/:id/approve
   * Finance Office Approval: Encumbers budget & pushes to PO stage
   */
  app.post("/api/purchase-requests/:id/approve", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const result = mockDb.approvePurchaseRequest(id);
      if (!result.success) {
        return res.status(422).json(result);
      }
      broadcastProcurementUpdate("PR_APPROVED", { result, all: mockDb.getPurchaseRequests() });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to approve purchase request" });
    }
  });

  /**
   * POST /api/purchase-requests/:id/reject
   * Finance Office Return / Reject PR
   */
  app.post("/api/purchase-requests/:id/reject", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { reason } = req.body;
      const result = mockDb.rejectPurchaseRequest(id, reason);
      if (!result.success) {
        return res.status(404).json(result);
      }
      broadcastProcurementUpdate("PR_REJECTED", { result, all: mockDb.getPurchaseRequests() });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to reject purchase request" });
    }
  });

  /**
   * DELETE /api/purchase-requests/:id
   */
  app.delete("/api/purchase-requests/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = mockDb.deletePurchaseRequest(id);
      if (!success) {
        return res.status(404).json({ success: false, message: `Purchase Request #${id} not found` });
      }
      broadcastProcurementUpdate("PR_DELETED", { id, all: mockDb.getPurchaseRequests() });
      res.json({ success: true, message: `Purchase Request #${id} deleted successfully` });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to delete purchase request" });
    }
  });

  // =========================================================================
  // EVIDENCE & DOCUMENT ATTACHMENT ENDPOINTS (CROSS-MODULE AUDIT TRAIL)
  // =========================================================================

  /**
   * POST /api/attachments/:module/:id
   * Attach evidence to any card across Canvassing, Purchase Request, or Purchase Order
   */
  app.post("/api/attachments/:module/:id", (req: Request, res: Response) => {
    try {
      const { module, id } = req.params;
      const validModules = ["canvasses", "purchase-requests", "purchase-orders"] as const;
      if (!validModules.includes(module as any)) {
        return res.status(400).json({ success: false, message: `Invalid module '${module}'` });
      }

      const recordId = Number(id);
      const attachment = mockDb.addAttachment(module as any, recordId, req.body);
      if (!attachment) {
        return res.status(404).json({ success: false, message: `Record #${recordId} in ${module} not found` });
      }

      res.status(201).json({
        success: true,
        message: `Attachment '${attachment.name}' added successfully to ${module} #${recordId}`,
        data: attachment,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to add attachment" });
    }
  });

  /**
   * DELETE /api/attachments/:module/:id/:attachmentId
   * Remove attached evidence from a record
   */
  app.delete("/api/attachments/:module/:id/:attachmentId", (req: Request, res: Response) => {
    try {
      const { module, id, attachmentId } = req.params;
      const validModules = ["canvasses", "purchase-requests", "purchase-orders"] as const;
      if (!validModules.includes(module as any)) {
        return res.status(400).json({ success: false, message: `Invalid module '${module}'` });
      }

      const recordId = Number(id);
      const success = mockDb.deleteAttachment(module as any, recordId, attachmentId);
      if (!success) {
        return res.status(404).json({ success: false, message: "Record or attachment not found" });
      }

      res.json({
        success: true,
        message: `Attachment removed successfully`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to delete attachment" });
    }
  });

  // =========================================================================
  // 2. PURCHASE ORDER MODULE ENDPOINTS (FULL CRUD + KANBAN & AUTO-RESTOCK)
  // =========================================================================

  /**
   * GET /api/purchase-orders
   * Supports query filters: ?status=... & ?supplier_id=... & ?warehouse_id=... & ?search=...
   */
  app.get("/api/purchase-orders", (req: Request, res: Response) => {
    try {
      let orders = mockDb.getPurchaseOrders();
      const { status, supplier_id, warehouse_id, search, is_active } = req.query;

      if (is_active !== undefined) {
        if (is_active === "true") {
          orders = orders.filter((o) => o.status !== "Fully Received" && o.status !== "Cancelled" && o.status !== "Order Received");
        } else if (is_active === "false") {
          orders = orders.filter((o) => o.status === "Fully Received" || o.status === "Cancelled" || o.status === "Order Received");
        }
      }

      if (status) {
        orders = orders.filter((o) => o.status.toLowerCase() === String(status).toLowerCase());
      }
      if (supplier_id) {
        orders = orders.filter((o) => o.supplier_id === Number(supplier_id));
      }
      if (warehouse_id) {
        orders = orders.filter((o) => o.warehouse_id === Number(warehouse_id));
      }
      if (search) {
        const q = String(search).toLowerCase();
        orders = orders.filter(
          (o) =>
            o.po_no.toLowerCase().includes(q) ||
            o.supplier_name.toLowerCase().includes(q) ||
            (o.canvass_no && o.canvass_no.toLowerCase().includes(q)) ||
            o.warehouse_name.toLowerCase().includes(q)
        );
      }

      res.json({
        success: true,
        total: orders.length,
        data: orders,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve purchase orders" });
    }
  });

  /**
   * GET /api/purchase-orders/:id
   * Get single Purchase Order with line items
   */
  app.get("/api/purchase-orders/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const po = mockDb.getPurchaseOrderById(id);
      if (!po) {
        return res.status(404).json({ success: false, message: `Purchase Order #${id} not found` });
      }
      res.json({ success: true, data: po });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve purchase order" });
    }
  });

  /**
   * POST /api/purchase-orders
   * Create a new Purchase Order
   */
  app.post("/api/purchase-orders", (req: Request, res: Response) => {
    try {
      const created = mockDb.createPurchaseOrder(req.body);
      res.status(201).json({
        success: true,
        message: `Purchase Order ${created.po_no} created successfully`,
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create purchase order" });
    }
  });

  /**
   * PUT /api/purchase-orders/:id
   * Update full details of a Purchase Order
   */
  app.put("/api/purchase-orders/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updated = mockDb.updatePurchaseOrder(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Purchase Order #${id} not found` });
      }
      res.json({
        success: true,
        message: `Purchase Order ${updated.po_no} updated successfully`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update purchase order" });
    }
  });

  /**
   * PATCH /api/purchase-orders/:id/status
   * Update PO status (Kanban lifecycle).
   * Note: Transitioning to 'Fully Received' or 'Partially Received' automatically increments stock in Inventory.
   */
  app.patch("/api/purchase-orders/:id/status", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status, remarks, performed_by, role } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Field 'status' is required" });
      }

      const validStatuses: POStatus[] = [
        "Draft",
        "Sent to Supplier",
        "In Transit",
        "Partially Received",
        "Order Received",
        "Awaiting Approval",
        "Ordered",
        "Fully Received",
        "Cancelled",
      ];
      if (!validStatuses.includes(status as POStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status '${status}'. Valid values: ${validStatuses.join(", ")}`,
        });
      }

      const result = mockDb.updatePOStatus(id, status as POStatus, remarks, performed_by, role);
      if (!result) {
        return res.status(404).json({ success: false, message: `Purchase Order #${id} not found` });
      }

      const message =
        status === "Fully Received"
          ? `PO ${result.po.po_no} marked as Fully Received. ${result.restockedItems.length} inventory item(s) restocked!`
          : `Purchase Order ${result.po.po_no} moved to ${status}`;

      res.json({
        success: true,
        message,
        data: result.po,
        restockedItems: result.restockedItems,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update purchase order status" });
    }
  });

  /**
   * DELETE /api/purchase-orders/:id
   * Delete a Purchase Order
   */
  app.delete("/api/purchase-orders/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = mockDb.deletePurchaseOrder(id);
      if (!success) {
        return res.status(404).json({ success: false, message: `Purchase Order #${id} not found` });
      }
      res.json({
        success: true,
        message: `Purchase Order #${id} deleted successfully`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to delete purchase order" });
    }
  });

  // =========================================================================
  // 3. INVENTORY MANAGEMENT MODULE ENDPOINTS (FULL CRUD + ALERTS & STOCK)
  // =========================================================================

  /**
   * GET /api/inventory
   * Supports query filters: ?category=... & ?warehouse_id=... & ?status=... & ?search=...
   */
  app.get("/api/inventory", (req: Request, res: Response) => {
    try {
      let items = mockDb.getInventory();
      const { category, warehouse_id, status, search } = req.query;

      if (category) {
        items = items.filter((i) => i.category.toLowerCase() === String(category).toLowerCase());
      }
      if (warehouse_id) {
        items = items.filter((i) => i.warehouse_id === Number(warehouse_id));
      }
      if (status) {
        items = items.filter((i) => i.status.toLowerCase() === String(status).toLowerCase());
      }
      if (search) {
        const q = String(search).toLowerCase();
        items = items.filter(
          (i) =>
            i.product_code.toLowerCase().includes(q) ||
            i.product_name.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            i.warehouse_name.toLowerCase().includes(q)
        );
      }

      res.json({
        success: true,
        total: items.length,
        data: items,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve inventory" });
    }
  });

  /**
   * GET /api/inventory/alerts
   * Get Low Stock, Out of Stock, and Total Valuation metrics
   */
  app.get("/api/inventory/alerts", (_req: Request, res: Response) => {
    try {
      const alerts = mockDb.getInventoryAlerts();
      res.json({ success: true, data: alerts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve inventory alerts" });
    }
  });

  /**
   * GET /api/inventory/:id
   * Get single inventory product details
   */
  app.get("/api/inventory/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const item = mockDb.getInventoryById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: `Inventory item #${id} not found` });
      }
      res.json({ success: true, data: item });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve inventory item" });
    }
  });

  /**
   * POST /api/inventory
   * Register a new inventory product / SKU
   */
  app.post("/api/inventory", (req: Request, res: Response) => {
    try {
      const { product_name } = req.body;
      if (!product_name) {
        return res.status(400).json({ success: false, message: "Field 'product_name' is required" });
      }

      const created = mockDb.createInventoryItem(req.body);
      res.status(201).json({
        success: true,
        message: `Inventory item '${created.product_name}' registered successfully`,
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create inventory item" });
    }
  });

  /**
   * PUT /api/inventory/:id
   * Update an inventory item's attributes
   */
  app.put("/api/inventory/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updated = mockDb.updateInventoryItem(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Inventory item #${id} not found` });
      }
      res.json({
        success: true,
        message: `Inventory item '${updated.product_name}' updated successfully`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to update inventory item" });
    }
  });

  /**
   * PATCH /api/inventory/:id/stock
   * Adjust inventory stock levels (quantity adjustment with reason)
   */
  app.patch("/api/inventory/:id/stock", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { adjustment, reason } = req.body;

      if (adjustment === undefined || isNaN(Number(adjustment))) {
        return res.status(400).json({ success: false, message: "Valid numeric 'adjustment' is required" });
      }

      const updated = mockDb.adjustInventoryStock(id, Number(adjustment), reason || "Stock Adjustment");
      if (!updated) {
        return res.status(404).json({ success: false, message: `Inventory item #${id} not found` });
      }

      res.json({
        success: true,
        message: `Stock for '${updated.product_name}' adjusted by ${adjustment > 0 ? `+${adjustment}` : adjustment}. New quantity: ${updated.quantity}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to adjust stock" });
    }
  });

  /**
   * DELETE /api/inventory/:id
   * Delete / archive an inventory product
   */
  app.delete("/api/inventory/:id", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = mockDb.deleteInventoryItem(id);
      if (!success) {
        return res.status(404).json({ success: false, message: `Inventory item #${id} not found` });
      }
      res.json({
        success: true,
        message: `Inventory item #${id} deleted successfully`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to delete inventory item" });
    }
  });

  // =========================================================================
  // 4. SUPPLIERS MODULE ENDPOINTS (FULL CRUD)
  // =========================================================================

  app.get("/api/suppliers", (_req: Request, res: Response) => {
    res.json({ success: true, total: mockDb.suppliers.length, data: mockDb.suppliers });
  });

  app.get("/api/suppliers/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const supplier = mockDb.getSupplierById(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: `Supplier #${id} not found` });
    }
    res.json({ success: true, data: supplier });
  });

  app.post("/api/suppliers", (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Field 'name' is required" });
      }
      const created = mockDb.createSupplier(req.body);
      res.status(201).json({
        success: true,
        message: `Supplier '${created.name}' created successfully`,
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = mockDb.updateSupplier(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Supplier #${id} not found` });
    }
    res.json({
      success: true,
      message: `Supplier '${updated.name}' updated successfully`,
      data: updated,
    });
  });

  app.delete("/api/suppliers/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = mockDb.deleteSupplier(id);
    if (!success) {
      return res.status(404).json({ success: false, message: `Supplier #${id} not found` });
    }
    res.json({ success: true, message: `Supplier #${id} deleted successfully` });
  });

  // =========================================================================
  // 5. WAREHOUSES MODULE ENDPOINTS (FULL CRUD)
  // =========================================================================

  app.get("/api/warehouses", (_req: Request, res: Response) => {
    res.json({ success: true, total: mockDb.warehouses.length, data: mockDb.warehouses });
  });

  app.get("/api/warehouses/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const warehouse = mockDb.getWarehouseById(id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: `Warehouse #${id} not found` });
    }
    res.json({ success: true, data: warehouse });
  });

  app.post("/api/warehouses", (req: Request, res: Response) => {
    try {
      const { warehouse_name } = req.body;
      if (!warehouse_name) {
        return res.status(400).json({ success: false, message: "Field 'warehouse_name' is required" });
      }
      const created = mockDb.createWarehouse(req.body);
      res.status(201).json({
        success: true,
        message: `Warehouse '${created.warehouse_name}' created successfully`,
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create warehouse" });
    }
  });

  app.put("/api/warehouses/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = mockDb.updateWarehouse(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Warehouse #${id} not found` });
    }
    res.json({
      success: true,
      message: `Warehouse '${updated.warehouse_name}' updated successfully`,
      data: updated,
    });
  });

  app.delete("/api/warehouses/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = mockDb.deleteWarehouse(id);
    if (!success) {
      return res.status(404).json({ success: false, message: `Warehouse #${id} not found` });
    }
    res.json({ success: true, message: `Warehouse #${id} deleted successfully` });
  });

  // =========================================================================
  // 6. DEPARTMENTS MODULE ENDPOINTS (FULL CRUD & REAL-TIME BUDGET ALLOCATION)
  // =========================================================================

  app.get("/api/departments", (_req: Request, res: Response) => {
    const list = mockDb.getDepartments();
    res.json({ success: true, total: list.length, data: list });
  });

  app.get("/api/departments/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const dept = mockDb.getDepartmentById(id);
    if (!dept) {
      return res.status(404).json({ success: false, message: `Department #${id} not found` });
    }
    res.json({ success: true, data: dept });
  });

  app.get("/api/departments/:id/budget", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const budget = mockDb.calculateDepartmentBudget(id);
    if (!budget) {
      return res.status(404).json({ success: false, message: `Department #${id} not found` });
    }
    res.json({ success: true, data: budget });
  });

  app.post("/api/departments", (req: Request, res: Response) => {
    try {
      const { name, code, allocated_amount, budget_allocated, head } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, message: "Department Name is required" });
      }
      const budgetVal = Number(allocated_amount ?? budget_allocated) || 0;
      const created = mockDb.createDepartment({
        name: name.trim(),
        code: (code || name.slice(0, 4)).trim().toUpperCase(),
        head: (head || "Department Dean / Head").trim(),
        allocated_amount: budgetVal,
      });
      res.status(201).json({
        success: true,
        message: `Department '${created.name}' (${created.code}) created successfully with an initial budget of ₱${Number(created.allocated_amount).toLocaleString()}`,
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updated = mockDb.updateDepartment(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Department #${id} not found` });
    }
    res.json({
      success: true,
      message: `Department '${updated.name}' updated successfully`,
      data: updated,
    });
  });

  app.delete("/api/departments/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = mockDb.deleteDepartment(id);
    if (!success) {
      return res.status(404).json({ success: false, message: `Department #${id} not found` });
    }
    res.json({ success: true, message: `Department #${id} deleted successfully` });
  });

  // =========================================================================
  // 6.5. ITEM RELEASES / WAREHOUSE DISPATCH ENDPOINTS
  // =========================================================================

  app.get("/api/releases", (req: Request, res: Response) => {
    try {
      let releases = mockDb.getItemReleases();
      const { status, department_id } = req.query;
      if (status) {
        releases = releases.filter((r) => r.status.toLowerCase() === String(status).toLowerCase());
      }
      if (department_id) {
        releases = releases.filter((r) => r.department_id === Number(department_id));
      }
      res.json({ success: true, total: releases.length, data: releases });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve item releases" });
    }
  });

  app.post("/api/releases", (req: Request, res: Response) => {
    try {
      const created = mockDb.createItemRelease(req.body);
      res.status(201).json({ success: true, message: `Release request ${created.release_no} created`, data: created });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to create release request" });
    }
  });

  app.patch("/api/releases/:id/dispatch", (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updated = mockDb.dispatchItemRelease(id);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Release request #${id} not found` });
      }
      res.json({
        success: true,
        message: `Release ${updated.release_no} successfully dispatched to ${updated.department_name}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to dispatch release request" });
    }
  });

  // =========================================================================
  // 6.6. DASHBOARD EXECUTIVE COCKPIT & BUDGET BURN-RATE ENDPOINTS
  // =========================================================================

  /**
   * GET /api/dashboard/metrics
   * Aggregated pipeline stats: active Canvasses, PRs, POs, and critical Inventory alerts
   */
  app.get("/api/dashboard/metrics", (_req: Request, res: Response) => {
    try {
      const metrics = mockDb.getDashboardMetrics();
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to load dashboard metrics" });
    }
  });

  /**
   * GET /api/dashboard/budget_burn_rate
   * Department budget health: Allocated, Utilized, Encumbered, Remaining, and burn rate %
   */
  app.get("/api/dashboard/budget_burn_rate", (_req: Request, res: Response) => {
    try {
      const burnRateData = mockDb.getBudgetBurnRate();
      res.json({ success: true, data: burnRateData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to load budget burn rate" });
    }
  });

  /**
   * GET /api/dashboard/procurement_velocity
   * Lead Time & Velocity Analytics: stage durations, bottleneck alerts, average cycle time
   */
  app.get("/api/dashboard/procurement_velocity", (_req: Request, res: Response) => {
    try {
      const velocity = mockDb.getProcurementVelocity();
      res.json({ success: true, data: velocity });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to load procurement velocity metrics" });
    }
  });

  // =========================================================================
  // 7. DEMO / SYSTEM MANAGEMENT ENDPOINTS
  // =========================================================================

  app.post("/api/reset-db", (_req: Request, res: Response) => {
    mockDb.reset();
    res.json({
      success: true,
      message: "Database reset to initial demo state with connected Canvasses, POs, and Inventory",
    });
  });

  // =========================================================================
  // 8. VITE INTEGRATION & PRODUCTION STATIC HOSTING
  // =========================================================================

  const isDev = process.env.APP_ENV === "development";
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (!isDev && hasDist) {
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FSUU PMO Inventory Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
