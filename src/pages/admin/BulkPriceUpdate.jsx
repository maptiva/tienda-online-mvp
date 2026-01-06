import React, { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/categoria/useCategories';
import { Loading } from '../../components/dashboard/Loading';
import SearchBar from '../../components/SearchBar';
import { supabase } from '../../services/supabase';

const BulkPriceUpdate = () => {
    const { products, loading: productsLoading, error: productsError } = useProducts();
    const { categories, loading: categoriesLoading } = useCategories();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    // Configuración de la operación
    const [operation, setOperation] = useState('increase'); // 'increase' | 'decrease'
    const [valueType, setValueType] = useState('percentage'); // 'percentage' | 'fixed'
    const [amount, setAmount] = useState(0);
    const [rounding, setRounding] = useState('none'); // 'none', 'to10', 'to100', 'to99'

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState(null);
    const [lastActionBackup, setLastActionBackup] = useState(null);

    // Lógica de redondeo
    const applyRounding = (price) => {
        if (rounding === 'none') return price;
        if (rounding === 'to10') return Math.round(price / 10) * 10;
        if (rounding === 'to100') return Math.round(price / 100) * 100;
        if (rounding === 'to99') return Math.floor(price) + 0.99;
        return price;
    };

    // Calcular nuevo precio previsualizado
    const calculateNewPrice = (oldPrice) => {
        if (amount <= 0) return oldPrice;

        let newPrice = oldPrice;
        const change = valueType === 'percentage'
            ? oldPrice * (amount / 100)
            : amount;

        if (operation === 'increase') {
            newPrice += change;
        } else {
            newPrice -= change;
        }

        return Math.max(0, applyRounding(newPrice));
    };

    // Filtrado de productos
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                p.name.toLowerCase().includes(searchLower) ||
                (p.description && p.description.toLowerCase().includes(searchLower)) ||
                (p.price && p.price.toString().includes(searchLower));

            const matchesCategory = selectedCategory === 'all' ||
                (p.category_id && p.category_id.toString() === selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    // Selección masiva
    const toggleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const toggleProduct = (id) => {
        const next = new Set(selectedProducts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedProducts(next);
    };

    const handleUpdate = async () => {
        if (selectedProducts.size === 0 || amount <= 0) return;

        if (!window.confirm(`¿Estás seguro de actualizar los precios de ${selectedProducts.size} productos?`)) return;

        setIsUpdating(true);
        try {
            const productsToUpdate = filteredProducts.filter(p => selectedProducts.has(p.id));

            // 🔄 Guardar backup para el "Deshacer" antes de actualizar
            const backup = productsToUpdate.map(p => ({ id: p.id, price: p.price }));
            setLastActionBackup(backup);

            const updates = productsToUpdate.map(p => ({
                id: p.id,
                price: parseFloat(calculateNewPrice(p.price).toFixed(2)),
                updated_at: new Date().toISOString()
            }));

            // Actualización en bloque (Promise.all para asegurar rapidez en lotes medianos)
            const results = await Promise.all(
                updates.map(u =>
                    supabase
                        .from('products')
                        .update({ price: u.price, updated_at: u.updated_at })
                        .eq('id', u.id)
                )
            );

            const hasError = results.some(r => r.error);
            if (hasError) throw new Error("Error en algunas actualizaciones");

            setUpdateMessage({ type: 'success', text: `¡Precios actualizados con éxito!` });
            // Ya no recargamos automáticamente para no perder el estado del "Deshacer"
            // setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setUpdateMessage({ type: 'error', text: 'Error al actualizar: ' + err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUndo = async () => {
        if (!lastActionBackup) return;
        if (!window.confirm(`¿Quieres revertir los últimos ${lastActionBackup.length} cambios?`)) return;

        setIsUpdating(true);
        try {
            const results = await Promise.all(
                lastActionBackup.map(u =>
                    supabase
                        .from('products')
                        .update({ price: u.price, updated_at: new Date().toISOString() })
                        .eq('id', u.id)
                )
            );

            const hasError = results.some(r => r.error);
            if (hasError) throw new Error("Error al revertir");

            setUpdateMessage({ type: 'success', text: `¡Cambios revertidos correctamente!` });
            setLastActionBackup(null);
            // Pequeño delay para que el usuario vea el éxito antes de recargar
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setUpdateMessage({ type: 'error', text: 'Error al deshacer: ' + err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    if (productsLoading || categoriesLoading) return <Loading message="Cargando productos..." />;

    return (
        <div className="w-full border-collapse shadow-xl bg-white p-8 rounded-xl font-outfit">
            <div className="flex justify-between items-end border-b border-gray-300 pb-3 mb-3">
                <div>
                    <h1 className="text-3xl font-bold">Actualización Masiva de Precios</h1>
                    <p className="text-gray-500 mt-1 text-sm italic">Gestiona múltiples precios con precisión y rapidez.</p>
                </div>
                {updateMessage && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {updateMessage.text}
                    </div>
                )}
            </div>

            {/* Panel de Filtros */}
            <div className="bg-white py-4 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px]">
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Buscar por nombre, descripción o precio..."
                    />
                </div>
                <select
                    className="p-2 border rounded-lg bg-gray-50 outline-none h-[42px]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="all">Todas las categorías</option>
                    {categories?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <div className="text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-2 rounded-lg">
                    {selectedProducts.size} seleccionados / {filteredProducts.length} filtrados
                </div>
            </div>

            {/* Panel de Acción (Integrado arriba) */}
            <div className="bg-slate-50 p-6 border rounded-xl mb-6 flex flex-wrap items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <select
                        className="bg-white border p-2 rounded-lg font-bold text-gray-700 outline-none"
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                    >
                        <option value="increase">Aumentar (+)</option>
                        <option value="decrease">Disminuir (-)</option>
                    </select>
                    <div className="flex bg-white border p-1 rounded-lg">
                        <button
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${valueType === 'percentage' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}
                            onClick={() => setValueType('percentage')}
                        >
                            %
                        </button>
                        <button
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${valueType === 'fixed' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}
                            onClick={() => setValueType('fixed')}
                        >
                            $
                        </button>
                    </div>
                    <input
                        type="number"
                        className="bg-white border p-2 rounded-lg w-24 font-bold text-center outline-none ring-2 ring-transparent focus:ring-blue-400 transition-all"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="0"
                    />
                </div>

                <div className="flex items-center gap-4">
                    {lastActionBackup && (
                        <button
                            onClick={handleUndo}
                            disabled={isUpdating}
                            className="px-6 py-2 rounded-lg font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 bg-white"
                        >
                            🔄 Deshacer
                        </button>
                    )}
                    <select
                        className="bg-white border p-2 rounded-lg text-sm outline-none"
                        value={rounding}
                        onChange={(e) => setRounding(e.target.value)}
                    >
                        <option value="none">Sin redondeo</option>
                        <option value="to10">Redondear a 10s</option>
                        <option value="to100">Redondear a 100s</option>
                        <option value="to99">Marketing (.99)</option>
                    </select>
                    <button
                        disabled={selectedProducts.size === 0 || amount <= 0 || isUpdating}
                        onClick={handleUpdate}
                        className={`px-8 py-2 rounded-lg font-bold text-white shadow-md transition-all transform active:scale-95 ${selectedProducts.size === 0 || amount <= 0 || isUpdating
                            ? 'bg-gray-300 cursor-not-allowed opacity-50'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isUpdating ? 'Procesando...' : `Confirmar para ${selectedProducts.size} productos`}
                    </button>
                </div>
            </div>

            {/* Tabla de Productos */}
            <div className='mt-5 overflow-y-scroll h-[440px] border border-gray-200 rounded-lg'>
                <table className="w-full">
                    <thead className="bg-gray-300 border-b border-gray-500 sticky top-0 z-10">
                        <tr>
                            <th className="py-2 px-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-left">Imagen</th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-left">Producto</th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-left">Categoría</th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-left">Precio Actual</th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-left">Nuevo Precio</th>
                        </tr>
                    </thead>
                    <tbody className="font-outfit">
                        {filteredProducts.map(product => {
                            const isSelected = selectedProducts.has(product.id);
                            const newPrice = calculateNewPrice(product.price);

                            return (
                                <tr key={product.id} className={`hover:bg-blue-50 transition-colors border-b border-gray-200 ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleProduct(product.id)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-4">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded-md border border-gray-200 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                                                Sin foto
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{product.name}</div>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">{product.categories?.name}</td>
                                    <td className="p-4 text-gray-600">${product.price.toLocaleString()}</td>
                                    <td className="p-4">
                                        {isSelected && amount > 0 ? (
                                            <span className="font-bold text-green-600 flex items-center gap-1">
                                                ${newPrice.toLocaleString()}
                                                <span className="text-[10px] bg-green-100 px-1 rounded">NUEVO</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">---</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BulkPriceUpdate;
