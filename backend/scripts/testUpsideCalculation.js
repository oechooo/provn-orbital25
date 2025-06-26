// Test the frontend upside calculation fix
const testStakeAmount = 50;
const backendUpsideRatio = 1.952; // From our test results

// Corrected frontend calculation
const totalPayout = backendUpsideRatio * testStakeAmount;
const profit = Math.max(0, totalPayout - testStakeAmount);
const multiplier = testStakeAmount > 0 ? totalPayout / testStakeAmount : 1;

console.log('🧮 Frontend Upside Calculation Test:');
console.log(`Stake Amount: ${testStakeAmount} PP`);
console.log(`Backend Upside Ratio: ${backendUpsideRatio}`);
console.log(`Total Payout: ${totalPayout.toFixed(1)} PP`);
console.log(`Profit (Upside): ${profit.toFixed(1)} PP`);
console.log(`Multiplier: ${multiplier.toFixed(2)}x`);

// This should match the backend test results:
// - Potential winnings: 97.6 PP
// - Which means profit = 97.6 - 50 = 47.6 PP
