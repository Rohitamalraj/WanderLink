import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function emergencyReturnFunds() {
  console.log("🚨 Emergency Fund Return\n");
  
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);
  
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );
  
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    artifact.abi,
    wallet
  );
  
  const users = [
    { name: "User A", address: "0xa01bfafbb205c64fcca21fbe0d6d70642b78dfa3" },
    { name: "User B", address: "0x3f61590c3285332dc63503d5a2d917d3a8014ebc" },
    { name: "User C", address: "0xfefa60f5aa4069f96b9bf65c814ddb3a604974e1" }
  ];
  
  console.log("📊 Checking balances...\n");
  
  for (const user of users) {
    const balance = await contract.getBalance(user.address);
    const balanceHBAR = ethers.formatEther(balance);
    console.log(`${user.name}: ${balanceHBAR} HBAR`);
    
    if (balance > 0n) {
      console.log(`   ⚠️  Has ${balanceHBAR} HBAR to return`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("EMERGENCY RETURN OPTIONS:");
  console.log("=".repeat(50) + "\n");
  
  console.log("Option 1: Pause & Emergency Withdraw (Nuclear Option)");
  console.log("  ⚠️  This withdraws ALL contract funds to owner");
  console.log("  Then owner must manually send to each user\n");
  
  console.log("Option 2: Users withdraw themselves (Recommended)");
  console.log("  ✅ Users connect wallet and click 'Withdraw All'");
  console.log("  ✅ Safest and most transparent\n");
  
  console.log("Option 3: Owner sends HBAR directly");
  console.log("  ⚠️  Bypasses contract, but works\n");
  
  // Check if we should proceed with emergency withdraw
  const contractBalance = await provider.getBalance(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  const contractBalanceHBAR = ethers.formatEther(contractBalance);
  
  console.log(`\n💰 Total contract balance: ${contractBalanceHBAR} HBAR\n`);
  
  console.log("🔧 To execute emergency withdrawal:\n");
  console.log("1. Pause contract:");
  console.log("   const tx1 = await contract.setPaused(true);");
  console.log("   await tx1.wait();\n");
  
  console.log("2. Emergency withdraw:");
  console.log("   const tx2 = await contract.emergencyWithdraw();");
  console.log("   await tx2.wait();\n");
  
  console.log("3. Send to User B:");
  console.log("   const tx3 = await wallet.sendTransaction({");
  console.log("     to: '0x3f61590c3285332dc63503d5a2d917d3a8014ebc',");
  console.log("     value: ethers.parseEther('20')");
  console.log("   });");
  console.log("   await tx3.wait();\n");
  
  console.log("4. Unpause contract:");
  console.log("   const tx4 = await contract.setPaused(false);");
  console.log("   await tx4.wait();\n");
  
  console.log("═".repeat(50));
  console.log("RECOMMENDED: Let User B withdraw via frontend!");
  console.log("═".repeat(50));
}

emergencyReturnFunds().catch(console.error);
