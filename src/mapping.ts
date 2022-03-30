import { BigInt } from "@graphprotocol/graph-ts"
import {
  StrategyCommonChefLPProxy,
  Deposit,
  OwnershipTransferred,
  Paused,
  StratHarvest,
  TombFees,
  Unpaused,
  Withdraw
} from "../generated/StrategyCommonChefLPProxy/StrategyCommonChefLPProxy"
import { ExampleEntity } from "../generated/schema"
import { updateStrategyDayData, updateStrategyData, updateFeesData } from './dayUpdates';

export function handleDeposit(event: Deposit): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.tvl = event.params.tvl

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.MAX_FEE(...)
  // - contract.balanceOf(...)
  // - contract.balanceOfPool(...)
  // - contract.balanceOfWant(...)
  // - contract.callReward(...)
  // - contract.chef(...)
  // - contract.harvestOnDeposit(...)
  // - contract.keeper(...)
  // - contract.lastHarvest(...)
  // - contract.lpToken0(...)
  // - contract.lpToken1(...)
  // - contract.native(...)
  // - contract.output(...)
  // - contract.outputToLp0(...)
  // - contract.outputToLp0Route(...)
  // - contract.outputToLp1(...)
  // - contract.outputToLp1Route(...)
  // - contract.outputToNative(...)
  // - contract.outputToNativeRoute(...)
  // - contract.owner(...)
  // - contract.paused(...)
  // - contract.pendingRewardsFunctionName(...)
  // - contract.poolId(...)
  // - contract.rewardsAvailable(...)
  // - contract.strategist(...)
  // - contract.target(...)
  // - contract.tombFee(...)
  // - contract.tombFeeRecipient(...)
  // - contract.totalFee(...)
  // - contract.unirouter(...)
  // - contract.vault(...)
  // - contract.want(...)
  // - contract.withdrawalFee(...)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleStratHarvest(event: StratHarvest): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.tvl = event.params.tvl
  updateStrategyData(event);
  updateStrategyDayData(event);

  // Entities can be written to the store with `.save()`
  entity.save()
}

export function handleTombFees(event: TombFees): void {
  updateFeesData(event)
}

export function handleUnpaused(event: Unpaused): void {}

export function handleWithdraw(event: Withdraw): void {}
