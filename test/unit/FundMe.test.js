const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer, MockV3Aggregator;
          let sendValue = ethers.utils.parseUnits("1", "ether");

          beforeEach(async function () {
              // deploy our fundMe contract
              // using hardhat deploy

              deployer = (await getNamedAccounts()).deployer;

              await deployments.fixture(["all"]);

              fundMe = await ethers.getContract("FundMe", deployer);

              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, MockV3Aggregator.address);
              });
          });

          describe("fund", function () {
              it("Fails if you don't send enough TEST", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });

              it("update the amount of the data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });

              it("add funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraw ETH from a single funder", async function () {
                  // arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);

                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // act
                  const transactionResponse = await fundMe.withdraw();

                  const transactionReciept = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReciept;

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows us to withdraw with multiple funders", async function () {
                  const accounts = await ethers.getSigners();

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  // arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);

                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw();

                  const transactionReciept = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReciept;

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  // make the mappings to be zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });

          describe("cheaperWithdrawal testing...", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraw ETH from a single funder", async function () {
                  // arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);

                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // act
                  const transactionResponse = await fundMe.cheaperWithdraw();

                  const transactionReciept = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReciept;

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows us to withdraw with multiple funders", async function () {
                  const accounts = await ethers.getSigners();

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  // arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);

                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw();

                  const transactionReciept = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReciept;

                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  // make the mappings to be zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(attackerConnectedContract.cheaperWithdraw()).to
                      .be.reverted;
              });
          });
      });
