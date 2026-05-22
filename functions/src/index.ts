import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

const TIERS = [
  { name: 'Silver', threshold: 0 },
  { name: 'Gold', threshold: 50 },
  { name: 'Platinum', threshold: 200 },
];

/**
 * Automatically update affiliate stats and tier when a new sale is recorded.
 */
export const onSaleCreated = functions.firestore
  .document('sales/{saleId}')
  .onCreate(async (snap, context) => {
    const saleData = snap.data();
    if (!saleData) return null;

    const { affiliateId, amount, units } = saleData;

    if (!affiliateId) {
      console.warn('Sale record missing affiliateId:', snap.id);
      return null;
    }

    const affiliateRef = db.collection('affiliates').doc(affiliateId);

    try {
      await db.runTransaction(async (transaction) => {
        const affiliateDoc = await transaction.get(affiliateRef);
        
        let cumulativeSales = 0;
        let totalUnits = 0;
        
        if (affiliateDoc.exists) {
          const currentStats = affiliateDoc.data() || {};
          cumulativeSales = (currentStats.cumulativeSales || 0) + amount;
          totalUnits = (currentStats.totalUnits || 0) + units;
        } else {
          // Initialize for new affiliate if doc doesn't exist
          cumulativeSales = amount;
          totalUnits = units;
        }

        // Determine correct tier based on total units
        let currentTier = 'Silver';
        for (const tier of TIERS) {
          if (totalUnits >= tier.threshold) {
            currentTier = tier.name;
          }
        }

        transaction.set(affiliateRef, {
          cumulativeSales,
          totalUnits,
          currentTier,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`Updated affiliate ${affiliateId}: Tier ${currentTier}, Total Units ${totalUnits}`);
      });
    } catch (error) {
      console.error('Error updating affiliate tier:', error);
    }

    return null;
  });
