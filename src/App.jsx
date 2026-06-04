import { useState, useEffect, useMemo } from "react";
import {
  Box, Button, Typography, Grid, Card, CardActionArea, CardContent,
  Container, AppBar, Toolbar, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Chip, CircularProgress, InputAdornment, Breadcrumbs, Link,
  ThemeProvider, createTheme, CssBaseline, alpha
} from "@mui/material";
import {
  Inventory2Outlined, BarChartOutlined, PeopleOutlined,
  SettingsOutlined, ArrowBackOutlined, SearchOutlined,
  StorefrontOutlined
} from "@mui/icons-material";

// ── Theme ──────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary:   { main: "#1a4a8a" },
    secondary: { main: "#f0a500" },
    background: { default: "#f5f7fa", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0" }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, backgroundColor: "#f0f4fa", color: "#1a4a8a" }
      }
    }
  }
});

// ── Mock data (replace GET /api/inventory with real fetch) ─────────────────
// const MOCK_ITEMS = [
//   { id: 1,  name: "Organic Whole Milk",    sku: "DAIRY-001", category: "Dairy",   qty: 42,  unit: "gallon", price: 5.49,  status: "In Stock"    },
//   { id: 2,  name: "Sourdough Bread",       sku: "BAKE-014",  category: "Bakery",  qty: 8,   unit: "loaf",   price: 4.99,  status: "Low Stock"   },
//   { id: 3,  name: "Free Range Eggs",       sku: "DAIRY-005", category: "Dairy",   qty: 0,   unit: "dozen",  price: 6.29,  status: "Out of Stock"},
//   { id: 4,  name: "Atlantic Salmon",       sku: "MEAT-022",  category: "Meat",    qty: 17,  unit: "lb",     price: 12.99, status: "In Stock"    },
//   { id: 5,  name: "Roma Tomatoes",         sku: "PROD-008",  category: "Produce", qty: 134, unit: "lb",     price: 1.29,  status: "In Stock"    },
//   { id: 6,  name: "Greek Yogurt",          sku: "DAIRY-010", category: "Dairy",   qty: 55,  unit: "cup",    price: 2.49,  status: "In Stock"    },
//   { id: 7,  name: "Chicken Breast",        sku: "MEAT-003",  category: "Meat",    qty: 6,   unit: "lb",     price: 8.49,  status: "Low Stock"   },
//   { id: 8,  name: "Basmati Rice",          sku: "GRAIN-011", category: "Grains",  qty: 72,  unit: "bag",    price: 3.99,  status: "In Stock"    },
//   { id: 9,  name: "Baby Spinach",          sku: "PROD-019",  category: "Produce", qty: 29,  unit: "bag",    price: 3.49,  status: "In Stock"    },
//   { id: 10, name: "Cheddar Cheese",        sku: "DAIRY-018", category: "Dairy",   qty: 3,   unit: "block",  price: 7.99,  status: "Low Stock"   },
//   { id: 11, name: "Whole Wheat Pasta",     sku: "GRAIN-007", category: "Grains",  qty: 98,  unit: "box",    price: 2.29,  status: "In Stock"    },
//   { id: 12, name: "Ground Beef 80/20",     sku: "MEAT-009",  category: "Meat",    qty: 0,   unit: "lb",     price: 6.99,  status: "Out of Stock"},
//   { id: 13, name: "Russet Potatoes",       sku: "PROD-003",  category: "Produce", qty: 200, unit: "lb",     price: 0.89,  status: "In Stock"    },
//   { id: 14, name: "Brioche Buns",          sku: "BAKE-022",  category: "Bakery",  qty: 12,  unit: "pack",   price: 3.79,  status: "In Stock"    },
// ];

const CATEGORIES = ["All", "Poultry", "Red Meat", "Seafood", "Game Meat"];

// const statusColor = (s) =>
//   s === "In Stock" ? "success" : s === "Low Stock" ? "warning" : "error";

// ── Inventory Page ─────────────────────────────────────────────────────────
function InventoryPage({ onBack }) {
  const [items,     setItems]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [search,    setSearch]   = useState("");
  const [category,  setCategory] = useState("All");
  const [newName, setNewName] = useState("");
  const [newCount, setNewCount] = useState("");
  const [newMeatType, setNewMeatType] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editItem, setEditItem] = useState(null)
  // const [status,    setStatus]   = useState("All"); status isn't being used anymore since backend doesn't contain status 

  useEffect(() => {
    // Replace with: fetch("https://your-api/api/inventory").then(r => r.json()).then(setItems)
    // const timer = setTimeout(() => { setItems(MOCK_ITEMS); setLoading(false); }, 900);
    // return () => clearTimeout(timer);
    fetch("http://127.0.0.1:5000/meats?limit=20").then(r => r.json()).then(setItems).then(() => setLoading(false))
  }, []);

  const filtered = useMemo(() => items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch   = !q || item.name.toLowerCase().includes(q) /*|| item.sku.toLowerCase().includes(q)*/;
    const matchCategory = category === "All" || item.meat_type === category;
    // const matchStatus   = status   === "All" || item.status   === status;
    return matchSearch && matchCategory /*&& matchStatus*/;
  }), [items, search, category]);

  const handleAdd = () => {
    if(!newName || !newCount || !newMeatType || !newPrice) {
      return;
    }

    const duplicate = items.some(meat => meat.name.toLowerCase() == newName.toLowerCase())
    if(duplicate) {
      return;
    }

    const newMeat = {
      name: newName.charAt(0).toUpperCase() + newName.slice(1),
      count: newCount,
      meat_type: newMeatType,
      price_per_oz: parseFloat(newPrice)
    }

    fetch("http://127.0.0.1:5000/meats", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMeat)
    }).then(r => r.json()).then(setItems).then(() => setLoading(false))
  }

  function handleDelete(name) {
    fetch(`http://127.0.0.1:5000/meats/${name}`, {
      method: 'DELETE'
    }).then(() => setItems(items.filter(item => item.name != name)))
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid #dde2ee" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBackOutlined />
          </IconButton>
          <StorefrontOutlined sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>FreshMart</Typography>
          <Breadcrumbs sx={{ color: "white" }}>
            <Link color="inherit" underline="hover" onClick={onBack} sx={{ cursor: "pointer" }}>Home</Link>
            <Typography color="white">Inventory</Typography>
          </Breadcrumbs>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Inventory</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {loading ? "Loading…" : `${filtered.length} of ${items.length} items`}
        </Typography>

        <div>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Add Meat</Typography>
          <div style={{ padding: '20px' }}>
            <TextField
              placeholder="Enter Name"
              size="small"
              onChange={e => setNewName(e.target.value)}
            />
            <TextField
              placeholder="Enter count"
              size="small"
              sx={{paddingRight: '5px', paddingLeft: '5px'}}
              onChange={e => setNewCount(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newMeatType}
                label="Category"
                onChange={e => setNewMeatType(e.target.value)}
              >
                {CATEGORIES.map(c => <MenuItem key={c} value={c}> {c} </MenuItem> )}
              </Select>
            </FormControl>
            <TextField
              placeholder="Enter Price"
              size="small"
              sx={{paddingLeft:'5px'}}
              onChange={e => setNewPrice(e.target.value)}
            />
            <Button 
            variant="contained" 
            sx={{marginLeft: '10px'}}
            onClick={handleAdd}
            > 
            ADD 
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #dde2ee", borderRadius: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search name..."
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 240, flexGrow: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          {/* <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl> */}
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #dde2ee", borderRadius: 2 }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Meat Type</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Price Per Ounce</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} color="primary" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No items match your filters.
                  </TableCell>
                </TableRow>
              ) : filtered.map((item, i) => (
                <TableRow
                  key={item.id}
                  sx={{
                    bgcolor: i % 2 === 0 ? "transparent" : alpha("#1a6b3a", 0.02),
                    "&:hover": { bgcolor: alpha("#1a6b3a", 0.05) },
                    transition: "background 0.15s"
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                  <TableCell>{item.meat_type}</TableCell>
                  <TableCell align="right">{item.count}</TableCell>
                  <TableCell align="right">${item.price_per_oz.toFixed(2)}</TableCell>
                  <TableCell align="right"> 
                    <Button 
                    sx={{
                      bgcolor: 'darkred',
                      '&:hover': {bgcolor: '#5c0000'}
                    }} 
                    variant="contained" 
                    onClick={() => handleDelete(item.name)}> 
                      Delete 
                    </Button>
                    <Button 
                    variant="contained"
                    onClick={handleAdd}
                    sx={{marginLeft: '10px'}}
                    >
                      UPDATE
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────────
const NAV_CARDS = [
  { label: "Inventory",  desc: "Browse, filter and manage stock levels",    icon: <Inventory2Outlined sx={{ fontSize: 40 }} />, active: true  },
  { label: "Reports",    desc: "Sales trends, turnover and shrinkage data", icon: <BarChartOutlined   sx={{ fontSize: 40 }} />, active: false },
  { label: "Suppliers",  desc: "Manage vendor contacts and purchase orders",icon: <PeopleOutlined     sx={{ fontSize: 40 }} />, active: false },
  { label: "Settings",   desc: "Store config, users and integrations",      icon: <SettingsOutlined   sx={{ fontSize: 40 }} />, active: false },
];

function LandingPage({ onNavigate }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid #dde2ee" }}>
        <Toolbar>
          <StorefrontOutlined sx={{ mr: 1 }} />
          <Typography variant="h6">FreshMart</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>Store Management</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          Select a module to get started.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {NAV_CARDS.map(card => (
            <Grid item xs={12} sm={6} key={card.label}>
              <Card sx={{
                opacity: card.active ? 1 : 0.55,
                transition: "transform 0.18s, box-shadow 0.18s",
                "&:hover": card.active ? { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(26,74,138,0.15)" } : {}
              }}>
                <CardActionArea
                  disabled={!card.active}
                  onClick={() => card.active && onNavigate(card.label.toLowerCase())}
                  sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.5 }}
                >
                  <Box sx={{ color: "primary.main" }}>{card.icon}</Box>
                  <CardContent sx={{ p: 0, textAlign: "left" }}>
                    <Typography variant="h6">{card.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.desc}</Typography>
                    {!card.active && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                        Coming soon
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Load DM Sans from Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      {page === "home"      && <LandingPage  onNavigate={setPage} />}
      {page === "inventory" && <InventoryPage onBack={() => setPage("home")} />}
    </ThemeProvider>
  );
}