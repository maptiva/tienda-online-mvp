import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/categoria/useCategories';
import { Loading } from '../../components/dashboard/Loading';
import SearchBar from '../../components/SearchBar';
import { supabase } from '../../services/supabase';
import { useProductStore } from '../../store/useProductStore';
import { useAuth } from '../../context/AuthContext';

const BulkPriceUpdate = () => {
    const { products, loading: productsLoading, error: productsError } = useProducts();
    const { categories, loading: categoriesLoading } = useCategories();
    // Necesitamos acceso directo al store y usuario para actualizar la UI sin recargar
    const { setProducts } = useProductStore();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    // Configuración de la operación
    const [operation, setOperation] = useState('increase'); // 'increase', 'decrease', 'visibility'
    const [visibilityAction, setVisibilityAction] = useState('hide'); // 'hide' (Consultar Precio), 'show' (Mostrar Precio)
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

            // Filtro opcional por estado de "Consultar Precio" si quisiéramos (por ahora no lo agregamos para no saturar)

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
                lastActionBackup.map(u => {
                    const { id, ...restoreData } = u;
                    return supabase
                        .from('products')
                        .update({
                            ...restoreData,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', id);
                })
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


    // Lógica para actualizar visibilidad (Consultar Precio)
    const handleVisibilityUpdate = async () => {
        if (selectedProducts.size === 0) return;
        if (!window.confirm(`¿Estás seguro de cambiar la visibilidad de ${selectedProducts.size} productos?`)) return;

        setIsUpdating(true);
        try {
            const productsToUpdate = filteredProducts.filter(p => selectedProducts.has(p.id));

            // Guardar backup global para "Deshacer"
            const backup = productsToUpdate.map(p => ({
                id: p.id,
                price: p.price,
                price_on_request: p.price_on_request,
                backup_price: p.backup_price
            }));
            setLastActionBackup(backup);

            // Preparar updates
            const updates = productsToUpdate.map(p => {
                const isHiding = visibilityAction === 'hide';

                let updateData = {
                    id: p.id,
                    updated_at: new Date().toISOString(),
                    price_on_request: isHiding
                };

                if (isHiding) {
                    // Si vamos a ocultar, guardamos backup si no existe ya
                    if (!p.price_on_request) { // Solo si no estaba ya oculto
                        updateData.backup_price = p.price;
                    }
                } else {
                    // Si vamos a mostrar, restauramos precio desde backup si existe
                    if (p.price_on_request && p.backup_price !== null && p.backup_price !== undefined) {
                        updateData.price = p.backup_price;
                        updateData.backup_price = null; // Limpiamos backup
                    }
                }
                return updateData;
            });

            // Ejecutar actualizaciones
            const results = await Promise.all(
                updates.map(u => {
                    const { id, ...data } = u;
                    return supabase.from('products').update(data).eq('id', id);
                })
            );

            const hasError = results.some(r => r.error);
            if (hasError) throw new Error("Error en algunas actualizaciones de visibilidad");

            setUpdateMessage({ type: 'success', text: `¡Visibilidad actualizada con éxito!` });

            // Actualización optimista del Store para reflejar cambios sin recargar
            if (user?.id) {
                const updatedProductsList = products.map(p => {
                    const update = updates.find(u => u.id === p.id);
                    if (update) {
                        // Crear nuevo objeto fusionando datos
                        // Nota: el update tiene 'id' y 'updated_at' también
                        return { ...p, ...update };
                    }
                    return p;
                });
                setProducts(user.id, updatedProductsList);
            }

            setTimeout(() => setUpdateMessage(null), 5000);

        } catch (err) {
            setUpdateMessage({ type: 'error', text: 'Error: ' + err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    // Cálculo de estados para validación de UI (IMPORTANTE: Debe ir antes del early return para no romper el orden de los Hooks)
    const selectedList = filteredProducts.filter(p => selectedProducts.has(p.id));
    const allHidden = selectedList.length > 0 && selectedList.every(p => p.price_on_request);
    const allVisible = selectedList.length > 0 && selectedList.every(p => !p.price_on_request);

    // Auto-ajustar acción de visibilidad según selección para evitar estados redundantes
    useEffect(() => {
        if (operation === 'visibility' && selectedProducts.size > 0) {
            if (allHidden && visibilityAction === 'hide') {
                setVisibilityAction('show');
            } else if (allVisible && visibilityAction === 'show') {
                setVisibilityAction('hide');
            }
        }
    }, [selectedProducts.size, allHidden, allVisible, operation, visibilityAction]);

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
                        <option value="visibility">👀 Visibilidad Precio</option>
                    </select>

                    {operation === 'visibility' ? (
                        <div className="flex bg-white border p-1 rounded-lg">
                            <button
                                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${allHidden
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : visibilityAction === 'hide'
                                        ? 'bg-orange-500 text-white shadow'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                onClick={() => !allHidden && setVisibilityAction('hide')}
                                disabled={allHidden}
                                title={allHidden ? "Todos los seleccionados ya tienen precio oculto" : ""}
                            >
                                🙈 Ocultar (Consultar Precio)
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${allVisible
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : visibilityAction === 'show'
                                        ? 'bg-green-600 text-white shadow'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                onClick={() => !allVisible && setVisibilityAction('show')}
                                disabled={allVisible}
                                title={allVisible ? "Todos los seleccionados ya tienen precio visible" : ""}
                            >
                                👁️ Mostrar Precio
                            </button>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {lastActionBackup && (
                        <div className="flex flex-col items-end gap-1">
                            <button
                                onClick={handleUndo}
                                disabled={isUpdating}
                                className="px-6 py-2 rounded-lg font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all flex items-center gap-2 bg-white"
                            >
                                🔄 Deshacer
                            </button>
                            <span className="text-[10px] text-gray-400 italic">Disponible hasta recargar página</span>
                        </div>
                    )}

                    {operation !== 'visibility' && (
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
                    )}

                    <button
                        disabled={
                            selectedProducts.size === 0 ||
                            isUpdating ||
                            (operation === 'visibility' && (
                                (visibilityAction === 'hide' && allHidden) ||
                                (visibilityAction === 'show' && allVisible)
                            )) ||
                            (operation !== 'visibility' && amount <= 0)
                        }
                        onClick={operation === 'visibility' ? handleVisibilityUpdate : handleUpdate}
                        className={`px-8 py-2 rounded-lg font-bold text-white shadow-md transition-all transform active:scale-95 ${selectedProducts.size === 0 || (operation !== 'visibility' && amount <= 0) || isUpdating
                            ? 'bg-gray-300 cursor-not-allowed opacity-50'
                            : operation === 'visibility'
                                ? visibilityAction === 'hide' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isUpdating ? 'Procesando...' :
                            operation === 'visibility'
                                ? `Aplicar a ${selectedProducts.size}`
                                : `Confirmar para ${selectedProducts.size}`
                        }
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
                            <th className="py-2 px-4 font-semibold text-gray-600 text-left">Consultar Precio</th>
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
                                    <td className="p-4">
                                        {product.price_on_request ? (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-200">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Inactivo</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {product.price_on_request ? (
                                            <span className="text-gray-400 italic text-sm line-through decoration-orange-500">
                                                ${product.price.toLocaleString()}
                                            </span>
                                        ) : (
                                            `$${product.price.toLocaleString()}`
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {isSelected ? (
                                            operation === 'visibility' ? (
                                                visibilityAction === 'hide' ? (
                                                    <span className="text-orange-600 font-bold text-xs flex items-center gap-1">
                                                        SE OCULTARÁ
                                                        <span className="text-[10px] bg-orange-100 px-1 rounded">🙈</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                                                        SE MOSTRARÁ
                                                        <span className="text-[10px] bg-green-100 px-1 rounded">👁️</span>
                                                    </span>
                                                )
                                            ) : amount > 0 ? (
                                                <span className="font-bold text-green-600 flex items-center gap-1">
                                                    ${newPrice.toLocaleString()}
                                                    <span className="text-[10px] bg-green-100 px-1 rounded">NUEVO</span>
                                                </span>
                                            ) : <span className="text-gray-300">---</span>
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
