import { useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { paymentSchema, registerPaymentSchema } from '../../schemas/payment.schema';
import { safeValidate } from '../../utils/zodHelpers';
import type { Payment } from '../../schemas/payment.schema';

export const usePayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Helper para limpiar datos antes de validar (extrae joins de Supabase)
     */
    const preparePaymentForValidation = (raw: any) => {
        if (!raw) return null;
        // El schema espera los campos de la tabla payments, no los objetos anidados de joins
        const { clients, subscriptions, ...paymentData } = raw;
        return paymentData;
    };

    const fetchPayments = useCallback(async (clientId: string | null = null) => {
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

            const { data: rawPayments, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            // Validar los datos de pagos con Zod pero mantener las relaciones de Supabase
            const validatedPayments: any[] = [];
            const paymentErrors: string[] = [];

            (rawPayments || []).forEach((rawPayment: any) => {
                const cleanData = preparePaymentForValidation(rawPayment);
                const { data: validatedPayment, error: validationError } = safeValidate(paymentSchema, cleanData);
                
                if (validationError) {
                    paymentErrors.push(...validationError.issues.map((e: any) => e.message));
                } else if (validatedPayment) {
                    // Mantener las relaciones de Supabase (clients, subscriptions) para el componente
                    validatedPayments.push({
                        ...validatedPayment,
                        clients: rawPayment.clients,
                        subscriptions: rawPayment.subscriptions
                    });
                }
            });

            if (paymentErrors.length > 0) {
                console.warn("Validation errors for payments:", paymentErrors);
            }

            setPayments(validatedPayments);
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Registra un pago y opcionalmente actualiza/crea una suscripción.
     */
    const registerPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
        setLoading(true);
        try {
            // Asegurarse de que amount sea número antes de validar si viene de un form JS
            const dataToValidate = {
                ...paymentData,
                amount: typeof paymentData.amount === 'string' ? parseFloat(paymentData.amount) : paymentData.amount
            };

            // Validar datos de entrada con registerPaymentSchema (que no requiere ID)
            const { data: validatedPaymentData, error: validationError } = safeValidate(registerPaymentSchema, dataToValidate);
            
            if (validationError || !validatedPaymentData) {
                throw new Error(`Datos de pago inválidos: ${validationError?.issues.map(e => e.message).join(', ') || 'Error desconocido'}`);
            }

            // 1. Insertar el pago
            const { data: rawNewPayment, error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    client_id: validatedPaymentData.client_id,
                    subscription_id: validatedPaymentData.subscription_id,
                    amount: validatedPaymentData.amount,
                    payment_method: validatedPaymentData.payment_method,
                    notes: validatedPaymentData.notes,
                    status: 'COMPLETED'
                }])
                .select()
                .single();

            if (paymentError) {
                console.error('❌ Error insertando pago:', paymentError);
                throw paymentError;
            }

            // Validar el pago creado (ahora sí con paymentSchema completo)
            const cleanNewPayment = preparePaymentForValidation(rawNewPayment);
            const { data: validatedNewPayment, error: newPaymentValidationError } = safeValidate(paymentSchema, cleanNewPayment);
            
            if (newPaymentValidationError) {
                console.warn("Validation errors for created payment:", newPaymentValidationError.issues);
            }

            // 2. Si es un pago de suscripción, actualizar la fecha de último pago
            if (validatedPaymentData.subscription_id) {
                await supabase
                    .from('subscriptions')
                    .update({
                        last_payment_date: new Date().toISOString(),
                        status: 'ACTIVE'
                    })
                    .eq('id', validatedPaymentData.subscription_id);
            }

            await fetchPayments(String(validatedPaymentData.client_id));
            return { success: true, data: validatedNewPayment || rawNewPayment };
        } catch (err) {
            console.error('Error registering payment:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
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
