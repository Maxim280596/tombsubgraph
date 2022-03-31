import { Address } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  Paused,
  StratHarvest,
  TombFees,
  Unpaused,
} from "../generated/StrategyCommonChefLPProxy/StrategyCommonChefLPProxy"
import { Deposit, Withdraw } from "../generated/templates/TombVaultProxy/TombVaultProxy";
import { TombVaultProxy } from "../generated/templates";
import { updateStrategyDayData, updateStrategyData, updateFeesData } from './strategy';
import { updateUser, updateUserWithdraw, updateVault } from "./vault";

export function handleDeposit(event: Deposit): void {
  TombVaultProxy.create(Address.fromString("0x1200b6044676aC48AD1b129a024389e46284d29D"))

  updateUser(event)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleStratHarvest(event: StratHarvest): void {
  TombVaultProxy.create(Address.fromString("0x1200b6044676aC48AD1b129a024389e46284d29D"))

  updateStrategyData(event);
  updateStrategyDayData(event);
  updateVault(event)
}

export function handleTombFees(event: TombFees): void {
  updateFeesData(event)
}

export function handleUnpaused(event: Unpaused): void {}

export function handleWithdraw(event: Withdraw): void {
  updateUserWithdraw(event)
}
