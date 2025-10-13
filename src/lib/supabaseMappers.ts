// Mappers to convert between Supabase snake_case and app camelCase

export const mapCropCycleFromDb = (dbCycle: any): any => ({
  id: dbCycle.id,
  name: dbCycle.name,
  cropType: dbCycle.crop_type,
  startDate: dbCycle.start_date,
  endDate: dbCycle.end_date,
  status: dbCycle.status,
  greenhouseId: dbCycle.greenhouse_id,
  notes: dbCycle.notes,
  userId: dbCycle.user_id,
  farmerId: dbCycle.farmer_id,
  farmerSharePercentage: dbCycle.farmer_share_percentage ? Number(dbCycle.farmer_share_percentage) : null,
});

export const mapCropCycleToDb = (cycle: any): any => ({
  name: cycle.name,
  crop_type: cycle.cropType,
  start_date: cycle.startDate,
  end_date: cycle.endDate,
  status: cycle.status,
  greenhouse_id: cycle.greenhouseId,
  notes: cycle.notes,
  farmer_id: cycle.farmerId || null,
  farmer_share_percentage: cycle.farmerSharePercentage || null,
});

export const mapGreenhouseFromDb = (dbGreenhouse: any): any => ({
  id: dbGreenhouse.id,
  name: dbGreenhouse.name,
  location: dbGreenhouse.location,
  area: dbGreenhouse.area,
  creationDate: dbGreenhouse.creation_date,
  initialCost: Number(dbGreenhouse.initial_cost) || 0,
  userId: dbGreenhouse.user_id,
});

export const mapGreenhouseToDb = (greenhouse: any): any => ({
  name: greenhouse.name,
  location: greenhouse.location,
  area: greenhouse.area,
  creation_date: greenhouse.creationDate,
  initial_cost: greenhouse.initialCost,
});

export const mapFarmerFromDb = (dbFarmer: any): any => ({
  id: dbFarmer.id,
  name: dbFarmer.name,
  phone: dbFarmer.phone,
  email: dbFarmer.email,
  address: dbFarmer.address,
  nationalId: dbFarmer.national_id,
  notes: dbFarmer.notes,
  balance: dbFarmer.balance,
  userId: dbFarmer.user_id,
});

export const mapFarmerToDb = (farmer: any): any => ({
  name: farmer.name,
  phone: farmer.phone,
  email: farmer.email,
  address: farmer.address,
  national_id: farmer.nationalId,
  notes: farmer.notes,
  balance: farmer.balance,
});

export const mapWithdrawalFromDb = (dbWithdrawal: any): any => ({
  id: dbWithdrawal.id,
  farmerId: dbWithdrawal.farmer_id,
  cropCycleId: dbWithdrawal.crop_cycle_id,
  amount: dbWithdrawal.amount,
  date: dbWithdrawal.date,
  description: dbWithdrawal.description,
  notes: dbWithdrawal.notes,
  userId: dbWithdrawal.user_id,
});

export const mapWithdrawalToDb = (withdrawal: any): any => ({
  farmer_id: withdrawal.farmerId,
  crop_cycle_id: withdrawal.cropCycleId,
  amount: withdrawal.amount,
  date: withdrawal.date,
  description: withdrawal.description,
  notes: withdrawal.notes,
});

export const mapSupplierFromDb = (dbSupplier: any): any => ({
  id: dbSupplier.id,
  name: dbSupplier.name,
  contactPerson: dbSupplier.contact_person,
  phone: dbSupplier.phone,
  email: dbSupplier.email,
  address: dbSupplier.address,
  notes: dbSupplier.notes,
  userId: dbSupplier.user_id,
});

export const mapSupplierToDb = (supplier: any): any => ({
  name: supplier.name,
  contact_person: supplier.contactPerson,
  phone: supplier.phone,
  email: supplier.email,
  address: supplier.address,
  notes: supplier.notes,
});

export const mapPaymentFromDb = (dbPayment: any): any => ({
  id: dbPayment.id,
  supplierId: dbPayment.supplier_id,
  amount: dbPayment.amount,
  date: dbPayment.date,
  description: dbPayment.description,
  notes: dbPayment.notes,
  linkedExpenseIds: dbPayment.linked_expense_ids,
  userId: dbPayment.user_id,
});

export const mapPaymentToDb = (payment: any): any => ({
  supplier_id: payment.supplierId,
  amount: payment.amount,
  date: payment.date,
  description: payment.description,
  notes: payment.notes,
  linked_expense_ids: payment.linkedExpenseIds,
});

export const mapProgramFromDb = (dbProgram: any): any => ({
  id: dbProgram.id,
  name: dbProgram.name,
  cropCycleId: dbProgram.crop_cycle_id,
  description: dbProgram.description,
  schedule: dbProgram.schedule,
  startDate: dbProgram.start_date,
  endDate: dbProgram.end_date,
  userId: dbProgram.user_id,
});

export const mapProgramToDb = (program: any): any => ({
  name: program.name,
  crop_cycle_id: program.cropCycleId,
  description: program.description,
  schedule: program.schedule,
  start_date: program.startDate,
  end_date: program.endDate,
});

export const mapAdvanceFromDb = (dbAdvance: any): any => ({
  id: dbAdvance.id,
  farmerId: dbAdvance.farmer_id,
  cropCycleId: dbAdvance.crop_cycle_id,
  amount: dbAdvance.amount,
  date: dbAdvance.date,
  description: dbAdvance.notes, // Using notes as description
  notes: dbAdvance.notes,
  status: dbAdvance.status,
  userId: dbAdvance.user_id,
});

export const mapAdvanceToDb = (advance: any): any => ({
  farmer_id: advance.farmerId,
  crop_cycle_id: advance.cropCycleId,
  amount: advance.amount,
  date: advance.date,
  notes: advance.description || advance.notes,
  status: advance.status,
});

export const mapRevenueFromDb = (dbRevenue: any): any => ({
  id: dbRevenue.id,
  cropCycleId: dbRevenue.crop_cycle_id,
  fertilizationProgramId: dbRevenue.fertilization_program_id,
  amount: dbRevenue.amount,
  date: dbRevenue.date,
  description: dbRevenue.description,
  notes: dbRevenue.notes,
  quantity: dbRevenue.quantity,
  priceItems: dbRevenue.price_items,
  discount: dbRevenue.discount,
  userId: dbRevenue.user_id,
});

export const mapRevenueToDb = (revenue: any): any => ({
  crop_cycle_id: revenue.cropCycleId,
  fertilization_program_id: revenue.fertilizationProgramId,
  amount: revenue.amount,
  date: revenue.date,
  description: revenue.description,
  notes: revenue.notes,
  quantity: revenue.quantity,
  price_items: revenue.priceItems,
  discount: revenue.discount,
});

export const mapExpenseFromDb = (dbExpense: any): any => ({
  id: dbExpense.id,
  cropCycleId: dbExpense.crop_cycle_id,
  greenhouseId: dbExpense.greenhouse_id,
  supplierId: dbExpense.supplier_id,
  categoryId: dbExpense.category_id,
  fertilizationProgramId: dbExpense.fertilization_program_id,
  amount: dbExpense.amount,
  date: dbExpense.date,
  description: dbExpense.description,
  notes: dbExpense.notes,
  quantity: dbExpense.quantity,
  priceItems: dbExpense.price_items,
  discount: dbExpense.discount,
  paymentMethod: dbExpense.payment_method,
  userId: dbExpense.user_id,
});

export const mapExpenseToDb = (expense: any): any => ({
  crop_cycle_id: expense.cropCycleId,
  greenhouse_id: expense.greenhouseId,
  supplier_id: expense.supplierId,
  category_id: expense.category,
  fertilization_program_id: expense.fertilizationProgramId,
  amount: expense.amount,
  date: expense.date,
  description: expense.description,
  notes: expense.notes,
  quantity: expense.quantity,
  price_items: expense.priceItems,
  discount: expense.discount,
  payment_method: expense.paymentMethod,
});

export const mapSettingsFromDb = (dbSettings: any, categories: any[]): any => ({
  currency: dbSettings.currency,
  language: dbSettings.language,
  theme: dbSettings.theme,
  isFarmerSystemEnabled: dbSettings.is_farmer_system_enabled,
  isSupplierSystemEnabled: dbSettings.is_supplier_system_enabled,
  isTreasurySystemEnabled: dbSettings.is_treasury_system_enabled,
  isAgriculturalProgramsSystemEnabled: dbSettings.is_agricultural_programs_system_enabled,
  isAdvancesSystemEnabled: dbSettings.is_advances_system_enabled,
  expenseCategories: categories.map(mapCategoryFromDb),
});

export const mapSettingsToDb = (settings: any): any => ({
  currency: settings.currency,
  language: settings.language,
  theme: settings.theme,
  is_farmer_system_enabled: settings.isFarmerSystemEnabled,
  is_supplier_system_enabled: settings.isSupplierSystemEnabled,
  is_treasury_system_enabled: settings.isTreasurySystemEnabled,
  is_agricultural_programs_system_enabled: settings.isAgriculturalProgramsSystemEnabled,
  is_advances_system_enabled: settings.isAdvancesSystemEnabled,
});

export const mapCategoryFromDb = (dbCategory: any): any => ({
  id: dbCategory.id,
  name: dbCategory.name,
  description: dbCategory.description,
  userId: dbCategory.user_id,
});

export const mapCategoryToDb = (category: any): any => ({
  name: category.name,
  description: category.description,
});
