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
  const [addr, setAddr] = useState('');
  const [proxyAddr, setProxyAddr] = useState('');
  const [proxyBal, setProxyBal] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [interval, setInterval] = useState(0);
  const [duration, setDuration] = useState(0);
  const [newProxy, setNewProxy] = useState('');
  const [loading, setLoading] = useState(false);
  const [proxyAddress, setProxyAddress] = useState('');
  
  const web3 = new Web3(window.ethereum);
  let accounts;
  const finaAddress = "0x9061e1af32e7d345ffdbdabebc2d915faf667bfe";
  const vestingFactoryAddress = "0x36Fe21056aE825fcBd227c7A9acA84b6ccD8EFa1";
  const proxy1 = "0x03187dE2be77fAd317D158B908c5A7EED2Be9067";
  const proxy2 = "0x03187dE2be77fAd317D158B908c5A7EED2Be9067";
  const vestingAddress = "0x81AC6109866E6C381D36C1b549300a7E4Df6f039";
  
  const vFactoryContract = new web3.eth.Contract(VestingFactory.abi, vestingFactoryAddress);
  const FINA = new web3.eth.Contract(FinAxis.abi, finaAddress);

  useEffect(async () => {
    await init();
    let ps = await vFactoryContract.methods.vestingProxies(1).call();
    console.log(ps);
    await getProxyDetails(ps);
  }, [])

  async function init() {
    accounts = await window.ethereum.enable();
  }

  async function createVesting() {
    
    const start = Math.ceil(Date.now()/1000);
    const encodedData = encodeInitializeData(beneficiary, start, interval*60*60, duration*60*60);
    setLoading(true);
    const tx = await vFactoryContract.methods.newVesting(encodedData).send({
      from: accounts[0]
    });
    setLoading(false);
    // console.log('transaction: ', tx);
    // console.log('proxy address:',  tx.events.ProxyCreated.returnValues);
    let p = await vFactoryContract.methods.vestingProxies(0).call();
    console.log(p)
    setNewProxy(p);
  }

  async function getFinaBalance() {
    setLoading(true);
    const balance = await FINA.methods.balanceOf(addr).call();
    setLoading(false);
    setProxyBal(balance.toString());
  }

  async function release() {
    setLoading(true);
    const pVestingContract = new web3.eth.Contract(Vesting.abi, proxyAddress);
    try {
      const tx = await pVestingContract.methods.release(finaAddress).send({
        from: "0x7bBD77cd941426D77ddaA623Bc9b1F6f0a07db42"
      });
      console.log(tx);
    } catch(err) {
      console.log(err);
    }
    setLoading(false);
  }

  async function getProxyDetails(pp) {
    const proxy = new web3.eth.Contract(Vesting.abi, pp);
    const benf = await proxy.methods.beneficiary().call();
    const proxyStart = await proxy.methods.start().call();
    const proxyInterval = await proxy.methods.interval().call();
    const proxyDuration = await proxy.methods.duration().call();
    const proxyRevokable = await proxy.methods.duration().call();
    console.log(benf, proxyStart, proxyInterval, proxyDuration, proxyRevokable);
  }

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
      {loading ?
        <h1>Loading...</h1>
        :
        null
      }
      <h2>Create vesting proxy</h2>
      <input
        placeholder="beneficiary"
        value={beneficiary}
        onChange={(e) => {
          setBeneficiary(e.target.value)
        }}
      />
      <input
        placeholder="Interval period"
        value={interval}
        onChange={(e) => {
          setInterval(e.target.value)
        }}
      />
      <input
        placeholder="duration period"
        value={duration}
        onChange={(e) => {
          setDuration(e.target.value)
        }}
      />
      <button onClick={createVesting}>Create new Vesting</button>
      <p>New proxy address: {newProxy}</p>
      
      <h2>Balance of FINA</h2>
      <input placeholder value={addr} onChange={(e) => {setAddr(e.target.value)}} />
      <button onClick={getFinaBalance}>Balance of this vesting</button>
      <p>balance: {proxyBal}</p>

      <h2>Relase due tokens from vesting</h2>
      <input placeholder="proxy address" value={proxyAddress} onChange={(e) => {setProxyAddress(e.target.value)}} />
      <button onClick={release}>Release</button>
    </div>
  );
}

export default App;
