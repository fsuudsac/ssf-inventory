import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { userData } from "./appConfig";

const ProcurementRealtimeContext = createContext(null);

export const ProcurementRealtimeProvider = ({ children }) => {
  // SSoT Unified Records
  const [unifiedRecords, setUnifiedRecords] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [canvasses, setCanvasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // User & Active Session State
  const [activeRole, setActiveRole] = useState("Department"); // "Department" | "Finance" | "PMO / Procurement"
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(2); // CCS default

  const broadcastChannelRef = useRef(null);
  const eventSourceRef = useRef(null);

  const storedUser = userData();
  const currentUser = {
    id: storedUser?.id || 1,
    name:
      activeRole === "Finance"
        ? "Elena Bautista (Finance Officer)"
        : activeRole === "PMO / Procurement"
        ? "Engr. Mark Villanueva (Procurement Officer)"
        : "Dr. Rachel Soriano (Dept Head)",
    role: activeRole,
    department_id: activeRole === "Finance" ? 5 : selectedDepartmentId || 2,
    department_name:
      activeRole === "Finance"
        ? "Finance & Accounting Office"
        : activeRole === "PMO / Procurement"
        ? "Physical Plant & Property Management Office (PMO)"
        : "College of Computer Studies (CCS)",
  };

  // Fetch all unified records from SSoT endpoint
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [unifiedRes, poRes, canRes, deptRes, supRes, whRes] = await Promise.allSettled([
        axios.get("/api/procurement/unified"),
        axios.get("/api/purchase-orders"),
        axios.get("/api/canvasses"),
        axios.get("/api/departments"),
        axios.get("/api/suppliers"),
        axios.get("/api/warehouses"),
      ]);

      if (unifiedRes.status === "fulfilled" && unifiedRes.value?.data?.data) {
        setUnifiedRecords(unifiedRes.value.data.data);
      }
      if (poRes.status === "fulfilled" && poRes.value?.data?.data) {
        setPurchaseOrders(poRes.value.data.data);
      }
      if (canRes.status === "fulfilled" && canRes.value?.data?.data) {
        setCanvasses(canRes.value.data.data);
      }
      if (deptRes.status === "fulfilled" && deptRes.value?.data?.data) {
        setDepartments(deptRes.value.data.data);
      }
      if (supRes.status === "fulfilled" && supRes.value?.data?.data) {
        setSuppliers(supRes.value.data.data);
      }
      if (whRes.status === "fulfilled" && whRes.value?.data?.data) {
        setWarehouses(whRes.value.data.data);
      }
    } catch (err) {
      console.error("Failed to load procurement SSoT data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Broadcast state change across local BroadcastChannel
  const broadcastLocalChange = (type, data) => {
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type, data });
      }
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }
  };

  // Real-Time Subscriptions: Server-Sent Events (SSE) + BroadcastChannel
  useEffect(() => {
    fetchAllData();

    // 1. Local tab-to-tab BroadcastChannel
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("procurement_realtime_sync");
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === "UNIFIED_RECORDS_REPLACED" && Array.isArray(data)) {
          setUnifiedRecords(data);
        } else if (type === "RECORD_UPDATED" && data) {
          setUnifiedRecords((prev) =>
            prev.map((item) => (item.id === data.id ? { ...item, ...data } : item))
          );
        } else if (type === "RECORD_CREATED" && data) {
          setUnifiedRecords((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
        }
      };
    }

    // 2. Server-Sent Events (SSE) connecting to /api/realtime/procurement-stream
    let es;
    try {
      es = new EventSource("/api/realtime/procurement-stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "INITIAL_SNAPSHOT") {
            if (Array.isArray(parsed.unified)) {
              setUnifiedRecords(parsed.unified);
            } else if (Array.isArray(parsed.data)) {
              setUnifiedRecords(parsed.data);
            }
            if (Array.isArray(parsed.purchaseOrders)) {
              setPurchaseOrders(parsed.purchaseOrders);
            }
            if (Array.isArray(parsed.canvasses)) {
              setCanvasses(parsed.canvasses);
            }
          } else if (parsed.type === "UNIFIED_SYNC") {
            if (Array.isArray(parsed.data?.allRecords)) {
              setUnifiedRecords(parsed.data.allRecords);
            } else if (parsed.data?.data) {
              const updated = parsed.data.data;
              setUnifiedRecords((prev) => {
                const exists = prev.some((r) => r.id === updated.id);
                if (exists) {
                  return prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r));
                }
                return [updated, ...prev];
              });
            }
            if (Array.isArray(parsed.data?.purchaseOrders)) {
              setPurchaseOrders(parsed.data.purchaseOrders);
            }
            if (Array.isArray(parsed.data?.canvasses)) {
              setCanvasses(parsed.data.canvasses);
            }
          } else if (parsed.type === "STATE_UPDATED" || parsed.type === "PR_UPDATED") {
            fetchAllData();
          }
        } catch (e) {
          console.warn("SSE parse error:", e);
        }
      };

      es.onerror = () => {
        // EventSource will automatically reconnect
      };
    } catch (err) {
      console.warn("EventSource setup error:", err);
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [fetchAllData]);

  // ==========================================
  // PIPELINE ACTIONS (MUTATIONS WITH REAL-TIME BROADCAST)
  // ==========================================

  // Stage 1: Request for Canvass (Department Portal)
  // Sets status to 'Pending Canvass'
  const createRequestForCanvass = useCallback(
    async (formData) => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      const tempId = Date.now();
      const tempRecord = {
        id: tempId,
        pr_id: tempId,
        canvass_id: tempId,
        pr_no: `RFQ-${new Date().getFullYear()}-${String(tempId).slice(-4)}`,
        canvass_no: `CNV-${new Date().getFullYear()}-${String(tempId).slice(-4)}`,
        title: formData.title || "Request for Canvass",
        department_id: formData.department_id || selectedDepartmentId || 2,
        department_name: formData.department_name || "Requesting Department",
        requested_by: formData.requested_by || currentUser.name,
        priority: formData.priority || "Normal",
        status: "Pending Canvass",
        items: formData.items || [],
        total_amount:
          formData.total_amount ||
          (formData.items || []).reduce(
            (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.estimated_unit_cost) || 0),
            0
          ),
        notes: formData.notes || "",
        created_at: nowStr,
        updated_at: nowStr,
      };

      // Optimistic update
      setUnifiedRecords((prev) => {
        const next = [tempRecord, ...prev];
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post("/api/procurement/unified", {
          ...formData,
          status: "Pending Canvass",
        });
        if (res.data?.data) {
          const realRecord = res.data.data;
          setUnifiedRecords((prev) => {
            const next = prev.map((r) => (r.id === tempId ? realRecord : r));
            broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
            return next;
          });
          return realRecord;
        }
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, selectedDepartmentId, fetchAllData]
  );

  // Alias for backward compatibility
  const createPurchaseRequest = createRequestForCanvass;

  // Stage 2: Canvassing Module: Start Bidding -> sets status to 'Bidding'
  const startBidding = useCallback(
    async (id) => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      setUnifiedRecords((prev) => {
        const next = prev.map((r) =>
          r.id === id || r.canvass_id === id ? { ...r, status: "Bidding", updated_at: nowStr } : r
        );
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        await axios.patch(`/api/procurement/unified/${id}/status`, {
          status: "Bidding",
          performedBy: currentUser.name,
        });
      } catch (err) {
        fetchAllData();
      }
    },
    [currentUser.name, fetchAllData]
  );

  // Stage 2: Award Vendor -> sets status to 'Bid Awarded - Pending PR'
  // Moves request to Department Stage 3 for PR Drafting
  const awardBid = useCallback(
    async (id, bidId, supplierInfo = {}) => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

      // Optimistic update
      setUnifiedRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === id || r.canvass_id === id || r.pr_id === id) {
            return {
              ...r,
              status: "Bid Awarded - Pending PR",
              winning_bid_id: bidId,
              awarded_supplier_name: supplierInfo.supplier_name || r.supplier_name || "Awarded Vendor",
              awarded_amount: supplierInfo.bid_amount || r.total_amount,
              updated_at: nowStr,
            };
          }
          return r;
        });
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post(`/api/procurement/canvassing/award/${id}`, {
          bid_id: bidId,
          ...supplierInfo,
        });
        if (res.data?.data) {
          const updated = res.data.data;
          setUnifiedRecords((prev) =>
            prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, ...updated } : r))
          );
        }
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [fetchAllData]
  );

  // Stage 3: Department contests/rejects awarded bid -> status: 'Contested' + justification
  const contestBid = useCallback(
    async (id, justification) => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

      // Optimistic update
      setUnifiedRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === id || r.pr_id === id || r.canvass_id === id) {
            return {
              ...r,
              status: "Contested",
              contest_justification: justification,
              updated_at: nowStr,
            };
          }
          return r;
        });
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post(`/api/procurement/purchase-requests/contest/${id}`, {
          justification,
          contested_by: currentUser.name,
        });
        if (res.data?.data) {
          const updated = res.data.data;
          setUnifiedRecords((prev) =>
            prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, ...updated } : r))
          );
        }
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, fetchAllData]
  );

  // Stage 3: Department generates & submits formal Purchase Request -> status: 'Pending Finance Approval'
  const submitFormalPR = useCallback(
    async (id, notes = "") => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

      // Optimistic update
      setUnifiedRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === id || r.pr_id === id || r.canvass_id === id) {
            return {
              ...r,
              status: "Pending Finance Approval",
              notes: notes || r.notes,
              updated_at: nowStr,
            };
          }
          return r;
        });
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post(`/api/procurement/purchase-requests/submit-pr/${id}`, {
          notes,
          submitted_by: currentUser.name,
        });
        if (res.data?.data) {
          const updated = res.data.data;
          setUnifiedRecords((prev) =>
            prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, ...updated } : r))
          );
        }
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, fetchAllData]
  );

  // Stage 4: Finance Module: Approve -> sets status to 'Finance Approved - Pending VPASA'
  const approveFinance = useCallback(
    async (id, remarks = "Finance Budget Clearance Approved") => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

      // Optimistic update
      setUnifiedRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === id || r.pr_id === id) {
            return {
              ...r,
              status: "Finance Approved - Pending VPASA",
              finance_approved_at: nowStr,
              finance_approved_by: currentUser.name,
              updated_at: nowStr,
            };
          }
          return r;
        });
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post(`/api/procurement/finance/approve/${id}`, {
          approver: currentUser.name,
          remarks,
        });
        if (res.data?.data) {
          const updated = res.data.data;
          setUnifiedRecords((prev) =>
            prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, ...updated } : r))
          );
        }
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, fetchAllData]
  );

  // Stage 5: VPASA Executive Authorization -> sets status to 'Ready for PO'
  const authorizeVPASA = useCallback(
    async (id, remarks = "Final Executive Authorization Approved") => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

      // Optimistic update
      setUnifiedRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === id || r.pr_id === id) {
            return {
              ...r,
              status: "Ready for PO",
              vpasa_authorized_at: nowStr,
              vpasa_authorized_by: currentUser.name,
              updated_at: nowStr,
            };
          }
          return r;
        });
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post(`/api/procurement/vpasa/authorize/${id}`, {
          approver: currentUser.name,
          remarks,
        });
        if (res.data?.data) {
          const updated = res.data.data;
          setUnifiedRecords((prev) =>
            prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, ...updated } : r))
          );
        }
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, fetchAllData]
  );

  // Stage 4: Finance Module: Needs Revision -> sets status to 'Needs Revision'
  const requestRevisionFinance = useCallback(
    async (id, remarks) => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

      // Optimistic update
      setUnifiedRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === id || r.pr_id === id) {
            return {
              ...r,
              status: "Needs Revision",
              revision_remarks: remarks || "Revision requested by Finance",
              revision_requested_at: nowStr,
              revision_requested_by: currentUser.name,
              updated_at: nowStr,
            };
          }
          return r;
        });
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post(`/api/procurement/finance/revision/${id}`, {
          remarks,
          approver: currentUser.name,
        });
        if (res.data?.data) {
          const updated = res.data.data;
          setUnifiedRecords((prev) =>
            prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, ...updated } : r))
          );
        }
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, fetchAllData]
  );

  // Resubmit PR after Revision -> status to 'Pending Finance Approval'
  const resubmitPR = useCallback(
    async (id, updates) => {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);

      setUnifiedRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === id || r.pr_id === id) {
            return {
              ...r,
              ...updates,
              status: "Pending Finance Approval",
              revision_remarks: null,
              revision_requested_at: null,
              updated_at: nowStr,
            };
          }
          return r;
        });
        broadcastLocalChange("UNIFIED_RECORDS_REPLACED", next);
        return next;
      });

      try {
        const res = await axios.post(`/api/purchase-requests/${id}/resubmit`, {
          ...updates,
          performed_by: currentUser.name,
        });
        fetchAllData();
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, fetchAllData]
  );

  // Stage 6: Purchase Order Module: Generate PO document -> sets status to 'PO Issued'
  const generatePO = useCallback(
    async (id, poData = {}) => {
      try {
        const res = await axios.post(`/api/procurement/purchase-orders/generate/${id}`, poData);
        if (res.data?.data) {
          const updated = res.data.data;
          const newPO = res.data.po;
          setUnifiedRecords((prev) =>
            prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, ...updated } : r))
          );
          if (newPO) {
            setPurchaseOrders((prev) => [newPO, ...prev.filter((p) => p.id !== newPO.id)]);
          }
          broadcastLocalChange("RECORD_UPDATED", updated);
        }
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [fetchAllData]
  );

  // General status update helper
  const updateRecordStatus = useCallback(
    async (id, status, remarks = "") => {
      setUnifiedRecords((prev) =>
        prev.map((r) => (r.id === id || r.pr_id === id ? { ...r, status } : r))
      );
      try {
        const res = await axios.patch(`/api/procurement/unified/${id}/status`, {
          status,
          remarks,
          performedBy: currentUser.name,
        });
        return res.data;
      } catch (err) {
        fetchAllData();
        throw err;
      }
    },
    [currentUser.name, fetchAllData]
  );

  // ==========================================
  // 6-STAGE PIPELINE FILTERS
  // ==========================================

  // All records for department portfolio overview
  const departmentPRs = unifiedRecords;

  // Stage 1: Requests for Canvass
  const departmentRFQRecords = unifiedRecords.filter(
    (r) => r.status === "Pending Canvass" || r.status === "Draft"
  );

  // Stage 2: Sourcing Queue (Canvassing & Sourcing Module)
  // STRICTLY filter for 'Pending Canvass', 'Bidding', 'Seeking Bids'
  const canvassingRecords = unifiedRecords.filter(
    (r) =>
      r.status === "Pending Canvass" ||
      r.status === "Bidding" ||
      r.status === "Seeking Bids" ||
      r.status === "Canvassing" ||
      r.status === "Canvassing / Bidding" ||
      r.status === "Ready for Canvass"
  );

  // Stage 3: Purchase Request Drafting (Department Portal)
  // STRICTLY filter for 'Bid Awarded - Pending PR' and 'Contested'
  const prDraftingRecords = unifiedRecords.filter(
    (r) => r.status === "Bid Awarded - Pending PR" || r.status === "Contested"
  );

  // Stage 4: Finance Approval (Finance Gatekeeper)
  // STRICTLY filter for 'Pending Finance Approval' or 'Budget Review'
  const financePendingRecords = unifiedRecords.filter(
    (r) => r.status === "Pending Finance Approval" || r.status === "Budget Review"
  );

  // Stage 5: Final Executive Authorization (VPASA View)
  // STRICTLY filter for 'Finance Approved - Pending VPASA'
  const vpasaPendingRecords = unifiedRecords.filter(
    (r) => r.status === "Finance Approved - Pending VPASA"
  );

  // Stage 6: Purchase Order Module
  // STRICTLY filter for 'Ready for PO'
  const readyForPORecords = unifiedRecords.filter(
    (r) => r.status === "Ready for PO" || r.status === "Winning Bid Selected"
  );

  // Issued PO records (for historical / tracking view)
  const issuedPORecords = unifiedRecords.filter(
    (r) => r.status === "PO Issued" || r.status === "Purchase Order Issued" || Boolean(r.po_id)
  );

  return (
    <ProcurementRealtimeContext.Provider
      value={{
        // SSoT State
        unifiedRecords,
        purchaseOrders,
        canvasses,
        departments,
        suppliers,
        warehouses,
        loading,
        currentUser,
        activeRole,
        setActiveRole,
        selectedDepartmentId,
        setSelectedDepartmentId,

        // Pipeline Filtered Views
        departmentPRs,
        departmentRFQRecords,
        canvassingRecords,
        prDraftingRecords,
        financePendingRecords,
        vpasaPendingRecords,
        readyForPORecords,
        issuedPORecords,

        // Backward compatibility properties
        purchaseRequests: unifiedRecords,
        setPurchaseRequests: setUnifiedRecords,
        updatePRStatus: updateRecordStatus,
        approvePR: approveFinance,
        requestRevision: requestRevisionFinance,

        // Pipeline Actions
        createRequestForCanvass,
        createPurchaseRequest,
        startBidding,
        awardBid,
        contestBid,
        submitFormalPR,
        approveFinance,
        authorizeVPASA,
        requestRevisionFinance,
        resubmitPR,
        generatePO,
        updateRecordStatus,
        refresh: fetchAllData,
        refreshAll: fetchAllData,
        fetchPurchaseRequests: fetchAllData,
      }}
    >
      {children}
    </ProcurementRealtimeContext.Provider>
  );
};

export const useProcurementRealtime = () => {
  const context = useContext(ProcurementRealtimeContext);
  if (!context) {
    throw new Error("useProcurementRealtime must be used within a ProcurementRealtimeProvider");
  }
  return context;
};
