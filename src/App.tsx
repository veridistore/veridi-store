import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURACIÓN DE SEGURIDAD ---
const APP_PASSWORD = "Meraly123"; 

// --- TU URL DE GOOGLE SCRIPT ---
const API_URL = "https://script.google.com/macros/s/AKfycbyTtKl1Q73tn29ySdLd4UObvbHQXCVuaVB1DvSZwZUVAOStlOYnktg3MiUhN6zQp2itCA/exec";

// --- APIs TIPO DE CAMBIO (Principal y Respaldo) ---
const SUNAT_API_BASE = "https://api.apis.net.pe/v1/tipo-cambio-sunat";
const FALLBACK_API = "https://api.exchangerate-api.com/v4/latest/USD";

// --- LOGO ---
const LOGO_URL = "https://lh3.googleusercontent.com/d/1obDjT8NmSP-Z9L37P7fR5nPVBEdzL-r1";

// --- DATA PERÚ ---
const peruLocations: any = {
  "Lima": {
    "Lima": ["Cercado de Lima","Ate","Barranco","Breña","Carabayllo","Chorrillos","Comas","El Agustino","Independencia","Jesus Maria","La Molina","La Victoria","Lince","Los Olivos","Lurigancho","Lurin","Magdalena del Mar","Miraflores","Pachacamac","Pucusana","Pueblo Libre","Puente Piedra","Punta Hermosa","Punta Negra","Rimac","San Bartolo","San Borja","San Isidro","San Juan de Lurigancho","San Juan de Miraflores","San Luis","San Martin de Porres","San Miguel","Santa Anita","Santa Maria del Mar","Santa Rosa","Santiago de Surco","Surquillo","Villa El Salvador","Villa Maria del Triunfo"],
    "Cañete": ["San Vicente","Asia","Chilca","Mala","Lunahuana"],
    "Huaral": ["Huaral","Chancay"],
    "Huaura": ["Huacho","Vegueta"]
  },
  "Callao": { "Callao": ["Bellavista","Callao","Carmen de la Legua","La Perla","La Punta","Ventanilla","Mi Peru"] },
  "Arequipa": { "Arequipa": ["Arequipa","Cayma","Cerro Colorado","Yanahuara","Miraflores"], "Camana": ["Camana"], "Islay": ["Mollendo"] },
  "Cusco": { "Cusco": ["Cusco","San Jeronimo","San Sebastian","Wanchaq"], "Urubamba": ["Urubamba","Machupicchu"] },
  "La Libertad": { "Trujillo": ["Trujillo","Huanchaco","Victor Larco Herrera"], "Pacasmayo": ["Pacasmayo"] },
  "Lambayeque": { "Chiclayo": ["Chiclayo","La Victoria","Pimentel"], "Lambayeque": ["Lambayeque"] },
  "Piura": { "Piura": ["Piura","Castilla"], "Sullana": ["Sullana"], "Talara": ["Talara","Mancora"] },
  "Junin": { "Huancayo": ["Huancayo","El Tambo"], "Tarma": ["Tarma"] },
  "Ica": { "Ica": ["Ica","Parcona"], "Pisco": ["Pisco","Paracas"], "Chincha": ["Chincha Alta"] },
  "Ancash": { "Huaraz": ["Huaraz", "Independencia"], "Santa": ["Chimbote", "Nuevo Chimbote"] },
  "Loreto": { "Maynas": ["Iquitos", "Punchana", "Belen"] },
  "Tacna": { "Tacna": ["Tacna", "Gregorio Albarracin"] }
};

// --- HELPERS ---
const getToday = () => new Date().toISOString().split('T')[0];
const formatDisplayDate = (isoDate: string) => {
  if (!isoDate) return '';
  const [y, m, d] = String(isoDate).split('-');
  return d ? `${d}/${m}/${y}` : isoDate;
};

// --- SAFE STRING HELPER ---
const safeString = (val: any) => String(val || '').toLowerCase();

// --- ESTILOS ---
const styles = {
  container: { backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '20px' },
  loginContainer: { display: 'flex', flexDirection: 'column' as 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' },
  loginBox: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '400px', textAlign: 'center' as 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' },
  logoContainer: { display: 'flex', alignItems: 'center' },
  logoImg: { height: '80px', objectFit: 'contain' },
  logoText: { fontSize: '1.8rem', fontWeight: 'bold', color: 'white', background: '#dc2626', padding: '10px 20px', borderRadius: '5px' },
  headerControls: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  exchangeRateBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '10px 20px', borderRadius: '10px', border: '1px solid #475569' },
  exchangeInput: (isLive: boolean) => ({ 
    width: '100px', padding: '5px', borderRadius: '5px', border: 'none', background: '#0f172a', 
    color: isLive ? '#4ade80' : '#ef4444', 
    textAlign: 'center' as 'center', fontWeight: 'bold', fontSize: '1.4rem' 
  }),
  refreshBtn: { background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '1.5rem', padding: '0 5px', display: 'flex', alignItems: 'center' },
  nav: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  navBtn: (active: boolean) => ({
    background: active ? '#2563eb' : 'transparent', color: 'white', border: active ? 'none' : '1px solid #475569',
    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: '0.3s', whiteSpace: 'nowrap'
  }),
  card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '20px' },
  kpiCard: { backgroundColor: '#334155', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '280px', borderLeft: '4px solid #3b82f6' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' },
  inputWrapper: { display: 'flex', gap: '10px' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: 'white', color: '#0f172a', flexGrow: 1 },
  inputDisabled: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #334155', background: '#334155', color: '#94a3b8', flexGrow: 1, cursor: 'not-allowed' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: 'white', color: '#0f172a', width: '100%' },
  selectCurrency: { padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  btnPrimary: { width: '100%', padding: '12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  btnWarning: { width: '100%', padding: '12px', background: '#f59e0b', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  btnDelete: { padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
  btnLoading: { width: '100%', padding: '12px', background: '#64748b', color: '#e2e8f0', border: 'none', borderRadius: '5px', cursor: 'wait', fontWeight: 'bold', marginTop: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9rem' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #334155', color: '#94a3b8' },
  td: { padding: '10px', borderBottom: '1px solid #334155' },
  statCard: { flex: 1, backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155', minWidth: '200px' },
  grid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  productInfo: { marginTop: '5px', fontSize: '0.9rem', color: '#4ade80' },
  sectionTitle: { borderBottom: '1px solid #475569', paddingBottom: '5px', marginBottom: '15px', color: '#60a5fa', fontWeight: 'bold' },
  imagePreview: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' },
  searchBar: { padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#0f172a', color: 'white', marginBottom: '20px', width: '100%' },
  reportRow: (isBold = false, isTotal = false) => ({
    display: 'flex', justifyContent: 'space-between', padding: '8px 0', 
    borderBottom: isTotal ? '2px solid #000' : '1px solid #e2e8f0',
    fontWeight: isBold || isTotal ? 'bold' : 'normal',
    fontSize: isTotal ? '1.1rem' : '1rem'
  })
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [view, setView] = useState('inventory');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<any>(3.75); 
  const [isRateConnected, setIsRateConnected] = useState(false);
  const [updatingRate, setUpdatingRate] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Filtros Reporte
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  // Filtros Búsqueda
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchTab, setSearchTab] = useState('inventory');
  const [voidSearchTerm, setVoidSearchTerm] = useState('');
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminExpenseSearch, setAdminExpenseSearch] = useState('');

  // Estados Formularios
  const [newProduct, setNewProduct] = useState<any>({ 
    id: null, date: getToday(), name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', 
    description: '', notes: '', size: '', color: '', model: '', image: '', imageBase64: '', store: '' 
  });
  
  const [newSale, setNewSale] = useState<any>({ 
    date: getToday(), sku: '', price: '', currency: 'PEN', ticketNo: '', description: '', notes: '', 
    size: '', color: '', model: '',
    customerName: '', docType: 'DNI', docNum: '', sex: 'M', phone: '', email: '', 
    batchId: '', receiverType: 'Yo', receiverName: '', receiverDoc: '', receiverPhone: '',
    destination: 'Lima Metropolitana', shippingCost: '', address: '', reference: '',
    department: '', province: '', district: '' 
  }); 
  
  const [newExpense, setNewExpense] = useState<any>({ 
    date: getToday(), desc: '', amount: '', type: 'Seguro', currency: 'PEN', notes: '' 
  });

  const fileInputRef = useRef<any>(null);
  const foundProduct = products.find(p => safeString(p.sku) === safeString(newSale.sku));

  const fetchExchangeRate = async () => {
    setUpdatingRate(true);
    setIsRateConnected(false);
    try {
        const response = await fetch(`${SUNAT_API_BASE}?_=${Date.now()}`); 
        const data = await response.json();
        if (data && data.venta) {
            setExchangeRate(data.venta);
            setIsRateConnected(true); 
        } else {
            throw new Error("Sin datos SUNAT");
        }
    } catch (err) {
        try {
            const resFallback = await fetch(FALLBACK_API);
            const dataFallback = await resFallback.json();
            if (dataFallback && dataFallback.rates && dataFallback.rates.PEN) {
                setExchangeRate(dataFallback.rates.PEN);
                setIsRateConnected(false); 
            }
        } catch (err2) {
            console.error("Error total TC", err2);
            setIsRateConnected(false);
        }
    } finally {
        setUpdatingRate(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    if (isAuthenticated) {
        fetch(API_URL).then(res => res.json()).then(data => {
            setProducts(data.products || []); setSales(data.sales || []); setExpenses(data.expenses || []); setInitialLoad(false);
        }).catch(err => { console.error(err); setInitialLoad(false); });
    }
  }, [isAuthenticated]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
        setIsAuthenticated(true);
        setLoginError(false);
        fetchExchangeRate(); 
    } else {
        setLoginError(true);
        setPasswordInput('');
    }
  };

  const sendToSheet = async (payload: any) => {
    setLoading(true);
    try {
      await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setLoading(false); return true;
    } catch (error) { console.error(error); setLoading(false); alert("Error de conexión"); return false; }
  };

  // --- LOGICA FINANCIERA ---
  const toPEN = (amount: any, currency: string, rate = exchangeRate) => {
    const val = parseFloat(amount || 0);
    return currency === 'USD' ? val * rate : val;
  };

  const filteredSales = sales.filter(s => {
    const [y, m] = s.date.split('-'); 
    return parseInt(y) === reportYear && parseInt(m) === reportMonth;
  });

  const filteredExpenses = expenses.filter(e => {
    const [y, m] = e.date.split('-');
    return parseInt(y) === reportYear && parseInt(m) === reportMonth;
  });

  const incomeTotal = filteredSales.reduce((acc, s) => acc + toPEN(s.total, s.currency, s.exchangeRate), 0);
  const cogsTotal = filteredSales.reduce((acc, s) => {
      const p = products.find(prod => safeString(prod.sku) === safeString(s.sku));
      const cost = p ? toPEN(p.cost, p.currency, p.exchangeRate) : 0; 
      return acc + (cost * s.qty);
  }, 0);
  const grossProfit = incomeTotal - cogsTotal;
  const expensesTotal = filteredExpenses.reduce((acc, e) => acc + toPEN(e.amount, e.currency, e.exchangeRate), 0);
  const netProfit = grossProfit - expensesTotal;
  const inventoryValue = products.reduce((acc, p) => acc + (toPEN(p.cost, p.currency, exchangeRate) * parseInt(p.stock)), 0);

  // --- DESGLOSE DE GASTOS PARA REPORTE ---
  const expenseBreakdown = filteredExpenses.reduce((acc: any, curr) => {
      const type = curr.type || 'Otros';
      const amount = toPEN(curr.amount, curr.currency, curr.exchangeRate);
      acc[type] = (acc[type] || 0) + amount;
      return acc;
  }, {});
  
  // --- INDICADORES PLAN DE NEGOCIOS ---
  const grossMarginPercent = incomeTotal > 0 ? (grossProfit / incomeTotal) * 100 : 0;
  const totalOrders = filteredSales.length;
  const aovPEN = totalOrders > 0 ? incomeTotal / totalOrders : 0;
  const aovUSD = aovPEN / exchangeRate; 
  const marketingExpenses = filteredExpenses.filter(e => safeString(e.type).includes('publicidad') || safeString(e.type).includes('marketing')).reduce((acc, e) => acc + toPEN(e.amount, e.currency, e.exchangeRate), 0);
  const uniqueCustomers = new Set(filteredSales.map(s => s.docNum)).size;
  const cacPEN = uniqueCustomers > 0 ? marketingExpenses / uniqueCustomers : 0;
  const targetCacMax = aovPEN * 0.25;

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 600; 
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); 
          setNewProduct((prev: any) => ({ ...prev, imageBase64: compressedBase64 }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = async () => {
    if(!newProduct.name || !newProduct.sku) return alert("Faltan datos");
    const isEdit = !!newProduct.id;
    const action = isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    const productData = { ...newProduct, id: newProduct.id || Date.now(), cost: parseFloat(newProduct.cost), stock: parseInt(newProduct.stock), exchangeRate };
    
    let updatedProducts;
    if (isEdit) {
      updatedProducts = products.map(p => p.id === productData.id ? productData : p);
    } else {
      updatedProducts = [...products, productData];
    }
    setProducts(updatedProducts);
    setNewProduct({ id: null, date: getToday(), name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', description: '', notes: '', size: '', color: '', model: '', image: '', imageBase64: '', store: '' });
    if(fileInputRef.current) fileInputRef.current.value = "";
    const success = await sendToSheet({ action, ...productData });
    if (!success && !isEdit) setProducts(products); 
  };

  const editProduct = (prod: any) => {
    setNewProduct(prod);
    window.scrollTo(0,0);
  };

  const addSale = async () => {
    const product = products.find(p => safeString(p.sku) === safeString(newSale.sku));
    if (!product) return alert('SKU no encontrado');
    if (product.stock < 1) return alert('Stock insuficiente');

    const qty = 1; 
    const totalOriginal = qty * parseFloat(newSale.price);
    
    const saleData = { 
      ...newSale, 
      qty: qty, 
      productName: product.name, 
      id: Date.now(), 
      total: totalOriginal, 
      exchangeRate 
    };

    const prevSales = [...sales]; const prevProducts = [...products]; const prevExpenses = [...expenses];

    setSales([...sales, saleData]);
    setProducts(products.map(p => safeString(p.sku) === safeString(newSale.sku) ? { ...p, stock: p.stock - qty } : p));
    
    if(saleData.shippingCost && parseFloat(saleData.shippingCost) > 0) {
       setExpenses([...expenses, {
         id: Date.now(), date: saleData.date, type: 'Envío', desc: `Envío ${saleData.department}-${saleData.district} (${saleData.ticketNo})`, 
         amount: parseFloat(saleData.shippingCost), currency: saleData.currency, exchangeRate: saleData.exchangeRate
       }]);
    }

    setNewSale({ 
      date: getToday(), sku: '', price: '', currency: 'PEN', ticketNo: '', description: '', notes: '', size: '', color: '', model: '', 
      customerName: '', docType: 'DNI', docNum: '', sex: 'M', phone: '', email: '', 
      batchId: '', receiverType: 'Yo', receiverName: '', receiverDoc: '', receiverPhone: '', 
      destination: 'Lima Metropolitana', shippingCost: '', address: '', reference: '',
      department: '', province: '', district: '' 
    });

    const success = await sendToSheet({ action: 'ADD_SALE', ...saleData });
    if (!success) { setSales(prevSales); setProducts(prevProducts); setExpenses(prevExpenses); alert("Error guardando venta"); }
  };

  const addExpense = async () => {
    if(!newExpense.amount) return;
    const expenseData = { ...newExpense, id: Date.now(), amount: parseFloat(newExpense.amount), exchangeRate };
    const prevExpenses = [...expenses];
    setExpenses([...expenses, expenseData]);
    setNewExpense({ ...newExpense, desc: '', amount: '', type: 'Seguro', currency: 'PEN', notes: '' });
    const success = await sendToSheet({ action: 'ADD_EXPENSE', ...expenseData });
    if (!success) setExpenses(prevExpenses);
  };

  const voidSale = async (saleId: any, sku: string, qty: any) => {
    if (!confirm("¿Seguro que deseas anular esta venta? El stock será devuelto.")) return;
    setLoading(true);
    const prevSales = [...sales]; const prevProducts = [...products];
    setSales(sales.filter(s => s.id !== saleId));
    setProducts(products.map(p => safeString(p.sku) === safeString(sku) ? { ...p, stock: p.stock + parseInt(qty) } : p));
    const success = await sendToSheet({ action: 'DELETE_SALE', id: saleId, sku, qty });
    if (!success) { setSales(prevSales); setProducts(prevProducts); alert("Error al anular venta"); } 
    else { setLoading(false); alert("Venta anulada correctamente"); }
  };

  const deleteProduct = async (id: any) => {
    if (!confirm("⚠️ ¿Estás seguro de eliminar este producto PERMANENTEMENTE del inventario?")) return;
    setLoading(true);
    const prevProducts = [...products];
    setProducts(products.filter(p => p.id !== id));
    const success = await sendToSheet({ action: 'DELETE_PRODUCT', id: id });
    if (!success) { setProducts(prevProducts); alert("Error al eliminar producto"); } 
    else { setLoading(false); alert("Producto eliminado"); }
  };

  const deleteExpense = async (id: any) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    setLoading(true);
    const prevExpenses = [...expenses];
    setExpenses(expenses.filter(e => e.id !== id));
    const success = await sendToSheet({ action: 'DELETE_EXPENSE', id: id });
    if (!success) { setExpenses(prevExpenses); alert("Error al eliminar gasto"); } 
    else { setLoading(false); alert("Gasto eliminado"); }
  };

  const handleDepartmentChange = (e: any) => {
    setNewSale({ ...newSale, department: e.target.value, province: '', district: '' });
  };
  const handleProvinceChange = (e: any) => {
    setNewSale({ ...newSale, province: e.target.value, district: '' });
  };
  const getProvinces = () => newSale.department && peruLocations[newSale.department] ? Object.keys(peruLocations[newSale.department]) : [];
  const getDistricts = () => newSale.department && newSale.province && peruLocations[newSale.department][newSale.province] ? peruLocations[newSale.department][newSale.province] : [];

  const getFilteredResults = () => {
    const term = globalSearch.toLowerCase();
    if (searchTab === 'inventory') {
      return products.filter(p => formatDisplayDate(p.date).includes(term) || safeString(p.sku).includes(term) || safeString(p.name).includes(term) || safeString(p.store).includes(term));
    } else if (searchTab === 'sales') {
      return sales.filter(s => formatDisplayDate(s.date).includes(term) || safeString(s.sku).includes(term) || safeString(s.ticketNo).includes(term) || safeString(s.customerName).includes(term) || safeString(s.docNum).includes(term) || safeString(s.destination).includes(term) || safeString(s.address).includes(term)).slice().reverse();
    } else if (searchTab === 'expenses') {
      return expenses.filter(e => formatDisplayDate(e.date).includes(term) || safeString(e.type).includes(term) || safeString(e.desc).includes(term)).slice().reverse();
    }
    return [];
  };

  const voidFilteredSales = sales.filter(s => {
    const term = voidSearchTerm.toLowerCase();
    if (!term) return true; 
    const visualDate = formatDisplayDate(s.date);
    return (visualDate.includes(term) || safeString(s.sku).includes(term) || safeString(s.ticketNo).includes(term) || safeString(s.docNum).includes(term));
  }).slice().reverse();

  const adminFilteredProducts = products.filter(p => {
    const term = adminProductSearch.toLowerCase();
    return safeString(p.sku).includes(term) || safeString(p.name).includes(term);
  }).slice().reverse();

  const adminFilteredExpenses = expenses.filter(e => {
    const term = adminExpenseSearch.toLowerCase();
    return safeString(e.desc).includes(term) || safeString(e.type).includes(term) || String(e.amount).includes(term);
  }).slice().reverse();

  const handleSkuChange = (e: any) => {
    const val = e.target.value;
    const found = products.find(p => safeString(p.sku) === safeString(val));
    setNewSale((prev: any) => ({ ...prev, sku: val, size: found ? found.size : prev.size, color: found ? found.color : prev.color, model: found ? found.model : prev.model })); 
  };

  if (!isAuthenticated) {
    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginBox}>
                <div style={{marginBottom: 20}}>
                     {!logoError ? ( <img src={LOGO_URL} alt="Logo" style={{height: 100}} onError={() => setLogoError(true)} /> ) : ( <h1 style={{color: '#dc2626'}}>VERIDI STORE</h1> )}
                </div>
                <h2 style={{marginBottom: 10}}>Acceso Restringido</h2>
                <p style={{color: '#94a3b8', marginBottom: 20}}>Ingresa la contraseña maestra para continuar.</p>
                <form onSubmit={handleLogin}>
                    <input 
                        type="password" 
                        style={{...styles.input, textAlign: 'center', fontSize: '1.2rem', marginBottom: 15}} 
                        placeholder="Contraseña..." 
                        value={passwordInput} 
                        onChange={(e) => setPasswordInput(e.target.value)} 
                        autoFocus
                    />
                    {loginError && <p style={{color: '#ef4444', marginBottom: 15}}>Contraseña incorrecta</p>}
                    <button type="submit" style={styles.btnPrimary}>INGRESAR AL SISTEMA</button>
                </form>
            </div>
        </div>
    );
  }

  if (initialLoad) return <div style={styles.container}><h2 style={{textAlign:'center', marginTop:'20%'}}>Cargando Veridi System...</h2></div>;

  // --- DASHBOARD RENDER ---
  const renderDashboard = () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      
      {/* 1. BARRA DE FILTROS */}
      <div style={styles.card}>
        <h3 style={{color: '#60a5fa'}}>📅 Filtros de Reporte</h3>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
            <div>
                <label style={styles.label}>Año</label>
                <select style={styles.select} value={reportYear} onChange={(e) => setReportYear(parseInt(e.target.value))}>
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div>
                <label style={styles.label}>Mes</label>
                <select style={styles.select} value={reportMonth} onChange={(e) => setReportMonth(parseInt(e.target.value))}>
                    {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => (
                        <option key={i} value={i+1}>{m}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {/* 2. KPIS PLAN DE NEGOCIOS */}
      <div style={{...styles.card, border: '1px solid #60a5fa'}}>
        <h3 style={{color: '#fbbf24', borderBottom: '1px solid #475569', paddingBottom: '10px', marginBottom: '20px'}}>
            🎯 KPIs Estratégicos (Plan de Negocios)
        </h3>
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
            <div style={styles.kpiCard}>
                <div style={styles.label}>1. Margen Bruto</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: grossMarginPercent >= 30 ? '#4ade80' : '#f87171'}}>
                    {grossMarginPercent.toFixed(1)}%
                </div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px'}}>
                    Meta: Mínimo 30% <br/>
                    {grossMarginPercent >= 30 ? '✅ Objetivo Cumplido' : '⚠️ Ajustar Precios/Costos'}
                </div>
            </div>

            <div style={styles.kpiCard}>
                <div style={styles.label}>2. Ticket Promedio (AOV)</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: aovUSD >= 100 ? '#4ade80' : '#fbbf24'}}>
                    S/ {aovPEN.toFixed(0)} <span style={{fontSize: '1rem', color:'#94a3b8'}}>($ {aovUSD.toFixed(0)})</span>
                </div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px'}}>
                    Meta: $100 - $150 (S/ {(100*exchangeRate).toFixed(0)} - S/ {(150*exchangeRate).toFixed(0)}) <br/>
                    {aovUSD >= 100 ? '✅ Objetivo Cumplido' : '⚠️ Fomentar Packs/Combos'}
                </div>
            </div>

            <div style={styles.kpiCard}>
                <div style={styles.label}>3. Costo Adquisición (CAC)</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: (cacPEN <= targetCacMax && cacPEN > 0) ? '#4ade80' : (cacPEN === 0 ? '#94a3b8' : '#f87171')}}>
                    S/ {cacPEN.toFixed(2)}
                </div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px'}}>
                    Meta (25% AOV): Máx S/ {targetCacMax.toFixed(2)} <br/>
                    {cacPEN === 0 ? 'ℹ️ Sin gastos de Publicidad' : (cacPEN <= targetCacMax ? '✅ Rentabilidad OK' : '⚠️ Optimizar Ads')}
                </div>
            </div>
        </div>
      </div>

      <div style={{display: 'flex', gap: '20px', flexDirection: 'column'}}>
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
            
            {/* 3. ESTADO DE RESULTADOS (Izquierda) */}
            <div style={{...styles.statCard, flex: 1, backgroundColor: 'white', color: '#1e293b', minWidth: '300px'}}>
            <h2 style={{textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px'}}>ESTADO DE RESULTADOS</h2>
            <p style={{textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px'}}>
                Al {new Date(reportYear, reportMonth, 0).getDate()} de {["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][reportMonth]} del {reportYear}
            </p>
            
            <div style={styles.reportRow(true)}>
                <span>(+) VENTAS NETAS</span>
                <span>S/ {incomeTotal.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{...styles.reportRow(), color: '#ef4444'}}>
                <span>(-) Costo de Ventas</span>
                <span>(S/ {cogsTotal.toLocaleString('es-PE', {minimumFractionDigits: 2})})</span>
            </div>
            
            <div style={styles.reportRow(true, true)}>
                <span>(=) UTILIDAD BRUTA</span>
                <span style={{color: grossProfit >= 0 ? '#16a34a' : '#ef4444'}}>S/ {grossProfit.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
            </div>

            <div style={{...styles.reportRow(), color: '#ef4444', marginTop: '10px'}}>
                <span>(-) Gastos Operativos</span>
                <span>(S/ {expensesTotal.toLocaleString('es-PE', {minimumFractionDigits: 2})})</span>
            </div>
            
            {/* DESGLOSE DE GASTOS */}
            {expensesTotal > 0 && (
                <div style={{background: '#f1f5f9', padding: '10px', borderRadius: '5px', marginTop: '5px', fontSize: '0.85rem'}}>
                    <div style={{fontWeight: 'bold', color: '#475569', marginBottom: '5px'}}>Detalle de Gastos:</div>
                    {Object.keys(expenseBreakdown).sort((a,b) => expenseBreakdown[b] - expenseBreakdown[a]).map(type => (
                        <div key={type} style={{display: 'flex', justifyContent: 'space-between', color: '#64748b'}}>
                            <span>• {type}</span>
                            <span>S/ {expenseBreakdown[type].toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                        </div>
                    ))}
                </div>
            )}

            <div style={{...styles.reportRow(true, true), marginTop: '20px', fontSize: '1.3rem', borderBottom: '4px double #000'}}>
                <span>(=) UTILIDAD NETA</span>
                <span style={{color: netProfit >= 0 ? '#16a34a' : '#ef4444'}}>S/ {netProfit.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
            </div>
            </div>

            {/* 4. BALANCE / SITUACIÓN (Derecha) */}
            <div style={{...styles.statCard, flex: 1, minWidth: '300px'}}>
            <h3 style={{color: '#fb923c'}}>📊 Balance General Simplificado</h3>
            
            <div style={{marginTop: '20px'}}>
                <div style={styles.label}>ACTIVO CORRIENTE (Realizable)</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa'}}>
                S/ {inventoryValue.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>Valor total del Inventario actual (al costo).</p>
            </div>

            <div style={{marginTop: '30px', borderTop: '1px solid #475569', paddingTop: '10px'}}>
                <div style={styles.label}>RESULTADO DEL EJERCICIO</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: netProfit >= 0 ? '#4ade80' : '#f87171'}}>
                S/ {netProfit.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>Dinero generado (o perdido) en este periodo.</p>
            </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      <div style={{...styles.card, flex: 1, minWidth: '300px'}}>
        <h3>{newProduct.id ? 'Editar Producto' : 'Agregar Producto'}</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha Ingreso</label><input type="date" style={styles.input} value={newProduct.date} onChange={(e:any) => setNewProduct({...newProduct, date: e.target.value})} /></div>
        <div style={styles.inputGroup}>
            <label style={styles.label}>Foto del Producto</label>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{color: 'white'}} accept="image/*" />
            {newProduct.imageBase64 && <div style={{marginTop: 10}}><img src={newProduct.imageBase64} style={styles.imagePreview} alt="Preview" /></div>}
            {newProduct.image && !newProduct.imageBase64 && <div style={{marginTop: 10}}><img src={newProduct.image} style={styles.imagePreview} alt="Current" /></div>}
        </div>
        <div style={styles.inputGroup}><label style={styles.label}>SKU</label><input style={styles.input} value={newProduct.sku} onChange={(e:any) => setNewProduct({...newProduct, sku: e.target.value})} placeholder="Ej: NK-001" disabled={!!newProduct.id} /></div>
        
        <div style={styles.inputGroup}><label style={styles.label}>Nombre del Producto</label><input style={styles.input} value={newProduct.name} onChange={(e:any) => setNewProduct({...newProduct, name: e.target.value})} /></div>
        
        <div style={styles.inputGroup}><label style={styles.label}>Tienda Adquisición (USA)</label><input style={styles.input} value={newProduct.store} onChange={(e:any) => setNewProduct({...newProduct, store: e.target.value})} placeholder="Ej: Ross, Macys..." /></div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Talla</label><input style={styles.input} value={newProduct.size} onChange={(e:any) => setNewProduct({...newProduct, size: e.target.value})} placeholder="S, M..." /></div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Color</label><input style={styles.input} value={newProduct.color} onChange={(e:any) => setNewProduct({...newProduct, color: e.target.value})} /></div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Modelo</label><input style={styles.input} value={newProduct.model} onChange={(e:any) => setNewProduct({...newProduct, model: e.target.value})} /></div>
        </div>
        <div style={styles.inputGroup}><label style={styles.label}>Descripción</label><input style={styles.input} value={newProduct.description} onChange={(e:any) => setNewProduct({...newProduct, description: e.target.value})} /></div>
        <div style={styles.grid}>
          <div style={{...styles.inputGroup, flex: 2}}>
            <label style={styles.label}>Costo Unit.</label>
            <div style={styles.inputWrapper}>
              <input type="number" style={styles.input} value={newProduct.cost} onChange={(e:any) => setNewProduct({...newProduct, cost: e.target.value})} />
              <select style={styles.selectCurrency} value={newProduct.currency} onChange={(e:any) => setNewProduct({...newProduct, currency: e.target.value})}><option value="PEN">S/</option><option value="USD">$</option></select>
            </div>
          </div>
          <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Stock</label><input type="number" style={styles.input} value={newProduct.stock} onChange={(e:any) => setNewProduct({...newProduct, stock: e.target.value})} /></div>
        </div>
        <button style={loading ? styles.btnLoading : (newProduct.id ? styles.btnWarning : styles.btnPrimary)} onClick={addProduct} disabled={loading}>{loading ? 'Procesando...' : (newProduct.id ? 'Actualizar Producto' : 'Guardar Producto')}</button>
        {newProduct.id && <button style={{...styles.btnDelete, marginTop: 10, width: '100%'}} onClick={() => setNewProduct({ id: null, date: getToday(), name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', description: '', notes: '', size: '', color: '', model: '', image: '', imageBase64: '', store: '' })}>Cancelar Edición</button>}
      </div>
      <div style={{...styles.card, flex: 2, overflowX: 'auto', minWidth: '300px'}}>
        <h3>Inventario Reciente</h3>
        <table style={styles.table}><thead><tr><th>Foto</th><th>SKU</th><th>Prod</th><th>Tienda</th><th>Stock</th></tr></thead>
        <tbody>{products.slice(-10).reverse().map(p => (
            <tr key={p.id} onClick={() => editProduct(p)} style={{cursor: 'pointer', background: newProduct.id === p.id ? '#334155' : 'transparent'}}>
                <td style={styles.td}>{p.image ? <img src={p.image} style={styles.imagePreview} /> : '-'}</td>
                <td style={styles.td}>{p.sku}</td><td style={styles.td}>{p.name}</td><td style={styles.td}>{p.store}</td><td style={styles.td}>{p.stock}</td>
            </tr>
        ))}</tbody></table>
      </div>
    </div>
  );

  const renderSales = () => (
    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      <div style={{...styles.card, flex: 1.2, minWidth: '300px'}}>
        <h3>Nueva Venta</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha Venta</label><input type="date" style={styles.input} value={newSale.date} onChange={(e:any) => setNewSale({...newSale, date: e.target.value})} /></div>
        <div style={styles.sectionTitle}>1. Producto</div>
        <div style={styles.inputGroup}><label style={styles.label}>SKU (Escanear)</label><input style={styles.input} value={newSale.sku} onChange={handleSkuChange} autoFocus placeholder="Escanea aquí..." />
        {newSale.sku && foundProduct ? <div style={styles.productInfo}>✅ Producto encontrado</div> : null}</div>
        
        <div style={styles.inputGroup}><label style={styles.label}>Nombre del Producto</label><input style={styles.inputDisabled} value={foundProduct ? foundProduct.name : ''} readOnly placeholder="Se llena automáticamente al ingresar SKU" /></div>

        <div style={styles.grid}>
          <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Talla</label><input style={styles.input} value={newSale.size} onChange={(e:any) => setNewSale({...newSale, size: e.target.value})} /></div>
          <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Color</label><input style={styles.input} value={newSale.color} onChange={(e:any) => setNewSale({...newSale, color: e.target.value})} /></div>
        </div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 2}}><label style={styles.label}>Boleta Nº</label><input style={styles.input} value={newSale.ticketNo} onChange={(e:any) => setNewSale({...newSale, ticketNo: e.target.value})} /></div>
            <div style={{...styles.inputGroup, flex: 2}}>
                <label style={styles.label}>Precio</label>
                <div style={styles.inputWrapper}>
                    <input type="number" style={styles.input} value={newSale.price} onChange={(e:any) => setNewSale({...newSale, price: e.target.value})} />
                    <select style={styles.selectCurrency} value={newSale.currency} onChange={(e:any) => setNewSale({...newSale, currency: e.target.value})}><option value="PEN">S/</option><option value="USD">$</option></select>
                </div>
            </div>
        </div>
        <div style={styles.sectionTitle}>2. Cliente</div>
        <div style={styles.inputGroup}><label style={styles.label}>Nombre Completo</label><input style={styles.input} value={newSale.customerName} onChange={(e:any) => setNewSale({...newSale, customerName: e.target.value})} /></div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 1}}>
                <label style={styles.label}>Doc.</label>
                <select style={styles.select} value={newSale.docType} onChange={(e:any) => setNewSale({...newSale, docType: e.target.value})}>
                    <option>DNI</option><option>CE</option><option>Pasaporte</option><option>Otro</option>
                </select>
            </div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Número</label><input style={styles.input} value={newSale.docNum} onChange={(e:any) => setNewSale({...newSale, docNum: e.target.value})} /></div>
        </div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Teléfono</label><input style={styles.input} value={newSale.phone} onChange={(e:any) => setNewSale({...newSale, phone: e.target.value})} /></div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Email</label><input style={styles.input} type="email" value={newSale.email} onChange={(e:any) => setNewSale({...newSale, email: e.target.value})} /></div>
        </div>

        <div style={styles.sectionTitle}>3. Envío y Orden</div>
        
        <div style={styles.inputGroup}><label style={styles.label}>Compra en conjunto - N° de boleta</label><input style={styles.input} value={newSale.batchId} onChange={(e:any) => setNewSale({...newSale, batchId: e.target.value})} placeholder="Ej: Lote #54" /></div>
        
        <div style={styles.inputGroup}>
            <label style={styles.label}>¿Quién Recibe?</label>
            <select style={styles.select} value={newSale.receiverType} onChange={(e:any) => setNewSale({...newSale, receiverType: e.target.value})}>
                <option>Yo</option><option>Otra Persona</option>
            </select>
        </div>

        {newSale.receiverType === 'Otra Persona' && (
            <div style={{background: '#334155', padding: 10, borderRadius: 5, marginBottom: 15}}>
                <div style={styles.inputGroup}><label style={styles.label}>Nombre Receptor</label><input style={styles.input} value={newSale.receiverName} onChange={(e:any) => setNewSale({...newSale, receiverName: e.target.value})} /></div>
                <div style={styles.grid}>
                    <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>DNI Rec.</label><input style={styles.input} value={newSale.receiverDoc} onChange={(e:any) => setNewSale({...newSale, receiverDoc: e.target.value})} /></div>
                    <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Tel Rec.</label><input style={styles.input} value={newSale.receiverPhone} onChange={(e:any) => setNewSale({...newSale, receiverPhone: e.target.value})} /></div>
                </div>
            </div>
        )}

        <div style={{background: '#334155', padding: 10, borderRadius: 5, marginBottom: 15}}>
            <label style={{...styles.label, color: '#60a5fa', fontWeight: 'bold'}}>Ubicación de Envío</label>
            <div style={styles.grid}>
                <div style={{...styles.inputGroup, flex: 1}}>
                    <label style={styles.label}>Departamento</label>
                    <select style={styles.select} value={newSale.department} onChange={handleDepartmentChange}>
                        <option value="">Seleccione...</option>
                        {Object.keys(peruLocations).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>
                <div style={{...styles.inputGroup, flex: 1}}>
                    <label style={styles.label}>Provincia</label>
                    <select style={styles.select} value={newSale.province} onChange={handleProvinceChange} disabled={!newSale.department}>
                        <option value="">Seleccione...</option>
                        {getProvinces().map((prov: string) => <option key={prov} value={prov}>{prov}</option>)}
                    </select>
                </div>
                <div style={{...styles.inputGroup, flex: 1}}>
                    <label style={styles.label}>Distrito</label>
                    <select style={styles.select} value={newSale.district} onChange={(e:any) => setNewSale({...newSale, district: e.target.value})} disabled={!newSale.province}>
                        <option value="">Seleccione...</option>
                        {getDistricts().map((dist: string) => <option key={dist} value={dist}>{dist}</option>)}
                    </select>
                </div>
            </div>
            <div style={styles.inputGroup}><label style={styles.label}>Dirección Exacta</label><input style={styles.input} value={newSale.address} onChange={(e:any) => setNewSale({...newSale, address: e.target.value})} placeholder="Av. Principal 123..." /></div>
            
            <div style={styles.inputGroup}><label style={styles.label}>Referencia</label><input style={styles.input} value={newSale.reference} onChange={(e:any) => setNewSale({...newSale, reference: e.target.value})} placeholder="Ej: Frente al parque, puerta azul..." /></div>
        </div>

        <div style={styles.inputGroup}><label style={styles.label}>Costo Envío (S/)</label><input type="number" style={styles.input} value={newSale.shippingCost} onChange={(e:any) => setNewSale({...newSale, shippingCost: e.target.value})} placeholder="0.00" /></div>
        
        <button style={loading ? styles.btnLoading : styles.btnPrimary} onClick={addSale} disabled={loading}>{loading ? 'Registrando...' : 'Confirmar Venta'}</button>
      </div>
      <div style={{...styles.card, flex: 1.8, overflowX: 'auto', minWidth: '300px'}}>
        <h3>Últimas Ventas</h3>
        <table style={styles.table}><thead><tr><th>Fecha</th><th>Boleta</th><th>Prod</th><th>Cliente</th><th>Total</th></tr></thead>
        <tbody>{sales.slice(-10).reverse().map(s => (
            <tr key={s.id}>
                <td style={styles.td}>{formatDisplayDate(s.date)}</td>
                <td style={styles.td}>{s.ticketNo || '-'}</td>
                <td style={styles.td}>{s.productName}</td>
                <td style={styles.td}>{s.customerName}</td>
                <td style={styles.td}>{s.currency === 'USD' ? '$' : 'S/'} {parseFloat(s.total).toFixed(2)}</td>
            </tr>
        ))}</tbody></table>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      <div style={{...styles.card, flex: 1, minWidth: '300px'}}>
        <h3>Nuevo Gasto</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha</label><input type="date" style={styles.input} value={newExpense.date} onChange={(e:any) => setNewExpense({...newExpense, date: e.target.value})} /></div>
        <div style={styles.inputGroup}><label style={styles.label}>Tipo</label>
            <select style={styles.select} value={newExpense.type} onChange={(e:any) => setNewExpense({...newExpense, type: e.target.value})}>
                <option>Publicidad</option>
                <option>Sueldo Dueños</option>
                <option>Comisión</option>
                <option>Teléfono/Internet</option>
                <option>Apps/Software</option>
                <option>Seguro</option>
                <option>Alimentación</option>
                <option>Movilidad</option>
                <option>Vuelo</option>
                <option>Hotel</option>
                <option>Aduanas</option>
                <option>Envío</option>
                <option>Pag. Web</option>
                <option>Otros</option>
            </select>
        </div>
        <div style={styles.inputGroup}><label style={styles.label}>Concepto</label><input style={styles.input} value={newExpense.desc} onChange={(e:any) => setNewExpense({...newExpense, desc: e.target.value})} /></div>
        <div style={{...styles.inputGroup}}>
          <label style={styles.label}>Monto</label>
          <div style={styles.inputWrapper}>
            <input type="number" style={styles.input} value={newExpense.amount} onChange={(e:any) => setNewExpense({...newExpense, amount: e.target.value})} />
            <select style={styles.selectCurrency} value={newExpense.currency} onChange={(e:any) => setNewExpense({...newExpense, currency: e.target.value})}><option value="PEN">S/</option><option value="USD">$</option></select>
          </div>
        </div>
        <button style={loading ? styles.btnLoading : styles.btnPrimary} onClick={addExpense} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Gasto'}</button>
      </div>
      <div style={{...styles.card, flex: 2, overflowX: 'auto', minWidth: '300px'}}>
        <h3>Gastos Recientes</h3>
        <table style={styles.table}><thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead><tbody>{expenses.slice(-10).reverse().map(e => (<tr key={e.id}><td style={styles.td}>{formatDisplayDate(e.date)}</td><td style={styles.td}>{e.type}</td><td style={styles.td}>{e.desc}</td><td style={styles.td}>{e.currency === 'USD' ? '$' : 'S/'} {parseFloat(e.amount).toFixed(2)}</td></tr>))}</tbody></table>
      </div>
    </div>
  );

  const renderVoid = () => (
    <div style={{...styles.card}}>
      <h3 style={{color:'#f87171'}}>⚠️ Anulación de Ventas (Stock retorna)</h3>
      <div style={{marginBottom: 20}}>
        <label style={styles.label}>Buscar Venta (DD/MM/AAAA, Boleta, SKU, DNI):</label>
        <input style={styles.searchBar} placeholder="Ej: 25/12/2023 o Boleta 001..." value={voidSearchTerm} onChange={e => setVoidSearchTerm(e.target.value)} />
      </div>
      <div style={{overflowX:'auto'}}>
      <table style={styles.table}>
        <thead><tr><th>Fecha</th><th>Boleta</th><th>Cliente (DNI)</th><th>Producto</th><th>Total</th><th>Acción</th></tr></thead>
        <tbody>
          {voidFilteredSales.map(s => (
            <tr key={s.id}>
              <td style={styles.td}>{formatDisplayDate(s.date)}</td>
              <td style={styles.td}>{s.ticketNo || 'S/N'}</td>
              <td style={styles.td}>{s.customerName} {s.docNum ? `(${s.docNum})` : ''}</td>
              <td style={styles.td}>{s.productName} ({s.sku})</td>
              <td style={styles.td}>{s.currency === 'USD' ? '$' : 'S/'} {parseFloat(s.total).toFixed(2)}</td>
              <td style={styles.td}>
                <button style={styles.btnDelete} onClick={() => voidSale(s.id, s.sku, s.qty)}>ANULAR 🗑️</button>
              </td>
            </tr>
          ))}
          {voidFilteredSales.length === 0 && <tr><td colSpan={6} style={{padding: 20, textAlign: 'center', color: '#94a3b8'}}>No se encontraron ventas con esos datos.</td></tr>}
        </tbody>
      </table>
      </div>
    </div>
  );

  const renderAdminVoid = () => (
      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        <div style={{...styles.card, flex: 1, minWidth: '300px'}}>
            <h3 style={{color:'#fb923c'}}>🗑️ Eliminar Producto (Inventario)</h3>
            <p style={{fontSize:'0.8rem', color:'#94a3b8'}}>Cuidado: Esto borra el producto permanentemente.</p>
            <input style={styles.searchBar} placeholder="Buscar SKU o Nombre..." value={adminProductSearch} onChange={e => setAdminProductSearch(e.target.value)} />
            <div style={{overflowY: 'auto', maxHeight: '400px'}}>
                <table style={styles.table}>
                    <thead><tr><th>SKU</th><th>Nombre</th><th>Acción</th></tr></thead>
                    <tbody>
                        {adminFilteredProducts.map(p => (
                            <tr key={p.id}>
                                <td style={styles.td}>{p.sku}</td>
                                <td style={styles.td}>{p.name}</td>
                                <td style={styles.td}><button style={styles.btnDelete} onClick={() => deleteProduct(p.id)}>X</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div style={{...styles.card, flex: 1, minWidth: '300px'}}>
            <h3 style={{color:'#fb923c'}}>🗑️ Eliminar Gasto</h3>
            <p style={{fontSize:'0.8rem', color:'#94a3b8'}}>Borra el registro financiero.</p>
            <input style={styles.searchBar} placeholder="Buscar Concepto o Monto..." value={adminExpenseSearch} onChange={e => setAdminExpenseSearch(e.target.value)} />
            <div style={{overflowY: 'auto', maxHeight: '400px'}}>
                <table style={styles.table}>
                    <thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Acción</th></tr></thead>
                    <tbody>
                        {adminFilteredExpenses.map(e => (
                            <tr key={e.id}>
                                <td style={styles.td}>{formatDisplayDate(e.date)}</td>
                                <td style={styles.td}>{e.desc}</td>
                                <td style={styles.td}>{e.amount}</td>
                                <td style={styles.td}><button style={styles.btnDelete} onClick={() => deleteExpense(e.id)}>X</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
  );

  const renderGlobalSearch = () => {
      const results = getFilteredResults();
      return (
        <div style={styles.card}>
            <h3>🔍 Búsqueda Avanzada Universal</h3>
            <div style={{display: 'flex', gap: 10, marginBottom: 20}}>
                <button style={styles.navBtn(searchTab === 'inventory')} onClick={() => setSearchTab('inventory')}>Inventario</button>
                <button style={styles.navBtn(searchTab === 'sales')} onClick={() => setSearchTab('sales')}>Ventas</button>
                <button style={styles.navBtn(searchTab === 'expenses')} onClick={() => setSearchTab('expenses')}>Gastos</button>
            </div>
            
            <input style={styles.searchBar} placeholder="Escribe para buscar (Fecha, SKU, Tienda, DNI, Dirección, etc)..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} autoFocus />

            <div style={{overflowX:'auto'}}>
            <table style={styles.table}>
                <thead>
                    {searchTab === 'inventory' && <tr><th>Fecha</th><th>SKU</th><th>Producto</th><th>Tienda</th><th>Stock</th></tr>}
                    {searchTab === 'sales' && <tr><th>Fecha</th><th>Boleta</th><th>Cliente</th><th>Dirección</th><th>Total</th></tr>}
                    {searchTab === 'expenses' && <tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr>}
                </thead>
                <tbody>
                    {results.length > 0 ? results.map((r: any) => (
                        <tr key={r.id}>
                            <td style={styles.td}>{formatDisplayDate(r.date)}</td>
                            
                            {searchTab === 'inventory' && <>
                                <td style={styles.td}>{r.sku}</td><td style={styles.td}>{r.name}</td><td style={styles.td}>{r.store}</td><td style={styles.td}>{r.stock}</td>
                            </>}

                            {searchTab === 'sales' && <>
                                <td style={styles.td}>{r.ticketNo}</td>
                                <td style={styles.td}>{r.customerName} ({r.docNum})</td>
                                <td style={styles.td}>{r.address || `${r.department}-${r.district}`}</td>
                                <td style={styles.td}>{r.currency === 'USD' ? '$' : 'S/'} {parseFloat(r.total).toFixed(2)}</td>
                            </>}

                            {searchTab === 'expenses' && <>
                                <td style={styles.td}>{r.type}</td><td style={styles.td}>{r.desc}</td><td style={styles.td}>{r.currency === 'USD' ? '$' : 'S/'} {parseFloat(r.amount).toFixed(2)}</td>
                            </>}
                        </tr>
                    )) : <tr><td colSpan={5} style={{textAlign: 'center', padding: 20, color: '#94a3b8'}}>No se encontraron resultados</td></tr>}
                </tbody>
            </table>
            </div>
        </div>
      );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoContainer}>
          {!logoError ? ( <img src={LOGO_URL} alt="Veridi Store" style={styles.logoImg} onError={() => setLogoError(true)} /> ) : ( <div style={{...styles.logoText, display: 'block'}}>VERIDI STORE</div> )}
        </div>
        <div style={styles.headerControls}>
          <div style={styles.exchangeRateBox}>
            <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>T.C. (SUNAT/Intl): $1 = S/</span>
            <input 
                type="number" 
                step="0.01" 
                style={styles.exchangeInput(isRateConnected)} 
                value={exchangeRate} 
                onChange={(e:any) => {
                    setExchangeRate(e.target.value);
                    setIsRateConnected(false); 
                }} 
            />
            <button style={styles.refreshBtn} onClick={fetchExchangeRate} title="Forzar Actualización" disabled={updatingRate}>
                {updatingRate ? '...' : '🔄'}
            </button>
          </div>
          <nav style={styles.nav}>
            <button style={styles.navBtn(view === 'inventory')} onClick={() => setView('inventory')}>Inventario</button>
            <button style={styles.navBtn(view === 'sales')} onClick={() => setView('sales')}>Ventas</button>
            <button style={styles.navBtn(view === 'expenses')} onClick={() => setView('expenses')}>Gastos</button>
            <button style={styles.navBtn(view === 'search')} onClick={() => setView('search')}>🔍 Búsqueda</button>
            <button style={{...styles.navBtn(view === 'admin_void'), color:'#fb923c', borderColor:'#fb923c'}} onClick={() => setView('admin_void')}>Admin Datos</button>
            <button style={{...styles.navBtn(view === 'void'), color:'#f87171', borderColor:'#f87171'}} onClick={() => setView('void')}>Anular Ventas</button>
            <button style={{...styles.navBtn(view === 'dashboard'), border: '1px solid #4ade80', color: view === 'dashboard' ? 'black' : '#4ade80', background: view === 'dashboard' ? '#4ade80' : 'transparent'}} onClick={() => setView('dashboard')}>📊 Resumen Financiero</button>
          </nav>
        </div>
      </div>
      
      {view === 'inventory' && renderInventory()}
      {view === 'sales' && renderSales()}
      {view === 'expenses' && renderExpenses()}
      {view === 'search' && renderGlobalSearch()}
      {view === 'admin_void' && renderAdminVoid()}
      {view === 'void' && renderVoid()}
      {view === 'dashboard' && renderDashboard()}
    </div>
  );
}