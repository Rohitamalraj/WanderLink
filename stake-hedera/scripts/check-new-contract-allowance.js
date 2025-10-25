import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function checkAllowances() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );
  
  const newContract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const agentAddress = process.env.NEXT_PUBLIC_AGENT_EVM_ADDRESS;
  
  const contract = new ethers.Contract(newContract, artifact.abi, provider);
  
  const users = [
    { name: "User A", address: "0xa01bfafbb205c64fcca21fbe0d6d70642b78dfa3" },
    { name: "User B", address: "0x3f61590c3285332dc63503d5a2d917d3a8014ebc" },
    { name: "User C", address: "0xfefa60f5aa4069f96b9bf65c814ddb3a604974e1" }
  ];
  
  console.log("🔍 Checking allowances on contract...");
  console.log("Contract:", newContract);
  console.log("Agent:", agentAddress);
  console.log();
  
  for (const user of users) {
    const allowance = await contract.allowance(user.address, agentAddress);
    console.log(`${user.name} (${user.address}):`);
    console.log(`  Allowance: ${ethers.formatEther(allowance)} HBAR`);
    
    if (allowance === 0n) {
      console.log(`  ❌ NOT APPROVED - User needs to approve agent!`);
    } else {
      console.log(`  ✅ Approved`);
    }
    console.log();
  }
}

checkAllowances().catch(console.error);
