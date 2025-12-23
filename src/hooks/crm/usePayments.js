import { useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';

export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPayments = useCallback(async (clientId = null) => {
        setLoading(true);
        try {
            let query = supabase
                .from('payments')
                .select(`
                    *,
                    clients (name),
                    subscriptions (plan_type)
                `)
                .order('created_at', { ascending: false });

            if (clientId) {
                query = query.eq('client_id', clientId);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            setPayments(data || []);
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Registra un pago y opcionalmente actualiza/crea una suscripción.
     */
    const registerPayment = async (paymentData) => {
        setLoading(true);
        try {
            // Convertir amount a número (la tabla espera DECIMAL)
            const amountNum = parseFloat(paymentData.amount);

            // 1. Insertar el pago
            const { data: newPayment, error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    client_id: paymentData.client_id,
                    subscription_id: paymentData.subscription_id,
                    amount: amountNum,
                    payment_method: paymentData.payment_method,
                    notes: paymentData.notes,
                    status: 'COMPLETED'
                }])
                .select()
                .single();

            if (paymentError) {
                console.error('❌ Error insertando pago:', paymentError);
                throw paymentError;
            }

            // 2. Si es un pago de suscripción, actualizar la fecha de último pago
            if (paymentData.subscription_id) {
                await supabase
                    .from('subscriptions')
                    .update({
                        last_payment_date: new Date().toISOString(),
                        status: 'ACTIVE'
                    })
                    .eq('id', paymentData.subscription_id);
            }

            await fetchPayments(paymentData.client_id);
            return { success: true, data: newPayment };
        } catch (err) {
            console.error('Error registering payment:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        payments,
        loading,
        error,
        fetchPayments,
        registerPayment
    };
};
