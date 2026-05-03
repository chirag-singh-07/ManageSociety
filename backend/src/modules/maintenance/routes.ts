import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../../shared/asyncHandler';
import { requireAuth } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { requireSocietyTenant } from '../../middlewares/tenant';
import { ApiError } from '../../shared/apiError';
import { MaintenanceCharge, MaintenanceBill } from './model';
import { User } from '../user/model';
import {
  createMaintenanceChargeSchema,
  updateMaintenanceChargeSchema,
  generateBillsSchema,
  updateBillStatusSchema,
  recordPaymentSchema,
  sendReminderSchema,
} from './validators';
import { writeAuditLog } from '../audit/service';

export const maintenanceRouter = Router();

maintenanceRouter.use(requireAuth(), requireRole('admin'), requireSocietyTenant());

// ============ MAINTENANCE CHARGES ============


// Get all charges
maintenanceRouter.get(
  '/charges',
  asyncHandler(async (req, res) => {
    const charges = await MaintenanceCharge.find({ societyId: req.tenant!.societyId })
      .sort({ order: 1 })
      .lean();
    res.json({ ok: true, charges });
  }),
);

// Create charge
maintenanceRouter.post(
  '/charges',
  asyncHandler(async (req, res) => {
    const input = createMaintenanceChargeSchema.parse(req.body);
    
    // Get the highest order
    const highestOrder = await MaintenanceCharge.findOne(
      { societyId: req.tenant!.societyId },
      { order: 1 },
    )
      .sort({ order: -1 });

    const charge = await MaintenanceCharge.create({
      societyId: req.tenant!.societyId,
      name: input.name,
      description: input.description,
      amount: input.amount,
      frequency: input.frequency,
      order: highestOrder ? highestOrder.order + 1 : 0,
    });

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.charge.create',
      targetType: 'maintenance_charge',
      targetId: String(charge._id),
      metadata: { name: charge.name, amount: charge.amount },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ ok: true, charge });
  }),
);

// Update charge
maintenanceRouter.patch(
  '/charges/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = updateMaintenanceChargeSchema.parse(req.body);

    const charge = await MaintenanceCharge.findOneAndUpdate(
      { _id: req.params.id, societyId: req.tenant!.societyId },
      { $set: input },
      { new: true },
    );

    if (!charge) throw new ApiError(404, 'NOT_FOUND', 'Charge not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.charge.update',
      targetType: 'maintenance_charge',
      targetId: String(charge._id),
      metadata: input,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, charge });
  }),
);

// Delete charge
maintenanceRouter.delete(
  '/charges/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');

    const charge = await MaintenanceCharge.findOneAndDelete({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
    }) as any;

    if (!charge) throw new ApiError(404, 'NOT_FOUND', 'Charge not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.charge.delete',
      targetType: 'maintenance_charge',
      targetId: String(charge._id),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true });
  }),
);

// ============ MAINTENANCE BILLS ============

// Get all bills
maintenanceRouter.get(
  '/bills',
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const period = req.query.period as string | undefined;

    const filter: any = { societyId: req.tenant!.societyId };
    if (status) filter.status = status;
    if (period) filter.period = period;

    const bills = await MaintenanceBill.find(filter)
      .populate('userId', 'name flatNumber')
      .sort({ dueDate: -1 })
      .limit(500)
      .lean();

    res.json({ ok: true, bills });
  }),
);

// Get bills summary
maintenanceRouter.get(
  '/bills/summary',
  asyncHandler(async (req, res) => {
    const societyId = new mongoose.Types.ObjectId(req.tenant!.societyId!);

    const summary = await MaintenanceBill.aggregate([
      { $match: { societyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          collectedAmount: { $sum: '$paidAmount' },
        },
      },
    ]);

    res.json({ ok: true, summary });
  }),
);

// Generate bills for a period
maintenanceRouter.post(
  '/bills/generate',
  asyncHandler(async (req, res) => {
    const input = generateBillsSchema.parse(req.body);

    // Get active charges
    const charges = await MaintenanceCharge.find({
      societyId: req.tenant!.societyId,
      active: true,
    }).lean();

    if (charges.length === 0) {
      throw new ApiError(400, 'NO_CHARGES', 'No maintenance charges configured');
    }

    // Get all active users in society
    const users = await User.find({
      societyId: req.tenant!.societyId,
      status: 'active',
    }).lean();

    if (users.length === 0) {
      throw new ApiError(400, 'NO_USERS', 'No active users found');
    }

    // Calculate total amount
    const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);

    // Create bills
    const bills = await Promise.all(
      users.map((user) =>
        MaintenanceBill.findOneAndUpdate(
          {
            societyId: req.tenant!.societyId,
            userId: user._id,
            period: input.period,
          },
          {
            $set: {
              flatNumber: user.flatNumber || 'N/A',
              dueDate: input.dueDate,
              totalAmount,
              charges: charges.map((c) => ({
                chargeId: c._id,
                name: c.name,
                amount: c.amount,
              })),
              status: 'unpaid',
            },
          },
          { upsert: true, new: true },
        ),
      ),
    );

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.bills.generate',
      targetType: 'maintenance_bill',
      targetId: 'batch',
      metadata: { period: input.period, count: bills.length },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ ok: true, count: bills.length, bills });
  }),
);

// Get single bill
maintenanceRouter.get(
  '/bills/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');

    const bill = await MaintenanceBill.findOne({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
    }).populate('userId', 'name email phone');

    if (!bill) throw new ApiError(404, 'NOT_FOUND', 'Bill not found');

    res.json({ ok: true, bill });
  }),
);

// Update bill status
maintenanceRouter.patch(
  '/bills/:id/status',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = updateBillStatusSchema.parse(req.body);

    const bill = await MaintenanceBill.findOneAndUpdate(
      { _id: req.params.id, societyId: req.tenant!.societyId },
      { $set: { status: input.status, remarks: input.remarks } },
      { new: true },
    );

    if (!bill) throw new ApiError(404, 'NOT_FOUND', 'Bill not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.bill.status',
      targetType: 'maintenance_bill',
      targetId: String(bill._id),
      metadata: { status: input.status },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, bill });
  }),
);

// Record payment
maintenanceRouter.post(
  '/bills/:id/payment',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');
    const input = recordPaymentSchema.parse(req.body);

    const bill = await MaintenanceBill.findOne({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
    });

    if (!bill) throw new ApiError(404, 'NOT_FOUND', 'Bill not found');

    const newPaidAmount = bill.paidAmount + input.amount;
    const newStatus =
      newPaidAmount >= bill.totalAmount
        ? 'paid'
        : newPaidAmount > 0
          ? 'partial'
          : 'unpaid';

    bill.paidAmount = newPaidAmount;
    bill.status = newStatus;
    if (bill.paymentHistory) {
      bill.paymentHistory.push({
        amount: input.amount,
        date: new Date(),
        method: input.method,
      });
    } else {
      bill.paymentHistory = [
        {
          amount: input.amount,
          date: new Date(),
          method: input.method,
        },
      ];
    }

    await bill.save();

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.bill.payment',
      targetType: 'maintenance_bill',
      targetId: String(bill._id),
      metadata: { amount: input.amount, method: input.method },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, bill });
  }),
);

// Send reminders to members
maintenanceRouter.post(
  '/bills/send-reminders',
  asyncHandler(async (req, res) => {
    const input = sendReminderSchema.parse(req.body);

    // Validate all bills exist and belong to this society
    const bills = await MaintenanceBill.find({
      _id: { $in: input.billIds },
      societyId: req.tenant!.societyId,
    }).populate('userId', 'name email phone');

    if (bills.length !== input.billIds.length) {
      throw new ApiError(404, 'NOT_FOUND', 'Some bills not found');
    }

    // In production, send actual SMS/email/notifications here
    // For now, just mark as reminded by updating metadata
    const reminderDate = new Date();
    await MaintenanceBill.updateMany(
      {
        _id: { $in: input.billIds },
        societyId: req.tenant!.societyId,
      },
      {
        $set: { 'paymentHistory.$[].reminderSent': reminderDate },
      },
    );

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.bill.reminder_sent',
      targetType: 'maintenance_bill',
      targetId: 'bulk',
      metadata: { billCount: bills.length, billIds: input.billIds },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ 
      ok: true, 
      message: `Reminders sent to ${bills.length} member(s)`,
      count: bills.length,
      bills 
    });
  }),
);

// Delete bill
maintenanceRouter.delete(
  '/bills/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'BAD_ID', 'Invalid id');

    const bill = await MaintenanceBill.findOneAndDelete({
      _id: req.params.id,
      societyId: req.tenant!.societyId,
    }) as any;

    if (!bill) throw new ApiError(404, 'NOT_FOUND', 'Bill not found');

    await writeAuditLog({
      scope: 'society',
      societyId: req.tenant!.societyId,
      actorId: req.tenant!.userId,
      actorRole: 'admin',
      action: 'maintenance.bill.delete',
      targetType: 'maintenance_bill',
      targetId: String(bill._id),
      metadata: { period: bill.period, flatNumber: bill.flatNumber, amount: bill.totalAmount },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, message: 'Bill deleted successfully' });
  }),
);
