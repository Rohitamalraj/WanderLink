import { expect } from "chai";
import { ethers } from "hardhat";
import { TripEscrow } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TripEscrow", function () {
  let tripEscrow: TripEscrow;
  let owner: SignerWithAddress;
  let organizer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let charlie: SignerWithAddress;

  const STAKE_AMOUNT = ethers.parseEther("0.1");
  const MAX_PARTICIPANTS = 5;

  beforeEach(async function () {
    [owner, organizer, alice, bob, charlie] = await ethers.getSigners();

    const TripEscrow = await ethers.getContractFactory("TripEscrow");
    const deployedContract = await TripEscrow.deploy();
    await deployedContract.waitForDeployment();
    tripEscrow = deployedContract as unknown as TripEscrow;
  });

  describe("Trip Creation", function () {
    it("Should create a trip successfully", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 86400 * 10; // 10 days from now
      const endTime = startTime + 86400 * 7; // 7 days trip

      const tx = await tripEscrow
        .connect(organizer)
        .createTrip(STAKE_AMOUNT, MAX_PARTICIPANTS, startTime, endTime);

      await expect(tx)
        .to.emit(tripEscrow, "TripCreated")
        .withArgs(1, organizer.address, STAKE_AMOUNT);

      const trip = await tripEscrow.getTrip(1);
      expect(trip.organizer).to.equal(organizer.address);
      expect(trip.stakeAmount).to.equal(STAKE_AMOUNT);
      expect(trip.maxParticipants).to.equal(MAX_PARTICIPANTS);
    });

    it("Should fail with invalid parameters", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 86400 * 10;
      const endTime = startTime + 86400 * 7;

      await expect(
        tripEscrow.connect(organizer).createTrip(0, MAX_PARTICIPANTS, startTime, endTime)
      ).to.be.revertedWith("Stake must be positive");

      await expect(
        tripEscrow.connect(organizer).createTrip(STAKE_AMOUNT, 2, startTime, endTime)
      ).to.be.revertedWith("Invalid participant count");
    });
  });

  describe("Joining Trip", function () {
    let tripId: number;
    let startTime: number;

    beforeEach(async function () {
      startTime = Math.floor(Date.now() / 1000) + 86400 * 10;
      const endTime = startTime + 86400 * 7;

      const tx = await tripEscrow
        .connect(organizer)
        .createTrip(STAKE_AMOUNT, MAX_PARTICIPANTS, startTime, endTime);
      
      const counter = await tripEscrow.tripCounter();
      tripId = Number(counter);
    });

    it("Should allow participants to join with correct stake", async function () {
      await expect(
        tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT })
      )
        .to.emit(tripEscrow, "ParticipantJoined")
        .withArgs(tripId, alice.address, STAKE_AMOUNT);

      const participant = await tripEscrow.getParticipant(tripId, alice.address);
      expect(participant.hasJoined).to.be.true;
      expect(participant.stakedAmount).to.equal(STAKE_AMOUNT);
    });

    it("Should reject incorrect stake amount", async function () {
      await expect(
        tripEscrow.connect(alice).joinTrip(tripId, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Incorrect stake amount");
    });

    it("Should prevent double joining", async function () {
      await tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT });

      await expect(
        tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT })
      ).to.be.revertedWith("Already joined");
    });

    it("Should activate trip when minimum participants join", async function () {
      await tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(bob).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(charlie).joinTrip(tripId, { value: STAKE_AMOUNT });

      const trip = await tripEscrow.getTrip(tripId);
      expect(trip.status).to.equal(1); // Active
      expect(trip.participantCount).to.equal(3);
    });
  });

  describe("Check-in and Confirmation", function () {
    let tripId: number;
    let startTime: number;

    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      startTime = (currentBlock?.timestamp || 0) + 86400 * 10; // 10 days from now
      const endTime = startTime + 86400 * 2;

      const tx = await tripEscrow
        .connect(organizer)
        .createTrip(STAKE_AMOUNT, MAX_PARTICIPANTS, startTime, endTime);
      
      const counter = await tripEscrow.tripCounter();
      tripId = Number(counter);

      // Three participants join
      await tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(bob).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(charlie).joinTrip(tripId, { value: STAKE_AMOUNT });
    });

    it("Should allow check-in after trip starts", async function () {
      // Fast forward to trip start
      await ethers.provider.send("evm_increaseTime", [86400 * 10 + 100]);
      await ethers.provider.send("evm_mine", []);

      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("location-proof-alice"));

      await expect(
        tripEscrow.connect(alice).confirmAttendance(tripId, proofHash)
      )
        .to.emit(tripEscrow, "CheckInSubmitted")
        .withArgs(tripId, alice.address, proofHash);

      const participant = await tripEscrow.getParticipant(tripId, alice.address);
      expect(participant.hasConfirmed).to.be.true;
      expect(participant.checkInProofHash).to.equal(proofHash);
    });

    it("Should prevent check-in before trip starts", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("early-proof"));

      await expect(
        tripEscrow.connect(alice).confirmAttendance(tripId, proofHash)
      ).to.be.revertedWith("Trip not started");
    });
  });

  describe("Trip Completion and Rewards", function () {
    let tripId: number;
    let startTime: number;
    let endTime: number;

    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      startTime = (currentBlock?.timestamp || 0) + 86400 * 10;
      endTime = startTime + 86400 * 2;

      const tx = await tripEscrow
        .connect(organizer)
        .createTrip(STAKE_AMOUNT, MAX_PARTICIPANTS, startTime, endTime);
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return tripEscrow.interface.parseLog(log)?.name === 'TripCreated';
        } catch { return false; }
      });
      const counter = await tripEscrow.tripCounter();
      tripId = event ? Number(tripEscrow.interface.parseLog(event)?.args[0]) : Number(counter);

      await tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(bob).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(charlie).joinTrip(tripId, { value: STAKE_AMOUNT });
    });

    it("Should complete trip and distribute rewards", async function () {
      // Fast forward to trip start
      await ethers.provider.send("evm_increaseTime", [86400 * 10 + 100]);
      await ethers.provider.send("evm_mine", []);

      // Alice and Bob check in, Charlie doesn't
      const aliceProof = ethers.keccak256(ethers.toUtf8Bytes("alice-proof"));
      const bobProof = ethers.keccak256(ethers.toUtf8Bytes("bob-proof"));

      await tripEscrow.connect(alice).confirmAttendance(tripId, aliceProof);
      await tripEscrow.connect(bob).confirmAttendance(tripId, bobProof);

      // Fast forward past verification period
      await ethers.provider.send("evm_increaseTime", [86400 * 4]);
      await ethers.provider.send("evm_mine", []);

      await expect(tripEscrow.completeTrip(tripId))
        .to.emit(tripEscrow, "TripCompleted")
        .to.emit(tripEscrow, "ParticipantSlashed")
        .withArgs(tripId, charlie.address, ethers.parseEther("0.03")); // 30% slash

      // Verify trip is completed
      const trip = await tripEscrow.getTrip(tripId);
      expect(trip.status).to.equal(2); // Completed
    });
  });

  describe("Emergency and Incident Handling", function () {
    let tripId: number;

    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = (currentBlock?.timestamp || 0) + 86400 * 10;
      const endTime = startTime + 86400 * 7;

      const tx = await tripEscrow
        .connect(organizer)
        .createTrip(STAKE_AMOUNT, MAX_PARTICIPANTS, startTime, endTime);
      
      const counter = await tripEscrow.tripCounter();
      tripId = Number(counter);

      await tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(bob).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(charlie).joinTrip(tripId, { value: STAKE_AMOUNT });
    });

    it("Should allow participant to report incident", async function () {
      await expect(tripEscrow.connect(alice).reportIncident(tripId))
        .to.emit(tripEscrow, "EmergencyFreeze")
        .withArgs(tripId, alice.address);

      const trip = await tripEscrow.getTrip(tripId);
      expect(trip.emergencyFreeze).to.be.true;
      expect(trip.status).to.equal(4); // Disputed
    });

    it("Should allow admin to slash malicious participant", async function () {
      await tripEscrow.connect(alice).reportIncident(tripId);

      await expect(tripEscrow.connect(owner).slashUser(tripId, charlie.address))
        .to.emit(tripEscrow, "ParticipantSlashed")
        .withArgs(tripId, charlie.address, STAKE_AMOUNT);

      const participant = await tripEscrow.getParticipant(tripId, charlie.address);
      expect(participant.isSlashed).to.be.true;
    });
  });

  describe("Trip Cancellation", function () {
    let tripId: number;

    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = (currentBlock?.timestamp || 0) + 86400 * 10;
      const endTime = startTime + 86400 * 7;

      const tx = await tripEscrow
        .connect(organizer)
        .createTrip(STAKE_AMOUNT, MAX_PARTICIPANTS, startTime, endTime);
      
      const counter = await tripEscrow.tripCounter();
      tripId = Number(counter);

      await tripEscrow.connect(alice).joinTrip(tripId, { value: STAKE_AMOUNT });
      await tripEscrow.connect(bob).joinTrip(tripId, { value: STAKE_AMOUNT });
    });

    it("Should allow organizer to cancel and refund", async function () {
      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
      const bobBalanceBefore = await ethers.provider.getBalance(bob.address);

      await expect(
        tripEscrow.connect(organizer).cancelTrip(tripId, "Weather emergency")
      ).to.emit(tripEscrow, "TripCancelled");

      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      const bobBalanceAfter = await ethers.provider.getBalance(bob.address);

      // Participants should be fully refunded
      expect(aliceBalanceAfter).to.equal(aliceBalanceBefore + STAKE_AMOUNT);
      expect(bobBalanceAfter).to.equal(bobBalanceBefore + STAKE_AMOUNT);
    });
  });
});
