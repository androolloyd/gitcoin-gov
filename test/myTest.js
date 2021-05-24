const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const {
  advanceBlockTo,
  latestBlock,
  advanceBlock,
  increase,
  increaseTo,
  latest,
} = require("./time");

use(solidity);

const delay = 0; // uint for the timelock delay

let QUAD;
let GOVERNOR;

let ADMIN;
let ALICE;
let BOB;
let CHARLIE;
let DALTON;
let EULER;
let FRANK;
let GALILEO;
let HARRY;
let IGOR;

let ADMINSIGNER;
let ALICESIGNER;
let BOBSIGNER;
let CHARLIESIGNER;
let DALTONSIGNER;
let EULERSIGNER;
let FRANKSIGNER;
let GALILEOSIGNER;
let HARRYSIGNER;
let IGORSIGNER;


// const POH_CONTRACT="0xC5E9dDebb09Cd64DfaCab4011A0D5cEDaf7c9BDb"

const coder = new ethers.utils.AbiCoder();

describe("QUAD Stack", function () {
  before(async function () {
    const [
      adminSigner,
      aliceSigner,
      bobSigner,
      charlieSigner,
      daltonSigner,
      eulerSigner,
      frankSigner,
      galileoSigner,
      harrySigner,
      igorSigner,
    ] = await ethers.getSigners();

    ADMINSIGNER = adminSigner;
    ALICESIGNER = aliceSigner;
    BOBSIGNER = bobSigner;
    CHARLIESIGNER = charlieSigner;
    DALTONSIGNER = daltonSigner;
    EULERSIGNER = eulerSigner;
    FRANKSIGNER = frankSigner;
    GALILEOSIGNER = galileoSigner;
    HARRYSIGNER = harrySigner;
    IGORSIGNER = igorSigner;

    ADMIN = await adminSigner.getAddress();
    ALICE = await aliceSigner.getAddress();
    BOB = await bobSigner.getAddress();
    CHARLIE = await charlieSigner.getAddress();
    DALTON = await daltonSigner.getAddress();
    EULER = await eulerSigner.getAddress();
    FRANK = await frankSigner.getAddress();
    GALILEO = await galileoSigner.getAddress();
    HARRY = await harrySigner.getAddress();
    IGOR = await igorSigner.getAddress();
  });

  describe("QUAD", function () {
    it("Should deploy QUAD Token", async function () {

      const quadToken = await ethers.getContractFactory("Quad");
      const POH = await ethers.getContractFactory("POH");
      const POH_CONTRACT = await POH.deploy();
      console.log(POH_CONTRACT.address);
      QUAD = await quadToken.deploy(ADMIN, POH_CONTRACT.address);
      expect(QUAD.address).to.not.equal(null);
    });

    describe("get Balance of account 0", function () {
      it("Total Supply should be sent to the msg sender", async function () {
        const balance = await QUAD.balanceOf(ADMIN);
        expect(await QUAD.totalSupply()).to.equal(balance);
      });
    });
  });

  describe("Timelock", function () {
    it("Should deploy A Timelock", async function () {
      const TimeLock = await ethers.getContractFactory("Timelock");

      TIMELOCK = await TimeLock.deploy(ADMIN, delay);
    });
  });

  describe("QuadraticGovernorAlpha", function () {
    it("Should deploy QuadraticGovernorAlpha Platform", async function () {
      const GovernorAlpha = await ethers.getContractFactory("QuadraticGovernorAlpha");

      GOVERNOR = await GovernorAlpha.deploy(
        TIMELOCK.address,
        QUAD.address,
        ADMIN
      );

      const eta = (await latest()).toNumber();

      const data = coder.encode(["address"], [GOVERNOR.address]);

      await TIMELOCK.functions.queueTransaction(
        TIMELOCK.address,
        "0",
        "setPendingAdmin(address)",
        data,
        eta + 1
      );

      // await increaseTo(eta + 200);
      await advanceBlock();
      await advanceBlock();

      await TIMELOCK.functions.executeTransaction(
        TIMELOCK.address,
        "0",
        "setPendingAdmin(address)",
        data,
        eta + 1
      );

      await GOVERNOR.functions.__acceptAdmin();
      // eslint-disable-next-line no-underscore-dangle
      await GOVERNOR.functions.__abdicate();
    });
  });

  describe("Quad Proposal Voting", function () {
    let proposalTx;
    let proposalId;
    it("Admin will issue votes to all voters ", async function () {
      // need to delegate tokens to make proposalsconst [adminSigner, aliceSigner, bobSigner] = await ethers.getSigners();
      //
      //   const admin = await adminSigner.getAddress();

      //we'll set quorum quite low for tests, but require that

      await QUAD.functions.transfer(ALICE, ethers.utils.parseEther("100.00"));
      await QUAD.functions.transfer(BOB, ethers.utils.parseEther("100.00"));
      await QUAD.functions.transfer(CHARLIE, ethers.utils.parseEther("100.00"));
      await QUAD.functions.transfer(DALTON, ethers.utils.parseEther("100.00"));
      await QUAD.functions.transfer(EULER, ethers.utils.parseEther("100.00"));
      await QUAD.functions.transfer(FRANK, ethers.utils.parseEther("1000.00"));
      await QUAD.functions.transfer(GALILEO, ethers.utils.parseEther("1000.00"));
      await QUAD.functions.transfer(HARRY, ethers.utils.parseEther("1000.00"));
      await QUAD.functions.transfer(IGOR, ethers.utils.parseEther("100.00"));

      await QUAD.connect(ALICESIGNER).functions.delegate(BOB);
      await QUAD.connect(BOBSIGNER).functions.delegate(BOB);
      await QUAD.connect(CHARLIESIGNER).functions.delegate(BOB);
      await QUAD.connect(DALTONSIGNER).functions.delegate(BOB);
      await QUAD.connect(EULERSIGNER).functions.delegate(BOB);
      console.log("Bob has 5 humans who delegated 100 each")
      await QUAD.connect(FRANKSIGNER).functions.delegate(FRANK);
      console.log("Frank has 1000 tokens himself")
      await advanceBlock();
      const blockCheck = (await latestBlock()).toString()
      await advanceBlock();

      const BOB_QUAD_POWER = await QUAD.functions.getPriorVotes(BOB, blockCheck);
      const FRANK_QUAD_POWER = await QUAD.functions.getPriorVotes(FRANK, blockCheck);

      console.log("Bob has more Voting power than frank")
      console.log(BOB_QUAD_POWER.toString());
      console.log(FRANK_QUAD_POWER.toString());
      expect(BOB_QUAD_POWER[0].gt(FRANK_QUAD_POWER[0]))
    });

    // it("Admin will create a new proposal and vote for it", async function () {
    //   // proposal steps
    //
    //   const targets = [PROXYADMIN.address];
    //   const values = ["0x0"];
    //   const fragment = LOGICV2.interface.getFunction("initializeUpgrade");
    //   const upgradeData = LOGICV2.interface.encodeFunctionData(fragment, []);
    //
    //   const signatures = ["upgradeAndCall(address,address,bytes)"];
    //   const data = coder.encode(
    //     ["address", "address", "bytes"],
    //     [QUADProxy.address, LOGICV2.address, upgradeData]
    //   );
    //   const calldatas = [data];
    //   const description = "ipfs://wip"; // ipfs hash
    //
    //   proposalTx = await GOVERNOR.functions.propose(
    //     targets,
    //     values,
    //     signatures,
    //     calldatas,
    //     description
    //   );
    //   const receipt = await proposalTx.wait();
    //
    //   proposalId = receipt.events[0].args[0].toString();
    //
    //   await advanceBlock();
    //   await GOVERNOR.functions.castVote(proposalId, true); // vote in support of the proposal
    //
    //   // move time into the future whatever the timeout of the prposal is set to
    // });

    // it("Admin will queue the finalized proposal", async function () {
    //   await increase(259300);
    //   const currBlock = await latestBlock();
    //   console.log(currBlock.toNumber());
    //   const votingPeriod = await GOVERNOR.functions.votingPeriod();
    //   console.log(votingPeriod);
    //   const advance = currBlock.toNumber() + votingPeriod[0].toNumber() + 1;
    //   console.log(advance);
    //   await advanceBlockTo(advance);
    //   await GOVERNOR.functions.queue(proposalId);
    //
    //   // pass time until timelock
    // }).timeout(100000);

    // it("Admin execute the proposal.", async function () {
    //   await increase(172900);
    //   await GOVERNOR.functions.execute(proposalId);
    // });
  });

});
