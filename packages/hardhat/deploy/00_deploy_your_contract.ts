import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys ClassDAO smart contracts
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployClassDAO: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying ClassDAO contracts...");

  // Deploy StudentNFT contract
  const studentNFT = await deploy("StudentNFT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Deploy PointsManager contract
  const pointsManager = await deploy("PointsManager", {
    from: deployer,
    args: [studentNFT.address],
    log: true,
    autoMine: true,
  });

  // Deploy DiscussionForum contract
  const discussionForum = await deploy("DiscussionForum", {
    from: deployer,
    args: [studentNFT.address, pointsManager.address],
    log: true,
    autoMine: true,
  });

  // Deploy WikipediaManager contract
  const wikipediaManager = await deploy("WikipediaManager", {
    from: deployer,
    args: [studentNFT.address, pointsManager.address],
    log: true,
    autoMine: true,
  });

  // Deploy ClassDAO contract
  const classDAO = await deploy("ClassDAO", {
    from: deployer,
    args: [studentNFT.address],
    log: true,
    autoMine: true,
  });

  // Set up contract relationships
  console.log("⚡ Setting up contract relationships...");
  
  const studentNFTContract = await hre.ethers.getContract("StudentNFT", deployer);
  
  // Set PointsManager in StudentNFT
  await studentNFTContract.setPointsManager(pointsManager.address);
  
  // Authorize contracts to trigger pet evolutions
  await studentNFTContract.setAuthorizedContract(discussionForum.address, true);
  await studentNFTContract.setAuthorizedContract(classDAO.address, true);
  await studentNFTContract.setAuthorizedContract(wikipediaManager.address, true);
  
  console.log("✅ ClassDAO deployment completed!");
  console.log("� Contract Addresses:");
  console.log(`   StudentNFT: ${studentNFT.address}`);
  console.log(`   PointsManager: ${pointsManager.address}`);
  console.log(`   DiscussionForum: ${discussionForum.address}`);
  console.log(`   WikipediaManager: ${wikipediaManager.address}`);
  console.log(`   ClassDAO: ${classDAO.address}`);
};

export default deployClassDAO;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ClassDAO
deployClassDAO.tags = ["ClassDAO"];
