import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";
const inter = Inter({ subsets: ["latin"] });

import { axelarTestnetConfigs as _axelarTestnetConfigs } from "../../../contracts/configs";
const axelarTestnetConfigs = _axelarTestnetConfigs as any;

import { useEthersSigner, useEthersProvider } from "@/hooks/useEthers";
import { ethers } from "ethers";
import { OMNI_FACTORY_ABI, OMNI_FACTORY_ADDRESS } from "@/lib/omni-deployer";
import { useAccount } from "wagmi";

const App: React.FC = () => {
  const [bytecode, setBytecode] = useState<string>("");
  const [salt, setSalt] = useState<string>(ethers.constants.HashZero);
  const [expectedContractAddress, setExpectedContractAddress] =
    useState<string>("");
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const { address } = useAccount();

  const handleNetworkChange = (network: string) => {
    if (selectedNetworks.includes(network)) {
      setSelectedNetworks((prev) => prev.filter((net) => net !== network));
    } else {
      setSelectedNetworks((prev) => [...prev, network]);
    }
  };

  const handleDeploy = async () => {
    if (!signer) {
      return;
    }
    const contract = new ethers.Contract(
      OMNI_FACTORY_ADDRESS,
      OMNI_FACTORY_ABI,
      signer
    );

    const destinationChains = selectedNetworks.map(
      (chainId) => axelarTestnetConfigs[chainId].name
    );
    const creationCodes = selectedNetworks.map(() => bytecode);
    const salts = selectedNetworks.map(() => salt);
    const inits = selectedNetworks.map(() => "0x");
    const value = ethers.utils.parseEther("0.01");
    const values = selectedNetworks.map(() => value);
    const totalValue = value.mul(selectedNetworks.length);
    console.log("destinationChains", destinationChains);
    const tx = await contract.omniDeployBatch(
      destinationChains,
      creationCodes,
      salts,
      inits,
      values,
      { value: totalValue }
    );
    console.log(tx.hash);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!provider || !address || !bytecode || !salt) {
      setExpectedContractAddress("");
      return;
    }
    const contract = new ethers.Contract(
      OMNI_FACTORY_ADDRESS,
      OMNI_FACTORY_ABI,
      provider
    );
    contract
      .deployedAddress(bytecode, address, salt)
      .then((expectedContractAddress: string) => {
        setExpectedContractAddress(expectedContractAddress);
      })
      .catch(() => {
        setExpectedContractAddress("");
      });
  }, [provider, address, bytecode, salt]);

  return (
    <div
      className={`bg-deep-space text-lunar-white h-screen flex flex-col ${inter}`}
    >
      <header className="top-0 z-10 p-4 bg-deep-space bg-opacity-60">
        <div className="float-right">
          <ConnectButton chainStatus={"icon"} accountStatus={"address"} />
        </div>
      </header>

      <main
        className="flex-1 flex justify-center items-center bg-center bg-cover py-12 px-4"
        style={{ backgroundImage: 'url("background.jpg")' }}
      >
        <div className="p-8 bg-opacity-60 bg-deep-space rounded-lg space-y-4 max-w-2xl w-full">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold">OmniDeployer</h1>
          </div>

          <div className="mb-4">
            <label>
              Bytecode:
              <textarea
                value={bytecode}
                onChange={(e) => setBytecode(e.target.value)}
                className="w-full px-2 py-3 mt-2 rounded bg-lunar-white text-deep-space text-xs"
                rows={12}
                placeholder="Enter bytecode..."
              />
            </label>
          </div>
          <div className="mb-4">
            <label>
              Salt:
              <input
                type="text"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="w-full px-2 py-3 mt-2 rounded bg-lunar-white text-deep-space text-xs"
                placeholder="Enter salt..."
              />
            </label>
          </div>
          <div className="mb-4 text-stellar-gold">
            <p className="mb-2">Expected deployed contract address: </p>
            <p className="text-xs">{expectedContractAddress}</p>
          </div>

          <div className="mb-4">
            <label>
              Target Axelar Network:
              {Object.keys(axelarTestnetConfigs).map((key) => (
                <div
                  key={key}
                  className="flex justify-between mt-2 items-center"
                >
                  <span>
                    {key}: {axelarTestnetConfigs[key].name}{" "}
                    {5 === Number(key) ? " >> Same network" : ""}
                  </span>
                  <input
                    type="checkbox"
                    value={key}
                    // disabled={5 === Number(key)}
                    disabled={!axelarTestnetConfigs[key].isDeployed}
                    checked={selectedNetworks.includes(key)}
                    onChange={() => handleNetworkChange(key)}
                  />
                </div>
              ))}
            </label>
          </div>
          <button
            className={`w-full bg-galactic-blue text-lunar-white py-2 rounded ${
              !expectedContractAddress
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-stellar-gold"
            }`}
            onClick={handleDeploy}
            disabled={!expectedContractAddress}
          >
            Deploy
          </button>
        </div>
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-20">
          <div className="absolute inset-0 bg-black opacity-75 z-10"></div>
          <div className="bg-deep-space p-8 rounded-lg space-y-4 max-w-md w-full z-30">
            <h2 className="text-2xl font-bold text-center">
              OmniDeployer Tx Sent
            </h2>
            <p>
              Check Tx at{" "}
              <a
                href={"https://testnet.axelarscan.io/gmp/search"}
                target="_blank"
                className="underline text-stellar-gold"
              >
                Axelar Scan
              </a>
            </p>
            <button
              className="w-full bg-galactic-blue text-lunar-white py-2 rounded hover:bg-stellar-gold"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
