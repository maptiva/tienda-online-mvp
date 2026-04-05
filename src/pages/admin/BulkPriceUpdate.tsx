import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/categoria/useCategories';
import { Loading } from '../../components/dashboard/Loading';
import SearchBar from '../../components/SearchBar';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    display_id?: number;
    sku?: string;
    name: string;
    description?: string;
    price: number;
    compare_at_price?: number | null;
    price_on_request?: boolean;
    category_id?: number;
    image_url?: string;
    categories?: { name: string };
}

type OperationType = 'increase' | 'decrease' | 'visibility' | 'promo' | 'clear_promo';
type ValueType = 'percentage' | 'fixed';

const BulkPriceUpdate: React.FC = () => {
    const queryClient = useQueryClient();
    const { products, loading: productsLoading } = useProducts() as any;
    const { categories, loading: categoriesLoading } = useCategories() as any;
    const { user, impersonatedUser } = useAuth() as any;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

    // Configuración de la operación
    const [operation, setOperation] = useState<OperationType>('increase');
    const [visibilityAction, setVisibilityAction] = useState<'hide' | 'show'>('hide');
    const [valueType, setValueType] = useState<ValueType>('percentage');
    const [amount, setAmount] = useState<number>(0);
    const [rounding, setRounding] = useState<string>('none');

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [lastActionBackup, setLastActionBackup] = useState<any[] | null>(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    // Lógica de redondeo
    const applyRounding = (price: number): number => {
        if (rounding === 'none') return price;
        if (rounding === 'to10') return Math.round(price / 10) * 10;
        if (rounding === 'to100') return Math.round(price / 100) * 100;
        if (rounding === 'to99') return Math.floor(price) + 0.99;
        return price;
    };

    // Calcular nuevos valores previsualizados
    const calculateNewValues = (product: Product) => {
        let newPrice = product.price;
        let newComparePrice = product.compare_at_price;

        // Determinar el precio base real (si ya hay promo, el base es el tachado)
        const basePrice = product.compare_at_price || product.price;

        if (operation === 'promo') {
            // Aplicar Promo: 
            if (amount > 0) {
                // El tachado será el base original (protegemos el original si ya existía)
                newComparePrice = basePrice;
                
                // El descuento se calcula SIEMPRE sobre el precio base original
                const discount = valueType === 'percentage' 
                    ? basePrice * (amount / 100) 
                    : amount;
                
                newPrice = Math.max(0, applyRounding(basePrice - discount));
            }
        } else if (operation === 'clear_promo') {
            // Limpiar Promo: Restaurar desde el tachado si existe
            if (product.compare_at_price) {
                newPrice = product.compare_at_price;
            }
            newComparePrice = null;
        } else if (operation === 'increase' || operation === 'decrease') {
            if (amount > 0) {
                const change = valueType === 'percentage'
                    ? product.price * (amount / 100)
                    : amount;
                newPrice = operation === 'increase' ? product.price + change : product.price - change;
                newPrice = Math.max(0, applyRounding(newPrice));
            }
        }

        return { newPrice, newComparePrice };
    };

    // Filtrado de productos
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((p: Product) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                p.name.toLowerCase().includes(searchLower) ||
                (p.description && p.description.toLowerCase().includes(searchLower)) ||
                (p.categories?.name && p.categories.name.toLowerCase().includes(searchLower)) ||
                (p.price && p.price.toString().includes(searchLower)) ||
                (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
                (searchLower.startsWith('#')
                    ? (p.display_id || p.id).toString() === searchLower.replace('#', '')
                    : (p.display_id || p.id).toString() === searchLower);

            const matchesCategory = selectedCategory === 'all' ||
                (p.category_id && p.category_id.toString() === selectedCategory);

            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    const toggleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map((p: Product) => p.id)));
        }
    };

    const toggleProduct = (id: number) => {
        const next = new Set(selectedProducts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedProducts(next);
    };

    const handleUpdate = async () => {
        const isClearPromo = operation === 'clear_promo';
        if (selectedProducts.size === 0 || (!isClearPromo && amount <= 0 && operation !== 'visibility')) return;

        const confirmMsg = isClearPromo 
            ? `¿Confirmas quitar las promociones de ${selectedProducts.size} productos?`
            : `¿Estás seguro de actualizar los precios de ${selectedProducts.size} productos?`;

        if (!window.confirm(confirmMsg)) return;

        setIsUpdating(true);
        try {
            const productsToUpdate = filteredProducts.filter((p: Product) => selectedProducts.has(p.id));

            // Guardar backup para "Deshacer"
            const backup = productsToUpdate.map((p: Product) => ({ 
                id: p.id, 
                price: p.price, 
                compare_at_price: p.compare_at_price 
            }));
            setLastActionBackup(backup);

            const updates = productsToUpdate.map((p: Product) => {
                const { newPrice, newComparePrice } = calculateNewValues(p);
                return {
                    id: p.id,
                    price: parseFloat(newPrice.toFixed(2)),
                    compare_at_price: newComparePrice ? parseFloat(newComparePrice.toFixed(2)) : null,
                    updated_at: new Date().toISOString()
                };
            });

            const results = await Promise.all(
                updates.map((u: { id: number; price: number; compare_at_price: number | null; updated_at: string }) =>
                    supabase
                        .from('products')
                        .update({ 
                            price: u.price, 
                            compare_at_price: u.compare_at_price,
                            updated_at: u.updated_at 
                        })
                        .eq('id', u.id)
                )
            );

            if (results.some(r => r.error)) throw new Error("Error en algunas actualizaciones");

            setUpdateMessage({ type: 'success', text: `¡Actualización exitosa!` });
            setTimeout(() => setUpdateMessage(null), 5000);
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (err: any) {
            setUpdateMessage({ type: 'error', text: 'Error: ' + err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUndo = async () => {
        if (!lastActionBackup) return;
        if (!window.confirm(`¿Quieres revertir los últimos ${lastActionBackup.length} cambios?`)) return;

        setIsUpdating(true);
        try {
            await Promise.all(
                lastActionBackup.map(u => 
                    supabase
                        .from('products')
                        .update({
                            price: u.price,
                            compare_at_price: u.compare_at_price,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', u.id)
                )
            );

            setUpdateMessage({ type: 'success', text: `¡Cambios revertidos!` });
            setLastActionBackup(null);
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (err: any) {
            setUpdateMessage({ type: 'error', text: 'Error al deshacer: ' + err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVisibilityUpdate = async () => {
        if (selectedProducts.size === 0) return;
        if (!window.confirm(`¿Cambiar visibilidad de ${selectedProducts.size} productos?`)) return;

        setIsUpdating(true);
        try {
            const productsToUpdate = filteredProducts.filter((p: Product) => selectedProducts.has(p.id));
            const backup = productsToUpdate.map((p: Product) => ({ id: p.id, price_on_request: p.price_on_request }));
            setLastActionBackup(backup);

            await Promise.all(
                productsToUpdate.map((p: Product) =>
                    supabase
                        .from('products')
                        .update({ 
                            price_on_request: visibilityAction === 'hide',
                            updated_at: new Date().toISOString() 
                        })
                        .eq('id', p.id)
                )
            );

            setUpdateMessage({ type: 'success', text: `Visibilidad actualizada` });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (err: any) {
            setUpdateMessage({ type: 'error', text: 'Error: ' + err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    if (productsLoading || categoriesLoading) return <Loading message="Cargando productos..." />;

    return (
        <div className="w-full flex-1 flex flex-col min-h-0 bg-white p-0 rounded-2xl shadow-lg border border-gray-200 overflow-hidden font-outfit">
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-300 pb-3 mb-3 gap-3">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold">Actualización Masiva</h1>
                        <p className="text-gray-500 mt-1 text-xs md:text-sm italic">Gestión inteligente de precios y promociones.</p>
                    </div>
                    {updateMessage && (
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {updateMessage.text}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white py-2 flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 items-stretch md:items-center">
                    <div className="flex-1 min-w-[150px]">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Buscar productos (Nombre, SKU, #ID)..."
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <select
                            className="p-2 border rounded-lg bg-gray-50 outline-none h-[38px] text-xs font-bold"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">Todas las Categorías</option>
                            {categories?.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="text-xs text-blue-600 font-black bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 whitespace-nowrap">
                            {selectedProducts.size} seleccionados
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 md:p-6 border rounded-xl mb-6 shadow-sm mt-3 ring-1 ring-slate-200">    
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">       
                        <div className="flex items-center gap-2">
                            <select
                                className="bg-white border-2 border-slate-200 px-3 py-2 rounded-xl font-black text-gray-700 outline-none text-sm h-[42px] shadow-sm focus:border-blue-500 transition-colors"
                                value={operation}
                                onChange={(e) => setOperation(e.target.value as OperationType)}
                            >
                                <option value="increase">📈 Aumentar</option>
                                <option value="decrease">📉 Disminuir</option>
                                <option value="promo">✨ Aplicar Promo</option>
                                <option value="clear_promo">🧹 Limpiar Promo</option>
                                <option value="visibility">👁️ Visibilidad</option>
                            </select>

                            {operation !== 'visibility' && operation !== 'clear_promo' && (
                                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border-2 border-slate-200 shadow-sm h-[42px]">
                                    <button
                                        className={`px-3 h-full rounded-lg text-xs font-black transition-all ${valueType === 'percentage' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-50'}`}
                                        onClick={() => setValueType('percentage')}
                                    >
                                        %
                                    </button>
                                    <button
                                        className={`px-3 h-full rounded-lg text-xs font-black transition-all ${valueType === 'fixed' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-50'}`}  
                                        onClick={() => setValueType('fixed')}
                                    >
                                        $
                                    </button>
                                    <input
                                        type="number"
                                        className="w-20 font-black text-center outline-none text-base bg-transparent"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            )}

                            {operation === 'visibility' && (
                                <div className="flex bg-white border-2 border-slate-200 p-1 rounded-xl h-[42px] shadow-sm">
                                    <button
                                        className={`px-4 rounded-lg text-xs font-black transition-all ${visibilityAction === 'hide' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400'}`}
                                        onClick={() => setVisibilityAction('hide')}
                                    >
                                        Ocultar
                                    </button>
                                    <button
                                        className={`px-4 rounded-lg text-xs font-black transition-all ${visibilityAction === 'show' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400'}`}
                                        onClick={() => setVisibilityAction('show')}
                                    >
                                        Mostrar
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={selectedProducts.size === 0 || isUpdating}
                            onClick={operation === 'visibility' ? handleVisibilityUpdate : handleUpdate}  
                            className={`flex-1 md:flex-none px-8 rounded-xl font-black text-white shadow-lg transition-all transform active:scale-95 text-sm h-[42px] ${
                                selectedProducts.size === 0 || isUpdating ? 'bg-slate-300 cursor-not-allowed' : 
                                operation === 'promo' ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
                                operation === 'clear_promo' ? 'bg-slate-700' : 'bg-blue-600'
                            }`}
                        >
                            {isUpdating ? 'Procesando...' : 
                             operation === 'promo' ? `¡Activar Promo en ${selectedProducts.size}!` :
                             operation === 'clear_promo' ? `Restaurar ${selectedProducts.size} Precios` :
                             `Confirmar Aplicación (${selectedProducts.size})`}
                        </button>

                        <button
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                        >
                            ⚙️ Opciones {showAdvancedOptions ? '▲' : '▼'}
                        </button>
                    </div>

                    {showAdvancedOptions && (
                        <div className="mt-4 pt-4 border-t border-slate-200 flex gap-6 items-center animate-in fade-in slide-in-from-top-2">
                            {operation !== 'visibility' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Redondeo:</span>
                                    <select
                                        className="bg-white border rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none"
                                        value={rounding}
                                        onChange={(e) => setRounding(e.target.value)}
                                    >
                                        <option value="none">Sin redondeo</option>
                                        <option value="to10">Al 10 más cercano</option>
                                        <option value="to100">Al 100 más cercano</option>
                                        <option value="to99">Terminar en .99</option>
                                    </select>
                                </div>
                            )}
                            {lastActionBackup && (
                                <button
                                    onClick={handleUndo}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                    🔄 Deshacer última acción ({lastActionBackup.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className='hidden md:flex flex-col flex-1 overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm'>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full border-separate border-spacing-0">
                            <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="py-3 px-4 w-10 border-b border-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 cursor-pointer accent-blue-600"
                                        />
                                    </th>
                                    <th className="py-3 px-4 font-black text-[10px] uppercase text-slate-500 text-left border-b border-gray-200">Ref</th>        
                                    <th className="py-3 px-4 font-black text-[10px] uppercase text-slate-500 text-left border-b border-gray-200">Producto</th>   
                                    <th className="py-3 px-4 font-black text-[10px] uppercase text-slate-500 text-right border-b border-gray-200">Precio Actual</th>
                                    <th className="py-3 px-4 font-black text-[10px] uppercase text-slate-500 text-right border-b border-gray-200">Nuevo Estado / Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product: Product) => {
                                    const isSelected = selectedProducts.has(product.id);
                                    const { newPrice, newComparePrice } = calculateNewValues(product);

                                    return (
                                        <tr key={product.id} className={`hover:bg-blue-50/50 transition-colors border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}>
                                            <td className="p-4 border-b border-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleProduct(product.id)}        
                                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                                />
                                            </td>
                                            <td className="p-4 border-b border-gray-50 font-mono text-[10px] text-gray-400">      
                                                {product.sku || `#${product.display_id || product.id}`}
                                            </td>
                                            <td className="p-4 border-b border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <img src={product.image_url || '/placeholder.jpg'} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm" />
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800 leading-tight">{product.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{product.categories?.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b border-gray-50 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-sm font-bold ${product.price_on_request ? 'text-orange-500' : 'text-gray-700'}`}>
                                                        ${product.price.toLocaleString()}
                                                    </span>
                                                    {product.compare_at_price && (
                                                        <span className="text-[10px] text-gray-400 line-through">
                                                            ${product.compare_at_price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 border-b border-gray-50 text-right">
                                                {isSelected ? (
                                                    <div className="flex flex-col items-end">
                                                        {operation === 'promo' ? (
                                                            <>
                                                                <span className="text-sm font-black text-green-600">${newPrice.toLocaleString()}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 line-through">${newComparePrice?.toLocaleString()}</span>
                                                                <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-black mt-1">NUEVA OFERTA</span>
                                                            </>
                                                        ) : operation === 'clear_promo' ? (
                                                            <>
                                                                <span className="text-sm font-black text-slate-700">${newPrice.toLocaleString()}</span>
                                                                <span className="text-[9px] bg-slate-200 text-slate-700 px-1 rounded font-black mt-1">LIMPIAR TACHADO</span>
                                                            </>
                                                        ) : operation === 'visibility' ? (
                                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${visibilityAction === 'hide' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                                {visibilityAction === 'hide' ? 'OCULTAR' : 'MOSTRAR'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm font-black text-blue-600">${newPrice.toLocaleString()}</span>
                                                        )}
                                                    </div>
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

                {/* Mobile View Placeholder */}
                <div className="md:hidden text-center py-10 text-gray-400 text-sm">
                    Utiliza un ordenador para realizar actualizaciones masivas de forma más cómoda.
                </div>
            </div>
        </div>
    );
};

export default BulkPriceUpdate;
