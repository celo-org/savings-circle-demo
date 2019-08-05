import {
    MockStableTokenContract,
    MockStableTokenInstance,
    SavingsCircleContract,
    SavingsCircleInstance,
  } from '../types/truffle-contracts'
  import BigNumber from 'bignumber.js'
  import * as Web3Utils from 'web3-utils'

  export async function assertRevert(promise: any, errorMessage: string = '') {
    try {
      await promise
      assert.fail('Expected revert not received')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      if (errorMessage === '') {
        assert(revertFound, `Expected "revert", got ${error} instead`)
      } else {
        assert(revertFound, errorMessage)
      }
    }
  }

  const SavingsCircle: SavingsCircleContract = artifacts.require('SavingsCircle')
  const MockStableToken: MockStableTokenContract = artifacts.require('MockStableToken')

  function hashName(name: string) {
    return Web3Utils.soliditySha3({ type: 'string', value: name })
  }

  contract('SavingsCircle', (accounts: string[]) => {
    let savingsCircle: SavingsCircleInstance
    // @ts-ignore
    let mockStableToken: MockStableTokenInstance

    const owner = accounts[0]
    const members = [owner, accounts[1]]
    const name = 'circle'
    const hashedName = hashName(name)
    const depositAmount = new BigNumber(web3.utils.toWei('5', 'ether').toString())

    beforeEach(async () => {
      mockStableToken = await MockStableToken.new()
      savingsCircle = await SavingsCircle.new()
      await savingsCircle.initialize()
    })

    describe('#initialize', () => {
      it('registers a circle', async () => {
        await savingsCircle.addCircle(name, members, mockStableToken.address, depositAmount)

        const expectedMembers = await savingsCircle.circleMembers(hashedName)

        assert.deepEqual(members, expectedMembers)
      })

      it('registers membership', async () => {
        await savingsCircle.addCircle(name, members, mockStableToken.address, depositAmount)
        const expectedCircles = await savingsCircle.circlesFor(members[1])

        assert.lengthOf(expectedCircles, 1)
        assert.equal(expectedCircles[0], hashedName)
      })

      it('should not register the same circle twice', async () => {
        await savingsCircle.addCircle(name, members, mockStableToken.address, depositAmount)

        await assertRevert(
          savingsCircle.addCircle(name, members, mockStableToken.address, depositAmount)
        )
      })

      it('should allow me to contribute and withdraw', async () => {
        await savingsCircle.addCircle(name, members, mockStableToken.address, depositAmount)

        await savingsCircle.contribute(hashedName, depositAmount)

        let withdrawable = await savingsCircle.withdrawable(hashedName)

        assert.isFalse(withdrawable)

        await savingsCircle.contribute(hashedName, depositAmount, { from: members[1] })

        withdrawable = await savingsCircle.withdrawable(hashedName)

        assert.isTrue(withdrawable)

        await assertRevert(savingsCircle.withdraw(hashedName, { from: members[1] }))
        await savingsCircle.withdraw(hashedName)
      })
    })
  })
