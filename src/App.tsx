import React, { useState, useEffect, useRef } from 'react';

// --- TU URL ACTUALIZADA ---
const API_URL = "https://script.google.com/macros/s/AKfycbwdEkqFStb5p56VEsNj40w-cVYVrXbUfuwvrUWyYTkwWACZG8yuvELQ3A9nZoTdltkhbw/exec";

// --- LOGO ---
const LOGO_URL = "https://lh3.googleusercontent.com/d/1obDjT8NmSP-Z9L37P7fR5nPVBEdzL-r1";

// --- HELPERS ---
const getToday = () => new Date().toISOString().split('T')[0];

// --- ESTILOS ---
const styles = {
  container: { backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' },
  logoContainer: { display: 'flex', alignItems: 'center' },
  logoImg: { height: '80px', objectFit: 'contain' },
  logoText: { fontSize: '1.8rem', fontWeight: 'bold', color: 'white', background: '#dc2626', padding: '10px 20px', borderRadius: '5px' },
  headerControls: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  exchangeRateBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '5px 15px', borderRadius: '20px', border: '1px solid #475569' },
  exchangeInput: { width: '60px', padding: '5px', borderRadius: '5px', border: 'none', background: '#0f172a', color: 'white', textAlign: 'center', fontWeight: 'bold' },
  nav: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  navBtn: (active: boolean) => ({
    background: active ? '#2563eb' : 'transparent', color: 'white', border: active ? 'none' : '1px solid #475569',
    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: '0.3s', whiteSpace: 'nowrap'
  }),
  card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '20px' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' },
  inputWrapper: { display: 'flex', gap: '10px' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: 'white', color: '#0f172a', flexGrow: 1 },
  textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: 'white', color: '#0f172a', minHeight: '60px' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: 'white', color: '#0f172a', width: '100%' },
  selectCurrency: { padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  btnPrimary: { width: '100%', padding: '12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  btnWarning: { width: '100%', padding: '12px', background: '#f59e0b', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  btnDelete: { padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9rem' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #334155', color: '#94a3b8' },
  td: { padding: '10px', borderBottom: '1px solid #334155' },
  statCard: { flex: 1, backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155', minWidth: '200px' },
  grid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  productInfo: { marginTop: '5px', fontSize: '0.9rem', color: '#4ade80' },
  sectionTitle: { borderBottom: '1px solid #475569', paddingBottom: '5px', marginBottom: '15px', color: '#60a5fa', fontWeight: 'bold' },
  imagePreview: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' },
  searchBar: { padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#0f172a', color: 'white', marginBottom: '20px', width: '100%' }
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<any>(3.75); 
  const [logoError, setLogoError] = useState(false);

  // Datos
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  // Filtros de búsqueda para ventas
  const [searchTerm, setSearchTerm] = useState('');

  // Estados Formularios
  const [newProduct, setNewProduct] = useState<any>({ 
    id: null, date: getToday(), name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', 
    description: '', notes: '', size: '', color: '', model: '', image: '', imageBase64: '' 
  });
  
  const [newSale, setNewSale] = useState<any>({ 
    date: getToday(), sku: '', price: '', currency: 'PEN', ticketNo: '', description: '', notes: '', 
    size: '', color: '', model: '',
    customerName: '', docType: 'DNI', docNum: '', sex: 'M', phone: '',
    batchId: '', receiverType: 'Mismo Comprador', receiverName: '', receiverDoc: '', receiverPhone: '',
    destination: 'Lima Metropolitana', shippingCost: ''
  }); 
  
  const [newExpense, setNewExpense] = useState<any>({ 
    date: getToday(), desc: '', amount: '', type: 'Seguro', currency: 'PEN', notes: '' 
  });

  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    fetch(API_URL).then(res => res.json()).then(data => {
        setProducts(data.products || []); setSales(data.sales || []); setExpenses(data.expenses || []); setInitialLoad(false);
      }).catch(err => { console.error(err); setInitialLoad(false); });
  }, []);

  const sendToSheet = async (payload: any) => {
    setLoading(true);
    try {
      await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setLoading(false); return true;
    } catch (error) { console.error(error); setLoading(false); alert("Error de conexión"); return false; }
  };

  // Convertir imagen a Base64 y redimensionar (para no saturar Google Apps Script)
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 600; // Redimensionar a max 600px
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Compresión JPEG 70%
          setNewProduct({ ...newProduct, imageBase64: compressedBase64 });
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
    
    // Actualización optimista
    let updatedProducts;
    if (isEdit) {
      updatedProducts = products.map(p => p.id === productData.id ? productData : p);
    } else {
      updatedProducts = [...products, productData];
    }
    setProducts(updatedProducts);
    
    // Limpiar form
    setNewProduct({ id: null, date: getToday(), name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', description: '', notes: '', size: '', color: '', model: '', image: '', imageBase64: '' });
    if(fileInputRef.current) fileInputRef.current.value = "";

    const success = await sendToSheet({ action, ...productData });
    if (!success && !isEdit) setProducts(products); // Revertir solo si era nuevo
  };

  const editProduct = (prod: any) => {
    setNewProduct(prod);
    // Scroll arriba
    window.scrollTo(0,0);
  };

  const addSale = async () => {
    const product = products.find(p => p.sku === newSale.sku);
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

    const prevSales = [...sales]; const prevProducts = [...products];
    const prevExpenses = [...expenses];

    setSales([...sales, saleData]);
    setProducts(products.map(p => p.sku === newSale.sku ? { ...p, stock: p.stock - qty } : p));
    
    // Si hay envio, agregar gasto visualmente también
    if(saleData.shippingCost && parseFloat(saleData.shippingCost) > 0) {
       setExpenses([...expenses, {
         id: Date.now(), date: saleData.date, type: 'Envío', desc: `Envío Boleta ${saleData.ticketNo}`, 
         amount: parseFloat(saleData.shippingCost), currency: saleData.currency, exchangeRate: saleData.exchangeRate
       }]);
    }

    setNewSale({ date: getToday(), sku: '', price: '', currency: 'PEN', ticketNo: '', description: '', notes: '', size: '', color: '', model: '', customerName: '', docType: 'DNI', docNum: '', sex: 'M', phone: '', batchId: '', receiverType: 'Mismo Comprador', receiverName: '', receiverDoc: '', receiverPhone: '', destination: 'Lima Metropolitana', shippingCost: '' });

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

  // Filtrado de Ventas
  const filteredSales = sales.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.date.includes(term) ||
      s.sku.toLowerCase().includes(term) ||
      (s.ticketNo || '').toLowerCase().includes(term) ||
      (s.destination || '').toLowerCase().includes(term)
    );
  }).slice().reverse();

  const handleSkuChange = (e: any) => {
    const val = e.target.value;
    const found = products.find(p => p.sku === val);
    setNewSale((prev: any) => ({
      ...prev, 
      sku: val, 
      size: found ? found.size : prev.size,
      color: found ? found.color : prev.color,
      model: found ? found.model : prev.model
    })); 
  };

  const toPEN = (amount: any, currency: string, rate = exchangeRate) => {
    const val = parseFloat(amount || 0);
    return currency === 'USD' ? val * rate : val;
  };
  
  // Totales
  const totalSalesPEN = sales.reduce((acc, s) => acc + toPEN(s.total, s.currency, s.exchangeRate), 0);
  const totalCOGSPEN = sales.reduce((acc, s) => {
    const p = products.find(prod => prod.sku === s.sku);
    return acc + (p ? toPEN(p.cost, p.currency, p.exchangeRate) * s.qty : 0);
  }, 0);
  const totalExpensesPEN = expenses.reduce((acc, e) => acc + toPEN(e.amount, e.currency, e.exchangeRate), 0);
  const grossProfit = totalSalesPEN - totalCOGSPEN;
  const netProfit = grossProfit - totalExpensesPEN;
  const foundProduct = products.find(p => p.sku === newSale.sku);

  if (initialLoad) return <div style={styles.container}><h2 style={{textAlign:'center', marginTop:'20%'}}>Cargando Veridi System...</h2></div>;

  // --- VISTAS ---
  
  const renderInventory = () => (
    <div style={{display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row'}}>
      <div style={{...styles.card, flex: 1}}>
        <h3>{newProduct.id ? 'Editar Producto' : 'Agregar Producto'}</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha Ingreso</label><input type="date" style={styles.input} value={newProduct.date} onChange={(e:any) => setNewProduct({...newProduct, date: e.target.value})} /></div>
        
        {/* FOTO */}
        <div style={styles.inputGroup}>
            <label style={styles.label}>Foto del Producto</label>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{color: 'white'}} accept="image/*" />
            {newProduct.imageBase64 && <div style={{marginTop: 10}}><img src={newProduct.imageBase64} style={styles.imagePreview} alt="Preview" /> (Listo para subir)</div>}
            {newProduct.image && !newProduct.imageBase64 && <div style={{marginTop: 10}}><img src={newProduct.image} style={styles.imagePreview} alt="Current" /> (Actual)</div>}
        </div>

        <div style={styles.inputGroup}><label style={styles.label}>SKU</label><input style={styles.input} value={newProduct.sku} onChange={(e:any) => setNewProduct({...newProduct, sku: e.target.value})} placeholder="Ej: NK-001" disabled={!!newProduct.id} /></div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 2}}><label style={styles.label}>Nombre del Producto</label><input style={styles.input} value={newProduct.name} onChange={(e:any) => setNewProduct({...newProduct, name: e.target.value})} /></div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Talla</label><input style={styles.input} value={newProduct.size} onChange={(e:any) => setNewProduct({...newProduct, size: e.target.value})} placeholder="S, M..." /></div>
        </div>
        <div style={styles.grid}>
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
        <div style={styles.inputGroup}><label style={styles.label}>Notas</label><textarea style={styles.textarea} value={newProduct.notes} onChange={(e:any) => setNewProduct({...newProduct, notes: e.target.value})} /></div>
        
        <button style={loading ? styles.btnLoading : (newProduct.id ? styles.btnWarning : styles.btnPrimary)} onClick={addProduct} disabled={loading}>
            {loading ? 'Procesando...' : (newProduct.id ? 'Actualizar Producto' : 'Guardar Producto')}
        </button>
        {newProduct.id && <button style={{...styles.btnDelete, marginTop: 10, width: '100%'}} onClick={() => setNewProduct({ id: null, date: getToday(), name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', description: '', notes: '', size: '', color: '', model: '', image: '', imageBase64: '' })}>Cancelar Edición</button>}
      </div>
      
      <div style={{...styles.card, flex: 2, overflowX: 'auto'}}>
        <h3>Inventario (Click para Editar)</h3>
        <table style={styles.table}><thead><tr><th>Foto</th><th>SKU</th><th>Prod</th><th>Talla</th><th>Color</th><th>Stock</th></tr></thead>
        <tbody>{products.map(p => (
            <tr key={p.id} onClick={() => editProduct(p)} style={{cursor: 'pointer', background: newProduct.id === p.id ? '#334155' : 'transparent'}}>
                <td style={styles.td}>{p.image ? <img src={p.image} style={styles.imagePreview} /> : '-'}</td>
                <td style={styles.td}>{p.sku}</td><td style={styles.td}>{p.name}</td><td style={styles.td}>{p.size}</td><td style={styles.td}>{p.color}</td><td style={styles.td}>{p.stock}</td>
            </tr>
        ))}</tbody></table>
      </div>
    </div>
  );

  const renderSales = () => (
    <div style={{display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row'}}>
      <div style={{...styles.card, flex: 1.2}}>
        <h3>Nueva Venta</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha Venta</label><input type="date" style={styles.input} value={newSale.date} onChange={(e:any) => setNewSale({...newSale, date: e.target.value})} /></div>
        
        {/* PRODUCTO */}
        <div style={styles.sectionTitle}>1. Producto</div>
        <div style={styles.inputGroup}><label style={styles.label}>SKU (Escanear)</label><input style={styles.input} value={newSale.sku} onChange={handleSkuChange} autoFocus placeholder="Escanea aquí..." />
        {newSale.sku && foundProduct ? <div style={styles.productInfo}>✅ {foundProduct.name} (Stock: {foundProduct.stock})</div> : null}</div>
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

        {/* CLIENTE */}
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
            <div style={{...styles.inputGroup, flex: 1}}>
                <label style={styles.label}>Sexo</label>
                <select style={styles.select} value={newSale.sex} onChange={(e:any) => setNewSale({...newSale, sex: e.target.value})}>
                    <option value="M">M</option><option value="F">F</option>
                </select>
            </div>
        </div>
        <div style={styles.inputGroup}><label style={styles.label}>Teléfono</label><input style={styles.input} value={newSale.phone} onChange={(e:any) => setNewSale({...newSale, phone: e.target.value})} /></div>

        {/* ENVIO */}
        <div style={styles.sectionTitle}>3. Envío y Orden</div>
        <div style={styles.inputGroup}><label style={styles.label}>Link Orden de Compra/Lote</label><input style={styles.input} value={newSale.batchId} onChange={(e:any) => setNewSale({...newSale, batchId: e.target.value})} placeholder="Ej: Lote #54" /></div>
        
        <div style={styles.inputGroup}>
            <label style={styles.label}>¿Quién Recibe?</label>
            <select style={styles.select} value={newSale.receiverType} onChange={(e:any) => setNewSale({...newSale, receiverType: e.target.value})}>
                <option>Mismo Comprador</option><option>Otra Persona</option>
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

        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 1}}>
                <label style={styles.label}>Destino</label>
                <select style={styles.select} value={newSale.destination} onChange={(e:any) => setNewSale({...newSale, destination: e.target.value})}>
                    <option>Lima Metropolitana</option><option>Provincias</option>
                </select>
            </div>
            <div style={{...styles.inputGroup, flex: 1}}>
                <label style={styles.label}>Costo Envío (S/)</label>
                <input type="number" style={styles.input} value={newSale.shippingCost} onChange={(e:any) => setNewSale({...newSale, shippingCost: e.target.value})} placeholder="0.00" />
            </div>
        </div>
        
        <button style={loading ? styles.btnLoading : styles.btnPrimary} onClick={addSale} disabled={loading}>{loading ? 'Registrando...' : 'Confirmar Venta'}</button>
      </div>
      
      <div style={{...styles.card, flex: 1.8, overflowX: 'auto'}}>
        <h3>Historial de Ventas</h3>
        <input style={styles.searchBar} placeholder="🔍 Buscar por Fecha, SKU, Boleta o Destino..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <table style={styles.table}><thead><tr><th>Fecha</th><th>Boleta</th><th>Prod</th><th>Cliente</th><th>Destino</th><th>Total</th></tr></thead>
        <tbody>{filteredSales.map(s => (
            <tr key={s.id}>
                <td style={styles.td}>{s.date}</td>
                <td style={styles.td}>{s.ticketNo || '-'}</td>
                <td style={styles.td}>{s.productName}</td>
                <td style={styles.td}>{s.customerName}</td>
                <td style={styles.td}>{s.destination}</td>
                <td style={styles.td}>{s.currency === 'USD' ? '$' : 'S/'} {parseFloat(s.total).toFixed(2)}</td>
            </tr>
        ))}</tbody></table>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div style={{display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row'}}>
      <div style={{...styles.card, flex: 1}}>
        <h3>Nuevo Gasto</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha</label><input type="date" style={styles.input} value={newExpense.date} onChange={(e:any) => setNewExpense({...newExpense, date: e.target.value})} /></div>
        
        <div style={styles.inputGroup}><label style={styles.label}>Tipo</label>
            <select style={styles.select} value={newExpense.type} onChange={(e:any) => setNewExpense({...newExpense, type: e.target.value})}>
                <option>Seguro</option><option>Publicidad</option><option>Pag. Web</option><option>Comisión</option><option>Aplicaciones</option>
                <option>Alimentación</option><option>Vuelo</option><option>Hotel</option><option>Aduanas</option><option>Movilidad</option><option>Otros</option><option>Envío</option>
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
      <div style={{...styles.card, flex: 2, overflowX: 'auto'}}>
        <h3>Gastos</h3>
        <table style={styles.table}><thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead><tbody>{expenses.map(e => (<tr key={e.id}><td style={styles.td}>{e.date}</td><td style={styles.td}>{e.type}</td><td style={styles.td}>{e.desc}</td><td style={styles.td}>{e.currency === 'USD' ? '$' : 'S/'} {parseFloat(e.amount).toFixed(2)}</td></tr>))}</tbody></table>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoContainer}>
          {!logoError ? ( <img src={LOGO_URL} alt="Veridi Store" style={styles.logoImg} onError={() => setLogoError(true)} /> ) : ( <div style={{...styles.logoText, display: 'block'}}>VERIDI STORE</div> )}
        </div>
        <div style={styles.headerControls}>
          <div style={styles.exchangeRateBox}>
            <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>T.C. Hoy: $1 = S/</span>
            <input type="number" step="0.01" style={styles.exchangeInput} value={exchangeRate} onChange={(e:any) => setExchangeRate(e.target.value)} />
          </div>
          <nav style={styles.nav}>
            <button style={styles.navBtn(view === 'dashboard')} onClick={() => setView('dashboard')}>Resumen</button>
            <button style={styles.navBtn(view === 'inventory')} onClick={() => setView('inventory')}>Inventario</button>
            <button style={styles.navBtn(view === 'sales')} onClick={() => setView('sales')}>Ventas</button>
            <button style={styles.navBtn(view === 'expenses')} onClick={() => setView('expenses')}>Gastos</button>
          </nav>
        </div>
      </div>
      {view === 'dashboard' && ( // DASHBOARD (Simplificado para el ejemplo)
        <div style={styles.grid}>
          <div style={styles.statCard}><div style={styles.label}>Ventas Totales</div><div style={{fontSize: '1.8rem', fontWeight: 'bold'}}>S/ {totalSalesPEN.toFixed(2)}</div></div>
          <div style={styles.statCard}><div style={styles.label}>Utilidad Bruta</div><div style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80'}}>S/ {grossProfit.toFixed(2)}</div></div>
          <div style={styles.statCard}><div style={styles.label}>Gastos Totales</div><div style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#f87171'}}>S/ {totalExpensesPEN.toFixed(2)}</div></div>
          <div style={styles.statCard}><div style={styles.label}>Utilidad Neta</div><div style={{fontSize: '1.8rem', fontWeight: 'bold', color: netProfit >= 0 ? '#4ade80' : '#f87171'}}>S/ {netProfit.toFixed(2)}</div></div>
        </div>
      )}
      {view === 'inventory' && renderInventory()}
      {view === 'sales' && renderSales()}
      {view === 'expenses' && renderExpenses()}
    </div>
  );
}