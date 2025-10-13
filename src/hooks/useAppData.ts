import React from 'react';
import { ToastContext, ToastContextType } from '../context/ToastContext.tsx';
import { CropCycle, Transaction, Greenhouse, AppSettings, Farmer, FarmerWithdrawal, Alert, BackupData, TransactionType, CropCycleStatus, AlertType, AppContextType, Supplier, SupplierPayment, FertilizationProgram, ExpenseCategorySetting, Advance } from '../types.ts';
import { INITIAL_SETTINGS } from '../constants.ts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as mappers from '@/lib/supabaseMappers';

export const useAppData = (): AppContextType => {
    const { addToast } = React.useContext(ToastContext) as ToastContextType;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    
    const [loading, setLoading] = React.useState(true);
    const [isDeletingData, setIsDeletingData] = React.useState(false);

    // Fetch all data from Supabase
    const { data: cropCycles = [], isLoading: loadingCropCycles } = useQuery({
        queryKey: ['cropCycles', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('crop_cycles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapCropCycleFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: greenhouses = [], isLoading: loadingGreenhouses } = useQuery({
        queryKey: ['greenhouses', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('greenhouses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapGreenhouseFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: farmers = [], isLoading: loadingFarmers } = useQuery({
        queryKey: ['farmers', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('farmers')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapFarmerFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: farmerWithdrawals = [], isLoading: loadingWithdrawals } = useQuery({
        queryKey: ['farmerWithdrawals', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('farmer_withdrawals')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapWithdrawalFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
        queryKey: ['suppliers', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapSupplierFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: supplierPayments = [], isLoading: loadingPayments } = useQuery({
        queryKey: ['supplierPayments', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('supplier_payments')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapPaymentFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: fertilizationPrograms = [], isLoading: loadingPrograms } = useQuery({
        queryKey: ['fertilizationPrograms', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('fertilization_programs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapProgramFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: advances = [], isLoading: loadingAdvances } = useQuery({
        queryKey: ['advances', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('advances')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
            if (error) throw error;
            return (data || []).map(mappers.mapAdvanceFromDb);
        },
        enabled: !!user?.id,
    });

    const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
        queryKey: ['transactions', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const [revenuesRes, expensesRes] = await Promise.all([
                supabase.from('revenues').select('*').eq('user_id', user.id),
                supabase.from('expenses').select('*').eq('user_id', user.id)
            ]);
            
            if (revenuesRes.error) throw revenuesRes.error;
            if (expensesRes.error) throw expensesRes.error;
            
            const revenues = (revenuesRes.data || []).map(r => ({
                ...mappers.mapRevenueFromDb(r),
                type: TransactionType.REVENUE,
            }));
            
            const expenses = (expensesRes.data || []).map(e => ({
                ...mappers.mapExpenseFromDb(e),
                type: TransactionType.EXPENSE,
                category: e.category_id,
            }));
            
            return [...revenues, ...expenses].sort((a: any, b: any) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },
        enabled: !!user?.id,
    });

    const { data: settings = INITIAL_SETTINGS, isLoading: loadingSettings } = useQuery({
        queryKey: ['settings', user?.id],
        queryFn: async () => {
            if (!user?.id) return INITIAL_SETTINGS;
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (!data) {
                const { data: newSettings, error: insertError } = await supabase
                    .from('user_settings')
                    .insert({
                        user_id: user.id,
                        ...mappers.mapSettingsToDb(INITIAL_SETTINGS),
                    })
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                return mappers.mapSettingsFromDb(newSettings, []);
            }
            
            const { data: categories } = await supabase
                .from('expense_categories')
                .select('*')
                .eq('user_id', user.id);
            
            return mappers.mapSettingsFromDb(data, categories || []);
        },
        enabled: !!user?.id,
    });

    React.useEffect(() => {
        const isLoading = loadingCropCycles || loadingGreenhouses || loadingFarmers || 
                         loadingWithdrawals || loadingSuppliers || loadingPayments || 
                         loadingPrograms || loadingAdvances || loadingTransactions || loadingSettings;
        setLoading(isLoading);
    }, [loadingCropCycles, loadingGreenhouses, loadingFarmers, loadingWithdrawals, 
        loadingSuppliers, loadingPayments, loadingPrograms, loadingAdvances, 
        loadingTransactions, loadingSettings]);

    // ALERTS LOGIC - Using useMemo to avoid infinite loops
    const alerts = React.useMemo(() => {
        if (loading) return [];
        const newAlerts: Alert[] = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const farmerBalances: { [key: string]: number } = {};
        if (settings.isFarmerSystemEnabled) {
            farmers.forEach(farmer => {
                const associatedCycles = cropCycles.filter(c => c.farmerId === farmer.id);
                let totalShare = 0;
                associatedCycles.forEach(cycle => {
                    const revenue = transactions
                        .filter(t => t.cropCycleId === cycle.id && t.type === TransactionType.REVENUE)
                        .reduce((sum, t) => sum + t.amount, 0);
                    if (cycle.farmerSharePercentage != null) {
                        totalShare += revenue * (cycle.farmerSharePercentage / 100);
                    }
                });
                const totalWithdrawals = farmerWithdrawals
                    .filter(w => associatedCycles.some(c => c.id === w.cropCycleId))
                    .reduce((sum, w) => sum + w.amount, 0);
                farmerBalances[farmer.id] = totalShare - totalWithdrawals;
            });
        }

        cropCycles.forEach(cycle => {
            if (cycle.status === CropCycleStatus.ACTIVE) {
                const cycleTransactions = transactions.filter(t => t.cropCycleId === cycle.id);
                const revenue = cycleTransactions.filter(t => t.type === TransactionType.REVENUE).reduce((s, t) => s + t.amount, 0);
                const expense = cycleTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

                if (revenue > 0 && expense > revenue * 0.8) {
                    newAlerts.push({ id: `cost-${cycle.id}`, type: AlertType.HIGH_COST, message: `مصروفات عروة "${cycle.name}" تجاوزت 80% من إيراداتها.`, relatedId: cycle.id });
                }

                if (revenue === 0 && new Date(cycle.startDate) < thirtyDaysAgo) {
                    newAlerts.push({ id: `stagnant-${cycle.id}`, type: AlertType.STAGNANT_CYCLE, message: `مر 30 يومًا على بدء عروة "${cycle.name}" دون تسجيل أي إيرادات.`, relatedId: cycle.id });
                }
            }
        });

        if (settings.isFarmerSystemEnabled) {
            farmers.forEach(farmer => {
                if (farmerBalances[farmer.id] < 0) {
                    newAlerts.push({ id: `balance-${farmer.id}`, type: AlertType.NEGATIVE_BALANCE, message: `الرصيد المتبقي للمزارع "${farmer.name}" أصبح سالباً.`, relatedId: farmer.id });
                }
            });
        }

        return newAlerts;
    }, [loading, cropCycles, transactions, farmers, farmerWithdrawals, settings.isFarmerSystemEnabled]);

    // Mutations
    const addCropCycleMutation = useMutation({
        mutationFn: async (cycle: Omit<CropCycle, 'id'>) => {
            const { error } = await supabase
                .from('crop_cycles')
                .insert({ ...mappers.mapCropCycleToDb(cycle), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cropCycles'] });
            addToast("تمت إضافة العروة بنجاح.", 'success');
        },
    });

    const updateCropCycleMutation = useMutation({
        mutationFn: async (cycle: CropCycle) => {
            const { error } = await supabase
                .from('crop_cycles')
                .update(mappers.mapCropCycleToDb(cycle))
                .eq('id', cycle.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cropCycles'] });
            addToast("تم تحديث العروة بنجاح.", 'success');
        },
    });

    const deleteCropCycleMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('crop_cycles')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cropCycles'] });
            addToast("تم حذف/أرشفة العروة.", 'success');
        },
    });

    const addTransactionMutation = useMutation({
        mutationFn: async (transaction: Omit<Transaction, 'id'>) => {
            const table = transaction.type === TransactionType.REVENUE ? 'revenues' : 'expenses';
            const mapper = transaction.type === TransactionType.REVENUE ? mappers.mapRevenueToDb : mappers.mapExpenseToDb;
            const { error } = await supabase
                .from(table)
                .insert({ ...mapper(transaction), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            addToast("تمت إضافة المعاملة بنجاح.", 'success');
        },
    });

    const updateTransactionMutation = useMutation({
        mutationFn: async (transaction: Transaction) => {
            const table = transaction.type === TransactionType.REVENUE ? 'revenues' : 'expenses';
            const mapper = transaction.type === TransactionType.REVENUE ? mappers.mapRevenueToDb : mappers.mapExpenseToDb;
            const { error } = await supabase
                .from(table)
                .update(mapper(transaction))
                .eq('id', transaction.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            addToast("تم تحديث المعاملة بنجاح.", 'success');
        },
    });

    const deleteTransactionMutation = useMutation({
        mutationFn: async (transaction: Transaction) => {
            const table = transaction.type === TransactionType.REVENUE ? 'revenues' : 'expenses';
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', transaction.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            addToast("تم حذف المعاملة بنجاح.", 'success');
        },
    });

    const addGreenhouseMutation = useMutation({
        mutationFn: async (greenhouse: Omit<Greenhouse, 'id'>) => {
            const { error } = await supabase
                .from('greenhouses')
                .insert({ ...mappers.mapGreenhouseToDb(greenhouse), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['greenhouses'] });
            addToast("تمت إضافة الصوبة.", 'success');
        },
    });

    const updateGreenhouseMutation = useMutation({
        mutationFn: async (greenhouse: Greenhouse) => {
            const { error } = await supabase
                .from('greenhouses')
                .update(mappers.mapGreenhouseToDb(greenhouse))
                .eq('id', greenhouse.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['greenhouses'] });
            addToast("تم تحديث الصوبة.", 'success');
        },
    });

    const deleteGreenhouseMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('greenhouses')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['greenhouses'] });
            addToast("تم حذف الصوبة.", 'success');
        },
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (newSettings: Partial<AppSettings>) => {
            const { error } = await supabase
                .from('user_settings')
                .update(mappers.mapSettingsToDb(newSettings))
                .eq('user_id', user?.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });

    const addFarmerMutation = useMutation({
        mutationFn: async (farmer: Omit<Farmer, 'id'>) => {
            const { error } = await supabase
                .from('farmers')
                .insert({ ...mappers.mapFarmerToDb(farmer), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmers'] });
            addToast("تمت إضافة المزارع.", 'success');
        },
    });

    const updateFarmerMutation = useMutation({
        mutationFn: async (farmer: Farmer) => {
            const { error } = await supabase
                .from('farmers')
                .update(mappers.mapFarmerToDb(farmer))
                .eq('id', farmer.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmers'] });
            addToast("تم تحديث المزارع.", 'success');
        },
    });

    const deleteFarmerMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('farmers')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmers'] });
            addToast("تم حذف المزارع.", 'success');
        },
    });

    const addFarmerWithdrawalMutation = useMutation({
        mutationFn: async (withdrawal: Omit<FarmerWithdrawal, 'id'>) => {
            const { error } = await supabase
                .from('farmer_withdrawals')
                .insert({ ...mappers.mapWithdrawalToDb(withdrawal), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmerWithdrawals'] });
            addToast("تمت إضافة السحب.", 'success');
        },
    });

    const updateFarmerWithdrawalMutation = useMutation({
        mutationFn: async (withdrawal: FarmerWithdrawal) => {
            const { error } = await supabase
                .from('farmer_withdrawals')
                .update(mappers.mapWithdrawalToDb(withdrawal))
                .eq('id', withdrawal.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmerWithdrawals'] });
            addToast("تم تحديث السحب.", 'success');
        },
    });

    const deleteFarmerWithdrawalMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('farmer_withdrawals')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmerWithdrawals'] });
            addToast("تم حذف السحب.", 'success');
        },
    });

    const addSupplierMutation = useMutation({
        mutationFn: async (supplier: Omit<Supplier, 'id'>) => {
            const { error } = await supabase
                .from('suppliers')
                .insert({ ...mappers.mapSupplierToDb(supplier), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            addToast("تمت إضافة المورد.", 'success');
        },
    });

    const updateSupplierMutation = useMutation({
        mutationFn: async (supplier: Supplier) => {
            const { error } = await supabase
                .from('suppliers')
                .update(mappers.mapSupplierToDb(supplier))
                .eq('id', supplier.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            addToast("تم تحديث المورد.", 'success');
        },
    });

    const deleteSupplierMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            addToast("تم حذف المورد.", 'success');
        },
    });

    const addSupplierPaymentMutation = useMutation({
        mutationFn: async (payment: Omit<SupplierPayment, 'id'>) => {
            const { error } = await supabase
                .from('supplier_payments')
                .insert({ ...mappers.mapPaymentToDb(payment), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplierPayments'] });
            addToast("تمت إضافة الدفعة.", 'success');
        },
    });

    const updateSupplierPaymentMutation = useMutation({
        mutationFn: async (payment: SupplierPayment) => {
            const { error } = await supabase
                .from('supplier_payments')
                .update(mappers.mapPaymentToDb(payment))
                .eq('id', payment.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplierPayments'] });
            addToast("تم تحديث الدفعة.", 'success');
        },
    });

    const deleteSupplierPaymentMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('supplier_payments')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplierPayments'] });
            addToast("تم حذف الدفعة.", 'success');
        },
    });

    const addFertilizationProgramMutation = useMutation({
        mutationFn: async (program: Omit<FertilizationProgram, 'id'>) => {
            const { error } = await supabase
                .from('fertilization_programs')
                .insert({ ...mappers.mapProgramToDb(program), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fertilizationPrograms'] });
            addToast("تمت إضافة البرنامج.", 'success');
        },
    });

    const updateFertilizationProgramMutation = useMutation({
        mutationFn: async (program: FertilizationProgram) => {
            const { error } = await supabase
                .from('fertilization_programs')
                .update(mappers.mapProgramToDb(program))
                .eq('id', program.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fertilizationPrograms'] });
            addToast("تم تحديث البرنامج.", 'success');
        },
    });

    const deleteFertilizationProgramMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('fertilization_programs')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fertilizationPrograms'] });
            addToast("تم حذف البرنامج.", 'success');
        },
    });

    const addAdvanceMutation = useMutation({
        mutationFn: async (advance: Omit<Advance, 'id'>) => {
            const { error } = await supabase
                .from('advances')
                .insert({ ...mappers.mapAdvanceToDb(advance), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            addToast("تمت إضافة السلفة.", 'success');
        },
    });

    const updateAdvanceMutation = useMutation({
        mutationFn: async (advance: Advance) => {
            const { error } = await supabase
                .from('advances')
                .update(mappers.mapAdvanceToDb(advance))
                .eq('id', advance.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            addToast("تم تحديث السلفة.", 'success');
        },
    });

    const deleteAdvanceMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('advances')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['advances'] });
            addToast("تم حذف السلفة.", 'success');
        },
    });

    const addExpenseCategoryMutation = useMutation({
        mutationFn: async (category: Omit<ExpenseCategorySetting, 'id'>) => {
            const { error } = await supabase
                .from('expense_categories')
                .insert({ ...mappers.mapCategoryToDb(category), user_id: user?.id });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            addToast("تمت إضافة الفئة.", 'success');
        },
    });

    const updateExpenseCategoryMutation = useMutation({
        mutationFn: async (category: ExpenseCategorySetting) => {
            const { error } = await supabase
                .from('expense_categories')
                .update(mappers.mapCategoryToDb(category))
                .eq('id', category.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            addToast("تم تحديث الفئة.", 'success');
        },
    });

    const deleteExpenseCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('expense_categories')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            addToast("تم حذف الفئة.", 'success');
        },
    });

    const loadBackupData = async (data: BackupData) => {
        addToast('استعادة البيانات غير متاحة حالياً في النسخة السحابية.', 'info');
    };

    const deleteAllData = async () => {
        setIsDeletingData(true);
        if (!user?.id) return;
        
        await Promise.all([
            supabase.from('crop_cycles').delete().eq('user_id', user.id),
            supabase.from('greenhouses').delete().eq('user_id', user.id),
            supabase.from('farmers').delete().eq('user_id', user.id),
            supabase.from('farmer_withdrawals').delete().eq('user_id', user.id),
            supabase.from('suppliers').delete().eq('user_id', user.id),
            supabase.from('supplier_payments').delete().eq('user_id', user.id),
            supabase.from('fertilization_programs').delete().eq('user_id', user.id),
            supabase.from('advances').delete().eq('user_id', user.id),
            supabase.from('revenues').delete().eq('user_id', user.id),
            supabase.from('expenses').delete().eq('user_id', user.id),
        ]);
        
        queryClient.invalidateQueries();
        addToast("تم حذف جميع البيانات بنجاح.", "success");
        setIsDeletingData(false);
    };

    const startFresh = async () => {
        await deleteAllData();
        addToast("تم البدء من جديد بنجاح.", "success");
    };

    const loadDemoData = async () => {
        addToast('تحميل البيانات التجريبية غير متاح في النسخة السحابية.', 'info');
    };

    return {
        loading,
        isDeletingData,
        cropCycles,
        transactions,
        greenhouses,
        settings,
        farmers,
        farmerWithdrawals,
        alerts,
        suppliers,
        supplierPayments,
        fertilizationPrograms,
        advances,
        addCropCycle: async (cycle) => addCropCycleMutation.mutateAsync(cycle),
        updateCropCycle: async (cycle) => updateCropCycleMutation.mutateAsync(cycle),
        deleteCropCycle: async (id) => deleteCropCycleMutation.mutateAsync(id),
        addTransaction: async (transaction) => addTransactionMutation.mutateAsync(transaction),
        updateTransaction: async (transaction) => updateTransactionMutation.mutateAsync(transaction),
        deleteTransaction: async (id) => {
            const transaction = transactions.find(t => t.id === id);
            if (transaction) await deleteTransactionMutation.mutateAsync(transaction);
        },
        addGreenhouse: async (greenhouse) => addGreenhouseMutation.mutateAsync(greenhouse),
        updateGreenhouse: async (greenhouse) => updateGreenhouseMutation.mutateAsync(greenhouse),
        deleteGreenhouse: async (id) => deleteGreenhouseMutation.mutateAsync(id),
        updateSettings: async (newSettings) => updateSettingsMutation.mutateAsync(newSettings),
        addFarmer: async (farmer) => addFarmerMutation.mutateAsync(farmer),
        updateFarmer: async (farmer) => updateFarmerMutation.mutateAsync(farmer),
        deleteFarmer: async (id) => deleteFarmerMutation.mutateAsync(id),
        addFarmerWithdrawal: async (withdrawal) => addFarmerWithdrawalMutation.mutateAsync(withdrawal),
        updateFarmerWithdrawal: async (withdrawal) => updateFarmerWithdrawalMutation.mutateAsync(withdrawal),
        deleteFarmerWithdrawal: async (id) => deleteFarmerWithdrawalMutation.mutateAsync(id),
        addSupplier: async (supplier) => addSupplierMutation.mutateAsync(supplier),
        updateSupplier: async (supplier) => updateSupplierMutation.mutateAsync(supplier),
        deleteSupplier: async (id) => deleteSupplierMutation.mutateAsync(id),
        addSupplierPayment: async (payment) => addSupplierPaymentMutation.mutateAsync(payment),
        updateSupplierPayment: async (payment) => updateSupplierPaymentMutation.mutateAsync(payment),
        deleteSupplierPayment: async (id) => deleteSupplierPaymentMutation.mutateAsync(id),
        addFertilizationProgram: async (program) => addFertilizationProgramMutation.mutateAsync(program),
        updateFertilizationProgram: async (program) => updateFertilizationProgramMutation.mutateAsync(program),
        deleteFertilizationProgram: async (id) => deleteFertilizationProgramMutation.mutateAsync(id),
        addAdvance: async (advance) => addAdvanceMutation.mutateAsync(advance),
        updateAdvance: async (advance) => updateAdvanceMutation.mutateAsync(advance),
        deleteAdvance: async (id) => deleteAdvanceMutation.mutateAsync(id),
        addExpenseCategory: async (category) => addExpenseCategoryMutation.mutateAsync(category),
        updateExpenseCategory: async (category) => updateExpenseCategoryMutation.mutateAsync(category),
        deleteExpenseCategory: async (id) => deleteExpenseCategoryMutation.mutateAsync(id),
        loadBackupData,
        loadDemoData,
        deleteAllData,
        startFresh,
    };
};
