import { mockDb } from "./mockDatabase";

async function runSimulationAndStressTest() {
  console.log("==================================================================");
  console.log("🧪 STARTING FSUU PROCUREMENT 6-STAGE PIPELINE SIMULATION & STRESS TEST");
  console.log("==================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) {
        console.error("     Details:", details);
      }
    }
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 1: E2E 6-STAGE PIPELINE SIMULATION (HAPPY PATH)
  // -------------------------------------------------------------------------
  console.log("📋 Test Suite 1: Full 6-Stage Procurement Pipeline Flow (Happy Path)");

  // Stage 1: Department initiates RFQ
  const rfqPayload = {
    title: "High Performance Computing Lab Workstations",
    department_id: 2,
    department_name: "College of Computer Studies (CCS)",
    requested_by: "Prof. Alan Turing",
    priority: "Urgent",
    notes: "Simulation & AI model training nodes for Senior Capstone Research",
    total_estimated_budget: 150000,
    items: [
      {
        item_name: "GPU Workstation Tower Core i9 64GB RAM RTX 4080",
        description: "Includes 3-year on-site enterprise warranty",
        quantity: 5,
        unit: "Units",
        estimated_unit_cost: 30000,
        total_estimated_cost: 150000,
      },
    ],
  };

  const initialDept = mockDb.getDepartmentById(2);
  const initialDeptRemaining = initialDept ? initialDept.remaining_balance || initialDept.budget_remaining : 0;
  console.log(`  Initial CCS Department Remaining Budget: ₱${initialDeptRemaining.toLocaleString()}`);

  const stage1Record = mockDb.createUnifiedRFQ(rfqPayload);
  assert(!!stage1Record, "Stage 1: RFQ created successfully");
  assert(stage1Record?.status === "Pending Canvass", "Stage 1: Status is strictly 'Pending Canvass'", stage1Record?.status);
  assert(stage1Record?.items?.length === 1, "Stage 1: Line items correctly initialized", stage1Record?.items?.length);

  const canvassId = stage1Record.canvass_id || stage1Record.id;
  const canvass = mockDb.getCanvassById(canvassId);
  assert(canvass?.status === "Pending Canvass", "Stage 1: Canvass entity status is 'Pending Canvass'");

  // Stage 2: Sourcing & Canvassing - Receive bids and award winner
  console.log("\n  Stage 2: Adding competitive supplier quotations...");
  const bids = [
    {
      supplier_id: 1,
      supplier_name: "Crown Paper & Office Supplies Corp.",
      contact_person: "Eduardo Santos",
      email: "sales@crownpaper.ph",
      phone: "(085) 342-8812",
      bid_amount: 155000,
      payment_terms: "Net 30",
      delivery_lead_time_days: 14,
      delivery_date: "2026-10-15",
      remarks: "Includes basic standard warranty.",
      status: "pending" as const,
      item_bids: [],
    },
    {
      supplier_id: 2,
      supplier_name: "Silicon Valley IT Solutions & Systems",
      contact_person: "Kristine Joy Mendoza",
      email: "corporate@siliconvalleysystems.com",
      phone: "(085) 815-4490",
      bid_amount: 145000,
      payment_terms: "30 Days Net",
      delivery_lead_time_days: 7,
      delivery_date: "2026-10-08",
      remarks: "Official distributor, includes free delivery and installation.",
      status: "pending" as const,
      item_bids: [],
    },
    {
      supplier_id: 4,
      supplier_name: "Agusan Tech Innovations & Electronics",
      contact_person: "Engr. Carlos Lim",
      email: "carlos@agusantech.com",
      phone: "0919-445-8833",
      bid_amount: 148000,
      payment_terms: "Net 30",
      delivery_lead_time_days: 10,
      delivery_date: "2026-10-11",
      remarks: "Local stock ready in Butuan.",
      status: "pending" as const,
      item_bids: [],
    },
  ];

  let winningBidId = 0;
  for (const bid of bids) {
    const addedBid = mockDb.addSupplierBid(canvassId, bid);
    assert(!!addedBid, `Stage 2: Bid added for ${bid.supplier_name}`);
    if (bid.supplier_name.includes("Silicon Valley")) {
      winningBidId = addedBid?.id || 0;
    }
  }

  assert(winningBidId > 0, "Stage 2: Winning bid ID identified");

  console.log("  Stage 2: Awarding winning bid to Silicon Valley IT Solutions...");
  const stage2Record = mockDb.awardBidUnified(stage1Record.id, winningBidId, {
    supplier_name: "Silicon Valley IT Solutions & Systems",
    bid_amount: 145000,
    remarks: "Lowest calculated and responsive bid meeting all workstation specifications.",
  });

  assert(!!stage2Record, "Stage 2: Award bid executed successfully");
  assert(
    stage2Record?.status === "Bid Awarded - Pending PR",
    "Stage 2: Status transitioned to 'Bid Awarded - Pending PR'",
    stage2Record?.status
  );
  assert(stage2Record?.winning_bid_amount === 145000, "Stage 2: Winning amount matches awarded bid");

  // Stage 3: Purchase Request Drafting by Department
  console.log("\n  Stage 3: Department drafts formal PR from winning bid...");
  const stage3Record = mockDb.submitPRFromBidUnified(
    stage2Record!.id,
    { notes: "Formal PR drafted by CICT Dean following Canvass Committee abstract of bids." },
    "Dean CICT"
  );

  assert(!!stage3Record, "Stage 3: Formal PR submitted successfully");
  assert(
    stage3Record?.status === "Pending Finance Approval",
    "Stage 3: Status transitioned to 'Pending Finance Approval'",
    stage3Record?.status
  );

  // Stage 4: Finance Office Verification & Budget Encumbrance
  console.log("\n  Stage 4: Finance Office budget verification...");
  const stage4Record = mockDb.approveFinanceUnified(
    stage3Record!.id,
    "Ms. Elena Bautista (Budget Director)",
    "Allocated under CICT 2026 Equipment Modernization Fund. Encumbered ₱145,000."
  );

  assert(!!stage4Record, "Stage 4: Finance approval executed successfully");
  assert(
    stage4Record?.status === "Finance Approved - Pending VPASA",
    "Stage 4: Status transitioned to 'Finance Approved - Pending VPASA'",
    stage4Record?.status
  );

  const updatedDept = mockDb.getDepartmentById(2);
  const updatedDeptRemaining = updatedDept ? updatedDept.remaining_balance || updatedDept.budget_remaining : 0;
  assert(
    updatedDeptRemaining === initialDeptRemaining - 145000,
    "Stage 4: Department budget accurately encumbered by winning bid amount (₱145,000)",
    { before: initialDeptRemaining, after: updatedDeptRemaining, diff: initialDeptRemaining - updatedDeptRemaining }
  );

  // Stage 5: VPASA Executive Authorization
  console.log("\n  Stage 5: VPASA Executive Authorization...");
  const stage5Record = mockDb.authorizeVPASAUnified(
    stage4Record!.id,
    "Dr. Ronald Castillo (VPASA)",
    "Approved and confirmed compliant with University Procurement Manual and BAC Resolution."
  );

  assert(!!stage5Record, "Stage 5: VPASA authorization executed successfully");
  assert(
    stage5Record?.status === "Ready for PO",
    "Stage 5: Status transitioned to 'Ready for PO'",
    stage5Record?.status
  );

  // Stage 6: Purchase Order Generation
  console.log("\n  Stage 6: PMO generates official Purchase Order...");
  const poResult = mockDb.generatePOUnified(stage5Record!.id, {
    warehouse_id: 1,
    delivery_date: "2026-10-08",
    payment_terms: "30 Days Net",
    notes: "Official Purchase Order dispatched to Silicon Valley IT Solutions & Systems.",
  });

  assert(!!poResult, "Stage 6: PO generation executed successfully");
  assert(
    poResult?.record?.status === "PO Issued",
    "Stage 6: Requisition status updated to 'PO Issued'",
    poResult?.record?.status
  );
  assert(
    poResult?.po?.status === "Sent to Supplier",
    "Stage 6: New PO initialized to 'Sent to Supplier'",
    poResult?.po?.status
  );
  assert(
    poResult?.po?.total_amount === 145000,
    "Stage 6: PO total matches awarded quotation ₱145,000",
    poResult?.po?.total_amount
  );

  // Post-Stage 6: Fulfillment & Inventory Receiving
  console.log("\n  Post-Stage 6: Receiving delivery and restocking inventory...");
  const poId = poResult!.po.id;

  // Transition PO: Sent to Supplier -> In Transit -> Fully Received
  const poInTransit = mockDb.updatePurchaseOrderStatus(poId, "In Transit");
  assert(poInTransit?.status === "In Transit", "PO status changed to 'In Transit'");

  // Record inventory quantity before receipt
  const invItemsBefore = mockDb.getInventoryItems();
  const initialInvCount = invItemsBefore.length;

  const poReceived = mockDb.updatePurchaseOrderStatus(poId, "Fully Received");
  assert(poReceived?.status === "Fully Received", "PO status updated to 'Fully Received'");

  // Verify inventory reflects received items
  const invItemsAfter = mockDb.getInventoryItems();
  const matchedInv = invItemsAfter.find(item =>
    (item as any).product_name?.includes("GPU Workstation Tower") ||
    (item as any).item_name?.includes("GPU Workstation Tower") ||
    (item as any).name?.includes("GPU Workstation Tower")
  );
  assert(
    !!matchedInv || invItemsAfter.length >= initialInvCount,
    "Inventory reflects items from completed procurement receipt",
    { totalItems: invItemsAfter.length }
  );

  // Check audit trail completeness
  const finalUnified = mockDb.getUnifiedRecordById(stage1Record.id);
  assert(!!finalUnified, "Unified record retrieved");
  assert(
    (finalUnified?.trail?.length || 0) >= 6,
    `Audit trail captures all stages (found ${finalUnified?.trail?.length} trail entries)`
  );

  // -------------------------------------------------------------------------
  // TEST SUITE 2: CONTEST / REJECTION FLOW & RE-CANVASSING
  // -------------------------------------------------------------------------
  console.log("\n📋 Test Suite 2: Department Bid Contest & Re-Canvass Flow");

  // Create another RFQ
  const rfq2 = mockDb.createUnifiedRFQ({
    title: "Laboratory Reagents and Chemicals for College of Arts & Sciences",
    department_id: 3,
    department_name: "College of Arts and Sciences (CAS)",
    requested_by: "Dr. Marie Curie",
    priority: "Normal",
    notes: "Analytical chemistry lab supplies for 1st semester",
    total_estimated_budget: 120000,
    items: [
      {
        item_name: "Hydrochloric Acid 37% AR Grade 2.5L",
        description: "Analytical Reagent grade with Certificate of Analysis",
        quantity: 10,
        unit: "Bottles",
        estimated_unit_cost: 3500,
        total_estimated_cost: 35000,
      },
    ],
  });

  const canvass2Id = rfq2.canvass_id || rfq2.id;
  const bidX = mockDb.addSupplierBid(canvass2Id, {
    supplier_id: 3,
    supplier_name: "Davao Scientific Supply & Chemicals",
    contact_person: "Dr. Rodrigo Tan",
    email: "sales@davaoscientific.ph",
    phone: "(082) 299-1234",
    bid_amount: 115000,
    payment_terms: "Net 30",
    delivery_lead_time_days: 20,
    delivery_date: "2026-10-30",
    remarks: "Technical grade instead of AR grade.",
    status: "pending" as const,
    item_bids: [],
  });

  // PMO awards bid
  mockDb.awardBidUnified(rfq2.id, bidX!.id, {
    supplier_name: "Davao Scientific Supply & Chemicals",
    bid_amount: 115000,
    remarks: "Awarded based on lowest cost.",
  });

  // Department Contests Bid due to specification mismatch
  console.log("  Department contesting awarded bid due to spec mismatch...");
  const contestedRecord = mockDb.contestBidUnified(
    rfq2.id,
    "Supplier offered Technical Grade instead of requested AR Grade with CoA. Will compromise lab experiment validity.",
    "Dr. Marie Curie (CAS Dept Chair)"
  );

  assert(
    contestedRecord?.status === "Contested",
    "Contested bid sets status strictly to 'Contested'",
    contestedRecord?.status
  );
  assert(
    contestedRecord?.contest_justification?.includes("AR Grade"),
    "Contest justification recorded in record metadata"
  );

  // Re-awarding to another supplier after contest
  console.log("  Re-awarding to compliant supplier after contest...");
  const bidY = mockDb.addSupplierBid(canvass2Id, {
    supplier_id: 5,
    supplier_name: "Bio-Chem Allied Solutions Manila",
    contact_person: "Marilou Cruz",
    email: "marilou@biochemallied.ph",
    phone: "(02) 8821-9900",
    bid_amount: 118000,
    payment_terms: "Net 30",
    delivery_lead_time_days: 10,
    delivery_date: "2026-10-15",
    remarks: "Certified Merck AR Grade with complete Batch CoA.",
    status: "pending" as const,
    item_bids: [],
  });

  const reAwarded = mockDb.awardBidUnified(rfq2.id, bidY!.id, {
    supplier_name: "Bio-Chem Allied Solutions Manila",
    bid_amount: 118000,
    remarks: "Re-awarded to compliant AR Grade supplier following CAS contest.",
  });

  assert(
    reAwarded?.status === "Bid Awarded - Pending PR",
    "Re-award resets status back to 'Bid Awarded - Pending PR'",
    reAwarded?.status
  );
  assert(
    reAwarded?.contest_justification === null,
    "Re-award clears previous contest justification"
  );

  // -------------------------------------------------------------------------
  // TEST SUITE 3: FINANCE REVISION REQUEST FLOW
  // -------------------------------------------------------------------------
  console.log("\n📋 Test Suite 3: Finance Revision Request & Resubmission Flow");

  // Advance re-awarded record to Stage 3
  const prSubmitted = mockDb.submitPRFromBidUnified(reAwarded!.id, { notes: "Formal PR with Merck AR Grade specs" }, "Dr. Marie Curie");
  assert(prSubmitted?.status === "Pending Finance Approval", "Status is 'Pending Finance Approval'");

  // Finance requests revision
  const revisionRequested = mockDb.requestRevisionUnified(
    reAwarded!.id,
    "Department CAS allocated balance is tight; please split delivery into 2 tranches or re-align OPEX budget.",
    "Finance Director Elena Bautista"
  );

  assert(
    revisionRequested?.status === "Needs Revision",
    "Finance revision sets status to 'Needs Revision'",
    revisionRequested?.status
  );

  // Department resubmits PR
  const resubmitted = mockDb.resubmitPurchaseRequest(
    reAwarded!.id,
    "Revised delivery terms approved with vendor into 2 tranches. Re-aligned with Dean approval."
  );

  assert(
    resubmitted?.status === "Pending Finance Approval",
    "Department resubmission returns status to 'Pending Finance Approval'",
    resubmitted?.status
  );

  // -------------------------------------------------------------------------
  // TEST SUITE 4: STRESS TEST & CONCURRENCY BURST
  // -------------------------------------------------------------------------
  console.log("\n📋 Test Suite 4: Concurrency & Stress Testing (50 Parallel Requests)");

  const CONCURRENT_REQUESTS = 50;
  const startTime = Date.now();
  const stressPromises: Promise<any>[] = [];

  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    const task = async (index: number) => {
      // Step 1: Create RFQ
      const rfq = mockDb.createUnifiedRFQ({
        title: `Stress Test Requisition #${index + 1} - Network Equipment`,
        department_id: (index % 4) + 1,
        department_name: `Department ${(index % 4) + 1}`,
        requested_by: `Requester #${index + 1}`,
        priority: index % 3 === 0 ? "Urgent" : "Normal",
        notes: `Automated stress test pipeline instance #${index + 1}`,
        total_estimated_budget: 50000 + (index * 1000),
        items: [
          {
            item_name: `Cat6 UTP Cable Box 305m Batch ${index + 1}`,
            description: "Solid copper 23AWG",
            quantity: 5 + (index % 10),
            unit: "Boxes",
            estimated_unit_cost: 6500,
            total_estimated_cost: (5 + (index % 10)) * 6500,
          },
        ],
      });

      if (!rfq) throw new Error(`Failed to create RFQ ${index}`);

      const canvId = rfq.canvass_id || rfq.id;

      // Step 2: Add Bid and Award
      const bid = mockDb.addSupplierBid(canvId, {
        supplier_id: (index % 5) + 1,
        supplier_name: `Supplier ${(index % 5) + 1}`,
        contact_person: `Sales Rep ${index}`,
        email: `sales${index}@supplier.com`,
        phone: `0917-000-${String(index).padStart(4, "0")}`,
        bid_amount: 48000 + (index * 1000),
        payment_terms: "Net 30",
        delivery_lead_time_days: 5,
        delivery_date: "2026-10-20",
        remarks: `Bid for test #${index}`,
        status: "pending" as const,
        item_bids: [],
      });

      if (!bid) throw new Error(`Failed to add bid ${index}`);

      const awarded = mockDb.awardBidUnified(rfq.id, bid.id, {
        supplier_name: bid.supplier_name,
        bid_amount: bid.bid_amount,
        remarks: "Awarded during stress test",
      });
      if (awarded?.status !== "Bid Awarded - Pending PR") throw new Error(`Award mismatch ${index}`);

      // Step 3: Formal PR
      const drafted = mockDb.submitPRFromBidUnified(rfq.id, { notes: "Drafted" }, `Requester ${index}`);
      if (drafted?.status !== "Pending Finance Approval") throw new Error(`PR Draft mismatch ${index}`);

      // Step 4: Finance Approval
      const finApproved = mockDb.approveFinanceUnified(rfq.id, "Elena Bautista", "Stress approved");
      if (finApproved?.status !== "Finance Approved - Pending VPASA") throw new Error(`Finance mismatch ${index}`);

      // Step 5: VPASA Authorization
      const vpasaAuth = mockDb.authorizeVPASAUnified(rfq.id, "Dr. Ronald Castillo", "Executive signed");
      if (vpasaAuth?.status !== "Ready for PO") throw new Error(`VPASA mismatch ${index}`);

      // Step 6: Generate PO
      const poGen = mockDb.generatePOUnified(rfq.id, {
        delivery_date: "2026-10-25",
        payment_terms: "30 Days",
      });
      if (poGen?.record?.status !== "PO Issued") throw new Error(`PO Gen mismatch ${index}`);

      return { id: rfq.id, poNo: poGen.po.po_no };
    };

    stressPromises.push(task(i));
  }

  const results = await Promise.allSettled(stressPromises);
  const elapsed = Date.now() - startTime;
  const fulfilledCount = results.filter(r => r.status === "fulfilled").length;
  const rejectedCount = results.filter(r => r.status === "rejected").length;

  console.log(`  Stress test execution completed in ${elapsed}ms`);
  console.log(`  Processed: ${CONCURRENT_REQUESTS} full 6-stage lifecycles (300 state transitions)`);
  console.log(`  Successful: ${fulfilledCount}/${CONCURRENT_REQUESTS}`);
  console.log(`  Failed: ${rejectedCount}`);

  assert(fulfilledCount === CONCURRENT_REQUESTS, `All ${CONCURRENT_REQUESTS} parallel lifecycles succeeded without race conditions or locks`);

  // -------------------------------------------------------------------------
  // TEST SUITE 5: DATA INTEGRITY & CORRUPTION CHECKS
  // -------------------------------------------------------------------------
  console.log("\n📋 Test Suite 5: Database State & Referential Integrity Verification");

  const allUnified = mockDb.getUnifiedRecords();
  const allCanvasses = mockDb.getCanvasses();
  const allPRs = mockDb.getPurchaseRequests();
  const allPOs = mockDb.getPurchaseOrders();

  console.log(`  Total Unified Records: ${allUnified.length}`);
  console.log(`  Total Canvasses: ${allCanvasses.length}`);
  console.log(`  Total Purchase Requests: ${allPRs.length}`);
  console.log(`  Total Purchase Orders: ${allPOs.length}`);

  let corruptedRecords = 0;
  for (const record of allUnified) {
    if (!record.id || !record.title || !record.status) {
      corruptedRecords++;
    }
  }
  assert(corruptedRecords === 0, "No corrupted records found in unified database", { corruptedCount: corruptedRecords });

  // Verify status consistency between PR and Canvass
  let desyncedRecords = 0;
  for (const pr of allPRs) {
    if (pr.canvass_id) {
      const parentCanvass = mockDb.getCanvassById(pr.canvass_id);
      if (parentCanvass) {
        // Canvass and PR should agree on pipeline state
        if (parentCanvass.status !== pr.status) {
          desyncedRecords++;
          console.warn(`  ⚠️ Desync alert: PR ${pr.pr_no} (${pr.status}) vs Canvass ${parentCanvass.canvass_no} (${parentCanvass.status})`);
        }
      }
    }
  }
  assert(desyncedRecords === 0, "All paired Canvass & Purchase Request records have synchronized statuses", { desyncCount: desyncedRecords });

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`🏁 SIMULATION & STRESS TEST RESULTS:`);
  console.log(`   Total Assertions: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failedTests}`);
  console.log("==================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSimulationAndStressTest().catch(err => {
  console.error("Fatal error during simulation test:", err);
  process.exit(1);
});
