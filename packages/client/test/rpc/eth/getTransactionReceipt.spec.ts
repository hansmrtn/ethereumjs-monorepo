import tape from 'tape'
import { FeeMarketEIP1559Transaction, Transaction } from '@ethereumjs/tx'
import { bufferToHex } from 'ethereumjs-util'
import {
  params,
  baseRequest,
  setupChain,
  runBlockWithTxs,
  gethGenesisStartLondon,
  dummy,
} from '../helpers'
import pow from './../../testdata/pow.json'

const method = 'eth_getTransactionReceipt'

tape(`${method}: call with legacy tx`, async (t) => {
  const { chain, common, execution, server } = await setupChain(pow, 'pow')

  // construct tx
  const tx = Transaction.fromTxData(
    { gasLimit: 2000000, gasPrice: 100, to: '0x0000000000000000000000000000000000000000' },
    { common }
  ).sign(dummy.privKey)

  await runBlockWithTxs(chain, execution, [tx])

  // get the tx
  const req = params(method, [bufferToHex(tx.hash())])
  const expectRes = (res: any) => {
    const msg = 'should return the correct tx'
    if (res.body.result.transactionHash === bufferToHex(tx.hash())) {
      t.pass(msg)
    } else {
      throw new Error(msg)
    }
  }
  await baseRequest(t, server, req, 200, expectRes)
})

tape(`${method}: call with 1559 tx`, async (t) => {
  const { chain, common, execution, server } = await setupChain(
    gethGenesisStartLondon(pow),
    'powLondon'
  )

  // construct tx
  const tx = FeeMarketEIP1559Transaction.fromTxData(
    {
      gasLimit: 2000000,
      maxFeePerGas: 975000000,
      maxPriorityFeePerGas: 10,
      to: '0x1230000000000000000000000000000000000321',
    },
    { common }
  ).sign(dummy.privKey)

  await runBlockWithTxs(chain, execution, [tx])

  // get the tx
  const req = params(method, [bufferToHex(tx.hash())])
  const expectRes = (res: any) => {
    const msg = 'should return the correct tx'
    if (res.body.result.transactionHash === bufferToHex(tx.hash())) {
      t.pass(msg)
    } else {
      throw new Error(msg)
    }
  }
  await baseRequest(t, server, req, 200, expectRes)
})

tape(`${method}: call with unknown tx hash`, async (t) => {
  const { server } = await setupChain(pow, 'pow')

  // get a random tx hash
  const req = params(method, ['0x89ea5b54111befb936851660a72b686a21bc2fc4889a9a308196ff99d08925a0'])
  const expectRes = (res: any) => {
    const msg = 'should return null'
    if (res.body.result === null) {
      t.pass(msg)
    } else {
      throw new Error(msg)
    }
  }
  await baseRequest(t, server, req, 200, expectRes)
})
