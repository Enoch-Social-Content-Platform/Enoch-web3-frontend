import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import react, {useState, useEffect} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import VestingFactory from './abis/VestingFactory.json';
import Vesting from './abis/Vesting2.json';
import FinAxis from './abis/FinAxis.json';

function App() {
  const [vestingProxy, setVestingProxy] = useState('');
  const [proxyAddr, setProxyAddr] = useState('');
  const [proxyBal, setProxyBal] = useState('');
  
  const web3 = new Web3(window.ethereum);
  let accounts;
  const finaAddress = "0x9061e1af32e7d345ffdbdabebc2d915faf667bfe";
  const proxy1 = "0x03187dE2be77fAd317D158B908c5A7EED2Be9067";
  const vestingFactoryAddress = "0x36Fe21056aE825fcBd227c7A9acA84b6ccD8EFa1";
  const vestingAddress = "0x81AC6109866E6C381D36C1b549300a7E4Df6f039";
  
  const vFactoryContract = new web3.eth.Contract(VestingFactory.abi, vestingFactoryAddress);
  const FINA = new web3.eth.Contract(FinAxis.abi, finaAddress);

  useEffect(() => {
    init();
  }, [])

  async function init() {
    accounts = await window.ethereum.enable();
  }

  async function createVesting() {
    
    // const start = Math.ceil(Date.now()/1000);
    // const encodedData = encodeInitializeData(accounts[0], start, 1*1*10*60, 1*1*30*60);
    // const tx = await vFactoryContract.methods.newVesting(encodedData).send({
    //   from: accounts[0]
    // });

    // console.log('transaction: ', tx);
    // console.log('proxy address:',  tx.events.ProxyCreated.returnValues);
    let p = await vFactoryContract.methods.vestingProxies(0).call();
    console.log(p)
  }

  async function getFinaBalance() {
    const balance = await FINA.methods.balanceOf(proxyAddr).call();
    setProxyBal(balance.toString());
  }

  // async function release

  function encodeInitializeData(benf, start, cliff, duration) {
    return web3.eth.abi.encodeFunctionCall({
      name: 'initialize',
      type: 'function',
      inputs: [{
          type: 'address',
          name: 'beneficiary'
      },{
          type: 'uint256',
          name: 'start'
      },{
          type: 'uint256',
          name: 'intervalPeriod'
      },{
          type: 'uint256',
          name: 'duration'
      },{
          type: 'bool',
          name: 'revocable'
      }]
    },[benf, start, cliff, duration, true]);
    }
  return (
    <div className="App">
      <h1>Web3 Implementation</h1>

      <h2>Create vesting proxy</h2>
      <button onClick={createVesting}>Create new Vesting</button>
      <p>Proxy: {vestingProxy}</p>
      
      <h2>Balance of FINA</h2>
      <input placeholder value={proxyAddr} onChange={(e) => {setProxyAddr(e.target.value)}} />
      <button onClick={getFinaBalance}>Balance of this vesting</button>
      <p>balance: {proxyBal}</p>
    </div>
  );
}

export default App;
