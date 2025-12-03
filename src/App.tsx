import React, { useState, useEffect } from 'react';

// --- TU NUEVA URL ---
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
  selectCurrency: { padding: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  btnPrimary: { width: '100%', padding: '12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  btnDelete: { padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9rem' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #334155', color: '#94a3b8' },
  td: { padding: '10px', borderBottom: '1px solid #334155' },
  statCard: { flex: 1, backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155', minWidth: '200px' },
  grid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  productInfo: { marginTop: '5px', fontSize: '0.9rem', color: '#4ade80' },
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<any>(3.75); 
  const [logoError, setLogoError] = useState(false);

  // USAMOS <any[]> PARA EVITAR ERRORES DE TYPESCRIPT
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [newProduct, setNewProduct] = useState<any>({ date: getToday(), name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', description: '', notes: '', size: '', color: '', model: '' });
  const [newSale, setNewSale] = useState<any>({ date: getToday(), sku: '', price: '', currency: 'PEN', ticketNo: '', description: '', notes: '', size: '', color: '', model: '' }); 
  const [newExpense, setNewExpense] = useState<any>({ date: getToday(), desc: '', amount: '', type: 'Alimentación', currency: 'PEN', notes: '' });

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

  const toPEN = (amount: any, currency: string, rate = exchangeRate) => {
    const val = parseFloat(amount || 0);
    return currency === 'USD' ? val * rate : val;
  };

  const addProduct = async () => {
    if(!newProduct.name || !newProduct.sku) return alert("Faltan datos");
    const productData = { ...newProduct, id: Date.now(), cost: parseFloat(newProduct.cost), stock: parseInt(newProduct.stock), exchangeRate };
    
    const prevProducts = [...products];
    setProducts([...products, productData]);
    setNewProduct({ ...newProduct, name: '', sku: '', category: '', cost: '', stock: '', currency: 'PEN', description: '', notes: '', size: '', color: '', model: '' });

    const success = await sendToSheet({ action: 'ADD_PRODUCT', ...productData });
    if (!success) setProducts(prevProducts);
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
    setSales([...sales, saleData]);
    setProducts(products.map(p => p.sku === newSale.sku ? { ...p, stock: p.stock - qty } : p));
    setNewSale({ ...newSale, sku: '', price: '', currency: 'PEN', ticketNo: '', description: '', notes: '', size: '', color: '', model: '' });

    const success = await sendToSheet({ action: 'ADD_SALE', ...saleData });
    if (!success) { setSales(prevSales); setProducts(prevProducts); alert("Error guardando venta"); }
  };

  const addExpense = async () => {
    if(!newExpense.amount) return;
    const expenseData = { ...newExpense, id: Date.now(), amount: parseFloat(newExpense.amount), exchangeRate };

    const prevExpenses = [...expenses];
    setExpenses([...expenses, expenseData]);
    setNewExpense({ ...newExpense, desc: '', amount: '', type: 'Alimentación', currency: 'PEN', notes: '' });

    const success = await sendToSheet({ action: 'ADD_EXPENSE', ...expenseData });
    if (!success) setExpenses(prevExpenses);
  };

  const voidSale = async (saleId: any, sku: string, qty: any) => {
    if (!confirm("¿Seguro que deseas anular esta venta? El stock será devuelto.")) return;
    setLoading(true);
    
    const prevSales = [...sales];
    const prevProducts = [...products];

    setSales(sales.filter(s => s.id !== saleId));
    setProducts(products.map(p => p.sku === sku ? { ...p, stock: p.stock + parseInt(qty) } : p));

    const success = await sendToSheet({ action: 'DELETE_SALE', id: saleId, sku, qty });
    if (!success) {
      setSales(prevSales);
      setProducts(prevProducts);
      alert("Error al anular venta");
    } else {
      setLoading(false);
      alert("Venta anulada correctamente");
    }
  };

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

  const renderDashboard = () => (
    <div>
      <h2 style={{marginBottom: '20px'}}>Resumen Financiero</h2>
      <div style={styles.grid}>
        <div style={styles.statCard}><div style={styles.label}>Ventas Totales</div><div style={{fontSize: '1.8rem', fontWeight: 'bold'}}>S/ {totalSalesPEN.toFixed(2)}</div></div>
        <div style={styles.statCard}><div style={styles.label}>Utilidad Bruta</div><div style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80'}}>S/ {grossProfit.toFixed(2)}</div></div>
        <div style={styles.statCard}><div style={styles.label}>Gastos Totales</div><div style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#f87171'}}>S/ {totalExpensesPEN.toFixed(2)}</div></div>
        <div style={styles.statCard}><div style={styles.label}>Utilidad Neta</div><div style={{fontSize: '1.8rem', fontWeight: 'bold', color: netProfit >= 0 ? '#4ade80' : '#f87171'}}>S/ {netProfit.toFixed(2)}</div></div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div style={{display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row'}}>
      <div style={{...styles.card, flex: 1}}>
        <h3>Agregar Producto</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha Ingreso</label><input type="date" style={styles.input} value={newProduct.date} onChange={(e:any) => setNewProduct({...newProduct, date: e.target.value})} /></div>
        <div style={styles.inputGroup}><label style={styles.label}>SKU</label><input style={styles.input} value={newProduct.sku} onChange={(e:any) => setNewProduct({...newProduct, sku: e.target.value})} placeholder="Ej: NK-001" /></div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 2}}><label style={styles.label}>Nombre</label><input style={styles.input} value={newProduct.name} onChange={(e:any) => setNewProduct({...newProduct, name: e.target.value})} /></div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Talla</label><input style={styles.input} value={newProduct.size} onChange={(e:any) => setNewProduct({...newProduct, size: e.target.value})} placeholder="S, M..." /></div>
        </div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Color</label><input style={styles.input} value={newProduct.color} onChange={(e:any) => setNewProduct({...newProduct, color: e.target.value})} placeholder="Ej: Negro" /></div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Modelo</label><input style={styles.input} value={newProduct.model} onChange={(e:any) => setNewProduct({...newProduct, model: e.target.value})} placeholder="Ej: Slim Fit" /></div>
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
        <button style={loading ? styles.btnLoading : styles.btnPrimary} onClick={addProduct} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
      <div style={{...styles.card, flex: 2, overflowX: 'auto'}}>
        <h3>Inventario</h3>
        <table style={styles.table}><thead><tr><th>Fecha</th><th>SKU</th><th>Prod</th><th>Talla</th><th>Color</th><th>Stock</th></tr></thead><tbody>{products.map(p => (<tr key={p.id}><td style={styles.td}>{p.date}</td><td style={styles.td}>{p.sku}</td><td style={styles.td}>{p.name}</td><td style={styles.td}>{p.size}</td><td style={styles.td}>{p.color}</td><td style={styles.td}>{p.stock}</td></tr>))}</tbody></table>
      </div>
    </div>
  );

  const renderSales = () => (
    <div style={{display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row'}}>
      <div style={{...styles.card, flex: 1}}>
        <h3>Nueva Venta</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha Venta</label><input type="date" style={styles.input} value={newSale.date} onChange={(e:any) => setNewSale({...newSale, date: e.target.value})} /></div>
        <div style={styles.inputGroup}><label style={styles.label}>SKU (Escanear)</label><input style={styles.input} value={newSale.sku} onChange={handleSkuChange} autoFocus placeholder="Escanea aquí..." />
        {newSale.sku && foundProduct ? <div style={styles.productInfo}>✅ {foundProduct.name} (Stock: {foundProduct.stock})</div> : null}</div>
        
        <div style={styles.grid}>
          <div style={{...styles.inputGroup, flex: 2}}><label style={styles.label}>Boleta Nº</label><input style={styles.input} value={newSale.ticketNo} onChange={(e:any) => setNewSale({...newSale, ticketNo: e.target.value})} placeholder="001-..." /></div>
          <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Talla</label><input style={styles.input} value={newSale.size} onChange={(e:any) => setNewSale({...newSale, size: e.target.value})} /></div>
        </div>
        <div style={styles.grid}>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Color</label><input style={styles.input} value={newSale.color} onChange={(e:any) => setNewSale({...newSale, color: e.target.value})} /></div>
            <div style={{...styles.inputGroup, flex: 1}}><label style={styles.label}>Modelo</label><input style={styles.input} value={newSale.model} onChange={(e:any) => setNewSale({...newSale, model: e.target.value})} /></div>
        </div>
        
        <div style={styles.inputGroup}>
            <label style={styles.label}>Precio Venta Unit.</label>
            <div style={styles.inputWrapper}>
              <input type="number" style={styles.input} value={newSale.price} onChange={(e:any) => setNewSale({...newSale, price: e.target.value})} />
              <select style={styles.selectCurrency} value={newSale.currency} onChange={(e:any) => setNewSale({...newSale, currency: e.target.value})}><option value="PEN">S/</option><option value="USD">$</option></select>
            </div>
        </div>
        <div style={styles.inputGroup}><label style={styles.label}>Descripción Adicional</label><input style={styles.input} value={newSale.description} onChange={(e:any) => setNewSale({...newSale, description: e.target.value})} /></div>
        <div style={styles.inputGroup}><label style={styles.label}>Notas</label><textarea style={styles.textarea} value={newSale.notes} onChange={(e:any) => setNewSale({...newSale, notes: e.target.value})} /></div>
        
        <button style={loading ? styles.btnLoading : styles.btnPrimary} onClick={addSale} disabled={loading}>{loading ? 'Registrando...' : 'Confirmar Venta'}</button>
      </div>
      <div style={{...styles.card, flex: 2, overflowX: 'auto'}}>
        <h3>Historial (Últimas)</h3>
        <table style={styles.table}><thead><tr><th>Fecha</th><th>Boleta</th><th>Prod</th><th>Talla</th><th>Total</th></tr></thead><tbody>{sales.slice(-5).reverse().map(s => (<tr key={s.id}><td style={styles.td}>{s.date}</td><td style={styles.td}>{s.ticketNo || '-'}</td><td style={styles.td}>{s.productName}</td><td style={styles.td}>{s.size}</td><td style={styles.td}>{s.currency === 'USD' ? '$' : 'S/'} {parseFloat(s.total).toFixed(2)}</td></tr>))}</tbody></table>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div style={{display: 'flex', gap: '20px', flexDirection: window.innerWidth < 768 ? 'column' : 'row'}}>
      <div style={{...styles.card, flex: 1}}>
        <h3>Nuevo Gasto</h3>
        <div style={styles.inputGroup}><label style={styles.label}>Fecha</label><input type="date" style={styles.input} value={newExpense.date} onChange={(e:any) => setNewExpense({...newExpense, date: e.target.value})} /></div>
        
        <div style={styles.inputGroup}><label style={styles.label}>Tipo</label><select style={styles.input} value={newExpense.type} onChange={(e:any) => setNewExpense({...newExpense, type: e.target.value})}><option>Alimentación</option><option>Vuelo</option><option>Hotel</option><option>Aduanas</option><option>Movilidad</option><option>Otros</option></select></div>
        <div style={styles.inputGroup}><label style={styles.label}>Concepto</label><input style={styles.input} value={newExpense.desc} onChange={(e:any) => setNewExpense({...newExpense, desc: e.target.value})} /></div>
        <div style={{...styles.inputGroup}}>
          <label style={styles.label}>Monto</label>
          <div style={styles.inputWrapper}>
            <input type="number" style={styles.input} value={newExpense.amount} onChange={(e:any) => setNewExpense({...newExpense, amount: e.target.value})} />
            <select style={styles.selectCurrency} value={newExpense.currency} onChange={(e:any) => setNewExpense({...newExpense, currency: e.target.value})}><option value="PEN">S/</option><option value="USD">$</option></select>
          </div>
        </div>
        <div style={styles.inputGroup}><label style={styles.label}>Notas</label><textarea style={styles.textarea} value={newExpense.notes} onChange={(e:any) => setNewExpense({...newExpense, notes: e.target.value})} /></div>
        <button style={loading ? styles.btnLoading : styles.btnPrimary} onClick={addExpense} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Gasto'}</button>
      </div>
      <div style={{...styles.card, flex: 2, overflowX: 'auto'}}>
        <h3>Gastos</h3>
        <table style={styles.table}><thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead><tbody>{expenses.map(e => (<tr key={e.id}><td style={styles.td}>{e.date}</td><td style={styles.td}>{e.type}</td><td style={styles.td}>{e.desc}</td><td style={styles.td}>{e.currency === 'USD' ? '$' : 'S/'} {parseFloat(e.amount).toFixed(2)}</td></tr>))}</tbody></table>
      </div>
    </div>
  );

  const renderVoid = () => (
    <div style={{...styles.card}}>
      <h3 style={{color:'#f87171'}}>⚠️ Zona de Anulación de Ventas</h3>
      <div style={{overflowX:'auto'}}>
      <table style={styles.table}>
        <thead><tr><th>Fecha</th><th>Boleta</th><th>Producto</th><th>Total</th><th>Motivo/Notas</th><th>Acción</th></tr></thead>
        <tbody>
          {sales.slice().reverse().map(s => (
            <tr key={s.id}>
              <td style={styles.td}>{s.date}</td>
              <td style={styles.td}>{s.ticketNo || 'S/N'}</td>
              <td style={styles.td}>{s.productName}</td>
              <td style={styles.td}>{s.currency === 'USD' ? '$' : 'S/'} {parseFloat(s.total).toFixed(2)}</td>
              <td style={styles.td}>{s.notes}</td>
              <td style={styles.td}>
                <button style={styles.btnDelete} onClick={() => voidSale(s.id, s.sku, s.qty)}>ANULAR 🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoContainer}>
          {!logoError ? (
            <img src={LOGO_URL} alt="Veridi Store" style={styles.logoImg} onError={() => setLogoError(true)} />
          ) : (
            <div style={{...styles.logoText, display: 'block'}}>VERIDI STORE</div>
          )}
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
            <button style={{...styles.navBtn(view === 'void'), color:'#f87171', borderColor:'#f87171'}} onClick={() => setView('void')}>Anulaciones</button>
          </nav>
        </div>
      </div>
      {view === 'dashboard' && renderDashboard()}
      {view === 'inventory' && renderInventory()}
      {view === 'sales' && renderSales()}
      {view === 'expenses' && renderExpenses()}
      {view === 'void' && renderVoid()}
    </div>
  );
}