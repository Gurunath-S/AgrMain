import React, { useEffect, useState, useRef } from "react";
import "./overallreport.css";
import "../CustomerReturn&Repair/Customer.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search, Clear as ClearIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const OverallReportNew = () => {
  const [reportData, setReportData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeCustomers, setActiveCustomers] = useState([]); // Base list for period
  const [filteredCustomers, setFilteredCustomers] = useState([]); // Search-filtered list
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(dayjs().subtract(15, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    setReportData([]);
    try {
      let start = startDate ? startDate.format("YYYY-MM-DD") : "";
      let end = endDate ? endDate.format("YYYY-MM-DD") : "";

      // If 'From' is selected but 'To' is not, default 'To' to today
      if (start && !end) {
        end = dayjs().format("YYYY-MM-DD");
      }
      // If 'To' is selected but 'From' is not, default 'From' to a very early date
      if (!start && end) {
        start = "2000-01-01";
      }

      const queryParams = (start && end) ? `?startDate=${start}&endDate=${end}` : "";
      
      const [customersRes, billsRes, stockRes, entriesRes, purchaseStockRes] = await Promise.all([
        fetch(`${BACKEND_SERVER_URL}/api/customers${queryParams}`),
        fetch(`${BACKEND_SERVER_URL}/api/bill${queryParams}`),
        fetch(`${BACKEND_SERVER_URL}/api/productStock${queryParams}`),
        fetch(`${BACKEND_SERVER_URL}/api/entries${queryParams}`),
        fetch(`${BACKEND_SERVER_URL}/api/item-purchase/itemstock${queryParams}`),
      ]);

      if (!customersRes.ok) throw new Error("Failed to fetch Customers data");
      if (!billsRes.ok) throw new Error("Failed to fetch Bills data");
      if (!stockRes.ok) throw new Error("Failed to fetch Product Stock data");
      if (!entriesRes.ok) throw new Error("Failed to fetch Entries data");
      if (!purchaseStockRes.ok) throw new Error("Failed to fetch Item Purchase Stock data");

      const [customersData, bills, productStock, entriesData, purchaseStockData] = await Promise.all([
        customersRes.json(),
        billsRes.json(),
        stockRes.json(),
        entriesRes.json(),
        purchaseStockRes.json(),
      ]);

      const isFiltered = !!(start && end);
      const billData = bills?.data || [];

      // Calculate totals based on whether filter is applied
      let pureBalanceTotal, hallmarkBalanceTotal, activeCustomersCount;

      if (isFiltered) {
        // When filtered: show only activity (gold movement) for that period
        pureBalanceTotal = billData.reduce(
          (sum, b) => sum + (parseFloat(b.billPureEffect) || 0),
          0
        );
        hallmarkBalanceTotal = billData.reduce(
          (sum, b) => sum + (parseFloat(b.billHallmarkEffect) || 0),
          0
        );
        // Count only customers who billed during this period
        const activeCustomerIds = new Set(billData.map(b => b.customer_id));
        activeCustomersCount = activeCustomerIds.size;
      } else {
        // No filter: show absolute current running balances for all time
        pureBalanceTotal = customersData.reduce(
          (sum, c) => sum + (parseFloat(c.customerBillBalance?.balance) || 0),
          0
        );
        hallmarkBalanceTotal = customersData.reduce(
          (sum, c) => sum + (parseFloat(c.customerBillBalance?.hallMarkBal) || 0),
          0
        );
        activeCustomersCount = customersData.length;
      }

      // Option A: The table always shows ALL customers and their all-time overall running balance
      setActiveCustomers(customersData);
      setFilteredCustomers(customersData);

      setCustomers(customersData);

      const billDetailsProfit = billData.reduce(
        (sum, b) => sum + (parseFloat(b.billDetailsprofit) || 0),
        0
      );
      const stoneProfit = billData.reduce(
        (sum, b) => sum + (parseFloat(b.Stoneprofit) || 0),
        0
      );
      const totalProfit = billData.reduce(
        (sum, b) => sum + (parseFloat(b.Totalprofit) || 0),
        0
      );

      const stockItems = productStock?.allStock || [];
      const totalStockCount = stockItems.length;
      const totalStockTouch = stockItems.reduce(
        (sum, s) => sum + (parseFloat(s.touch) || 0),
        0
      );

      const totalEntriesPurity = entriesData.reduce(
        (sum, e) => {
          if (e.type === "Gold") {
            return sum + (parseFloat(e.purity) || 0);
          } else if (e.type === "Cash" || e.type === "Cash RTGS") {
            console.log(e)
            const pureGold = e.touch > 0 ? (parseFloat(e.purity) / parseFloat(e.touch)) * 100 : 0;
            return sum + (pureGold || 0);
          }
          return sum;
        },
        0
      );

      const purchaseStockItems = purchaseStockData?.allStock || [];
      const totalPurchaseStockCount = purchaseStockItems.length;
      const totalPurchaseStockTouch = purchaseStockItems.reduce(
        (sum, s) => sum + (parseFloat(s.touch) || 0),
        0
      );

      setReportData([
        { label: "Bill Details Profit", value: `${billDetailsProfit.toFixed(2)}` },
        { label: "Stone Profit", value: `${stoneProfit.toFixed(2)}` },
        { label: "Total Profit", value: `${totalProfit.toFixed(2)}` },
        { label: isFiltered ? "Pure Sold Total" : "Pure Balance Total", value: `${pureBalanceTotal.toFixed(3)} g` },
        { label: isFiltered ? "Hallmark Sold Total" : "Hallmark Balance Total", value: `${hallmarkBalanceTotal.toFixed(3)} g` },
        { label: "Cash/Gold (Pure gold + purity)", value: `${totalEntriesPurity.toFixed(3)} g` },
        { label: isFiltered ? "Active Customers" : "Total Customers", value: `${activeCustomersCount}` },
        {
          label: isFiltered ? "Stock Added" : "Stock",
          value: `${totalStockCount + totalPurchaseStockCount} Items (Touch ${(totalStockTouch + totalPurchaseStockTouch).toFixed(3)})`,
        },
      ]);
    } catch (err) {
      console.error("Error fetching report:", err);
      toast.error(err.message || "Failed to fetch report data");
      setReportData([{ label: "Error", value: "Could not load data" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredCustomers(
      activeCustomers.filter((c) => c.name?.toLowerCase().includes(lower))
    );
    setPage(0);
  }, [searchTerm, activeCustomers]);

  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const handlePrint = (type) => {
    const fmtPrintDate = (d) => (d ? d.format("DD/MM/YYYY") : "—");
    const dateRangeText = startDate || endDate 
      ? `Date Range: ${fmtPrintDate(startDate)} to ${fmtPrintDate(endDate)}` 
      : "";

    const summaryHtml = `
      <div class="summary-section">
        <h3>Report Summary</h3>
        <div class="summary-grid">
          ${reportData.map(item => `
            <div class="summary-item">
              <div class="s-label">${item.label}</div>
              <div class="s-value">${item.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const tableRows = filteredCustomers.map((c, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${c.name}</td>
        <td>${c.phone || "-"}</td>
        <td>${(parseFloat(c.customerBillBalance?.balance) || 0).toFixed(3)}</td>
        <td>${(parseFloat(c.customerBillBalance?.hallMarkBal) || 0).toFixed(3)}</td>
      </tr>
    `).join("");

    const balancesHtml = `
      <div class="balances-section">
        <h3>Customer Bill Balances</h3>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Pure Balance</th>
              <th>Hallmark Balance</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;

    const printHtml = `
      <html>
        <head>
          <title>Overall Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 4px; color: #000; }
            h3 { border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 20px; }
            .date-range { text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 14px; color: #666; }
            
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-item { padding: 12px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; }
            .s-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; font-weight: bold; }
            .s-value { font-size: 18px; font-weight: bold; color: #000; }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: center; font-size: 13px; }
            th { background: #f4f4f4; font-weight: bold; }
            tr:nth-child(even) { background: #f9f9f9; }
            
            @media print {
              .summary-item { break-inside: avoid; }
              table { break-inside: auto; }
              tr { break-inside: avoid; break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h2>Overall Report</h2>
          ${dateRangeText ? `<p class="date-range">${dateRangeText}</p>` : ""}
          ${(type === 'summary' || type === 'both') ? summaryHtml : ''}
          ${(type === 'balances' || type === 'both') ? balancesHtml : ''}
        </body>
      </html>
    `;

    const newWin = window.open("", "_blank", "width=1000,height=700");
    newWin.document.write(printHtml);
    newWin.document.close();
    newWin.focus();
    setTimeout(() => {
      newWin.print();
      newWin.close();
    }, 400);
    setPrintDialogOpen(false);
  };

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box p={3}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Overall Report</Typography>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            Summary of all balances, stock, and profits
          </Typography>
        </Box>
        <Box className="no-print">
          <Button variant="outlined" onClick={() => setPrintDialogOpen(true)}>Print Report</Button>
        </Box>
      </Box>

      {/* Print Selection Dialog */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Print Report Selection</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            What would you like to include in the printed report?
          </Typography>
          <Stack spacing={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => handlePrint('summary')}
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              Print Summary Cards Only
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => handlePrint('balances')}
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              Print Customer Balances Only
            </Button>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => handlePrint('both')}
              sx={{ justifyContent: 'flex-start', py: 1.5, backgroundColor: '#0074d9' }}
            >
              Print Full Report (Both)
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Box mb={4} display="flex" gap={2} flexWrap="wrap" alignItems="center" className="no-print">
        <TextField
          size="small"
          placeholder="Search customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />
          }}
          sx={{ width: 260 }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={startDate}
            format="DD/MM/YYYY"
            maxDate={endDate || undefined}
            onChange={(newValue) => {
              if (newValue && endDate && newValue.isAfter(endDate, "day")) {
                toast.error("From Date cannot be after To Date");
                return;
              }
              setStartDate(newValue);
            }}
            slotProps={{ textField: { size: "small", sx: { width: 200 } } }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="To Date"
            value={endDate}
            format="DD/MM/YYYY"
            minDate={startDate || undefined}
            onChange={(newValue) => {
              if (newValue && startDate && newValue.isBefore(startDate, "day")) {
                toast.error("To Date cannot be before From Date");
                return;
              }
              setEndDate(newValue);
            }}
            slotProps={{ textField: { size: "small", sx: { width: 200 } } }}
          />
        </LocalizationProvider>
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: "#d32f2f",
            color: "white",
            "&:hover": { backgroundColor: "#c62828" },
            height: "40px",
            textTransform: "none"
          }}
          onClick={() => {
            setSearchTerm("");
            setStartDate(dayjs().subtract(15, "day"));
            setEndDate(dayjs());
          }}
        >
          Reset
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <div className="report-cards-container no-print">
            {reportData.map((item, idx) => (
              <div key={idx} className="report-card">
                <div className="card-label">{item.label}</div>
                <div className="card-value">{item.value}</div>
              </div>
            ))}
          </div>

          <Box className="customer-balances-section">
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Customer Bill Balances
            </Typography>
            
            <Table className="BillTable">
              <TableHead>
                <TableRow>
                  <TableCell className="BillTable-th-td">S.No</TableCell>
                  <TableCell className="BillTable-th-td">Customer Name</TableCell>
                  <TableCell className="BillTable-th-td">Phone</TableCell>
                  <TableCell className="BillTable-th-td">Pure Balance</TableCell>
                  <TableCell className="BillTable-th-td">Hallmark Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((c, index) => (
                    <TableRow key={c.id || index}>
                      <TableCell className="BillTable-tb-td">{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell className="BillTable-tb-td">{c.name}</TableCell>
                      <TableCell className="BillTable-tb-td">{c.phone || "-"}</TableCell>
                      <TableCell className="BillTable-tb-td">{(parseFloat(c.customerBillBalance?.balance) || 0).toFixed(3)}</TableCell>
                      <TableCell className="BillTable-tb-td">{(parseFloat(c.customerBillBalance?.hallMarkBal) || 0).toFixed(3)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No matching customers found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <TablePagination
              component="div"
              count={filteredCustomers.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              className="no-print"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default OverallReportNew;
