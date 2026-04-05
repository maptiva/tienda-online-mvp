import React from 'react';

interface MonthlyData {
    month: string;
    total: number;
}

interface BarChartViewProps {
    monthlyData: MonthlyData[];
}

const BarChartView: React.FC<BarChartViewProps> = ({ monthlyData }) => {
    const totalAnnual = monthlyData.reduce((acc, d) => acc + d.total, 0);
    const maxAmount = totalAnnual || 1;
    
    const formatCurrency = (amount: number) => {
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
                <div className="relative h-56 w-full">
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
                    
                    <div className="absolute inset-0 flex items-end justify-between gap-2">
                        {monthlyData.map((month, index) => {
                            const percentage = (month.total / maxAmount) * 100;
                            const isCurrentMonth = index === currentMonth;
                            
                            return (
                                <div key={index} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group">
                                    <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {formatCurrency(month.total)}
                                    </span>
                                    <div 
                                        className={`w-full max-w-[20px] rounded-t-sm transition-all hover:opacity-80 ${isCurrentMonth ? 'bg-[#10b981]' : 'bg-gray-300'}`}
                                        style={{ height: `${Math.max(percentage, 2)}%` }}
                                        title={`${month.month}: ${formatCurrency(month.total)}`}
                                    />
                                    <span className={`text-[10px] font-black uppercase ${isCurrentMonth ? 'text-[#10b981]' : 'text-gray-400'}`}>
                                        {month.month}
                                    </span>
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
