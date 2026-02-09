import React from 'react';

// 2. GRÁFICO DE BARRAS: Visual comparativo mes a mes
const BarChartView = ({ monthlyData }) => {
    const totalAnnual = monthlyData.reduce((acc, d) => acc + d.total, 0);
    const maxAmount = totalAnnual || 1;
    
    const formatCurrency = (amount) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
        return `$${amount}`;
    };

    const currentMonth = new Date().getMonth();

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#10b981] to-[#059669]">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-white italic tracking-tight">📈 Gráfico de Barras</h3>
                        <p className="text-[10px] text-white/80 uppercase font-black tracking-widest mt-1">% del total anual</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(totalAnnual)}</p>
                        <p className="text-[10px] text-white/60 uppercase font-bold">Total año</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                {/* Contenedor de barras con altura fija */}
                <div className="relative h-56 w-full">
                    {/* Línea de 100% */}
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
                    
                    {/* Barras */}
                    <div className="absolute inset-0 flex items-end justify-between gap-2">
                        {monthlyData.map((month, index) => {
                            const percentage = (month.total / maxAmount) * 100;
                            const isCurrentMonth = index === currentMonth;
                            const hasData = month.total > 0;
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
                                    {/* Etiqueta arriba */}
                                    {hasData && (
                                        <div className="mb-1 text-[10px] font-bold text-gray-600">
                                            {percentage.toFixed(0)}%
                                        </div>
                                    )}
                                    {/* Barra */}
                                    <div 
                                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${
                                            isCurrentMonth 
                                                ? 'bg-gradient-to-t from-[#5FAFB8] to-[#7fd4dd]' 
                                                : hasData 
                                                    ? 'bg-gradient-to-t from-emerald-400 to-emerald-300' 
                                                    : 'bg-gray-100'
                                        }`}
                                        style={{ 
                                            height: `${percentage}%`,
                                            minHeight: hasData ? '4px' : '0px'
                                        }}
                                    />
                                    {/* Label del mes */}
                                    <div className={`mt-2 text-[9px] font-bold uppercase tracking-wider ${isCurrentMonth ? 'text-[#5FAFB8]' : 'text-gray-400'}`}>
                                        {month.shortMonth}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarChartView;
